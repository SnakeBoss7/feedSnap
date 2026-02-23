const user = require("../models/user");
const webData = require("../models/WebData");
const feedback = require("../models/feedback");
const Team = require("../models/teamSchema");
const path = require('path')
const { Parser } = require("json2csv");
const PDFDocument = require("pdfkit");
const fs = require('fs')
const { sendEmail } = require("../utils/mailService");
const { computeSeverity } = require("../utils/severityCompute");

// Normalize URL for consistent comparison (strips trailing slash, lowercases, keeps protocol)
const normalizeUrl = (url) => {
  if (!url) return '';
  try {
    let normalized = url.trim().toLowerCase();
    // Remove trailing slash
    normalized = normalized.replace(/\/+$/, '');
    return normalized;
  } catch (e) {
    return url.trim().toLowerCase().replace(/\/+$/, '');
  }
};

// Helper function to get all websites accessible to a user
const getUserAccessibleWebsites = async (userId) => {
  try {
    // 1. Direct ownership: owner is an array of IDs in the schema
    const directWebData = await webData.find({ owner: userId });

    // 2. Team membership: find teams where userId is in members.user
    const userTeams = await Team.find({
      'members.user': userId
    }).populate('webData');
    console.log({ userTeams })

    const directSites = directWebData.map(web => web.webUrl);

    // Extract webUrl from populated webData in teams
    const teamSites = userTeams
      .filter(team => team && team.webData)
      .map(team => team.webData.webUrl);

    const allSites = [...new Set([...directSites, ...teamSites])];

    // Combine webData objects for dashboard and other uses
    const teamWebDataObjects = userTeams
      .filter(team => team && team.webData)
      .map(team => team.webData);

    const allWebDataObjects = [...directWebData, ...teamWebDataObjects];
    // Unique by _id to avoid duplicates if someone is owner AND in a team (unlikely but safe)
    const uniqueWebDataObjects = Array.from(new Map(allWebDataObjects.map(item => [item._id.toString(), item])).values());

    return {
      sites: allSites,
      webDataObjects: uniqueWebDataObjects,
      teams: userTeams
    };
  } catch (error) {
    console.error("Error fetching user accessible websites:", error);
    throw error;
  }
};

const exportFeedback = async (req, res) => {
  try {
    const user = req.user;
    const { sites } = await getUserAccessibleWebsites(user.id);

    const feedbacks = await feedback
      .find({ webUrl: { $in: sites } })
      .sort({ createdOn: -1, webUrl: 1 });

    const { format } = req.query;

    if (format === "csv") {
      const fields = ["title", "description", "rating", "webUrl", "pathname", "createdOn", "severity", "status"];
      const parser = new Parser({ fields });
      const csv = parser.parse(feedbacks);

      res.header("Content-Type", "text/csv");
      res.attachment("feedbacks.csv");
      return res.send(csv);
    }

    if (format === "pdf") {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=feedbacks.pdf");

      const doc = new PDFDocument();
      doc.pipe(res);

      doc.fontSize(20).text("Feedback Report", { align: "center" }).moveDown();

      feedbacks.forEach((fb, i) => {
        doc.fontSize(12).text(
          `${i + 1}. [${fb.webUrl}] ⭐${fb.rating}\nTitle: ${fb.title}\nDesc: ${fb.description}\nDate: ${fb.createdOn}\n`
        );
        doc.moveDown();
      });

      doc.end();
      return;
    }

    if (format === "json") {
      res.json(feedbacks);
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error exporting feedback" });
  }
};

const createFeed = async (req, res) => {
  console.log("Hello there");
  const { webUrl, pathname, title, email, description, rating, config } = req.body;
  console.log({ webUrl, pathname, title, email, description, rating });
  let severity = computeSeverity({ title, rating, description, email, status: false });
  res.status(200).json({ mess: "cooked" });
  let data = await feedback.create({ ...req.body, severity, status: false });

  if (req.body.config?.ackMail) {
    const currentDate = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    let filepath = path.join(process.cwd(), "utils", "ackMail.html")
    let mailContent = fs.readFileSync(filepath, "utf-8")
    console.log({ filepath, mailContent })
    mailContent = mailContent
      .replace(/{{email}}/g, email)
      .replace(/{{title}}/g, title)
      .replace(/{{webUrl}}/g, webUrl)
      .replace(/{{rating}}/g, rating)
      .replace(/{{description}}/g, description)
      .replace(/{{pathname}}/g, pathname)
      .replace(/{{currentDate}}/g, currentDate);
    // const templatePath = path.join(process.cwd(), "templates", "ackMail.html");
    // console.log({filepath});
    console.log({ mailContent })
    sendEmail(email, `Your feedback has been received — ${webUrl} Team`, mailContent);
  }
};

const getFeed = async (req, res) => {
  const user = req.user;
  const { sites, webDataObjects } = await getUserAccessibleWebsites(user.id);

  const userfeedback = await feedback
    .find({ webUrl: { $in: sites } })
    .sort({ createdOn: -1 });

  const avgRating1 = await feedback.aggregate([
    {
      $match: {
        webUrl: { $in: sites },
        rating: { $type: "number" },
      },
    },
    {
      $group: {
        _id: "$webUrl",
        avgRating: { $avg: "$rating" },
        totalRating: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        website: "$_id",
        avgRating: { $round: ["$avgRating", 2] },
        totalRating: 1,
      },
    },
  ]);

  const totalFeedbacks1 = await webData.aggregate([
    {
      $match: {
        webUrl: { $in: sites },
      },
    },
    {
      $lookup: {
        from: "feedbacks",
        let: { webUrl: "$webUrl" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$webUrl", "$webUrl"] },
            },
          },
          {
            $count: "count",
          },
        ],
        as: "feedbackCount",
      },
    },
    {
      $project: {
        _id: 0,
        website: "$webUrl",
        totalFeedbacks: {
          $ifNull: [{ $arrayElemAt: ["$feedbackCount.count", 0] }, 0],
        },
      },
    },
  ]);

  const ratingPerSite = {};
  const avgRatingPerSite = {};
  const ratingCountPerSite = {};
  const feedbackPerSite = {};
  let totalFeedbacks = userfeedback.length;

  userfeedback.forEach((fb) => {
    const { webUrl, rating } = fb;
    feedbackPerSite[webUrl] = (feedbackPerSite[webUrl] || 0) + 1;
    if (!isNaN(rating) && rating && rating !== "" && rating !== " ") {
      ratingPerSite[webUrl] = (ratingPerSite[webUrl] || 0) + rating;
      ratingCountPerSite[webUrl] = (ratingCountPerSite[webUrl] || 0) + 1;
    }
  });

  sites.forEach((site) => {
    avgRatingPerSite[site] = (
      ratingPerSite[site] / ratingCountPerSite[site]
    ).toFixed(1);
  });

  const values = Object.values(avgRatingPerSite).map(Number);
  const total = values.reduce((acc, val) => acc + val, 0);
  const avgRating = (total / values.length).toFixed(1);

  res.status(200).json({
    sites,
    userfeedback,
    totalFeedbacks,
    avgRatingPerSite,
    avgRating,
    feedbackPerSite,
    mess: "data fetched succesfully",
  });
};
// Helper: determine user's highest role across direct ownership + all teams
const getUserHighestRole = async (userId) => {
  // Direct site owner = 'owner' role
  const directWebDataCount = await webData.countDocuments({ owner: userId });
  if (directWebDataCount > 0) return 'owner';

  // Check team memberships
  const userTeams = await Team.find({ 'members.user': userId });
  const rolePriority = { owner: 3, editor: 2, viewer: 1 };
  let highest = 'viewer';

  for (const team of userTeams) {
    const member = team.members.find(m => m.user.toString() === userId);
    if (member && (rolePriority[member.role] || 0) > (rolePriority[highest] || 0)) {
      highest = member.role;
    }
  }
  return highest;
};

const allFeedback = async (req, res) => {
  try {
    console.log("[allFeedback] START");
    const user = req.user;

    const { sites } = await getUserAccessibleWebsites(user.id);
    console.log("[allFeedback] User sites:", sites);

    // Get user's highest RBAC role for frontend permission checks
    const userRole = await getUserHighestRole(user.id);

    if (!sites || sites.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        sites: [],
        userRole,
        count: 0
      });
    }
    const userTeams = await Team.find({
      'members.user': user.id,
      'members.role': { $in: ['owner', 'editor'] },
    });
    const teamOptions = userTeams.map(team => ({
      value: team.mail,   // the email will be the value
      label: team.name    // the team name will be shown in the dropdown
    }));
    // Fetch all feedback sorted by creation date (ascending for proper chart rendering)
    const feedbacks = await feedback
      .find({ webUrl: { $in: sites } })
      .sort({ createdOn: 1 })
      .lean();

    console.log(`[allFeedback] Total feedback: ${feedbacks.length}`);

    // Group by date to verify multiple entries per day
    const byDate = {};
    feedbacks.forEach(fb => {
      const date = new Date(fb.createdOn).toISOString().split('T')[0];
      byDate[date] = (byDate[date] || 0) + 1;
    });
    console.log("[allFeedback] Feedback per date:", byDate);

    return res.status(200).json({
      success: true,
      data: feedbacks,
      userTeams: teamOptions,
      userRole,
      sites: sites,
      count: feedbacks.length
    });
  } catch (error) {
    console.error("[allFeedback] ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
      data: []
    });
  }
};
// REPLACE your display function with this debug version

const display = async (req, res) => {
  console.log("\n========================================");
  console.log("=== DISPLAY ANALYTICS CALLED ===");
  console.log("========================================");

  try {
    console.log("Step 1: Got request");
    console.log("Step 2: Checking user...");

    if (!req.user) {
      console.log("ERROR: No user in request!");
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const user = req.user;
    console.log("Step 3: User found:", user.id);

    console.log("Step 4: Getting accessible websites...");
    const { sites } = await getUserAccessibleWebsites(user.id);
    console.log("Step 5: User sites:", sites);

    if (!sites || sites.length === 0) {
      console.log("Step 6: No sites found, returning empty");
      return res.status(200).json({
        success: true,
        data: {},
        sites: [],
        message: "No websites found for this user",
      });
    }

    console.log("Step 7: Starting analytics aggregation...");
    const analytics = await getDetailedFeedbackAnalyticsOptimized(sites);
    console.log("Step 8: Analytics complete!");
    console.log("Step 9: Sending response...");

    return res.status(200).json({
      success: true,
      data: analytics,
      sites: sites,
    });
  } catch (error) {
    console.error("ERROR in display function:", error);
    console.error("Error stack:", error.stack);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const getDetailedFeedbackAnalyticsOptimized = async (webUrls) => {
  try {
    console.log("Processing websites:", webUrls);

    const dateRanges = getDateRanges();
    const now = new Date();
    const currentDay = now.getDate();
    const analytics = {};

    for (const webUrl of webUrls) {
      console.log(`\nProcessing ${webUrl}...`);

      // Simple query - just get all feedback for this site
      const allFeedbackForSite = await feedback.find({ webUrl }).sort({ createdOn: 1 });
      console.log(`Found ${allFeedbackForSite.length} total feedback for ${webUrl}`);

      if (allFeedbackForSite.length === 0) {
        analytics[webUrl] = {
          totalFeedback: 0,
          currentMonth: { count: 0, name: getMonthName(dateRanges.current.monthIndex) },
          lastMonth: { count: 0, name: getMonthName(dateRanges.last.monthIndex) },
          categories: { bug: 0, complaint: 0, feature: 0, general: 0, improvement: 0, other: 0 },
          monthlyBreakdown: {},
          dailyBreakdown: {},
        };
        continue;
      }

      // Initialize counters
      const categories = { bug: 0, complaint: 0, feature: 0, general: 0, improvement: 0, other: 0 };
      const currentMonthCat = { bug: 0, complaint: 0, feature: 0, general: 0, improvement: 0, other: 0 };
      const lastMonthCat = { bug: 0, complaint: 0, feature: 0, general: 0, improvement: 0, other: 0 };
      const dailyBreakdown = {};

      // Initialize daily breakdown for current month
      for (let day = 1; day <= currentDay; day++) {
        dailyBreakdown[day] = { bug: 0, complaint: 0, feature: 0, general: 0, improvement: 0, other: 0 };
      }

      let currentMonthCount = 0;
      let lastMonthCount = 0;

      // Process each feedback
      allFeedbackForSite.forEach(fb => {
        const fbDate = new Date(fb.createdOn);
        const fbMonth = fbDate.getMonth();
        const fbYear = fbDate.getFullYear();
        const fbDay = fbDate.getDate();

        const category = categorizeFeedback(fb.title);
        categories[category]++;

        // Current month
        if (fbYear === dateRanges.current.year && fbMonth === dateRanges.current.monthIndex) {
          currentMonthCat[category]++;
          currentMonthCount++;

          if (fbDay <= currentDay) {
            dailyBreakdown[fbDay][category]++;
          }
        }

        // Last month
        if (fbYear === dateRanges.last.year && fbMonth === dateRanges.last.monthIndex) {
          lastMonthCat[category]++;
          lastMonthCount++;
        }
      });

      console.log(`${webUrl} - Current month: ${currentMonthCount}, Last month: ${lastMonthCount}`);

      analytics[webUrl] = {
        totalFeedback: allFeedbackForSite.length,
        currentMonth: {
          count: currentMonthCount,
          name: getMonthName(dateRanges.current.monthIndex),
        },
        lastMonth: {
          count: lastMonthCount,
          name: getMonthName(dateRanges.last.monthIndex),
        },
        categories: categories,
        monthlyBreakdown: {
          [getMonthName(dateRanges.current.monthIndex)]: currentMonthCat,
          [getMonthName(dateRanges.last.monthIndex)]: lastMonthCat,
        },
        dailyBreakdown: dailyBreakdown,
      };
    }

    console.log("Analytics complete!");
    return analytics;
  } catch (error) {
    console.error("Error in analytics:", error);
    throw error;
  }
};

// Helper functions (keep these the same)
const getMonthName = (monthIndex) => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return months[monthIndex];
};

const getDateRanges = () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  let lastMonth = currentMonth - 1;
  let lastYear = currentYear;
  if (lastMonth < 0) {
    lastMonth = 11;
    lastYear = currentYear - 1;
  }

  return {
    current: {
      start: new Date(Date.UTC(currentYear, currentMonth, 1, 0, 0, 0, 0)),
      end: new Date(Date.UTC(currentYear, currentMonth + 1, 0, 23, 59, 59, 999)),
      monthIndex: currentMonth,
      year: currentYear,
    },
    last: {
      start: new Date(Date.UTC(lastYear, lastMonth, 1, 0, 0, 0, 0)),
      end: new Date(Date.UTC(lastYear, lastMonth + 1, 0, 23, 59, 59, 999)),
      monthIndex: lastMonth,
      year: lastYear,
    },
  };
};

const FEEDBACK_CATEGORIES = {
  "Bug Report": "bug",
  "Complaint": "complaint",
  "Feature Request": "feature",
  "General Feedback": "general",
  "Improvement": "improvement",
};

const categorizeFeedback = (title) => {
  if (FEEDBACK_CATEGORIES[title]) {
    return FEEDBACK_CATEGORIES[title];
  }

  const titleLower = (title || '').toLowerCase().trim();
  if (titleLower.includes('bug')) return 'bug';
  if (titleLower.includes('complaint')) return 'complaint';
  if (titleLower.includes('feature')) return 'feature';
  if (titleLower.includes('improvement')) return 'improvement';
  if (titleLower.includes('general')) return 'general';

  return 'other';
};

const getDashboardData = async (req, res) => {
  try {
    const user = req.user;
    const { sites, webDataObjects, teams } = await getUserAccessibleWebsites(user.id);
    console.log({ sites })
    if (!sites || sites.length === 0) {
      return res.status(200).json({
        stats: {
          totalFeedbacks: 0,
          avgRating: 0,
          totalWidgets: 0,
          newFeedbackToday: 0
        },
        analytics: [],
        recentCriticalFeedback: [],
        teamMembers: [],
        widgets: []
      });
    }

    // 1. Fetch all feedback for accessible sites
    const allFeedback = await feedback.find({ webUrl: { $in: sites } }).sort({ createdOn: -1 });

    // 2. Calculate Stats
    const totalFeedbacks = allFeedback.length;

    const ratedFeedbacks = allFeedback.filter(f => f.rating && !isNaN(f.rating));
    const avgRating = ratedFeedbacks.length > 0
      ? (ratedFeedbacks.reduce((acc, curr) => acc + curr.rating, 0) / ratedFeedbacks.length).toFixed(1)
      : 0;

    const totalWidgets = sites.length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newFeedbackToday = allFeedback.filter(f => new Date(f.createdOn) >= today).length;

    // Calculate resolved count (status === true)
    const resolvedCount = allFeedback.filter(f => f.status === true).length;

    // 3. Analytics (Last 7 days for chart)
    const analytics = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayFeedbacks = allFeedback.filter(f => f.createdOn.toISOString().split('T')[0] === dateStr);

      analytics.push({
        date: d.toLocaleDateString('en-US', { weekday: 'short' }), // Mon, Tue
        count: dayFeedbacks.length,
        avgRating: dayFeedbacks.filter(f => f.rating).length > 0
          ? (dayFeedbacks.reduce((acc, f) => acc + (f.rating || 0), 0) / dayFeedbacks.filter(f => f.rating).length).toFixed(1)
          : 0
      });
    }

    // 4. Recent Critical Feedback (Low rating or High severity)
    const recentCriticalFeedback = allFeedback
      .filter(f => (f.rating && f.rating <= 2) || (f.severity && f.severity >= 4)) // Adjust thresholds as needed
      .slice(0, 5);

    // 5. Team Members (Mocking or fetching real if available)
    let teamMembers = [];


    // Better approach for Team Members: Fetch distinct users from teams
    // For now, let's return empty or implement a separate call if it's heavy. 
    // Actually, let's try to get some basic info.
    // We can fetch the team details with populated members.
    const populatedTeams = await Team.find({ _id: { $in: teams.map(t => t._id) } }).populate('members.user', 'name email profile');

    const membersMap = new Map();
    populatedTeams.forEach(team => {
      team.members.forEach(m => {
        if (m.user && !membersMap.has(m.user._id.toString())) {
          membersMap.set(m.user._id.toString(), {
            name: m.user.name,
            email: m.user.email,
            profile: m.user.profile,
            role: m.role,
            teamName: team.name
          });
        }
      });
    });
    teamMembers = Array.from(membersMap.values()).slice(0, 5); // Top 5 members

    // 6. Widgets List with specific stats
    const widgets = webDataObjects.map(site => {
      const siteFeedbacks = allFeedback.filter(f => f.webUrl === site.webUrl);
      const siteRated = siteFeedbacks.filter(f => f.rating);
      const siteAvg = siteRated.length > 0
        ? (siteRated.reduce((acc, f) => acc + f.rating, 0) / siteRated.length).toFixed(1)
        : 0;

      return {
        webUrl: site.webUrl,
        totalFeedback: siteFeedbacks.length,
        avgRating: siteAvg,
        lastActive: siteFeedbacks.length > 0 ? siteFeedbacks[0].createdOn : site.createdAt
      };
    });

    res.status(200).json({
      stats: {
        totalFeedbacks,
        avgRating,
        totalWidgets,
        newFeedbackToday,
        resolvedCount
      },
      analytics,
      recentCriticalFeedback,
      teamMembers,
      widgets
    });

  } catch (error) {
    console.error("Error in getDashboardData:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Delete single feedback by ID (RBAC: owner/editor only)
// NOTE: Some feedback _id values are stored as strings (not ObjectId) in MongoDB.
// Mongoose's findById casts to ObjectId which won't match string _ids.
// So we use the raw driver and try both string and ObjectId formats.
const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const mongoose = require('mongoose');

    // RBAC check
    const userRole = await getUserHighestRole(userId);
    if (userRole === 'viewer') {
      return res.status(403).json({ success: false, message: 'You do not have permission to delete feedback' });
    }

    const collection = mongoose.connection.db.collection('feedbacks');

    // Try string _id first (some docs have string _id), then ObjectId
    let result = await collection.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      // Fallback: try as ObjectId
      try {
        result = await collection.deleteOne({ _id: new mongoose.Types.ObjectId(id) });
      } catch (e) {
        // Invalid ObjectId format, ignore
      }
    }

    console.log('[deleteFeedback] ID:', id, '| Deleted:', result.deletedCount);

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    }

    return res.status(200).json({ success: true, message: 'Feedback deleted successfully' });
  } catch (error) {
    console.error('[deleteFeedback] ERROR:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};
// Bulk delete feedbacks by IDs (RBAC: owner/editor only)
// Same string _id issue as single delete — use raw driver
const bulkDeleteFeedback = async (req, res) => {
  try {
    const { ids } = req.body;
    const userId = req.user.id;
    const mongoose = require('mongoose');

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'No feedback IDs provided' });
    }

    // RBAC check
    const userRole = await getUserHighestRole(userId);
    if (userRole === 'viewer') {
      return res.status(403).json({ success: false, message: 'You do not have permission to delete feedback' });
    }

    const collection = mongoose.connection.db.collection('feedbacks');

    // Try string _id first, then ObjectId
    let result = await collection.deleteMany({ _id: { $in: ids } });

    if (result.deletedCount === 0) {
      // Fallback: try as ObjectIds
      try {
        const objectIds = ids.map(id => new mongoose.Types.ObjectId(id));
        result = await collection.deleteMany({ _id: { $in: objectIds } });
      } catch (e) {
        // Invalid ObjectId format, ignore
      }
    }

    console.log('[bulkDeleteFeedback] IDs:', ids.length, '| Deleted:', result.deletedCount);

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'No feedback found to delete' });
    }

    return res.status(200).json({
      success: true,
      message: `${result.deletedCount} feedback(s) deleted successfully`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('[bulkDeleteFeedback] ERROR:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Resolve/Unresolve single feedback by ID (RBAC: owner/editor only)
const resolveFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // true = resolved, false = unresolved
    const userId = req.user.id;
    const mongoose = require('mongoose');

    if (typeof status !== 'boolean') {
      return res.status(400).json({ success: false, message: 'Status must be a boolean' });
    }

    // RBAC check
    const userRole = await getUserHighestRole(userId);
    if (userRole === 'viewer') {
      return res.status(403).json({ success: false, message: 'You do not have permission to update feedback' });
    }

    const collection = mongoose.connection.db.collection('feedbacks');

    // Try string _id first, then ObjectId
    let result = await collection.updateOne({ _id: id }, { $set: { status, updatedOn: new Date() } });

    if (result.matchedCount === 0) {
      try {
        result = await collection.updateOne(
          { _id: new mongoose.Types.ObjectId(id) },
          { $set: { status, updatedOn: new Date() } }
        );
      } catch (e) {
        // Invalid ObjectId format, ignore
      }
    }

    console.log('[resolveFeedback] ID:', id, '| Status:', status, '| Matched:', result.matchedCount);

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    }

    return res.status(200).json({
      success: true,
      message: `Feedback ${status ? 'resolved' : 'unresolved'} successfully`
    });
  } catch (error) {
    console.error('[resolveFeedback] ERROR:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Bulk resolve/unresolve feedbacks by IDs (RBAC: owner/editor only)
const bulkResolveFeedback = async (req, res) => {
  try {
    const { ids, status } = req.body;
    const userId = req.user.id;
    const mongoose = require('mongoose');

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'No feedback IDs provided' });
    }
    if (typeof status !== 'boolean') {
      return res.status(400).json({ success: false, message: 'Status must be a boolean' });
    }

    // RBAC check
    const userRole = await getUserHighestRole(userId);
    if (userRole === 'viewer') {
      return res.status(403).json({ success: false, message: 'You do not have permission to update feedback' });
    }

    const collection = mongoose.connection.db.collection('feedbacks');

    // Try string _id first, then ObjectId
    let result = await collection.updateMany(
      { _id: { $in: ids } },
      { $set: { status, updatedOn: new Date() } }
    );

    if (result.matchedCount === 0) {
      try {
        const objectIds = ids.map(id => new mongoose.Types.ObjectId(id));
        result = await collection.updateMany(
          { _id: { $in: objectIds } },
          { $set: { status, updatedOn: new Date() } }
        );
      } catch (e) {
        // Invalid ObjectId format, ignore
      }
    }

    console.log('[bulkResolveFeedback] IDs:', ids.length, '| Status:', status, '| Matched:', result.matchedCount);

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: 'No feedback found to update' });
    }

    return res.status(200).json({
      success: true,
      message: `${result.modifiedCount} feedback(s) ${status ? 'resolved' : 'unresolved'} successfully`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('[bulkResolveFeedback] ERROR:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createFeed,
  getFeed,
  display,
  allFeedback,
  exportFeedback,
  getUserAccessibleWebsites,
  getDashboardData,
  deleteFeedback,
  bulkDeleteFeedback,
  resolveFeedback,
  bulkResolveFeedback
};
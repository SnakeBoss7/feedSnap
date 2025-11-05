const user = require("../models/user");
const webData = require("../models/WebData");
const feedback = require("../models/feedback");
const Team = require("../models/teamSchema");
const cloudinary = require("../config/cloudinary");
const path = require('path')
const { Parser } = require("json2csv");
const PDFDocument = require("pdfkit");
const fs = require('fs')
const { sendFeedbackEmail } = require("../utils/ackMails");
const {computeSeverity} = require("../utils/severityCompute");

// Helper function to get all websites accessible to a user
const getUserAccessibleWebsites = async (userId) => {
  try {
    const directWebData = await webData.find({
      $or: [
        { owner: userId },
        { members: userId }
      ]
    });

    const userTeams = await Team.find({
      'members.user': userId
    }).select('webData');

    const directSites = directWebData.map(web => web.webUrl);
    const teamSites = userTeams
      .map(team => team.webData)
      .filter(webData => webData);

    const allSites = [...new Set([...directSites, ...teamSites])];

    return {
      sites: allSites,
      webDataObjects: directWebData,
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
      const fields = ["title", "description", "rating", "webUrl", "pathname", "createdOn"];
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
  const {webUrl,pathname,title,email,description,rating,config}= req.body;
  console.log({webUrl,pathname,title,email,description,rating});
  let severity = computeSeverity({title,rating,description,email,status:false});
  res.status(200).json({ mess: "cooked" });
  let data = await feedback.create({...req.body,severity,status:false});
  
  if(req.body.config?.ackMail) {
    const currentDate = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    let filepath = path.join(process.cwd(),"utils","ackMail.html")
    let  mailContent = fs.readFileSync(filepath,"utf-8")
    console.log({filepath,mailContent})
        mailContent= mailContent
      .replace(/{{email}}/g, email)
      .replace(/{{title}}/g, title)
      .replace(/{{webUrl}}/g, webUrl)
      .replace(/{{rating}}/g, rating)
      .replace(/{{description}}/g, description)
      .replace(/{{pathname}}/g, pathname)
      .replace(/{{currentDate}}/g, currentDate);
    // const templatePath = path.join(process.cwd(), "templates", "ackMail.html");
    // console.log({filepath});
    sendFeedbackEmail(email,`Your feedback has been received — ${webUrl} Team`,mailContent);
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
const allFeedback = async (req, res) => {
  try {
    console.log("[allFeedback] START");
    const user = req.user;
    
    const { sites } = await getUserAccessibleWebsites(user.id);
    console.log("[allFeedback] User sites:", sites);
    
    if (!sites || sites.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        sites: [],
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
     userTeams:teamOptions,
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

module.exports = { 
  createFeed, 
  getFeed, 
  display, 
  allFeedback,  // THIS WAS MISSING
  exportFeedback,
  getUserAccessibleWebsites 
};
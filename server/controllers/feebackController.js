const user = require("../models/user");
const webData = require("../models/WebData");
const feedback = require("../models/feedback");
const Team = require("../models/teamSchema"); // Add this import
const cloudinary = require("../config/cloudinary");
const { Parser } = require("json2csv");
const PDFDocument = require("pdfkit");
const { sendFeedbackEmail } = require("../utils/ackMails");

// Helper function to get all websites accessible to a user
const getUserAccessibleWebsites = async (userId) => {
  try {
    // 1. Get websites directly owned by or shared with the user
    const directWebData = await webData.find({
      $or: [
        { owner: userId },
        { members: userId }
      ]
    });

    // 2. Get teams where user is a member
    const userTeams = await Team.find({
      'members.user': userId
    }).select('webData');

    // 3. Combine direct websites and team websites
    const directSites = directWebData.map(web => web.webUrl);
    const teamSites = userTeams
      .map(team => team.webData)
      .filter(webData => webData); // Filter out null/undefined

    // 4. Merge and deduplicate
    const allSites = [...new Set([...directSites, ...teamSites])];

    return {
      sites: allSites,
      webDataObjects: directWebData,
      teams: userTeams
    };
  } catch (error) {
    //.error("Error fetching user accessible websites:", error);
    throw error;
  }
};

//creating exportable file
const exportFeedback = async (req, res) => {
  try {
    const user = req.user;
    
    // Use the helper function to get all accessible websites
    const { sites } = await getUserAccessibleWebsites(user.id);
    
    const feedbacks = await feedback
      .find({ webUrl: { $in: sites } })
      .sort({ createdOn: -1, webUrl: 1 });

    const { format } = req.query; // csv | pdf | json
    //.log(format);

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
    //.error(err);
    res.status(500).json({ message: "Error exporting feedback" });
  }
};

//adding feedback to mongo
const createFeed = async (req, res) => {
  //.log(req.body);
  const {webUrl,pathname,title,email,description,rating,config}= req.body
  res.status(200).json({ mess: "cooked" });
  let data = await feedback.create(req.body);
  if(req.body.config.ackMail)
    {
      const currentDate = new Date().toLocaleString("en-IN", {
  timeZone: "Asia/Kolkata",
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

      let mail = `<html>
  <body style=\"font-family: 'Helvetica Neue', Arial, sans-serif; color:#111; margin:0; padding:0;\">
    <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"background:#f6f7fb; padding:28px 0;\">
      <tr>
        <td align=\"center\">
          <table width=\"600\" cellpadding=\"0\" cellspacing=\"0\" style=\"background:#ffffff; border-radius:8px; overflow:hidden;\">
            <tr>
              <td style=\"padding:28px;\">
                <h1 style=\"margin:0 0 8px 0; font-size:20px;\">We received your feedback — thank you👏</h1>
                <p style=\"margin:0 0 18px 0; color:#555;\">We’ve recorded your submission and a member of our team will review it shortly.</p>

                <h3 style=\"margin:12px 0 6px 0; font-size:14px; color:#333;\">What you sent</h3>
                <table cellpadding=\"6\" cellspacing=\"0\" style=\"width:100%; border-collapse:collapse; font-size:14px; color:#333;\">
                  <tr>
                    <td style=\"width:130px; color:#666;\">Type</td>
                    <td><strong>${title}</strong></td>
                  </tr>
                  <tr style=\"background:#fafafa;\">
                    <td style=\"color:#666;\">Rating</td>
                    <td><strong>${rating} / 5</strong></td>
                  </tr>
                  <tr>
                    <td style=\"color:#666; vertical-align:top;\">Title</td>
                    <td>${title}</td>
                  </tr>
                  <tr style=\"background:#fafafa;\">
                    <td style=\"color:#666; vertical-align:top;\">Comment</td>
                    <td style=\"white-space:pre-wrap;\">${description}</td>
                  </tr>
                  <tr>
                    <td style=\"color:#666;\">Website</td>
                    <td><a href=\"${webUrl}\" target=\"_blank\" style=\"color:#0366d6; text-decoration:none;\">${webUrl}</a></td>
                  </tr>
                  <tr style=\"background:#fafafa;\">
                    <td style=\"color:#666;\">Page</td>
                    <td>${pathname}</td>
                  </tr>
                  <tr>
                    <td style=\"color:#666;\">Submitted</td>
                    <td>${currentDate}</td>
                  </tr>
                </table>

                <p style=\"margin:18px 0 0 0; color:#555; font-size:13px;\">
                  We take your privacy seriously — your email will only be used to follow up on this feedback. If you’d like a direct reply, simply hit reply to this message.
                </p>

                <div style=\"margin-top:20px; display:flex; gap:12px; align-items:center;\">
                  <a href=\"mailto:support@${email}\" style=\"color:#0366d6; text-decoration:none; font-size:13px;\">Contact support</a>
                </div>

                <hr style=\"border:none;border-top:1px solid #eee;margin:22px 0;\" />
                <p style=\"margin:0; font-size:13px; color:#777;\">Thanks — FeedSnap Team<br/><small style=\"color:#aaa;\">FeedSnap• Built with ❤️</small></p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
      
sendFeedbackEmail(email,`Thanks for your feedback on ${webUrl}`,mail);
}

  //.log(data);
};

const getFeed = async (req, res) => {
  const user = req.user;
  //.log(user);
  
  // Use the helper function to get all accessible websites
  const { sites, webDataObjects } = await getUserAccessibleWebsites(user.id);
  
  //.log("All accessible sites:", sites);

  //getting users feedback
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

  //.log(totalFeedbacks1);
  //.log(avgRating1);

  //rating of each site
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

// getting last and current months total
const getMonthName = (monthIndex) => {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return months[monthIndex];
};

// Define feedback categories
const FEEDBACK_CATEGORIES = {
  "Bug Reports": "bug",
  Complaints: "complaint",
  "Feature Requests": "feature",
  "General Feedback": "general",
  Improvements: "improvement",
};

// Helper function to get date ranges for current and last month
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

// Helper function to get total feedback count for a website
const getTotalFeedbackCount = async (webUrl) => {
  try {
    const count = await feedback.countDocuments({ webUrl });
    return count;
  } catch (error) {
    //.error(`Error getting total feedback for ${webUrl}:`, error);
    return 0;
  }
};

// Helper function to get feedback count for a specific time period
const getFeedbackCountByPeriod = async (webUrl, startDate, endDate) => {
  try {
    const count = await feedback.countDocuments({
      webUrl,
      createdOn: {
        $gte: startDate,
        $lte: endDate,
      },
    });
    return count;
  } catch (error) {
    //.error(`Error getting feedback count by period for ${webUrl}:`, error);
    return 0;
  }
};

// Helper function to get feedback breakdown by category for a specific period
const getFeedbackBreakdownByPeriod = async (webUrl, startDate, endDate) => {
  try {
    const pipeline = [
      {
        $match: {
          webUrl,
          createdOn: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: "$title",
          count: { $sum: 1 },
        },
      },
    ];

    const results = await feedback.aggregate(pipeline);

    const breakdown = {
      bug: 0,
      complaint: 0,
      feature: 0,
      general: 0,
      improvement: 0,
      other: 0,
    };

    results.forEach((result) => {
      const category = FEEDBACK_CATEGORIES[result._id] || "other";
      breakdown[category] = result.count;
    });

    return breakdown;
  } catch (error) {
    //.error(`Error getting feedback breakdown for ${webUrl}:`, error);
    return {
      bug: 0,
      complaint: 0,
      feature: 0,
      general: 0,
      improvement: 0,
      other: 0,
    };
  }
};

// Helper function to get overall category breakdown (all time)
const getOverallCategoryBreakdown = async (webUrl) => {
  try {
    const pipeline = [
      {
        $match: { webUrl },
      },
      {
        $group: {
          _id: "$title",
          count: { $sum: 1 },
        },
      },
    ];

    const results = await feedback.aggregate(pipeline);

    const breakdown = {
      bug: 0,
      complaint: 0,
      feature: 0,
      general: 0,
      improvement: 0,
      other: 0,
    };

    results.forEach((result) => {
      const category = FEEDBACK_CATEGORIES[result._id] || "other";
      breakdown[category] = result.count;
    });

    return breakdown;
  } catch (error) {
    //.error(`Error getting overall breakdown for ${webUrl}:`, error);
    return {
      bug: 0,
      complaint: 0,
      feature: 0,
      general: 0,
      improvement: 0,
      other: 0,
    };
  }
};

// Helper function to get daily breakdown for current month
const getCurrentMonthDailyBreakdown = async (webUrl) => {
  try {
    const dateRanges = getDateRanges();

    const daysInMonth = new Date(
      dateRanges.current.year,
      dateRanges.current.monthIndex + 1,
      0
    ).getDate();

    const pipeline = [
      {
        $match: {
          webUrl,
          createdOn: {
            $gte: dateRanges.current.start,
            $lte: dateRanges.current.end,
          },
        },
      },
      {
        $addFields: {
          createdOnDate: {
            $cond: {
              if: { $eq: [{ $type: "$createdOn" }, "string"] },
              then: { $dateFromString: { dateString: "$createdOn" } },
              else: "$createdOn",
            },
          },
        },
      },
      {
        $group: {
          _id: {
            day: { $dayOfMonth: "$createdOnDate" },
            title: "$title",
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.day": 1 },
      },
    ];

    const results = await feedback.aggregate(pipeline);

    const dailyBreakdown = {};
    for (let day = 1; day <= daysInMonth; day++) {
      dailyBreakdown[day] = {
        bug: 0,
        complaint: 0,
        feature: 0,
        general: 0,
        improvement: 0,
        other: 0,
      };
    }

    results.forEach((result) => {
      const day = result._id.day;
      const title = result._id.title;
      const count = result.count;
      const category = FEEDBACK_CATEGORIES[title] || "other";

      dailyBreakdown[day][category] = count;
    });

    return dailyBreakdown;
  } catch (error) {
    //.error(`Error getting daily breakdown for ${webUrl}:`, error);
    return {};
  }
};

// Main function to get detailed feedback analytics for a single website
const getWebsiteFeedbackAnalytics = async (webUrl) => {
  try {
    const dateRanges = getDateRanges();

    const [
      totalFeedback,
      currentMonthCount,
      lastMonthCount,
      overallBreakdown,
      currentMonthBreakdown,
      lastMonthBreakdown,
      dailyBreakdown,
    ] = await Promise.all([
      getTotalFeedbackCount(webUrl),
      getFeedbackCountByPeriod(webUrl, dateRanges.current.start, dateRanges.current.end),
      getFeedbackCountByPeriod(webUrl, dateRanges.last.start, dateRanges.last.end),
      getOverallCategoryBreakdown(webUrl),
      getFeedbackBreakdownByPeriod(webUrl, dateRanges.current.start, dateRanges.current.end),
      getFeedbackBreakdownByPeriod(webUrl, dateRanges.last.start, dateRanges.last.end),
      getCurrentMonthDailyBreakdown(webUrl),
    ]);

    return {
      totalFeedback,
      currentMonth: {
        count: currentMonthCount,
        name: getMonthName(dateRanges.current.monthIndex),
      },
      lastMonth: {
        count: lastMonthCount,
        name: getMonthName(dateRanges.last.monthIndex),
      },
      categories: overallBreakdown,
      monthlyBreakdown: {
        [getMonthName(dateRanges.current.monthIndex)]: currentMonthBreakdown,
        [getMonthName(dateRanges.last.monthIndex)]: lastMonthBreakdown,
      },
      dailyBreakdown: dailyBreakdown,
    };
  } catch (error) {
    //.error(`Error getting analytics for ${webUrl}:`, error);
    throw error;
  }
};

// Main function to get detailed feedback analytics for multiple websites
const getDetailedFeedbackAnalytics = async (webUrls) => {
  try {
    //.log("Getting detailed feedback analytics for websites:", webUrls);

    const analytics = {};

    for (const webUrl of webUrls) {
      //.log(`Processing analytics for: ${webUrl}`);
      analytics[webUrl] = await getWebsiteFeedbackAnalytics(webUrl);
    }

    return analytics;
  } catch (error) {
    //.error("Error getting detailed feedback analytics:", error);
    throw error;
  }
};

// Optimized function using aggregation for better performance
const getDetailedFeedbackAnalyticsOptimized = async (webUrls) => {
  try {
    //.log("Getting optimized detailed feedback analytics for websites:", webUrls);

    const dateRanges = getDateRanges();
    const analytics = {};

    for (const webUrl of webUrls) {
      const pipeline = [
        { $match: { webUrl } },
        {
          $addFields: {
            createdOnDate: {
              $cond: {
                if: { $eq: [{ $type: "$createdOn" }, "string"] },
                then: { $dateFromString: { dateString: "$createdOn" } },
                else: "$createdOn",
              },
            },
          },
        },
        {
          $facet: {
            total: [{ $count: "count" }],
            currentMonth: [
              {
                $match: {
                  createdOnDate: {
                    $gte: dateRanges.current.start,
                    $lte: dateRanges.current.end,
                  },
                },
              },
              {
                $group: {
                  _id: "$title",
                  count: { $sum: 1 },
                },
              },
            ],
            lastMonth: [
              {
                $match: {
                  createdOnDate: {
                    $gte: dateRanges.last.start,
                    $lte: dateRanges.last.end,
                  },
                },
              },
              {
                $group: {
                  _id: "$title",
                  count: { $sum: 1 },
                },
              },
            ],
            overall: [
              {
                $group: {
                  _id: "$title",
                  count: { $sum: 1 },
                },
              },
            ],
            dailyBreakdown: [
              {
                $match: {
                  createdOnDate: {
                    $gte: dateRanges.current.start,
                    $lte: dateRanges.current.end,
                  },
                },
              },
              {
                $group: {
                  _id: {
                    day: { $dayOfMonth: "$createdOnDate" },
                    title: "$title",
                  },
                  count: { $sum: 1 },
                },
              },
              {
                $sort: { "_id.day": 1 },
              },
            ],
          },
        },
      ];

      const results = await feedback.aggregate(pipeline);
      const result = results[0];

      const totalFeedback = result.total.length > 0 ? result.total[0].count : 0;

      const convertToBreakdown = (aggregationResults) => {
        const breakdown = {
          bug: 0,
          complaint: 0,
          feature: 0,
          general: 0,
          improvement: 0,
          other: 0,
        };

        aggregationResults.forEach((item) => {
          const category = FEEDBACK_CATEGORIES[item._id] || "other";
          breakdown[category] = item.count;
        });

        return breakdown;
      };

      const processDailyBreakdown = (dailyResults) => {
        const daysInMonth = new Date(
          dateRanges.current.year,
          dateRanges.current.monthIndex + 1,
          0
        ).getDate();

        const dailyBreakdown = {};
        for (let day = 1; day <= daysInMonth; day++) {
          dailyBreakdown[day] = {
            bug: 0,
            complaint: 0,
            feature: 0,
            general: 0,
            improvement: 0,
            other: 0,
          };
        }

        dailyResults.forEach((item) => {
          const day = item._id.day;
          const title = item._id.title;
          const count = item.count;
          const category = FEEDBACK_CATEGORIES[title] || "other";

          dailyBreakdown[day][category] = count;
        });

        return dailyBreakdown;
      };

      const overallBreakdown = convertToBreakdown(result.overall);
      const currentMonthBreakdown = convertToBreakdown(result.currentMonth);
      const lastMonthBreakdown = convertToBreakdown(result.lastMonth);
      const dailyBreakdown = processDailyBreakdown(result.dailyBreakdown);

      const currentMonthTotal = result.currentMonth.reduce((sum, item) => sum + item.count, 0);
      const lastMonthTotal = result.lastMonth.reduce((sum, item) => sum + item.count, 0);

      analytics[webUrl] = {
        totalFeedback,
        currentMonth: {
          count: currentMonthTotal,
          name: getMonthName(dateRanges.current.monthIndex),
        },
        lastMonth: {
          count: lastMonthTotal,
          name: getMonthName(dateRanges.last.monthIndex),
        },
        categories: overallBreakdown,
        monthlyBreakdown: {
          [getMonthName(dateRanges.current.monthIndex)]: currentMonthBreakdown,
          [getMonthName(dateRanges.last.monthIndex)]: lastMonthBreakdown,
        },
        dailyBreakdown: dailyBreakdown,
      };
    }

    return analytics;
  } catch (error) {
    //.error("Error getting optimized detailed feedback analytics:", error);
    throw error;
  }
};

// Updated display function with team support
const display = async (req, res) => {
  //.log("Display detailed analytics function called");
  try {
    const user = req.user;

    // Use the helper function to get all accessible websites
    const { sites } = await getUserAccessibleWebsites(user.id);
    
    //.log("Sites for detailed analytics:", sites);

    if (sites.length === 0) {
      return res.json({
        success: true,
        data: {},
        message: "No websites found for this user",
      });
    }

    const analytics = await getDetailedFeedbackAnalyticsOptimized(sites);
    //.log("Detailed analytics result:", JSON.stringify(analytics, null, 2));
    
    res.json({
      success: true,
      data: analytics,
      sites: sites,
    });
  } catch (error) {
    //.error("Error in display detailed analytics function:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Updated allFeedback function with team support
const allFeedback = async (req, res) => {
  //.log("allFeedback function called");
  try {
    const user = req.user;

    // Use the helper function to get all accessible websites
    const { sites } = await getUserAccessibleWebsites(user.id);
    
    //.log("All accessible sites for feedback:", sites);
    
    let data = await feedback.aggregate([
      { $match: { webUrl: { $in: sites } } },
      { $sort: { createdOn: -1 } },
    ]);
    
    //.log('Fetched feedback count:', data.length);
    const userTeams = await Team.find({
  'members.user': user.id,
  'members.role': { $in: ['owner', 'editor'] },
});
const teamOptions = userTeams.map(team => ({
  value: team.mail,   // the email will be the value
  label: team.name    // the team name will be shown in the dropdown
}));
  //.log({userTeams})
    return res.status(200).json({
      success: true,
      sites: sites,
      userTeams:teamOptions,
      data: data,
    });
  } catch (err) {
    //.error("Error in allFeedback function:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = { createFeed, getFeed, display, allFeedback, exportFeedback,getUserAccessibleWebsites }
const user = require("../models/user");
const webData = require("../models/WebData");
const feedback = require("../models/feedback");
const cloudinary = require("../config/cloudinary");
const { Parser } = require("json2csv");
const PDFDocument = require("pdfkit");

//creating exportable file
const exportFeedback = async (req, res) => {
    try {
          const user = req.user;
        const userWebData = await webData.find({
    $or: [
      { owner: user.id },
      { members: user.id }
    ]
  });
  const sites = userWebData.map((web) => web.webUrl);
  const feedbacks = await feedback
    .find({ webUrl: { $in: sites } })
    .sort({ createdOn: -1 ,webUrl:1});

    const { format } = req.query; // csv | pdf | json
  console.log(format);
    if (format === "csv") {
      const fields = ["title", "description", "rating", "webUrl","pathname", "createdOn"];
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
          `${i + 1}. [${fb.website}] ⭐${fb.rating}\nTitle: ${fb.title}\nDesc: ${fb.description}\nDate: ${fb.createdAt}\n`
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
//adding feedback to mongo
const createFeed = async (req, res) => {
  console.log(req.body);
  res.status(200).json({ mess: "cooked" });
  let data = await feedback.create(req.body);
  console.log(data);
};

const getFeed = async (req, res) => {
  const user = req.user;
  console.log(user);
  //getting user websites
      const userWebData = await webData.find({
    $or: [
      { owner: user.id },
      { members: user.id }
    ]
  });
  console.log(userWebData)
  const sites = userWebData.map((web) => web.webUrl);
  // console.log(sites);

  //getting users feedback
  const userfeedback = await feedback
    .find({ webUrl: { $in: sites } })
    .sort({ createdOn: -1 });
  // console.log(userfeedback)
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
  // Alternative approach: More efficient for large datasets
  const totalFeedbacks1 = await webData.aggregate([
    {
      $match: {
        webUrl: { $in: sites },
      },
    },
    {
      $lookup: {
        from: "feedback",
        let: { webUrl: "$webUrl" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$webUrl", "$$webUrl"] },
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
  console.log(totalFeedbacks1);
  console.log(avgRating1);
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
      // console.log(rating);
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
  // console.log(avgRatingPerSite);
  res
    .status(200)
    .json({
      sites,
      userfeedback,
      totalFeedbacks,
      avgRatingPerSite,
      avgRating,
      feedbackPerSite,
      mess: "data fetched succesfully",
    });
  // res.status(400).json({mess:'fetch failed ,Looks like you have no data'})
};

// getting last and current months total
const getMonthName = (monthIndex) => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
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

  // Calculate last month
  let lastMonth = currentMonth - 1;
  let lastYear = currentYear;
  if (lastMonth < 0) {
    lastMonth = 11;
    lastYear = currentYear - 1;
  }

  return {
    current: {
      start: new Date(Date.UTC(currentYear, currentMonth, 1, 0, 0, 0, 0)),
      end: new Date(
        Date.UTC(currentYear, currentMonth + 1, 0, 23, 59, 59, 999)
      ),
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
    console.error(`Error getting total feedback for ${webUrl}:`, error);
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
    console.error(
      `Error getting feedback count by period for ${webUrl}:`,
      error
    );
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

    // Initialize all categories with 0
    const breakdown = {
      bug: 0,
      complaint: 0,
      feature: 0,
      general: 0,
      improvement: 0,
      other: 0,
    };

    // Map results to our categories
    results.forEach((result) => {
      const category = FEEDBACK_CATEGORIES[result._id] || "other";
      breakdown[category] = result.count;
    });

    return breakdown;
  } catch (error) {
    console.error(`Error getting feedback breakdown for ${webUrl}:`, error);
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

    // Initialize all categories with 0
    const breakdown = {
      bug: 0,
      complaint: 0,
      feature: 0,
      general: 0,
      improvement: 0,
      other: 0,
    };

    // Map results to our categories
    results.forEach((result) => {
      const category = FEEDBACK_CATEGORIES[result._id] || "other";
      breakdown[category] = result.count;
    });

    return breakdown;
  } catch (error) {
    console.error(`Error getting overall breakdown for ${webUrl}:`, error);
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

// NEW: Helper function to get daily breakdown for current month
const getCurrentMonthDailyBreakdown = async (webUrl) => {
  try {
    const dateRanges = getDateRanges();

    // Get the number of days in current month
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
          // Convert createdOn to Date if it's a string
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

    // Initialize all days with zero counts
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

    // Fill in actual feedback counts
    results.forEach((result) => {
      const day = result._id.day;
      const title = result._id.title;
      const count = result.count;
      const category = FEEDBACK_CATEGORIES[title] || "other";

      dailyBreakdown[day][category] = count;
    });

    return dailyBreakdown;
  } catch (error) {
    console.error(`Error getting daily breakdown for ${webUrl}:`, error);
    return {};
  }
};

// Main function to get detailed feedback analytics for a single website
const getWebsiteFeedbackAnalytics = async (webUrl) => {
  try {
    const dateRanges = getDateRanges();

    // Get all the data in parallel for better performance
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
      getFeedbackCountByPeriod(
        webUrl,
        dateRanges.current.start,
        dateRanges.current.end
      ),
      getFeedbackCountByPeriod(
        webUrl,
        dateRanges.last.start,
        dateRanges.last.end
      ),
      getOverallCategoryBreakdown(webUrl),
      getFeedbackBreakdownByPeriod(
        webUrl,
        dateRanges.current.start,
        dateRanges.current.end
      ),
      getFeedbackBreakdownByPeriod(
        webUrl,
        dateRanges.last.start,
        dateRanges.last.end
      ),
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
      // Overall category breakdown
      categories: overallBreakdown,
      // Monthly breakdowns (keeping for compatibility)
      monthlyBreakdown: {
        [getMonthName(dateRanges.current.monthIndex)]: currentMonthBreakdown,
        [getMonthName(dateRanges.last.monthIndex)]: lastMonthBreakdown,
      },
      // NEW: Daily breakdown for current month
      dailyBreakdown: dailyBreakdown,
    };
  } catch (error) {
    console.error(`Error getting analytics for ${webUrl}:`, error);
    throw error;
  }
};

// Main function to get detailed feedback analytics for multiple websites
const getDetailedFeedbackAnalytics = async (webUrls) => {
  try {
    console.log("Getting detailed feedback analytics for websites:", webUrls);

    const analytics = {};

    // Process each website
    for (const webUrl of webUrls) {
      console.log(`Processing analytics for: ${webUrl}`);
      analytics[webUrl] = await getWebsiteFeedbackAnalytics(webUrl);
    }

    return analytics;
  } catch (error) {
    console.error("Error getting detailed feedback analytics:", error);
    throw error;
  }
};

// Alternative function using aggregation for better performance (single query per website)
const getDetailedFeedbackAnalyticsOptimized = async (webUrls) => {
  try {
    console.log(
      "Getting optimized detailed feedback analytics for websites:",
      webUrls
    );

    const dateRanges = getDateRanges();
    const analytics = {};

    for (const webUrl of webUrls) {
      const pipeline = [
        { $match: { webUrl } },
        {
          $addFields: {
            // Convert createdOn to Date if it's a string
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
            // NEW: Daily breakdown for current month
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

      // Process results
      const totalFeedback = result.total.length > 0 ? result.total[0].count : 0;

      // Helper function to convert aggregation results to our format
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

      // Process daily breakdown
      const processDailyBreakdown = (dailyResults) => {
        // Get the number of days in current month
        const daysInMonth = new Date(
          dateRanges.current.year,
          dateRanges.current.monthIndex + 1,
          0
        ).getDate();

        // Initialize all days with zero counts
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

        // Fill in actual feedback counts
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

      // Calculate month totals
      const currentMonthTotal = result.currentMonth.reduce(
        (sum, item) => sum + item.count,
        0
      );
      const lastMonthTotal = result.lastMonth.reduce(
        (sum, item) => sum + item.count,
        0
      );

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
        // NEW: Daily breakdown for current month
        dailyBreakdown: dailyBreakdown,
      };
    }

    return analytics;
  } catch (error) {
    console.error(
      "Error getting optimized detailed feedback analytics:",
      error
    );
    throw error;
  }
};

// Updated display function with detailed analytics
const display = async (req, res) => {
  console.log("Display detailed analytics function called");
  try {
    const user = req.user;

    // Getting user websites
      const userWebData = await webData.find({
    $or: [
      { owner: user.id },
      { members: user.id }
    ]
  });
  console.log('webdata',userWebData);
    const sites = userWebData.map((web) => web.webUrl);

    console.log("Sites for detailed analytics:", sites);

    if (sites.length === 0) {
      return res.json({
        success: true,
        data: {},
        message: "No websites found for this user",
      });
    }

    // Get detailed analytics (use optimized version for better performance)
    const analytics = await getDetailedFeedbackAnalyticsOptimized(sites);
    console.log(
      "Detailed analytics result:",
      JSON.stringify(analytics, null, 2)
    );
    res.json({
      success: true,
      data: analytics,
      sites: sites,
    });
  } catch (error) {
    console.error("Error in display detailed analytics function:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const allFeedback = async (req, res) => {
  console.log("Display detailed analytics function called");
  try {
    const user = req.user;

    // Getting user websites
     const userWebData = await webData.find({
    $or: [
      { owner: user.id },
      { members: user.id }
    ]
  });
    const sites = userWebData.map((web) => web.webUrl);
    let data = await feedback.aggregate([
      { $match: { webUrl: { $in: sites } } },
      { $sort: { createdOn: -1 } },
    ])
    console.log(data);
    return res.status(200).json({
      success: true,
      sites: sites,
      data: data,
    });
  } catch (err) {
    console.error("Error in display detailed analytics function:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { createFeed, getFeed, display, allFeedback,exportFeedback };

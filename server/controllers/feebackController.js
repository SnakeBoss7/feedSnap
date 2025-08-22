const user = require('../models/user')
const webData = require('../models/WebData')
const feedback = require('../models/feedback')
const cloudinary = require('../config/cloudinary');

const createFeed = async (req, res) => {
  console.log(req.body);
  res.status(200).json({mess:'cooked'})
  let data = await feedback.create(req.body);
  console.log(data);
}

const getFeed = async(req,res) =>
  {
    
    const user = req.user;

    //getting user websites
    const userWebData =await webData.find({userId:user.id});
    const sites = userWebData.map(web=>(web.webUrl));
    // console.log(sites);

    //getting users feedback
    const userfeedback = await feedback.find({webUrl:{$in:sites}}).sort({createdOn:-1});
    // console.log(userfeedback)
    const avgRating1 = await feedback.aggregate(
      [
        {
          $match: {
            webUrl: { $in: sites },
            rating: { $type: "number" }
          }
        },
        {
           $group: {
      _id: "$webUrl",
      avgRating: { $avg: "$rating" },
      totalRating: { $sum: 1 }
    }
        },
        {
       $project: {
      _id: 0,
      website: "$_id",
      avgRating: { $round: ["$avgRating", 2] },
      totalRating: 1
    }
        }
      ])
// Alternative approach: More efficient for large datasets
const totalFeedbacks1 = await webData.aggregate([
  {
    $match: {
      webUrl: { $in: sites }
    }
  },
  {
    $lookup: {
      from: "feedback",
      let: { webUrl: "$webUrl" },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ["$webUrl", "$$webUrl"] }
          }
        },
        {
          $count: "count"
        }
      ],
      as: "feedbackCount"
    }
  },
  {
    $project: {
      _id: 0,
      website: "$webUrl",
      totalFeedbacks: {
        $ifNull: [
          { $arrayElemAt: ["$feedbackCount.count", 0] },
          0
        ]
      }
    }
  }
]);
    console.log(totalFeedbacks1)
      console.log(avgRating1);
    //rating of each site
    const ratingPerSite = {};
    const avgRatingPerSite={};
    const ratingCountPerSite = {};
    const feedbackPerSite = {};
    let totalFeedbacks = userfeedback.length;
  userfeedback.forEach((fb) => {
  const { webUrl, rating } = fb;
      feedbackPerSite[webUrl] = (feedbackPerSite[webUrl] || 0 ) +1;
      if(!isNaN(rating) && rating && rating!=='' && rating!==' '  )
        {
          // console.log(rating);
          ratingPerSite[webUrl] = (ratingPerSite[webUrl] || 0 ) + rating;
          ratingCountPerSite[webUrl] = (ratingCountPerSite[webUrl] || 0 ) + 1;

        }
});
  sites.forEach(site=>
    {
      avgRatingPerSite[site] = (ratingPerSite[site] /ratingCountPerSite[site]).toFixed(1);
    })
    const values = Object.values(avgRatingPerSite).map(Number);
    const total = values.reduce((acc,val)=> acc+val,0 );
    const avgRating = (total / values.length).toFixed(1);
    // console.log(avgRatingPerSite);
    res.status(200).json({sites,userfeedback,totalFeedbacks,avgRatingPerSite,avgRating,feedbackPerSite,mess:'data fetched succesfully'});
    // res.status(400).json({mess:'fetch failed ,Looks like you have no data'})
  }
module.exports = { createFeed,getFeed };
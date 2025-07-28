const user = require('../models/user')
const webData = require('../models/WebData')
const feedback = require('../models/feedback')
const cloudinary = require('../config/cloudinary');

const createFeed = (req, res) => {
  console.log(req.body);
  res.status(200).json({mess:'cooked'})
//   if (req.file) {

//   console.log('📤 Uploading to Cloudinary...');

//   const stream = cloudinary.uploader.upload_stream(
//     { folder: 'feedback_images' },
//     (error, result) => {
//       if (error) {
//         console.error('❌ Cloudinary error:', error);
//         return res.status(500).json({ error: 'Upload failed', detail: error });
//       }

//       console.log('✅ Upload successful');
//       return res.status(200).json({ url: result.secure_url });
//     }
//   );

//   stream.end(req.file.buffer); // ✅ Send the file buffer into the stream
// };
// res.status(200).json({ message: "File uploaded successfully" });
}

const getFeed = async(req,res) =>
  {
    
    const user = req.user;

    //getting user websites
    const userWebData =await webData.find({userId:user.id});
    const sites = userWebData.map(web=>(web.webUrl));
    console.log(sites);

    //getting users feedback
    const userfeedback = await feedback.find({webUrl:{$in:sites}}).sort({createdOn:-1});
    console.log(userfeedback)

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
          console.log(rating);
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
    console.log(avgRatingPerSite);
    res.status(200).json({sites,userfeedback,totalFeedbacks,avgRatingPerSite,avgRating,feedbackPerSite,mess:'data fetched succesfully'});
    // res.status(400).json({mess:'fetch failed ,Looks like you have no data'})
  }
module.exports = { createFeed,getFeed };
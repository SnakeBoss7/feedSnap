const feedback = require('../models/feedback')
const user = require('../models/user')
const webData = require('../models/WebData');

const widgetConfigProvider =async(req,res)=>
    {
        let url = req.query.webUrl;
        console.log(url);
        let web = await webData.findOne({webUrl:url})
        if(!web)
            {
                res.status(400).send("Service is not provided to this web");
                return;
            }
            console.log(web);
            console.log(web.bgColor);

        const {color,widgetText,position,bgColor} = web;
        console.log(color,widgetText,position,bgColor);
        res.json({color,widgetText,position,bgColor});

        
    }
module.exports={widgetConfigProvider};
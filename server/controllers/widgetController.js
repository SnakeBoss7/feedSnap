const feedback = require('../models/feedback')
const user = require('../models/user')
const webData = require('../models/WebData');

const widgetConfigProvider =async(req,res)=>
    {
        let url = req.query.webUrl;
        //.log(url);
        let web = await webData.findOne({webUrl:url})
        if(!web)
            {
                res.status(400).send("Service is not provided to this web");
                return;
            }
            //.log(web);
            //.log(web.bgColor);

        const {color,widgetText,position,bgColor,botContext,ackMail} = web;
        // //.log(color,widgetText,position,bgColor,botContext,ackMail);
        res.json({color,widgetText,position,bgColor,botContext,ackMail});

        
    }
module.exports={widgetConfigProvider};
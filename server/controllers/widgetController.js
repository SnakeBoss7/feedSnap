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
        const {color,text,position,modeColor} = web;
        console.log(color,text,position,modeColor);
        res.json({color,text,position,modeColor});

        
    }
module.exports={widgetConfigProvider};
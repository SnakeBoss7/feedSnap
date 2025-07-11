const feedback = require('../models/bug')
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
        const {color,text,position,email} = web;
        console.log(color,text,position);
        res.json({color,text,position,email});

        
    }
module.exports={widgetConfigProvider};
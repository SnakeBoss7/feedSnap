const User = require('../models/user');
const webData = require('../models/WebData');
const scriptCreate = async (req,res)=>
{
    console.log(process.env.SERVER)
    if(!req.user)
        {
            res.status(400).json({mess:"user not found"});

        }
    const {webUrl,position,color,text} = req.body.settings;
    
    let webdata = await webData.findOne({webUrl:webUrl})
    // console.log(process.env.SERVER);
    if(!webdata)
        {
            console.log('new data created');
            let webdata = await webData.create({
                webUrl,
                color,
                position,
                text,
                userId:req.user.id
            })
            let scriptInjection = `<script src="${process.env.SERVER}/script.js?webUrl=${webUrl}"></script>`
            res.status(200).json({mess:"web data created",injection:scriptInjection});
        }
        else
        {
            console.log('already exist');
            res.status(400).json({mess:"web data already exists"});
        }
        console.log('nothing happend');
}
module.exports = {scriptCreate}
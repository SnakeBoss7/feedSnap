const User = require("../models/user");
const webData = require("../models/WebData");
const scriptCreate = async (req, res) => {
  if (!req.user) {
    res.status(400).json({ mess: "user not found" });
  }
  const { webUrl, position, color, text,bgColor } = req.body.settings;

  let webdata = await webData.findOne({ webUrl: webUrl });
  // console.log(process.env.SERVER);
  if (!webdata) {
    console.log("new data created");
    let webdata = await webData.create({
      webUrl,
      color,
      position,
      text,
      bgColor,
      owner: req.user.id,
    });
    let scriptInjection = `<script src="${process.env.SERVER}/script.js?webUrl=${webUrl}"></script>`;
    res
      .status(200)
      .json({ mess: "web data created", injection: scriptInjection });
  } else {
    console.log("already exist");
    res.status(400).json({ mess: "web data already exists" });
  }
  console.log("nothing happend");
};
const scriptDemo = async (req, res) => {
  if (!req.user) {
    res.status(400).json({ mess: "user not found" });
  }
  const { position, color, text,bgColor } = req.body.settings;
  console.log({bgColor})
  let webdata = await webData.findOne({ webUrl: process.env.FRONTEND });
  if (!webdata) {
    console.log("new data created");
    let webdata = await webData.create({
      webUrl: process.env.FRONTEND,
      color,
      position,
      text,
      bgColor,
      owner: req.user.id,
    });
    return res
      .status(200)
      .json({ mess: "web data created" });
  } else {
    console.log('hers the position',position);
    webdata.color = color;
    webdata.position = position;
    webdata.widgetText = text;
    webdata.bgColor = bgColor;

    await webdata.save();
    return res.status(200).json({ mess: 'updated' });
  }
};
module.exports = { scriptCreate, scriptDemo };

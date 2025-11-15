const User = require("../models/user");
const webData = require("../models/WebData");
const scriptCreate = async (req, res) => {
  if (!req.user) {
    res.status(400).json({ mess: "user not found" });
  }
  const { webUrl, position, color, text, bgColor, ackMail, botContext } =
    req.body.settings;
  let webdata = await webData.findOne({ webUrl: webUrl });
  if (!webdata) {
    let webdata = await webData.create({
      webUrl,
      color,
      position,
      widgetText: text,
      bgColor,
      ackMail,
      botContext,

      owner: req.user.id,
    });
    let scriptInjection = `<script src="${process.env.SERVER}/widget/script/?webUrl=${webUrl}"></script>`;
    res
      .status(200)
      .json({ mess: "web data created", injection: scriptInjection });
  } else {
    res.status(400).json({ mess: "web data already exists" });
  }
};
const scriptDemo = async (req, res) => {
  if (!req.user) {
    res.status(400).json({ mess: "user not found" });
  }
  const { position, color, text, bgColor } = req.body;
  let webdata = await webData.findOne({ webUrl: process.env.FRONTEND });
  if (!webdata) {
    let webdata = await webData.create({
      webUrl: process.env.FRONTEND,
      color,
      position,
      text,
      bgColor,
      owner: req.user.id,
    });
    return res.status(200).json({ mess: "web data created" });
  } else {
    webdata.color = color;
    webdata.position = position;
    webdata.widgetText = text;
    webdata.bgColor = bgColor;

    await webdata.save();
    return res.status(200).json({ mess: "updated" });
  }
};
module.exports = { scriptCreate, scriptDemo };

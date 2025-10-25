var admin = require("firebase-admin");
if(process.env.MODE === "dev")
  {
    console.log("env" + process.env.MODE)
    var serviceAccount = require("../firebase-adminsdk.json");
  }
  else
    {
      var serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);
    }
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;
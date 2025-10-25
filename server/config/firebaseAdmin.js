var admin = require("firebase-admin");
if(process.env.NODE_ENV === "dev")
  {
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
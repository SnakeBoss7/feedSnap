const mongoose = require('mongoose');
const dns = require('dns');

// Force usage of generic DNS servers to bypass potential local configuration issues
try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
    console.log("Forced DNS to 8.8.8.8");
} catch (e) {
    console.log("Failed to force DNS:", e.message);
}

const connectDB = async () => {

    try {
        await mongoose.connect(`${process.env.MONGO_URL}`);
        console.log('MONGO CONNECTED');
    }
    catch (err) {

        console.log('MONGO NOT CONNECTED');
        console.log(err);
    }
}

module.exports = connectDB;

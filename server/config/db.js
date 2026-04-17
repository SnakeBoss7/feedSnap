const mongoose = require('mongoose');
const dns = require('dns');

// Force usage of generic DNS servers to bypass potential local configuration issues


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

const mongoose = require('mongoose');
const connectDB = async () => {
console.log("MONGO_URL:", process.env.MONGO_URL);

    try {
        await mongoose.connect(`${process.env.MONGO_URL}`);
        console.log('MONGO CONNECTED');
    }
    catch(err){
        
        console.log('MONGO NOT CONNECTED');
        console.log(err);
    }
}

module.exports = connectDB;
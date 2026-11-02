const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function connectDB() {

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected');
    }
    catch (error) {
        console.error('MongoDB connection error:', error);
    }
}

module.exports = connectDB;
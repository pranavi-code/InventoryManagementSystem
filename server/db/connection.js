import dotenv from 'dotenv';

// Always override anything already set in process.env
dotenv.config({ path: './.env', override: true });

console.log('DEBUG MONGO_URI after dotenv load:', process.env.MONGO_URI);

import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB Atlas');
    } catch (error) {
        console.error('❌ Error connecting to MongoDB:', error.message);
        process.exit(1);
    }
};

export default connectDB;

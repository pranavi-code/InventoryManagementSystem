// db/connection.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB Atlas');
    } catch (error) {
        console.error('❌ Error connecting to MongoDB:', error.message);
        process.exit(1); // Exit with failure
    }
};

export default connectDB;

import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const checkUsers = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Get all users
        const users = await User.find({});
        console.log('All users:');
        console.log(JSON.stringify(users, null, 2));

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkUsers();
import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const updateUsersWithActiveField = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Update all users without isActive field
        const result = await User.updateMany(
            { isActive: { $exists: false } },
            { $set: { isActive: false } } // Set to false by default, will be true when they login
        );

        console.log(`Updated ${result.modifiedCount} users with isActive field`);

        // Display all users with their isActive status
        const users = await User.find({}).select('name email isActive');
        console.log('\nCurrent user statuses:');
        users.forEach(user => {
            console.log(`${user.name} (${user.email}): ${user.isActive ? 'Active' : 'Inactive'}`);
        });

        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    } catch (error) {
        console.error('Error updating users:', error);
        process.exit(1);
    }
};

updateUsersWithActiveField();
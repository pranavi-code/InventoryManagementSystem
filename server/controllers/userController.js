import User from '../models/User.js';
import bcrypt from 'bcrypt';

export const getUsers = async (req, res) => {
    try {
        const users = await User.find({}, '-password');
        // Get userSocketMap from app (for online status)
        const userSocketMap = req.app.get('userSocketMap');
        const usersWithStatus = users.map(user => ({
            ...user.toObject(),
            isActive: userSocketMap ? userSocketMap.has(String(user._id)) : false
        }));
        res.json({ success: true, users: usersWithStatus });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

export const addUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password || !role) {
            return res.json({ success: false, error: "All fields are required" });
        }
        const existing = await User.findOne({ email });
        if (existing) {
            return res.json({ success: false, error: "User already exists" });
        }
        const hash = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hash, role });
        await user.save();
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role } = req.body;
        
        // Check if user is updating their own profile or is admin
        if (req.user.role !== 'admin' && req.user.id !== id) {
            return res.status(403).json({ success: false, error: "Unauthorized to update this user" });
        }
        
        // If not admin, don't allow role changes
        const updateData = { name, email };
        if (req.user.role === 'admin' && role) {
            updateData.role = role;
        }
        
        const updated = await User.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        ).select('-password');
        
        if (!updated) {
            return res.status(404).json({ success: false, error: "User not found" });
        }
        res.json({ success: true, user: updated });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

export const updatePassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { currentPassword, newPassword } = req.body;
        
        // Check if user is updating their own password or is admin
        if (req.user.role !== 'admin' && req.user.id !== id) {
            return res.status(403).json({ success: false, error: "Unauthorized to update this user's password" });
        }
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, error: "Current password and new password are required" });
        }
        
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, error: "User not found" });
        }
        
        // Verify current password
        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        if (!isValidPassword) {
            return res.status(400).json({ success: false, error: "Current password is incorrect" });
        }
        
        // Hash new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        
        // Update password
        await User.findByIdAndUpdate(id, { password: hashedNewPassword });
        
        res.json({ success: true, message: "Password updated successfully" });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Only admin can delete users
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: "Unauthorized to delete users" });
        }
        
        const deleted = await User.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ success: false, error: "User not found" });
        }
        res.json({ success: true, message: "User deleted" });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

export const toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;
        
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: "Unauthorized to toggle user status" });
        }
        
        const updated = await User.findByIdAndUpdate(
            id,
            { isActive },
            { new: true }
        ).select('-password');
        
        if (!updated) {
            return res.status(404).json({ success: false, error: "User not found" });
        }
        
        res.json({ success: true, user: updated });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

import dotenv from 'dotenv';
dotenv.config({ override: true });

console.log("DEBUG .env MONGO_URI:", process.env.MONGO_URI);


import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import connectDB from './db/connection.js';
import authRoutes from './routes/auth.js';
import categoryRoutes from './routes/category.js';
import supplierRoutes from './routes/supplier.js';
import productRoutes from './routes/product.js';
import orderRoutes from './routes/order.js';
import userRoutes from './routes/user.js';
import notificationRoutes from './routes/notification.js';
import salesRoutes from './routes/sales.js';
import analyticsRoutes from './routes/analytics.js';

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

// UserID to socket mapping
const userSocketMap = new Map();

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    // Listen for user identification
    socket.on('register', (userId) => {
        userSocketMap.set(userId, socket.id);
        console.log(`User ${userId} registered with socket ${socket.id}`);
    });

    // Handle user going online
    socket.on('user_online', (userId) => {
        userSocketMap.set(userId, socket.id);
        // Broadcast to all connected clients that this user is online
        socket.broadcast.emit('user_online', userId);
        console.log(`User ${userId} is online`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        // Find and remove user from map on disconnect
        let disconnectedUserId = null;
        for (const [userId, sockId] of userSocketMap.entries()) {
            if (sockId === socket.id) {
                userSocketMap.delete(userId);
                disconnectedUserId = userId;
                break;
            }
        }
        
        // Broadcast to all connected clients that this user is offline
        if (disconnectedUserId) {
            socket.broadcast.emit('user_offline', disconnectedUserId);
            console.log(`User ${disconnectedUserId} went offline`);
        }
    });
});

// Make io and userSocketMap available to controllers
app.set('io', io);
app.set('userSocketMap', userSocketMap);

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/supplier', supplierRoutes);
app.use('/api/product', productRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/user', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/analytics', analyticsRoutes);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    connectDB();
    console.log(`Server is running on http://localhost:${PORT}`);
});
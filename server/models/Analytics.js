// models/Analytics.js
import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    totalSales: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    productTrends: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        count: Number
    }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

const Analytics = mongoose.model('Analytics', analyticsSchema);
export default Analytics;

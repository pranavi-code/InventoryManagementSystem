// analyticsController.js
import Analytics from '../models/Analytics.js';
import Sales from '../models/Sales.js';

export const getAnalytics = async (req, res) => {
    try {
        let matchQuery = {};
        if (req.user.role !== 'admin') {
            matchQuery.createdBy = req.user.id;
        }
        const analytics = await Analytics.find(matchQuery)
            .populate('createdBy', 'name')
            .sort({ date: -1 });
        return res.json({ success: true, analytics });
    } catch (error) {
        console.error('Get analytics error:', error);
        return res.status(500).json({ success: false, error: "Server error" });
    }
};

export const updateAnalytics = async (req, res) => {
    try {
        const sales = await Sales.find().select('product totalAmount');
        const analytics = new Analytics({
            totalSales: sales.reduce((sum, sale) => sum + sale.totalAmount, 0),
            totalOrders: await Sales.countDocuments(),
            productTrends: await Sales.aggregate([
                { $group: { _id: '$product', count: { $sum: 1 } } }
            ]),
            createdBy: req.user.id
        });
        await analytics.save();
        return res.json({ success: true, analytics });
    } catch (error) {
        console.error('Update analytics error:', error);
        return res.status(500).json({ success: false, error: "Server error" });
    }
};

// salesController.js
import Sales from '../models/Sales.js';

export const getSales = async (req, res) => {
    try {
        let query = {};
        if (req.user.role !== 'admin') {
            query.createdBy = req.user.id;
        }
        const sales = await Sales.find(query)
            .populate('product', 'name price')
            .populate('createdBy', 'name')
            .sort({ saleDate: -1 });
        return res.json({ success: true, sales });
    } catch (error) {
        console.error('Get sales error:', error);
        return res.status(500).json({ success: false, error: "Server error" });
    }
};

export const getTotalSales = async (req, res) => {
    try {
        let matchQuery = {};
        if (req.user.role !== 'admin') {
            matchQuery.createdBy = req.user.id;
        }
        const total = await Sales.aggregate([
            { $match: matchQuery },
            { $group: { _id: null, totalAmount: { $sum: '$totalAmount' } } }
        ]);
        return res.json({ success: true, total: total[0]?.totalAmount || 0 });
    } catch (error) {
        console.error('Get total sales error:', error);
        return res.status(500).json({ success: false, error: "Server error" });
    }
};

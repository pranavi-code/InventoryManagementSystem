import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

// Add a new order (Employee/Customer)
export const addOrder = async (req, res) => {
    try {
        const { product, quantity, customerName, priority, notes } = req.body;
        const customerId = req.user.id;

        // Get product details to calculate total amount
        const productDetails = await Product.findById(product);
        if (!productDetails) {
            return res.status(404).json({ success: false, error: "Product not found" });
        }

        // Check if enough stock is available
        if (productDetails.quantity < quantity) {
            return res.status(400).json({ 
                success: false, 
                error: `Insufficient stock. Only ${productDetails.quantity} items available.` 
            });
        }

        const totalAmount = productDetails.price * quantity;

        const order = new Order({ 
            product, 
            quantity, 
            customerName, 
            customerId,
            totalAmount,
            priority: priority || "Medium",
            notes
        });
        
        await order.save();
        
        // Create a notification for all admins
        const admins = await User.find({ role: 'admin' });
        const customer = await User.findById(customerId);

        for (const admin of admins) {
            const notification = new Notification({
                recipient: admin._id,
                sender: customerId,
                type: 'order_placed',
                message: `New order placed by ${customer.name}.`,
            });
            await notification.save();
        }

        // Populate product details for response
        await order.populate('product', 'name price');
        
        return res.json({ success: true, order });
    } catch (error) {
        console.error('Add order error:', error);
        return res.status(500).json({ success: false, error: "Server error" });
    }
};

// Get all orders (Admin can see all, Employees see only their orders)
export const getOrders = async (req, res) => {
    try {
        let query = {};
        
        // If user is not admin, only show their orders
        if (req.user.role !== 'admin') {
            query.customerId = req.user.id;
        }

        const orders = await Order.find(query)
            .populate("product", "name price category")
            .populate("customerId", "name email")
            .populate("approvedBy", "name")
            .sort({ orderDate: -1 });
            
        return res.json({ success: true, orders });
    } catch (error) {
        console.error('Get orders error:', error);
        return res.status(500).json({ success: false, error: "Server error" });
    }
};

// Get orders by status
export const getOrdersByStatus = async (req, res) => {
    try {
        const { status } = req.params;
        let query = { status };
        
        // If user is not admin, only show their orders
        if (req.user.role !== 'admin') {
            query.customerId = req.user.id;
        }

        const orders = await Order.find(query)
            .populate("product", "name price category")
            .populate("customerId", "name email")
            .populate("approvedBy", "name")
            .sort({ orderDate: -1 });
            
        return res.json({ success: true, orders });
    } catch (error) {
        console.error('Get orders by status error:', error);
        return res.status(500).json({ success: false, error: "Server error" });
    }
};

// Update order status (Admin only for approval/rejection)
export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, rejectionReason, estimatedDelivery } = req.body;

        // Only admin can approve/reject orders
        if (req.user.role !== 'admin' && ['Approved', 'Rejected', 'Processing', 'Shipped', 'Delivered'].includes(status)) {
            return res.status(403).json({ success: false, error: "Unauthorized to change this status" });
        }

        const updateData = { status };

        if (status === 'Approved') {
            updateData.approvedBy = req.user.id;
            updateData.approvedDate = new Date();
            
            // Reduce product quantity when order is approved
            const order = await Order.findById(id);
            if (order) {
                await Product.findByIdAndUpdate(
                    order.product,
                    { $inc: { quantity: -order.quantity } }
                );
                // Emit real-time stock update
                const io = req.app.get('io');
                if (io) {
                    const updatedProduct = await Product.findById(order.product);
                    console.log('[Socket.IO] Emitting stock_update:', {
                        productId: updatedProduct._id,
                        quantity: updatedProduct.quantity
                    });
                    io.emit('stock_update', {
                        productId: updatedProduct._id,
                        quantity: updatedProduct.quantity
                    });
                }
            }
        }

        if (status === 'Rejected' && rejectionReason) {
            updateData.rejectionReason = rejectionReason;
        }

        if (estimatedDelivery) {
            updateData.estimatedDelivery = estimatedDelivery;
        }

        const updated = await Order.findByIdAndUpdate(id, updateData, { new: true })
            .populate("product", "name price")
            .populate("customerId", "name email")
            .populate("approvedBy", "name");

        if (!updated) {
            return res.status(404).json({ success: false, error: "Order not found" });
        }

        return res.json({ success: true, order: updated });
    } catch (error) {
        console.error('Update order status error:', error);
        return res.status(500).json({ success: false, error: "Server error" });
    }
};

// Update order (General update for employees - limited fields)
export const updateOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity, priority, notes } = req.body;

        // Find the order first
        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ success: false, error: "Order not found" });
        }

        // Check if user owns this order or is admin
        if (req.user.role !== 'admin' && order.customerId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, error: "Unauthorized to update this order" });
        }

        // Only allow updates if order is still pending
        if (order.status !== 'Pending') {
            return res.status(400).json({ success: false, error: "Cannot update order after it has been processed" });
        }

        const updateData = {};
        if (quantity) {
            // Check stock availability for new quantity
            const product = await Product.findById(order.product);
            if (product && product.quantity < quantity) {
                return res.status(400).json({ 
                    success: false, 
                    error: `Insufficient stock. Only ${product.quantity} items available.` 
                });
            }
            updateData.quantity = quantity;
            updateData.totalAmount = product.price * quantity;
        }
        if (priority) updateData.priority = priority;
        if (notes !== undefined) updateData.notes = notes;

        const updated = await Order.findByIdAndUpdate(id, updateData, { new: true })
            .populate("product", "name price")
            .populate("customerId", "name email");

        return res.json({ success: true, order: updated });
    } catch (error) {
        console.error('Update order error:', error);
        return res.status(500).json({ success: false, error: "Server error" });
    }
};

// Cancel order (Employee can cancel their own pending orders)
export const cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ success: false, error: "Order not found" });
        }

        // Check if user owns this order or is admin
        if (req.user.role !== 'admin' && order.customerId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, error: "Unauthorized to cancel this order" });
        }

        // Only allow cancellation if order is pending or approved (not yet shipped)
        if (!['Pending', 'Approved'].includes(order.status)) {
            return res.status(400).json({ success: false, error: "Cannot cancel order at this stage" });
        }

        // If order was approved, restore the product quantity
        if (order.status === 'Approved') {
            await Product.findByIdAndUpdate(
                order.product,
                { $inc: { quantity: order.quantity } }
            );
        }

        const updated = await Order.findByIdAndUpdate(
            id,
            { status: 'Cancelled' },
            { new: true }
        ).populate("product", "name price");

        return res.json({ success: true, order: updated });
    } catch (error) {
        console.error('Cancel order error:', error);
        return res.status(500).json({ success: false, error: "Server error" });
    }
};

// Delete order (Admin only)
export const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;

        // Only admin can delete orders
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: "Unauthorized to delete orders" });
        }

        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ success: false, error: "Order not found" });
        }

        // If order was approved, restore the product quantity
        if (order.status === 'Approved') {
            await Product.findByIdAndUpdate(
                order.product,
                { $inc: { quantity: order.quantity } }
            );
        }

        await Order.findByIdAndDelete(id);
        return res.json({ success: true, message: "Order deleted successfully" });
    } catch (error) {
        console.error('Delete order error:', error);
        return res.status(500).json({ success: false, error: "Server error" });
    }
};

// Get order statistics (for dashboard)
export const getOrderStats = async (req, res) => {
    try {
        let matchQuery = {};
        
        // If user is not admin, only show their order stats
        if (req.user.role !== 'admin') {
            matchQuery.customerId = req.user.id;
        }

        const stats = await Order.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                    totalAmount: { $sum: "$totalAmount" }
                }
            }
        ]);

        const totalOrders = await Order.countDocuments(matchQuery);
        
        return res.json({ success: true, stats, totalOrders });
    } catch (error) {
        console.error('Get order stats error:', error);
        return res.status(500).json({ success: false, error: "Server error" });
    }
};
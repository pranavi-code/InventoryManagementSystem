import mongoose from "mongoose";
const orderSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true },
    customerName: { type: String, required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { 
        type: String, 
        enum: ["Pending", "Approved", "Processing", "Shipped", "Delivered", "Cancelled", "Rejected"],
        default: "Pending" 
    },
    orderDate: { type: Date, default: Date.now },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvedDate: { type: Date },
    rejectionReason: { type: String },
    totalAmount: { type: Number },
    priority: { 
        type: String, 
        enum: ["Low", "Medium", "High", "Urgent"],
        default: "Medium" 
    },
    notes: { type: String },
    estimatedDelivery: { type: Date }
});
const Order = mongoose.model("Order", orderSchema);
export default Order;

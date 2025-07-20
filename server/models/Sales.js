import mongoose from 'mongoose';

  const salesSchema = new mongoose.Schema({
      orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantitySold: { type: Number, required: true },
      totalAmount: { type: Number, required: true },
      saleDate: { type: Date, default: Date.now },
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  });

export default mongoose.model('Sales', salesSchema);
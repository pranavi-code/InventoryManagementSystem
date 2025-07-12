import mongoose from "mongoose";
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    description: { type: String }
});
const Product = mongoose.model("Product", productSchema);
export default Product;
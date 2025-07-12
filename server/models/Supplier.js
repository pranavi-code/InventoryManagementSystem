import mongoose from "mongoose";
const supplierSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    number: { type: String, required: true },
    address: { type: String, required: true }
});
const Supplier = mongoose.model("Supplier", supplierSchema);
export default Supplier;
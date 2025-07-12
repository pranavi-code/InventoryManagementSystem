import Product from '../models/Product.js';

export const addProduct = async (req, res) => {
    try {
        const { name, category, supplier, price, quantity, description } = req.body;
        const product = new Product({ name, category, supplier, price, quantity, description });
        await product.save();
        return res.json({ success: true, product });
    } catch (error) {
        return res.status(500).json({ success: false, error: 'Server error' });
    }
};

export const getProducts = async (req, res) => {
    try {
        const products = await Product.find()
            .populate('category', 'categoryName')
            .populate('supplier', 'name');
        return res.json({ success: true, products });
    } catch (error) {
        return res.status(500).json({ success: false, error: 'Server error' });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, category, supplier, price, quantity, description } = req.body;
        const updated = await Product.findByIdAndUpdate(
            id,
            { name, category, supplier, price, quantity, description },
            { new: true }
        );
        if (!updated) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }
        return res.json({ success: true, product: updated });
    } catch (error) {
        return res.status(500).json({ success: false, error: 'Server error' });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Product.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }
        return res.json({ success: true, message: 'Product deleted' });
    } catch (error) {
        return res.status(500).json({ success: false, error: 'Server error' });
    }
};
import Supplier from '../models/Supplier.js';

export const addSupplier = async (req, res) => {
    try {
        const { name, email, number, address } = req.body;
        const existing = await Supplier.findOne({ email });
        if (existing) {
            return res.json({ success: false, error: 'Supplier already exists' });
        }
        const supplier = new Supplier({ name, email, number, address });
        await supplier.save();
        return res.json({ success: true, supplier });
    } catch (error) {
        return res.status(500).json({ success: false, error: 'Server error' });
    }
};

export const getSuppliers = async (req, res) => {
    try {
        const suppliers = await Supplier.find();
        return res.json({ success: true, suppliers });
    } catch (error) {
        return res.status(500).json({ success: false, error: 'Server error' });
    }
};

export const updateSupplier = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, number, address } = req.body;
        const updated = await Supplier.findByIdAndUpdate(
            id,
            { name, email, number, address },
            { new: true }
        );
        if (!updated) {
            return res.status(404).json({ success: false, error: 'Supplier not found' });
        }
        return res.json({ success: true, supplier: updated });
    } catch (error) {
        return res.status(500).json({ success: false, error: 'Server error' });
    }
};

export const deleteSupplier = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Supplier.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ success: false, error: 'Supplier not found' });
        }
        return res.json({ success: true, message: 'Supplier deleted' });
    } catch (error) {
        return res.status(500).json({ success: false, error: 'Server error' });
    }
};
import Category from '../models/Category.js';
import Product from '../models/Product.js';

export const addCategory = async(req,res)=>{
    try{
        const {categoryName, categoryDescription} = req.body;
        const existingCategory =  await Category.findOne({categoryName});
        if(existingCategory){
            return res.status(400).json({error: 'Category already exists'});
        }
        const newCategory = new Category({
            categoryName,
            categoryDescription
        });
        await newCategory.save();
        return res.status(201).json({success: true, message: 'Category added successfully'});
    }
    catch(error){
        console.error('Error adding category:', error);
        return res.status(500).json({success: false, error: 'Internal server error'});
    }
}
export const getCategories = async(req,res)=>{
    try{
        const categories = await Category.find({});
        return res.status(200).json({success: true, categories});
    }
    catch(error){
        console.error('Error fetching categories:', error);
        return res.status(500).json({success: false, message: 'server error in getting categories'});
    }
}
export const updateCategory = async(req,res)=>{
    try{
        const {id} = req.params;
        const {categoryName, categoryDescription} = req.body;
        const existingCategory = await Category.findById(id);
        if(!existingCategory){
            return res.status(404).json({error: 'Category not found'});
        }
        const updatedCategory = await Category.findByIdAndUpdate(id, {
            categoryName,
            categoryDescription
        }, {new: true});
        return res.json({ success: true, message: 'Category updated successfully'});
    } 
    catch(error){
        console.error('Error updating category:', error);
        return res.status(500).json({success: false, message: 'Internal server error'});
    }
    
}   

export const deleteCategory = async(req,res)=>{
    try{
        const {id} = req.params;
        const existingCategory= await Category.findById(id);
        if(!existingCategory){
            return res.status(404).json({error: 'Category not found'});
        }

        // First delete all products associated with this category
        const deletedProducts = await Product.deleteMany({ category: id });
        console.log(`Deleted ${deletedProducts.deletedCount} products associated with category ${id}`);

        // Then delete the category
        await Category.findByIdAndDelete(id);
        
        return res.status(200).json({
            success: true, 
            message: `Category deleted successfully. ${deletedProducts.deletedCount} associated products were also removed.`
        });
    }catch(error){
        console.error('Error deleting category:', error);
        return res.status(500).json({success: false, message: 'Internal server error'});
    }
}
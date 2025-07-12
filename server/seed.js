import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from './models/User.js';
import Category from './models/Category.js';
import Supplier from './models/Supplier.js';
import Product from './models/Product.js';
import Order from './models/Order.js';
import connectDB from './db/connection.js';

/**
 * Database Seeding Script
 * 
 * This script populates the database with comprehensive sample data for testing
 * the inventory management system. It creates:
 * 
 * - Users (Admin, Employee, Customer) with different roles
 * - Product categories for organization
 * - Suppliers for product sourcing
 * - Products with realistic inventory data
 * - Sample orders in various states (pending, approved, delivered, etc.)
 * 
 * This ensures all employee functionality can be properly tested including:
 * - Order placement and management
 * - Product browsing and filtering
 * - Notification system
 * - Dashboard statistics
 * - Order history and tracking
 */
const seedDatabase = async () => {
    try {
        await connectDB();
        
        // Clear existing data
        await User.deleteMany({});
        await Category.deleteMany({});
        await Supplier.deleteMany({});
        await Product.deleteMany({});
        await Order.deleteMany({});
        
        console.log('Cleared existing data');
        
        // Create users with hashed passwords
        const hashedPassword = await bcrypt.hash('password123', 10);
        
        const users = await User.insertMany([
            {
                name: 'Admin User',
                email: 'admin@inventory.com',
                password: hashedPassword,
                role: 'admin'
            },
            {
                name: 'John Employee',
                email: 'employee@inventory.com',
                password: hashedPassword,
                role: 'employee'
            },
            {
                name: 'Sarah Employee',
                email: 'employee2@inventory.com',
                password: hashedPassword,
                role: 'employee'
            },
            {
                name: 'Jane Customer',
                email: 'customer@inventory.com',
                password: hashedPassword,
                role: 'customer'
            },
            {
                name: 'Mike Customer',
                email: 'customer2@inventory.com',
                password: hashedPassword,
                role: 'customer'
            }
        ]);
        
        console.log('Created users');
        
        // Create comprehensive categories
        const categories = await Category.insertMany([
            {
                categoryName: 'Electronics',
                categoryDescription: 'Electronic devices, computers, and accessories'
            },
            {
                categoryName: 'Office Supplies',
                categoryDescription: 'Stationery, paper, and general office equipment'
            },
            {
                categoryName: 'Furniture',
                categoryDescription: 'Office and workspace furniture'
            },
            {
                categoryName: 'Software',
                categoryDescription: 'Software licenses and digital products'
            },
            {
                categoryName: 'Safety Equipment',
                categoryDescription: 'Workplace safety and security equipment'
            }
        ]);
        
        console.log('Created categories');
        
        // Create diverse suppliers
        const suppliers = await Supplier.insertMany([
            {
                name: 'Tech Solutions Inc',
                email: 'contact@techsolutions.com',
                number: '+1-555-0101',
                address: '123 Tech Street, Silicon Valley, CA 94000'
            },
            {
                name: 'Office Pro Supplies',
                email: 'sales@officepro.com',
                number: '+1-555-0102',
                address: '456 Business Ave, New York, NY 10001'
            },
            {
                name: 'Furniture World',
                email: 'orders@furnitureworld.com',
                number: '+1-555-0103',
                address: '789 Furniture Blvd, Chicago, IL 60601'
            },
            {
                name: 'Digital Solutions Ltd',
                email: 'licensing@digitalsolutions.com',
                number: '+1-555-0104',
                address: '321 Software Park, Austin, TX 78701'
            },
            {
                name: 'Safety First Corp',
                email: 'orders@safetyfirst.com',
                number: '+1-555-0105',
                address: '654 Safety Lane, Denver, CO 80201'
            }
        ]);
        
        console.log('Created suppliers');
        
        // Create extensive product catalog
        const products = await Product.insertMany([
            // Electronics
            {
                name: 'Laptop Computer - Business Grade',
                category: categories[0]._id,
                supplier: suppliers[0]._id,
                price: 999.99,
                quantity: 50,
                description: 'High-performance laptop with Intel i7, 16GB RAM, 512GB SSD'
            },
            {
                name: 'Wireless Mouse',
                category: categories[0]._id,
                supplier: suppliers[0]._id,
                price: 29.99,
                quantity: 100,
                description: 'Ergonomic wireless mouse with long battery life'
            },
            {
                name: 'Mechanical Keyboard',
                category: categories[0]._id,
                supplier: suppliers[0]._id,
                price: 89.99,
                quantity: 75,
                description: 'Professional mechanical keyboard with RGB backlighting'
            },
            {
                name: '27" Monitor',
                category: categories[0]._id,
                supplier: suppliers[0]._id,
                price: 299.99,
                quantity: 30,
                description: '4K UHD monitor with USB-C connectivity'
            },
            {
                name: 'Webcam HD',
                category: categories[0]._id,
                supplier: suppliers[0]._id,
                price: 79.99,
                quantity: 60,
                description: '1080p HD webcam with auto-focus and noise cancellation'
            },
            
            // Office Supplies
            {
                name: 'Printer Paper A4',
                category: categories[1]._id,
                supplier: suppliers[1]._id,
                price: 19.99,
                quantity: 200,
                description: 'High-quality A4 printer paper, 500 sheets per pack'
            },
            {
                name: 'Desk Lamp LED',
                category: categories[1]._id,
                supplier: suppliers[1]._id,
                price: 49.99,
                quantity: 75,
                description: 'LED desk lamp with adjustable brightness and color temperature'
            },
            {
                name: 'Notebook Set',
                category: categories[1]._id,
                supplier: suppliers[1]._id,
                price: 15.99,
                quantity: 150,
                description: 'Set of 3 professional notebooks with lined pages'
            },
            {
                name: 'Pen Set - Blue',
                category: categories[1]._id,
                supplier: suppliers[1]._id,
                price: 12.99,
                quantity: 300,
                description: 'Pack of 10 blue ballpoint pens'
            },
            {
                name: 'Stapler Heavy Duty',
                category: categories[1]._id,
                supplier: suppliers[1]._id,
                price: 24.99,
                quantity: 40,
                description: 'Heavy-duty stapler for up to 50 sheets'
            },
            
            // Furniture
            {
                name: 'Ergonomic Office Chair',
                category: categories[2]._id,
                supplier: suppliers[2]._id,
                price: 299.99,
                quantity: 25,
                description: 'Comfortable ergonomic office chair with lumbar support'
            },
            {
                name: 'Standing Desk',
                category: categories[2]._id,
                supplier: suppliers[2]._id,
                price: 599.99,
                quantity: 15,
                description: 'Height-adjustable standing desk with memory presets'
            },
            {
                name: 'Filing Cabinet',
                category: categories[2]._id,
                supplier: suppliers[2]._id,
                price: 199.99,
                quantity: 20,
                description: '4-drawer filing cabinet with lock'
            },
            {
                name: 'Bookshelf',
                category: categories[2]._id,
                supplier: suppliers[2]._id,
                price: 149.99,
                quantity: 35,
                description: '5-tier wooden bookshelf for office storage'
            },
            
            // Software
            {
                name: 'Office Suite License',
                category: categories[3]._id,
                supplier: suppliers[3]._id,
                price: 149.99,
                quantity: 100,
                description: 'Annual license for office productivity suite'
            },
            {
                name: 'Antivirus Software',
                category: categories[3]._id,
                supplier: suppliers[3]._id,
                price: 59.99,
                quantity: 80,
                description: 'Enterprise antivirus protection for 1 year'
            },
            
            // Safety Equipment
            {
                name: 'First Aid Kit',
                category: categories[4]._id,
                supplier: suppliers[4]._id,
                price: 39.99,
                quantity: 50,
                description: 'Complete first aid kit for office use'
            },
            {
                name: 'Fire Extinguisher',
                category: categories[4]._id,
                supplier: suppliers[4]._id,
                price: 89.99,
                quantity: 25,
                description: 'ABC fire extinguisher for office safety'
            }
        ]);
        
        console.log('Created products');
        
        // Create comprehensive order samples with various statuses and dates
        const now = new Date();
        const orders = await Order.insertMany([
            // Recent pending orders
            {
                product: products[0]._id, // Laptop
                quantity: 2,
                customerName: 'John Employee',
                customerId: users[1]._id,
                status: 'Pending',
                totalAmount: 1999.98,
                priority: 'High',
                notes: 'Needed for new project team urgently',
                orderDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
            },
            {
                product: products[3]._id, // Monitor
                quantity: 1,
                customerName: 'Sarah Employee',
                customerId: users[2]._id,
                status: 'Pending',
                totalAmount: 299.99,
                priority: 'Medium',
                notes: 'For workstation upgrade',
                orderDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
            },
            
            // Recently approved orders
            {
                product: products[1]._id, // Mouse
                quantity: 5,
                customerName: 'John Employee',
                customerId: users[1]._id,
                status: 'Approved',
                totalAmount: 149.95,
                priority: 'Medium',
                approvedBy: users[0]._id,
                approvedDate: new Date(now.getTime() - 6 * 60 * 60 * 1000), // 6 hours ago
                notes: 'Replacement for broken mice'
            },
            {
                product: products[6]._id, // Desk Lamp
                quantity: 3,
                customerName: 'Sarah Employee',
                customerId: users[2]._id,
                status: 'Approved',
                totalAmount: 149.97,
                priority: 'Low',
                approvedBy: users[0]._id,
                approvedDate: new Date(now.getTime() - 12 * 60 * 60 * 1000), // 12 hours ago
                notes: 'For better workspace lighting'
            },
            
            // Processing orders
            {
                product: products[10]._id, // Office Chair
                quantity: 1,
                customerName: 'Jane Customer',
                customerId: users[3]._id,
                status: 'Processing',
                totalAmount: 299.99,
                priority: 'Medium',
                approvedBy: users[0]._id,
                approvedDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
                notes: 'Ergonomic chair for remote work setup'
            },
            
            // Shipped orders
            {
                product: products[5]._id, // Printer Paper
                quantity: 10,
                customerName: 'John Employee',
                customerId: users[1]._id,
                status: 'Shipped',
                totalAmount: 199.90,
                priority: 'Low',
                approvedBy: users[0]._id,
                approvedDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
                estimatedDelivery: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
                notes: 'Bulk order for office supplies'
            },
            {
                product: products[14]._id, // Office Suite
                quantity: 5,
                customerName: 'Sarah Employee',
                customerId: users[2]._id,
                status: 'Shipped',
                totalAmount: 749.95,
                priority: 'High',
                approvedBy: users[0]._id,
                approvedDate: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
                estimatedDelivery: new Date(now.getTime()), // Today
                notes: 'Software licenses for new team members'
            },
            
            // Delivered orders
            {
                product: products[2]._id, // Keyboard
                quantity: 2,
                customerName: 'Jane Customer',
                customerId: users[3]._id,
                status: 'Delivered',
                totalAmount: 179.98,
                priority: 'Medium',
                approvedBy: users[0]._id,
                approvedDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
                estimatedDelivery: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
                notes: 'Mechanical keyboards for developers'
            },
            {
                product: products[7]._id, // Notebook Set
                quantity: 20,
                customerName: 'Mike Customer',
                customerId: users[4]._id,
                status: 'Delivered',
                totalAmount: 319.80,
                priority: 'Low',
                approvedBy: users[0]._id,
                approvedDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
                estimatedDelivery: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
                notes: 'Notebooks for training sessions'
            },
            
            // Rejected order
            {
                product: products[11]._id, // Standing Desk
                quantity: 1,
                customerName: 'John Employee',
                customerId: users[1]._id,
                status: 'Rejected',
                totalAmount: 599.99,
                priority: 'Low',
                rejectionReason: 'Budget constraints for this quarter. Please resubmit next quarter.',
                notes: 'Standing desk for health benefits'
            },
            
            // Cancelled order
            {
                product: products[4]._id, // Webcam
                quantity: 3,
                customerName: 'Sarah Employee',
                customerId: users[2]._id,
                status: 'Cancelled',
                totalAmount: 239.97,
                priority: 'Medium',
                approvedBy: users[0]._id,
                approvedDate: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
                notes: 'Cancelled due to change in requirements'
            },
            
            // Old pending order (for notification testing)
            {
                product: products[8]._id, // Pen Set
                quantity: 10,
                customerName: 'John Employee',
                customerId: users[1]._id,
                status: 'Pending',
                totalAmount: 129.90,
                priority: 'Low',
                notes: 'Pens for office use',
                orderDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000) // 5 days ago (should trigger notification)
            }
        ]);
        
        console.log('Created orders');
        
        console.log('\n🎉 Database seeded successfully!');
        console.log('\n📊 Summary:');
        console.log(`- Users: ${users.length}`);
        console.log(`- Categories: ${categories.length}`);
        console.log(`- Suppliers: ${suppliers.length}`);
        console.log(`- Products: ${products.length}`);
        console.log(`- Orders: ${orders.length}`);
        
        console.log('\n🔐 Login credentials:');
        console.log('👨‍💼 Admin: admin@inventory.com / password123');
        console.log('👷‍♂️ Employee: employee@inventory.com / password123');
        console.log('👷‍♀️ Employee 2: employee2@inventory.com / password123');
        console.log('👤 Customer: customer@inventory.com / password123');
        console.log('👤 Customer 2: customer2@inventory.com / password123');
        
        console.log('\n✅ All employee features can now be tested with realistic data!');
        
    } catch (error) {
        console.error('❌ Error seeding database:', error);
    } finally {
        mongoose.connection.close();
    }
};

seedDatabase();
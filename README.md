# 📦 Inventory Management System

A modern full-stack inventory management system built with React.js and Node.js for efficient order processing and inventory tracking.

## ✨ Features

**Admin:** Dashboard analytics, product/order/user management, sales reports  
**Employee:** Order placement, order history, product browsing, profile management

## 🚀 Quick Start

```bash
# Clone and install
git clone https://github.com/pranavi-code/InventoryManagementSystem.git
cd InventoryManagementSystem
npm install

# Install dependencies
cd frontend && npm install
cd ../server && npm install

# Start application
cd server && npm run dev    # Backend (port 5000)
cd frontend && npm run dev  # Frontend (port 5173)
```

## 🔐 Login Credentials

**Admin:** admin@company.com / admin123  
**Employee:** employee@company.com / employee123

## ️ Tech Stack

**Frontend:** React.js, Tailwind CSS, Vite  
**Backend:** Node.js, Express.js, JWT  
**Database:** JSON files, Supabase (optional)

## � Project Structure

```
├── frontend/     # React frontend
├── server/       # Node.js backend  
└── data/         # JSON database files
```

## 🔧 Key API Endpoints

- `POST /api/auth/login` - Login
- `GET /api/order` - Get orders
- `POST /api/order` - Create order
- `GET /api/product` - Get products
- `POST /api/product` - Create product (Admin)

## 🚀 Deployment

**Frontend:** Build with `npm run build` and deploy to Vercel/Netlify  
**Backend:** Deploy server folder to Heroku/Railway with environment variables

---

⭐ **Star this repo if helpful!** | ‍💻 **Author:** [Pranavi](https://github.com/pranavi-code)" 

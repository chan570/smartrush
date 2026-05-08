const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const Store = require('./models/Store');
const Product = require('./models/Product');
const Inventory = require('./models/Inventory');
const User = require('./models/User');

dotenv.config();

const stores = [
  {
    name: 'Zudio - Koramangala',
    brand: 'Zudio',
    address: '80 Feet Rd, Koramangala, Bengaluru',
    location: { lat: 12.9352, lng: 77.6245 },
    rating: 4.2
  },
  {
    name: 'H&M - Indiranagar',
    brand: 'H&M',
    address: '100 Feet Rd, Indiranagar, Bengaluru',
    location: { lat: 12.9716, lng: 77.6412 },
    rating: 4.5
  },
  {
    name: 'Zara - MG Road',
    brand: 'Zara',
    address: 'MG Road, Bengaluru',
    location: { lat: 12.9733, lng: 77.6033 },
    rating: 4.7
  },
  {
    name: 'Uniqlo - Phoenix Marketcity',
    brand: 'Uniqlo',
    address: 'Whitefield Main Rd, Bengaluru',
    location: { lat: 12.9958, lng: 77.6964 },
    rating: 4.6
  },
  {
    name: 'Zudio - Jayanagar',
    brand: 'Zudio',
    address: '4th Block, Jayanagar, Bengaluru',
    location: { lat: 12.9285, lng: 77.5831 },
    rating: 4.1
  }
];

const products = [
  { 
    name: 'Oversized Cotton T-Shirt', 
    category: 'Tops', 
    price: 799, 
    description: 'A premium heavy-weight cotton t-shirt with a relaxed fit.',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80',
    features: ['100% Organic Cotton', 'Drop Shoulder', 'Breathable Fabric', 'Machine Wash']
  },
  { 
    name: 'Slim Fit Denim Jeans', 
    category: 'Bottoms', 
    price: 1999, 
    description: 'Classic slim-fit jeans with a bit of stretch for comfort.',
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=80',
    features: ['Stretchable Denim', 'Mid-rise Waist', '5-Pocket Design', 'Durable Stitching']
  },
  { 
    name: 'Linen Blend Shirt', 
    category: 'Tops', 
    price: 1499, 
    description: 'Stylish linen-blend shirt for a smart-casual summer look.',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
    features: ['Breathable Linen', 'Regular Fit', 'Mandarin Collar', 'Lightweight']
  },
  { 
    name: 'Casual Blazer', 
    category: 'Outerwear', 
    price: 3499, 
    description: 'Elevate your style with this versatile semi-formal blazer.',
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80',
    features: ['Premium Blend', 'Notch Lapel', 'Slim Fit', 'Twin Pockets']
  },
  { 
    name: 'Canvas Sneakers', 
    category: 'Footwear', 
    price: 1299, 
    description: 'Minimalist white canvas sneakers for everyday wear.',
    image: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=80',
    features: ['Durable Canvas', 'Cushioned Insole', 'Rubber Outsole', 'Lace-up']
  },
  { 
    name: 'Graphic Hoodie', 
    category: 'Outerwear', 
    price: 2499, 
    description: 'Cozy streetwear hoodie with a modern graphic print.',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80',
    features: ['Fleece Interior', 'Kangaroo Pocket', 'Adjustable Hood', 'Ribbed Cuffs']
  },
  { 
    name: 'Floral Summer Dress', 
    category: 'Dresses', 
    price: 1899, 
    description: 'Elegant floral print dress, perfect for garden parties.',
    image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
    features: ['A-Line Silhouette', 'Soft Rayon', 'V-Neck', 'Side Zip']
  },
  { 
    name: 'Leather Belt', 
    category: 'Accessories', 
    price: 599, 
    description: 'Classic genuine leather belt with a brushed buckle.',
    image: 'https://images.unsplash.com/photo-1624222247344-550fbadfd08d?auto=format&fit=crop&w=800&q=80',
    features: ['Full Grain Leather', 'Antique Buckle', 'Adjustable Fit']
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000
    });
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await Store.deleteMany({});
    await Product.deleteMany({});
    await Inventory.deleteMany({});
    await User.deleteMany({});

    // Create Admin User
    await User.create({
      name: 'Super Admin',
      email: 'admin@smartrush.com',
      password: 'password123',
      role: 'admin'
    });

    console.log(`✅ Admin created.`);

    // Create Users and Stores
    const createdStores = [];
    for (let i = 0; i < stores.length; i++) {
      const storeData = stores[i];
      const email = storeData.name.toLowerCase().replace(/[^a-z0-9]/g, '') + '@owner.com';
      
      const user = await User.create({
        name: storeData.name + ' Owner',
        email: email,
        password: 'password123',
        role: 'store_owner'
      });

      const store = await Store.create({
        ...storeData,
        ownerId: user._id
      });

      user.storeId = store._id;
      await user.save();

      createdStores.push(store);
      console.log(`👤 Owner created: ${email} | Password: password123`);
    }

    console.log(`✅ Seeded ${createdStores.length} stores with owners.`);

    // Insert Products
    const createdProducts = await Product.insertMany(products);
    console.log(`✅ Seeded ${createdProducts.length} products.`);

    // Create Inventory entries
    const inventoryData = [];
    createdStores.forEach(store => {
      createdProducts.forEach(product => {
        // Random stock level between 0 and 50
        const stockLevel = Math.floor(Math.random() * 51);
        inventoryData.push({
          store: store._id,
          product: product._id,
          stockLevel,
          popularity: Math.floor(Math.random() * 100)
        });
      });
    });

    await Inventory.insertMany(inventoryData);
    console.log(`✅ Seeded ${inventoryData.length} inventory records.`);

    // Seed Delivery Persons
    const DeliveryPerson = require('./models/DeliveryPerson');
    await DeliveryPerson.deleteMany({});
    const deliveryPartners = [
      { name: 'Rahul Sharma', phone: '9876543210', vehicle: 'Activa 6G', isAvailable: true },
      { name: 'Amit Kumar', phone: '9876543211', vehicle: 'Splendor Plus', isAvailable: true },
      { name: 'Priya Patel', phone: '9876543212', vehicle: 'Jupiter', isAvailable: true },
      { name: 'Sandeep Singh', phone: '9876543213', vehicle: 'Access 125', isAvailable: true },
      { name: 'Vikram Das', phone: '9876543214', vehicle: 'Pulsar 150', isAvailable: true }
    ];
    await DeliveryPerson.insertMany(deliveryPartners);
    console.log(`✅ Seeded ${deliveryPartners.length} delivery partners.`);

    console.log('🌱 Seeding completed successfully!');
    process.exit();
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();

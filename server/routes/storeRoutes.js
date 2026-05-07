const express = require('express');
const router = express.Router();
const Store = require('../models/Store');
const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const axios = require('axios');
const { protect, authorize } = require('../middleware/authMiddleware');

// Discover real stores nearby using OpenStreetMap (Overpass API)
router.get('/discover', async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) return res.status(400).json({ message: 'Location required' });

    console.log(`Discovering real stores near ${lat}, ${lng}...`);

    const query = `[out:json][timeout:15];node(around:5000,${lat},${lng})["shop"~"clothes|shoes|electronics|jewelry|boutique|mall"];out;`;
    
    const mirrors = [
      'https://overpass-api.de/api/interpreter',
      'https://lz4.overpass-api.de/api/interpreter',
      'https://overpass.kumi.systems/api/interpreter'
    ];

    let elements = [];
    for (const mirror of mirrors) {
      try {
        const resp = await axios.post(mirror, `data=${encodeURIComponent(query)}`, {
          headers: { 
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'SmartRush/1.0'
          },
          timeout: 10000
        });
        elements = resp.data.elements;
        if (elements && elements.length > 0) break;
      } catch (err) {
        console.warn(`Mirror ${mirror} failed: ${err.message}`);
      }
    }

    const realStores = elements.map(el => ({
      _id: `real-${el.id}`,
      name: el.tags?.name || 'Local Store',
      brand: el.tags?.brand || el.tags?.['brand:en'] || 'Local Brand',
      lat: el.lat,
      lng: el.lon,
      rating: (4.0 + Math.random()).toFixed(1),
      priority: 1, 
      isRealTime: true,
      eta: '20-40', // Dummy ETA for live stores
    }));

    res.json(realStores);
  } catch (error) {
    console.error('Discovery Error:', error);
    res.status(500).json({ message: 'Failed to fetch live stores' });
  }
});

// Get my store (For store_owner)
router.get('/my-store', protect, authorize('store_owner'), async (req, res) => {
  try {
    const store = await Store.findOne({ ownerId: req.user._id });
    if (!store) return res.status(404).json({ message: 'Store not found' });
    res.json(store);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get my store inventory
router.get('/my-store/inventory', protect, authorize('store_owner'), async (req, res) => {
  try {
    const store = await Store.findOne({ ownerId: req.user._id });
    if (!store) return res.status(404).json({ message: 'Store not found' });
    
    const inventory = await Inventory.find({ store: store._id }).populate('product');
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new product to my store
router.post('/my-store/products', protect, authorize('store_owner'), async (req, res) => {
  try {
    const { name, category, price, stockLevel, image } = req.body;
    
    const store = await Store.findOne({ ownerId: req.user._id });
    if (!store) return res.status(404).json({ message: 'Store not found' });

    // Create Product
    const product = await Product.create({
      name,
      category,
      price,
      description: 'Added by owner',
      image: image || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80' // default image
    });

    // Create Inventory entry
    const inventory = await Inventory.create({
      store: store._id,
      product: product._id,
      stockLevel
    });

    res.status(201).json(await inventory.populate('product'));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update stock
router.put('/my-store/inventory/:id', protect, authorize('store_owner'), async (req, res) => {
  try {
    const { stockLevel } = req.body;
    const inventory = await Inventory.findByIdAndUpdate(req.params.id, { stockLevel }, { new: true }).populate('product');
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get('/', async (req, res) => {
  try {
    const stores = await Store.find();
    res.json(stores);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get specific store inventory
router.get('/:id/inventory', async (req, res) => {
  try {
    console.log(`Fetching inventory for store ID: ${req.params.id}`);
    const inventory = await Inventory.find({ store: req.params.id }).populate('product');
    console.log(`Found ${inventory.length} items`);
    res.json(inventory);
  } catch (error) {
    console.error('Inventory Fetch Error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

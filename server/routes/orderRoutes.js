const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// Place a new order
router.post('/', async (req, res) => {
  try {
    const { storeId, items, totalAmount, customerDetails } = req.body;
    const order = new Order({
      store: storeId,
      items,
      totalAmount,
      customerDetails
    });
    await order.save();
    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all orders (for analytics)
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().populate('store');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

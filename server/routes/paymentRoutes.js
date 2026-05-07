const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Inventory = require('../models/Inventory');
const DeliveryPerson = require('../models/DeliveryPerson');
const { protect } = require('../middleware/authMiddleware');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder'
});

// Helper to assign a random available delivery person
const assignDeliveryPartner = async () => {
  const partners = await DeliveryPerson.find({ isAvailable: true });
  if (partners.length === 0) return null;
  return partners[Math.floor(Math.random() * partners.length)];
};

// Get Razorpay Key for frontend
router.get('/get-key', protect, (req, res) => {
  res.status(200).json({ key: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder' });
});

// Get My Orders
router.get('/my-orders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .populate('store')
      .populate('deliveryPerson')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create Order (Razorpay or COD)
router.post('/create-order', protect, async (req, res) => {
  try {
    const { storeId, items, totalAmount, customerDetails, paymentMethod } = req.body;
    
    // Find available delivery partner
    const deliveryPartner = await assignDeliveryPartner();

    if (paymentMethod === 'COD') {
      const newOrder = await Order.create({
        store: storeId,
        items: items,
        totalAmount: totalAmount,
        status: 'Confirmed',
        deliveryStatus: 'Confirmed',
        customerDetails: customerDetails,
        paymentMethod: 'COD',
        deliveryPerson: deliveryPartner ? deliveryPartner._id : null,
        userId: req.user._id
      });

      // Deduct inventory
      for (let item of items) {
        if (item.inventoryId) {
          await Inventory.findByIdAndUpdate(item.inventoryId, {
            $inc: { stockLevel: -item.quantity }
          });
        }
      }

      return res.status(201).json({
        order: newOrder,
        message: 'COD Order placed successfully'
      });
    }

    // Prepaid Flow
    const options = {
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`
    };

    const razorpayOrder = await razorpay.orders.create(options);

    const newOrder = await Order.create({
      store: storeId,
      items: items,
      totalAmount: totalAmount,
      status: 'Pending',
      deliveryStatus: 'Placed',
      customerDetails: customerDetails,
      paymentMethod: 'Prepaid',
      razorpayOrderId: razorpayOrder.id,
      deliveryPerson: deliveryPartner ? deliveryPartner._id : null,
      userId: req.user._id
    });

    res.json({
      order: newOrder,
      razorpayOrder: razorpayOrder
    });
  } catch (error) {
    console.error("Order Creation Error Detail:", {
      body: req.body,
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
});

// Verify Payment
router.post('/verify-payment', protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, dbOrderId } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder')
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      const order = await Order.findById(dbOrderId);
      if (!order) return res.status(404).json({ message: 'Order not found' });

      order.status = 'Paid';
      order.deliveryStatus = 'Confirmed';
      order.razorpayPaymentId = razorpay_payment_id;
      await order.save();

      // Deduct inventory
      for (let item of order.items) {
        if (item.inventoryId) {
          await Inventory.findByIdAndUpdate(item.inventoryId, {
            $inc: { stockLevel: -item.quantity }
          });
        }
      }

      return res.status(200).json({ message: 'Payment verified successfully', order });
    } else {
      return res.status(400).json({ message: 'Invalid signature sent!' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error!' });
  }
});

module.exports = router;

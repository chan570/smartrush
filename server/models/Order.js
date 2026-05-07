const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    inventoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory' },
    name: String,
    price: Number,
    quantity: Number
  }],
  totalAmount: { type: Number, required: true },
  status: { type: String, default: 'Pending' },
  deliveryStatus: { 
    type: String, 
    enum: ['Placed', 'Confirmed', 'Picked Up', 'Out for Delivery', 'Delivered'],
    default: 'Placed'
  },
  customerDetails: {
    name: String,
    address: String
  },
  paymentMethod: { type: String, enum: ['COD', 'Prepaid'], default: 'Prepaid' },
  deliveryPerson: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryPerson' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);

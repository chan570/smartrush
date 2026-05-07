const mongoose = require('mongoose');

const deliveryPersonSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  vehicle: { type: String, required: true },
  isAvailable: { type: Boolean, default: true },
  currentLocation: {
    lat: Number,
    lng: Number
  }
}, { timestamps: true });

module.exports = mongoose.model('DeliveryPerson', deliveryPersonSchema);

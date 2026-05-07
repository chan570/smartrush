const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  stockLevel: { type: Number, required: true }, // Current items in stock
  popularity: { type: Number, default: 0 }      // To help estimate demand/availability probability
}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);

const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  eventType: { type: String, required: true }, // 'search', 'click', 'visit'
  userId: { type: String },                    // Optional if no auth yet
  details: { type: Object },                   // Search query, storeId, etc.
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Analytics', analyticsSchema);

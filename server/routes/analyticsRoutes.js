const express = require('express');
const router = express.Router();
const Analytics = require('../models/Analytics');

// Log an event
router.post('/log', async (req, res) => {
  try {
    const { eventType, details, userId } = req.body;
    const log = new Analytics({ eventType, details, userId });
    await log.save();
    res.status(201).json({ message: 'Event logged' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get insights (summary)
router.get('/insights', async (req, res) => {
  try {
    const totalSearches = await Analytics.countDocuments({ eventType: 'search' });
    const topStores = await Analytics.aggregate([
      { $match: { eventType: 'click' } },
      { $group: { _id: '$details.storeId', count: { $sum: 1 } } },
      { 
        $lookup: {
          from: 'stores',
          localField: '_id',
          foreignField: '_id',
          as: 'storeInfo'
        }
      },
      { $unwind: { path: '$storeInfo', preserveNullAndEmptyArrays: true } },
      { 
        $project: {
          count: 1,
          name: { $ifNull: ['$storeInfo.name', 'Unknown Store'] }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    res.json({ totalSearches, topStores });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

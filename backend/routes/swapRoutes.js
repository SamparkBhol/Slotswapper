const express = require('express');
const router = express.Router();
const {
  getSwappableSlots,
  createSwapRequest,
  respondToSwapRequest,
  getMySwapRequests,
  getMySwapStats
} = require('../controllers/swapController');
const { protect } = require('../middleware/authMiddleware');

router.get('/swappable-slots', protect, getSwappableSlots);
router.get('/my-requests', protect, getMySwapRequests);
router.get('/my-stats', protect, getMySwapStats);
router.post('/swap-request', protect, createSwapRequest);
router.post('/swap-response/:requestId', protect, respondToSwapRequest);

module.exports = router;
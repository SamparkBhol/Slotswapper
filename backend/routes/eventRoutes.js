const express = require('express');
const router = express.Router();
const {
  createEvent,
  getMyEvents,
  updateEventStatus,
  deleteEvent,
  getEventsByUser,
} = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, createEvent).get(protect, getMyEvents);

router
  .route('/:id')
  .put(protect, updateEventStatus)
  .delete(protect, deleteEvent);
  
router.get('/user/:userId', protect, getEventsByUser);

module.exports = router;
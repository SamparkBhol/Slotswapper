const Event = require('../models/Event');

const createEvent = async (req, res) => {
  const { title, startTime, endTime } = req.body;

  try {
    const event = new Event({
      title,
      startTime,
      endTime,
      owner: req.user._id,
      status: 'BUSY',
    });

    const createdEvent = await event.save();
    res.status(201).json(createdEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ owner: req.user._id }).sort({ startTime: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getEventsByUser = async (req, res) => {
  try {
    const events = await Event.find({ owner: req.params.userId }).sort({ startTime: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateEventStatus = async (req, res) => {
  const { status } = req.body;
  
  if (!['BUSY', 'SWAPPABLE'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    if (event.status === 'SWAP_PENDING') {
      return res.status(400).json({ message: 'Cannot change status of a pending swap' });
    }

    event.status = status;
    const updatedEvent = await event.save();
    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    if (event.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    if (event.status !== 'BUSY') {
        return res.status(400).json({ message: 'Cannot delete an event involved in a swap' });
    }

    await event.remove();
    res.json({ message: 'Event removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


module.exports = { 
  createEvent, 
  getMyEvents, 
  updateEventStatus, 
  deleteEvent, 
  getEventsByUser 
};
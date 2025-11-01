const SwapRequest = require('../models/SwapRequest');
const Event = require('../models/Event');

const getMySwapStats = async (req, res) => {
  const userId = req.user._id;
  try {
    const completed = await SwapRequest.countDocuments({
      $or: [{ requesterUser: userId }, { receiverUser: userId }],
      status: 'ACCEPTED'
    });
    
    const rejected = await SwapRequest.countDocuments({
      $or: [{ requesterUser: userId }, { receiverUser: userId }],
      status: 'REJECTED'
    });

    res.json({ completed, rejected });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getSwappableSlots = async (req, res) => {
  try {
    const swappableSlots = await Event.find({
      status: 'SWAPPABLE',
      owner: { $ne: req.user._id },
    })
      .populate('owner', 'name')
      .sort({ startTime: 1 });
    res.json(swappableSlots);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const createSwapRequest = async (req, res) => {
  const { mySlotId, theirSlotId } = req.body;
  const requesterUserId = req.user._id;
  const io = req.io;

  try {
    const mySlot = await Event.findById(mySlotId);
    const theirSlot = await Event.findById(theirSlotId);

    if (!mySlot || !theirSlot) {
      return res.status(404).json({ message: 'One or both slots not found' });
    }

    if (
      mySlot.owner.toString() !== requesterUserId.toString() ||
      theirSlot.owner.toString() === requesterUserId.toString()
    ) {
      return res.status(401).json({ message: 'Invalid slot ownership' });
    }

    if (mySlot.status !== 'SWAPPABLE' || theirSlot.status !== 'SWAPPABLE') {
      return res
        .status(400)
        .json({ message: 'Both slots must be marked as swappable' });
    }

    const receiverUserId = theirSlot.owner;

    const swapRequest = new SwapRequest({
      requesterUser: requesterUserId,
      receiverUser: receiverUserId,
      requesterSlot: mySlotId,
      receiverSlot: theirSlotId,
      status: 'PENDING',
    });

    mySlot.status = 'SWAP_PENDING';
    theirSlot.status = 'SWAP_PENDING';

    await mySlot.save();
    await theirSlot.save();
    const createdRequest = await swapRequest.save();

    io.to(receiverUserId.toString()).emit('newSwapRequest', {
      message: `You have a new swap request from ${req.user.name}!`,
      request: createdRequest,
    });

    res.status(201).json(createdRequest);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const respondToSwapRequest = async (req, res) => {
  const { requestId } = req.params;
  const { accept } = req.body;
  const userId = req.user._id;
  const io = req.io;

  try {
    const swapRequest = await SwapRequest.findById(requestId);

    if (!swapRequest) {
      return res.status(404).json({ message: 'Swap request not found' });
    }

    if (swapRequest.receiverUser.toString() !== userId.toString()) {
      return res.status(401).json({ message: 'Not authorized to respond' });
    }
    
    if (swapRequest.status !== 'PENDING') {
      return res.status(400).json({ message: 'This request has already been actioned' });
    }

    const requesterSlot = await Event.findById(swapRequest.requesterSlot);
    const receiverSlot = await Event.findById(swapRequest.receiverSlot);

    if (!requesterSlot || !receiverSlot) {
      return res.status(404).json({ message: 'Slots involved in swap no longer exist' });
    }

    if (accept === false) {
      swapRequest.status = 'REJECTED';
      requesterSlot.status = 'SWAPPABLE';
      receiverSlot.status = 'SWAPPABLE';

      await swapRequest.save();
      await requesterSlot.save();
      await receiverSlot.save();

      io.to(swapRequest.requesterUser.toString()).emit('swapResponse', {
        message: `Your swap request for ${requesterSlot.title} was rejected.`,
      });

      return res.json({ message: 'Swap rejected' });
    }

    if (accept === true) {
      swapRequest.status = 'ACCEPTED';

      const requesterOwner = requesterSlot.owner;
      const receiverOwner = receiverSlot.owner;

      requesterSlot.owner = receiverOwner;
      receiverSlot.owner = requesterOwner;

      requesterSlot.status = 'BUSY';
      receiverSlot.status = 'BUSY';

      await swapRequest.save();
      await requesterSlot.save();
      await receiverSlot.save();

      io.to(swapRequest.requesterUser.toString()).emit('swapResponse', {
        message: `Your swap request for ${requesterSlot.title} was accepted!`,
      });

      return res.json({ message: 'Swap accepted!' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getMySwapRequests = async (req, res) => {
  try {
    const incomingRequests = await SwapRequest.find({
      receiverUser: req.user._id,
      status: 'PENDING',
    })
      .populate('requesterUser', 'name')
      .populate('requesterSlot')
      .populate('receiverSlot');

    const outgoingRequests = await SwapRequest.find({
      requesterUser: req.user._id,
      status: 'PENDING',
    })
      .populate('receiverUser', 'name')
      .populate('requesterSlot')
      .populate('receiverSlot');
      
    const historyRequests = await SwapRequest.find({
        $or: [
            { requesterUser: req.user._id },
            { receiverUser: req.user._id }
        ],
        status: { $in: ['ACCEPTED', 'REJECTED'] }
    })
      .populate('requesterUser', 'name')
      .populate('receiverUser', 'name')
      .populate('requesterSlot')
      .populate('receiverSlot')
      .sort({ createdAt: -1 });

    res.json({ 
      incoming: incomingRequests, 
      outgoing: outgoingRequests,
      history: historyRequests
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getSwappableSlots,
  createSwapRequest,
  respondToSwapRequest,
  getMySwapRequests,
  getMySwapStats
};
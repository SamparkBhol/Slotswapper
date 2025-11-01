const { describe, it, expect, beforeEach } = require('@jest/globals');
const supertest = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const Event = require('../models/Event');
const SwapRequest = require('../models/SwapRequest');

let mockTestUser;

jest.mock('../middleware/authMiddleware', () => ({
  protect: (req, res, next) => {
    req.user = mockTestUser;
    next();
  },
}));

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  req.io = { to: () => ({ emit: () => {} }) };
  next();
});

const swapRoutes = require('../routes/swapRoutes');
const eventRoutes = require('../routes/eventRoutes');
app.use('/api/swap', swapRoutes);
app.use('/api/events', eventRoutes);

require('./setup');

describe('Swap Logic API (/api/swap)', () => {

  let userA, userB;
  let eventA, eventB;

  beforeEach(async () => {
    userA = new User({ name: 'User A', email: 'a@test.com', password: 'password123' });
    userB = new User({ name: 'User B', email: 'b@test.com', password: 'password123' });
    await userA.save();
    await userB.save();

    eventA = new Event({
      title: 'Event A',
      startTime: new Date('2025-12-01T10:00:00Z'),
      endTime: new Date('2025-12-01T11:00:00Z'),
      owner: userA._id,
      status: 'SWAPPABLE'
    });
    eventB = new Event({
      title: 'Event B',
      startTime: new Date('2025-12-02T14:00:00Z'),
      endTime: new Date('2025-12-02T15:00:00Z'),
      owner: userB._id,
      status: 'SWAPPABLE'
    });
    await eventA.save();
    await eventB.save();
  });

  describe('POST /api/swap/swap-response/:requestId (Accept)', () => {
    it('should correctly swap ownership of both events', async () => {
      mockTestUser = userA;
      const reqBody = { mySlotId: eventA._id, theirSlotId: eventB._id };
      const reqRes = await supertest(app).post('/api/swap/swap-request').send(reqBody);
      
      const swapRequest = reqRes.body;
      expect(reqRes.statusCode).toBe(201);
      
      const eventA_pending = await Event.findById(eventA._id);
      const eventB_pending = await Event.findById(eventB._id);
      expect(eventA_pending.status).toBe('SWAP_PENDING');
      expect(eventB_pending.status).toBe('SWAP_PENDING');

      mockTestUser = userB;
      const resBody = { accept: true };
      const resRes = await supertest(app).post(`/api/swap/swap-response/${swapRequest._id}`).send(resBody);
      
      expect(resRes.statusCode).toBe(200);
      expect(resRes.body.message).toBe('Swap accepted!');

      const eventA_after = await Event.findById(eventA._id);
      const eventB_after = await Event.findById(eventB._id);

      expect(eventA_after.owner.toString()).toBe(userB._id.toString());
      expect(eventB_after.owner.toString()).toBe(userA._id.toString());
      
      expect(eventA_after.status).toBe('BUSY');
      expect(eventB_after.status).toBe('BUSY');
      
      const swap_after = await SwapRequest.findById(swapRequest._id);
      expect(swap_after.status).toBe('ACCEPTED');
    });
  });

  describe('POST /api/swap/swap-response/:requestId (Reject)', () => {
    it('should set events back to SWAPPABLE', async () => {
      mockTestUser = userA;
      const reqBody = { mySlotId: eventA._id, theirSlotId: eventB._id };
      const reqRes = await supertest(app).post('/api/swap/swap-request').send(reqBody);
      const swapRequest = reqRes.body;
      expect(reqRes.statusCode).toBe(201);
      
      mockTestUser = userB;
      const resBody = { accept: false };
      const resRes = await supertest(app).post(`/api/swap/swap-response/${swapRequest._id}`).send(resBody);
      
      expect(resRes.statusCode).toBe(200);
      expect(resRes.body.message).toBe('Swap rejected');

      const eventA_after = await Event.findById(eventA._id);
      const eventB_after = await Event.findById(eventB._id);

      expect(eventA_after.status).toBe('SWAPPABLE');
      expect(eventB_after.status).toBe('SWAPPABLE');
      
      expect(eventA_after.owner.toString()).toBe(userA._id.toString());
      expect(eventB_after.owner.toString()).toBe(userB._id.toString());
    });
  });
});
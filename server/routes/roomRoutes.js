import express from 'express';
import upload from '../middleware/uploadMiddleware.js'
import { protect } from '../middleware/authMiddleware.js';
import { createRoom, deleteRoom, getOwnerRooms, getRoomBookingImpact, getRooms, toggleRoomAvailability, updateRoom } from '../controllers/roomController.js';

const roomRouter = express.Router();

roomRouter.post('/', upload.array('images', 4), protect, createRoom)
roomRouter.get('/', getRooms)
roomRouter.get('/owner', protect, getOwnerRooms)
roomRouter.post('/toggle-availability', protect, toggleRoomAvailability)

roomRouter.put('/:roomId', protect, upload.array('images', 4), updateRoom)
roomRouter.get('/:roomId/booking-impact', protect, getRoomBookingImpact)
roomRouter.delete('/:roomId', protect, deleteRoom)

export default roomRouter;
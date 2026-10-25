import Booking from '../models/Booking.js';
import Hotel from '../models/Hotel.js';
import Room from '../models/Room.js';

// Check room availability using hotel check-in/check-out date boundaries.
const checkAvailability = async ({ checkInDate, checkOutDate, room }) => {
    const bookings = await Booking.find({
        room,
        status: { $ne: 'cancelled' },
        checkInDate: { $lt: new Date(checkOutDate) },
        checkOutDate: { $gt: new Date(checkInDate) },
    });

    return bookings.length === 0;
}

// API to check availability for one room or a list of rooms.
// POST /api/bookings/check-availability
export const checkAvailabilityAPI = async (req, res) => {
    try {
        const { room, rooms, checkInDate, checkOutDate } = req.body;

        if (!checkInDate || !checkOutDate || Number.isNaN(new Date(checkInDate).getTime()) || Number.isNaN(new Date(checkOutDate).getTime()) || new Date(checkInDate) >= new Date(checkOutDate)) {
            return res.status(400).json({ success: false, message: 'Check-Out Date must be after Check-In Date' });
        }

        // Batch-check the rooms from the search results in one database query.
        if (Array.isArray(rooms)) {
            if (rooms.length === 0) {
                return res.json({ success: true, availableRoomIds: [] });
            }

            const bookings = await Booking.find({
                room: { $in: rooms },
                status: { $ne: 'cancelled' },
                checkInDate: { $lt: new Date(checkOutDate) },
                checkOutDate: { $gt: new Date(checkInDate) },
            }).select('room');

            const bookedRoomIds = new Set(bookings.map((booking) => String(booking.room)));
            const availableRoomIds = rooms.filter((roomId) => !bookedRoomIds.has(String(roomId)));

            return res.json({ success: true, availableRoomIds });
        }

        if (!room) {
            return res.status(400).json({ success: false, message: 'Room is required' });
        }

        const isAvailable = await checkAvailability({ checkInDate, checkOutDate, room });
        return res.json({ success: true, isAvailable });

    } catch (error) {
        console.error('Check availability failed:', error.message);
        return res.status(500).json({ success: false, message: 'Failed to check room availability' });
    }
}

// API to create a new booking
// POST /api/bookings/book
export const createBooking = async (req, res) => {
    try {
        const { room, checkInDate, checkOutDate, guests, adults, children } = req.body;
        const adultCount = adults === undefined ? Number(guests) : Number(adults);
        const childrenCount = children === undefined ? 0 : Number(children);

        if (!room || !checkInDate || !checkOutDate || Number.isNaN(new Date(checkInDate).getTime()) || Number.isNaN(new Date(checkOutDate).getTime()) || new Date(checkInDate) >= new Date(checkOutDate)) {
            return res.status(400).json({ success: false, message: 'Please select valid check-in and check-out dates' });
        }

        if (!Number.isInteger(adultCount) || adultCount < 1 || adultCount > 4 || !Number.isInteger(childrenCount) || childrenCount < 0 || childrenCount > 3) {
            return res.status(400).json({ success: false, message: 'Invalid guest count' });
        }

        if (!req.user?._id) {
            return res.status(401).json({ success: false, message: 'Please sign in before booking a room' });
        }

        // Check availability again at booking time to avoid relying on the search result alone.
        const isAvailable = await checkAvailability({ checkInDate, checkOutDate, room });

        if (!isAvailable) {
            return res.status(409).json({ success: false, message: 'Room is not available for the selected dates' });
        }

        const roomData = await Room.findById(room).populate('hotel');

        if (!roomData || !roomData.isAvailable || !roomData.hotel) {
            return res.status(404).json({ success: false, message: 'Room is not available' });
        }

        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
        const totalPrice = roomData.pricePerNight * nights;

        await Booking.create({
            user: req.user._id,
            room,
            hotel: roomData.hotel._id,
            guests: adultCount + childrenCount,
            adults: adultCount,
            children: childrenCount,
            checkInDate,
            checkOutDate,
            totalPrice,
        });

        return res.json({ success: true, message: 'Booking created successfully' });

    } catch (error) {
        console.error('Create booking failed:', error.message);
        return res.status(500).json({ success: false, message: 'Failed to create booking' });
    }
};

// API to get all bookings for a user
// POST /api/bookings/user
export const getUserBookings = async (req, res) => {
    try {
        const user = req.user._id;
        const bookings = await Booking.find({ user }).populate('room hotel').sort({ createdAt: -1 });
        return res.json({ success: true, bookings });

    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to fetch booking' });
    }
}

export const getHotelBookings = async (req, res) => {
    try {
        const hotel = await Hotel.findOne({ owner: req.auth.userId });

        if (!hotel) {
            return res.json({ success: false, message: 'No Room found' });
        }

        const bookings = await Booking.find({ hotel: hotel._id }).populate('room hotel user').sort({ createdAt: -1 });
        const totalBookings = bookings.length;
        const totalRevenue = bookings.reduce((acc, booking) => acc + booking.totalPrice, 0);

        return res.json({ success: true, dashboardData: { totalBookings, totalRevenue, bookings } });

    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to fetch booking' });
    }
}

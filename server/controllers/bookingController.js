import transporter from '../configs/nodemailer.js';
import Booking from '../models/Booking.js';
import Hotel from '../models/Hotel.js';
import Room from '../models/Room.js';
import stripe from 'stripe';

// Function to Check Availability of Room
const checkAvailability = async ({ checkInDate, checkOutDate, room }) => {
    try {
        const bookings = await Booking.find({
            room,
            checkInDate: { $lte: checkOutDate },
            checkOutDate: { $gte: checkInDate },
        });
        
        const isAvailable = bookings.length === 0;
        return isAvailable;

    } catch (error) {
        console.error(error.message);
    }
}

// API to Check Availability of Room
// POST /api/bookings/check-availability
export const checkAvailabilityAPI = async (req, res) => {
    try {
        const { room, checkInDate, checkOutDate } = req.body;
        const isAvailable = await checkAvailability({
            checkInDate,
            checkOutDate,
            room
        });
        res.json({ success: true, isAvailable })

    } catch (error) {
        res.json({ success: false, message : error.message })
    }
}

// API to create a new booking
// POST /api/bookings/book
export const createBooking = async (req, res) => {
    try {
        const { room, checkInDate, checkOutDate, guests, adults, children } = req.body;
        const adultCount = adults === undefined ? Number(guests) : Number(adults);
        const childrenCount = children === undefined ? 0 : Number(children);

        if (!Number.isInteger(adultCount) || adultCount < 1 || !Number.isInteger(childrenCount) || childrenCount < 0) {
            return res.json({ success: false, message: 'Invalid guest count' });
        }

        const user = req.user._id;

            // Before Booking Check Availability
        const isAvailable = await checkAvailability({
            checkInDate,
            checkOutDate,
            room
        });

        if (!isAvailable) {
            return res.json({ success: false, message: 'Room is not available' })
        }

            // Get totalPrice from Room
        const roomData = await Room.findById(room).populate('hotel');
        if (!roomData || !roomData.hotel) {
            return res.json({ success: false, message: 'Room or hotel not found' });
        }
        let totalPrice = roomData.pricePerNight;
        
            // Calculate totalPrice based on nights
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        const timeDiff = checkOut.getTime() - checkIn.getTime();
        const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        totalPrice *= nights;
        const booking = await Booking.create({
            user,
            guestName: req.user.username?.trim() || req.user.email,
            room,
            roomName: roomData.roomType,
            hotel: roomData.hotel._id,
            hotelName: roomData.hotel.name,
            guests: adultCount + childrenCount,
            adults: adultCount,
            children: childrenCount,
            checkInDate,
            checkOutDate,
            totalPrice,
        })

        
        const currency = process.env.CURRENCY || '฿'

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: req.user.email,
            subject: `Booking Confirmation - ${ roomData.hotel.name }`,
            html: `
                <h2>Booking Confirmation</h2>
                <p>Dear ${ req.user.username || req.user.email },</p>
                <p>Thank you for your booking! Here are your booking details:</p>
                <ul>
                    <li><strong>Booking ID:</strong> ${ booking._id }</li>
                    <li><strong>Guest Name:</strong> ${ req.user.username || 'Guest' }</li>
                    <li><strong>Hotel Name:</strong> ${ roomData.hotel.name }</li>
                    <li><strong>Room:</strong> ${ roomData.roomType || 'Room' }</li>
                    <li><strong>Booking Date:</strong> ${ new Date(booking.createdAt).toLocaleString('en-GB', { timeZone: 'Asia/Bangkok' }) }</li>
                    <li><strong>Check-in:</strong> ${ new Date(booking.checkInDate).toDateString() }</li>
                    <li><strong>Check-out:</strong> ${ new Date(booking.checkOutDate).toDateString() }</li>
                    <li><strong>Date Total:</strong> ${ nights } ${ nights === 1 ? 'day' : 'days' }</li>
                    <li><strong>Guests:</strong> ${ booking.guests } (Adults: ${ booking.adults }, Children: ${ booking.children })</li>
                    <li><strong>Booking Total:</strong> ${ booking.totalPrice } ${ currency } (${ roomData.pricePerNight } ${ currency } / night)</li>
                </ul>
                <p>We look forward to welcoming you!</p>
                <p>If you need to make any changes, please contact us.</p>
                <p>Thank you for choosing ${ roomData.hotel.name }.</p>
            `
        }

        await transporter.sendMail(mailOptions)

        res.json({ success: true, message: 'Booking created successfully' })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message : 'Failed to create booking' })
    }
};

// API to get all bookings for a user
// POST /api/bookings/user
export const getUserBookings = async (req, res) => {
    try {
        const user = req.user._id;
        const bookings = await Booking.find({ user }).populate('room hotel').sort({ createdAt: -1 })
        res.json({ success: true, bookings })
    
    } catch (error) {
        res.json({ success: false, message : 'Failed to fetch booking' });
    }
}

// DELETE /api/bookings/:bookingId
export const cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findOne({
            _id: req.params.bookingId,
            user: req.user._id
        }).populate('room hotel')

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found or access denied'
            })
        }

        if (booking.isPaid) {
            return res.status(400).json({
                success: false,
                message: 'Paid bookings cannot be cancelled online yet. Please contact the hotel for assistance.'
            })
        }

        
        const guestEmail = req.user.email
        const guestName = req.user.username || 'Guest'
        const roomData = booking.room
        const hotelName = booking.hotel?.name || booking.hotelName || 'Bupatara'
        const currency = process.env.CURRENCY || '฿'
        const nights = Math.ceil((new Date(booking.checkOutDate) - new Date(booking.checkInDate)) / (1000 * 60 * 60 * 24))

        // Delete the booking first
        await Booking.findByIdAndDelete(booking._id)

        // Send cancellation email through the existing Brevo SMTP transporter
        try {
            await transporter.sendMail({
                from: process.env.SENDER_EMAIL,
                to: guestEmail,
                subject: `Booking Cancellation Confirmation - ${ hotelName }`,
                html: `
                    <h2>Booking Cancellation Confirmation</h2>
                    <p>Dear ${ guestName },</p>
                    <p>Your booking has been cancelled successfully. Here are the details for your records:</p>
                    <ul>
                        <li><strong>Booking ID:</strong> ${ booking._id }</li>
                        <li><strong>Guest Name:</strong> ${ guestName} </li>
                        <li><strong>Hotel Name:</strong> ${ hotelName }</li>
                        <li><strong>Room:</strong> ${ roomData?.roomType || booking.roomName || 'Room' }</li>
                        <li><strong>Booking Date:</strong> ${ new Date(booking.createdAt).toLocaleString('en-GB', { timeZone: 'Asia/Bangkok' }) }</li>
                        <li><strong>Check-in:</strong> ${ new Date(booking.checkInDate).toDateString() }</li>
                        <li><strong>Check-out:</strong> ${ new Date(booking.checkOutDate).toDateString() }</li>
                        <li><strong>Date Total:</strong> ${ nights } ${ nights === 1 ? 'day' : 'days' }</li>
                        <li><strong>Guests:</strong> ${ booking.guests } (Adults: ${ booking.adults ?? booking.guests }, Children: ${ booking.children ?? 0 })</li>
                        <li><strong>Booking Total:</strong> ${ booking.totalPrice } ${ currency } (${ roomData?.pricePerNight ?? 'N/A' } ${ currency } / night)</li>
                    </ul>
                    <p>If you have any questions, please contact the hotel directly.</p>
                    <p>Thank you for considering ${ hotelName }.</p>
                `
            })

        } catch (emailError) {
            console.log(error);
            res.json({ success: false, message : 'Failed to create booking' })
        }

        return res.json({
            success: true,
            message: 'Booking cancelled successfully'
        })
    } catch (error) {
        console.error('Cancel booking error:', error.message)
        return res.status(500).json({
            success: false,
            message: 'Failed to cancel booking'
        })
    }
}

export const getHotelBookings = async (req, res) => {
    try {
        const hotel = await Hotel.findOne({ owner: req.auth.userId });
        if(!hotel) {
            return res.json({ success: false, message : 'No Room found' });
        }
        const bookings = await Booking.find({ hotel: hotel._id }).populate('room hotel user').sort({ createdAt: -1 });
                // Total Bookings
            const totalBookings = bookings.length;
                // Total Revenue
            const totalRevenue = bookings.reduce((acc, booking) => acc + booking.totalPrice, 0)

            res.json({ success: true, dashboardData: { totalBookings, totalRevenue, bookings } })

    } catch (error) {
        res.json({ success: false, message : 'Failed to fetch booking' });
    }
}

export const stripePayment = async (req, res) => {
    try {
        const { bookingId } = req.body;

        const booking = await Booking.findById(bookingId);
        const roomData = await Room.findById(booking.room).populate('hotel');
        const totalPrice = booking.totalPrice;
        const { origin } = req.headers;

        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

        const line_items = [
            {
                price_data: {
                    currency: 'thb',
                    product_data: {
                        name: roomData.hotel.name,
                    },
                    unit_amount: totalPrice * 100
                },
                quantity: 1,
            }
        ]
            // Create Checkout Session
        const session = await stripeInstance.checkout.sessions.create({
            line_items,
            mode: 'payment',
            success_url: `${ origin }/loader/my-bookings`,
            cancel_url: `${ origin }/my-bookings`,
            metadata: {
                bookingId,
            }
        })
        res.json({ success: true, url: session.url })

    } catch (error) {
        res.json({ success: false, message: 'Payment Failed' })
    }
}
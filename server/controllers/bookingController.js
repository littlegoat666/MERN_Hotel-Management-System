import transporter from '../configs/nodemailer.js'
import Booking from '../models/Booking.js'
import Hotel from '../models/Hotel.js'
import Room from '../models/Room.js'
import stripe from 'stripe'

const checkAvailability = async ({ checkInDate, checkOutDate, room }) => {
    try {
        const bookings = await Booking.find({
            room,
            checkInDate: { $lte: checkOutDate },
            checkOutDate: { $gte: checkInDate },
        })
        return bookings.length === 0
    } catch (error) {
        console.error('Check availability error:', error.message)
        return false
    }
}

const getBangkokParts = (date = new Date()) => {
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Bangkok',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).formatToParts(date)

    return Object.fromEntries(
        parts.filter((part) => part.type !== 'literal').map((part) => [part.type, part.value])
    )
}

export const checkAvailabilityAPI = async (req, res) => {
    try {
        const { room, checkInDate, checkOutDate } = req.body
        const roomData = await Room.findById(room)
        if (!roomData || roomData.isDeleted || !roomData.isAvailable) {
            return res.json({ success: true, isAvailable: false })
        }
        const isAvailable = await checkAvailability({ checkInDate, checkOutDate, room })
        return res.json({ success: true, isAvailable })
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message })
    }
}

export const createBooking = async (req, res) => {
    try {
        const { room, checkInDate, checkOutDate, guests, adults, children } = req.body
        const adultCount = adults === undefined ? Number(guests) : Number(adults)
        const childrenCount = children === undefined ? 0 : Number(children)

        if (!Number.isInteger(adultCount) || adultCount < 1 || !Number.isInteger(childrenCount) || childrenCount < 0) {
            return res.status(400).json({ success: false, message: 'Invalid guest count' })
        }

        const checkIn = new Date(checkInDate)
        const checkOut = new Date(checkOutDate)
        if (!checkInDate || !checkOutDate || Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime()) || checkOut <= checkIn) {
            return res.status(400).json({ success: false, message: 'Please provide a valid check-in and check-out date' })
        }

        const roomData = await Room.findById(room).populate('hotel')
        if (!roomData || roomData.isDeleted || !roomData.isAvailable || !roomData.hotel) {
            return res.status(400).json({ success: false, message: 'This room is no longer available for booking' })
        }

        const isAvailable = await checkAvailability({ checkInDate, checkOutDate, room })
        if (!isAvailable) return res.status(409).json({ success: false, message: 'Room is not available for the selected dates' })

        const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
        const totalPrice = Number(roomData.pricePerNight) * nights
        const booking = await Booking.create({
            user: req.user._id,
            room,
            hotel: roomData.hotel._id,
            guests: adultCount + childrenCount,
            adults: adultCount,
            children: childrenCount,
            checkInDate,
            checkOutDate,
            totalPrice,
        })

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: req.user.email,
            subject: 'Hotel Booking Details',
            html: `
                <h2>Your Booking Details</h2>
                <p>Dear ${req.user.username || 'Guest'},</p>
                <p>Thank you for your booking! Here are your details:</p>
                <ul>
                    <li><strong>Booking ID:</strong> ${booking._id}</li>
                    <li><strong>Guest Name:</strong> ${req.user.username || 'Guest'}</li>
                    <li><strong>Hotel:</strong> ${roomData.hotel.name}</li>
                    <li><strong>Room:</strong> ${roomData.roomType || 'Room'}</li>
                    <li><strong>Booking Date:</strong> ${new Date(booking.createdAt).toLocaleString('en-GB', { timeZone: 'Asia/Bangkok' })}</li>
                    <li><strong>Check-in:</strong> ${new Date(booking.checkInDate).toDateString()}</li>
                    <li><strong>Check-out:</strong> ${new Date(booking.checkOutDate).toDateString()}</li>
                    <li><strong>Date Total:</strong> ${nights} ${nights === 1 ? 'day' : 'days'}</li>
                    <li><strong>Guests:</strong> ${booking.guests} (Adults: ${booking.adults}, Children: ${booking.children})</li>
                    <li><strong>Booking Total:</strong> ${booking.totalPrice} ${process.env.CURRENCY || '฿'} (${roomData.pricePerNight} ${process.env.CURRENCY || '฿'} / night)</li>
                </ul>
                <p>We look forward to welcoming you!</p>
            `,
        }

        try {
            await transporter.sendMail(mailOptions)
        } catch (mailError) {
            console.error('Booking confirmation email failed:', mailError.message)
        }

        return res.json({ success: true, message: 'Booking created successfully', bookingId: booking._id })
    } catch (error) {
        console.error('Create booking error:', error.message)
        return res.status(500).json({ success: false, message: 'Failed to create booking' })
    }
}

export const getUserBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id })
            .populate('room hotel')
            .sort({ createdAt: -1 })
        return res.json({ success: true, bookings })
    } catch (error) {
        console.error('Get user bookings error:', error.message)
        return res.status(500).json({ success: false, message: 'Failed to fetch bookings' })
    }
}

export const getHotelBookings = async (req, res) => {
    try {
        const hotel = await Hotel.findOne({ owner: req.auth.userId })
        if (!hotel) return res.status(404).json({ success: false, message: 'No hotel is registered to this owner account' })

        const bookings = await Booking.find({ hotel: hotel._id })
            .populate('room hotel user')
            .sort({ createdAt: -1 })
            .lean()

        const paidBookings = bookings.filter((booking) => booking.isPaid === true)
        const totalRevenue = paidBookings.reduce((total, booking) => total + Number(booking.totalPrice || 0), 0)
        const now = new Date()
        const nowParts = getBangkokParts(now)
        const currentYear = Number(nowParts.year)
        const selectedYearInput = Number.parseInt(req.query.year, 10)
        const selectedMonthInput = Number.parseInt(req.query.month, 10)
        const selectedYear = Number.isInteger(selectedYearInput) && selectedYearInput >= 2000 && selectedYearInput <= currentYear + 1 ? selectedYearInput : currentYear
        const selectedMonth = Number.isInteger(selectedMonthInput) && selectedMonthInput >= 1 && selectedMonthInput <= 12 ? selectedMonthInput : Number(nowParts.month)

        const monthlyRevenue = Array.from({ length: 12 }, (_, index) => ({
            month: new Date(Date.UTC(selectedYear, index, 1)).toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }),
            revenue: 0,
        }))

        const dayCount = new Date(Date.UTC(selectedYear, selectedMonth, 0)).getUTCDate()
        const dailyRevenue = Array.from({ length: dayCount }, (_, index) => ({ day: index + 1, revenue: 0 }))
        const yearMap = new Map()

        paidBookings.forEach((booking) => {
            if (!booking.createdAt) return
            const parts = getBangkokParts(booking.createdAt)
            const year = Number(parts.year)
            const month = Number(parts.month)
            const day = Number(parts.day)
            const amount = Number(booking.totalPrice || 0)

            yearMap.set(year, (yearMap.get(year) || 0) + amount)
            if (year === selectedYear) monthlyRevenue[month - 1].revenue += amount
            if (year === selectedYear && month === selectedMonth) dailyRevenue[day - 1].revenue += amount
        })

        yearMap.set(currentYear, yearMap.get(currentYear) || 0)
        const yearlyRevenue = Array.from(yearMap.entries()).sort(([a], [b]) => a - b).map(([year, revenue]) => ({ year, revenue }))
        const availableYears = [...new Set([currentYear, selectedYear, ...yearlyRevenue.map((item) => item.year)])].sort((a, b) => b - a)

        return res.json({
            success: true,
            dashboardData: {
                totalBookings: bookings.length,
                totalRevenue,
                bookings: bookings.slice(0, 20),
                monthlyRevenue,
                dailyRevenue,
                yearlyRevenue,
                availableYears,
                currentYear,
                selectedYear,
                selectedMonth,
            },
        })
    } catch (error) {
        console.error('Get hotel bookings error:', error.message)
        return res.status(500).json({ success: false, message: 'Failed to fetch hotel bookings' })
    }
}

export const cancelBooking = async (req, res) => {
    try {
        const bookingId = req.body?.bookingId || req.params?.bookingId
        if (!bookingId) return res.status(400).json({ success: false, message: 'Booking ID is required' })

        const booking = await Booking.findOne({ _id: bookingId, user: req.user._id }).populate('room hotel')
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' })

        const roomData = booking.room
        const hotelData = booking.hotel || roomData?.hotel
        const nights = Math.max(0, Math.ceil((new Date(booking.checkOutDate) - new Date(booking.checkInDate)) / (1000 * 60 * 60 * 24)))
        const currency = process.env.CURRENCY || '฿'

        try {
            await transporter.sendMail({
                from: process.env.SENDER_EMAIL,
                to: req.user.email,
                subject: 'Booking Cancellation Confirmation',
                html: `
                    <h2>Booking Cancellation Confirmation</h2>
                    <p>Dear ${req.user.username || 'Guest'},</p>
                    <p>Your booking removal has been processed. Details are below:</p>
                    <ul>
                        <li><strong>Booking ID:</strong> ${booking._id}</li>
                        <li><strong>Guest Name:</strong> ${req.user.username || 'Guest'}</li>
                        <li><strong>Hotel:</strong> ${hotelData?.name || 'Bupatara Chiangmai'}</li>
                        <li><strong>Room:</strong> ${roomData?.roomType || 'Room'}</li>
                        <li><strong>Booking Date:</strong> ${new Date(booking.createdAt).toLocaleString('en-GB', { timeZone: 'Asia/Bangkok' })}</li>
                        <li><strong>Check-in:</strong> ${new Date(booking.checkInDate).toDateString()}</li>
                        <li><strong>Check-out:</strong> ${new Date(booking.checkOutDate).toDateString()}</li>
                        <li><strong>Date Total:</strong> ${nights} ${nights === 1 ? 'day' : 'days'}</li>
                        <li><strong>Guests:</strong> ${booking.guests} (Adults: ${booking.adults}, Children: ${booking.children})</li>
                        <li><strong>Booking Total:</strong> ${booking.totalPrice} ${currency} (${roomData?.pricePerNight || 0} ${currency} / night)</li>
                    </ul>
                    <p>If you did not request this action, please contact the hotel.</p>
                `,
            })
        } catch (mailError) {
            console.error('Booking cancellation email failed:', mailError.message)
        }

        await Booking.deleteOne({ _id: booking._id, user: req.user._id })
        return res.json({ success: true, message: 'Booking cancelled successfully' })
    } catch (error) {
        console.error('Cancel booking error:', error.message)
        return res.status(500).json({ success: false, message: 'Failed to cancel booking' })
    }
}

export const stripePayment = async (req, res) => {
    try {
        const { bookingId } = req.body
        const booking = await Booking.findOne({ _id: bookingId, user: req.user._id })
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found for this account' })
        if (booking.isPaid) return res.status(400).json({ success: false, message: 'This booking has already been paid' })

        const roomData = await Room.findById(booking.room).populate('hotel')
        if (!roomData?.hotel) return res.status(404).json({ success: false, message: 'The room details for this booking are no longer available' })
        const { origin } = req.headers
        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY)
        const line_items = [{
            price_data: {
                currency: 'thb',
                product_data: { name: `${roomData.hotel.name} - ${roomData.roomType}` },
                unit_amount: Math.round(Number(booking.totalPrice) * 100),
            },
            quantity: 1,
        }]

        const session = await stripeInstance.checkout.sessions.create({
            line_items,
            mode: 'payment',
            success_url: `${origin}/loader/my-bookings`,
            cancel_url: `${origin}/my-bookings`,
            metadata: { bookingId: String(booking._id) },
        })
        return res.json({ success: true, url: session.url })
    } catch (error) {
        console.error('Stripe payment error:', error.message)
        return res.status(500).json({ success: false, message: 'Payment could not be started' })
    }
}
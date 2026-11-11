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

const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
}[character]))

const formatDate = (value) => {
    if (!value) return '-'

    return new Date(value).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        timeZone: 'Asia/Bangkok',
    })
}

const formatDateTime = (value) => {
    if (!value) return '-'

    return new Date(value).toLocaleString('en-GB', {
        timeZone: 'Asia/Bangkok',
    })
}

const createBookingEmailHtml = ({ booking, guestName, hotelName, roomName, pricePerNight, title, message, footer }) => {
    const currency = process.env.CURRENCY || '฿'
    const totalPrice = Number(booking.totalPrice || 0).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })

    const nights = Math.max(0, Math.ceil(
        (new Date(booking.checkOutDate) - new Date(booking.checkInDate)) / (1000 * 60 * 60 * 24)
    ))

    const adults = Number(booking.adults ?? booking.guests ?? 1)
    const children = Number(booking.children ?? 0)
    const guests = Number(booking.guests ?? adults + children)

    return `
        <div style="margin: 0; padding: 32px 16px; background-color: #FAF7F2; font-family: Arial, sans-serif; color: #55443B;">
            <div style="max-width: 600px; margin: 0 auto; padding: 32px; background-color: #FFFDFA; border: 1px solid #E7DAD0; border-radius: 16px;">
                <p style="margin: 0 0 8px; color: #A96F58; font-size: 12px; font-weight: bold; letter-spacing: 2px;">BUPATARA CHIANGMAI</p>

                <h2 style="margin: 0 0 16px; color: #55443B;">${escapeHtml(title)}</h2>

                <p>Dear ${escapeHtml(guestName)},</p>

                <p>${escapeHtml(message)}</p>

                <h3 style="margin: 28px 0 12px; color: #A96F58;">Booking Details</h3>

                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                    <tr>
                        <td style="padding: 9px 0; border-bottom: 1px solid #E7DAD0;"><strong>Booking ID</strong></td>
                        <td style="padding: 9px 0; border-bottom: 1px solid #E7DAD0; text-align: right;">${escapeHtml(booking._id)}</td>
                    </tr>
                    <tr>
                        <td style="padding: 9px 0; border-bottom: 1px solid #E7DAD0;"><strong>Guest Name</strong></td>
                        <td style="padding: 9px 0; border-bottom: 1px solid #E7DAD0; text-align: right;">${escapeHtml(guestName)}</td>
                    </tr>
                    <tr>
                        <td style="padding: 9px 0; border-bottom: 1px solid #E7DAD0;"><strong>Hotel</strong></td>
                        <td style="padding: 9px 0; border-bottom: 1px solid #E7DAD0; text-align: right;">${escapeHtml(hotelName)}</td>
                    </tr>
                    <tr>
                        <td style="padding: 9px 0; border-bottom: 1px solid #E7DAD0;"><strong>Room</strong></td>
                        <td style="padding: 9px 0; border-bottom: 1px solid #E7DAD0; text-align: right;">${escapeHtml(roomName)}</td>
                    </tr>
                    <tr>
                        <td style="padding: 9px 0; border-bottom: 1px solid #E7DAD0;"><strong>Booking Date</strong></td>
                        <td style="padding: 9px 0; border-bottom: 1px solid #E7DAD0; text-align: right;">${escapeHtml(formatDateTime(booking.createdAt))}</td>
                    </tr>
                    <tr>
                        <td style="padding: 9px 0; border-bottom: 1px solid #E7DAD0;"><strong>Check-in</strong></td>
                        <td style="padding: 9px 0; border-bottom: 1px solid #E7DAD0; text-align: right;">${escapeHtml(formatDate(booking.checkInDate))}</td>
                    </tr>
                    <tr>
                        <td style="padding: 9px 0; border-bottom: 1px solid #E7DAD0;"><strong>Check-out</strong></td>
                        <td style="padding: 9px 0; border-bottom: 1px solid #E7DAD0; text-align: right;">${escapeHtml(formatDate(booking.checkOutDate))}</td>
                    </tr>
                    <tr>
                        <td style="padding: 9px 0; border-bottom: 1px solid #E7DAD0;"><strong>Duration</strong></td>
                        <td style="padding: 9px 0; border-bottom: 1px solid #E7DAD0; text-align: right;">${nights} ${nights === 1 ? 'night' : 'nights'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 9px 0; border-bottom: 1px solid #E7DAD0;"><strong>Guests</strong></td>
                        <td style="padding: 9px 0; border-bottom: 1px solid #E7DAD0; text-align: right;">${guests} (Adults: ${adults}, Children: ${children})</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; color: #A96F58;"><strong>Booking Total</strong></td>
                        <td style="padding: 12px 0; color: #A96F58; text-align: right;"><strong>${totalPrice} ${escapeHtml(currency)}</strong></td>
                    </tr>
                    <tr>
                        <td style="padding: 0 0 12px; color: #8C7A70;"><strong>Price per night</strong></td>
                        <td style="padding: 0 0 12px; color: #8C7A70; text-align: right;">${Number(pricePerNight || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${escapeHtml(currency)} / night</td>
                    </tr>
                </table>

                <p style="margin: 28px 0 0; font-size: 13px; color: #8C7A70;">${escapeHtml(footer)}</p>

                <p style="margin: 16px 0 0;">Best regards,<br />Bupatara Chiangmai</p>
            </div>
        </div>
    `
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
            html: createBookingEmailHtml({
                booking,
                guestName: req.user.username || 'Guest',
                hotelName: roomData.hotel.name,
                roomName: roomData.roomType || 'Room',
                pricePerNight: roomData.pricePerNight,
                title: 'Thank You for Your Booking!',
                message: 'Thank you for your booking. Your reservation has been successfully created. We look forward to welcoming you!',
                footer: 'This email confirms that your booking has been successfully created.',
            }),
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
        return res.status(500).json({ success: false, message: 'Failed to fetch bookings' })
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

        try {
            await transporter.sendMail({
                from: process.env.SENDER_EMAIL,
                to: req.user.email,
                subject: 'Booking Cancellation Confirmation',
                html: createBookingEmailHtml({
                    booking,
                    guestName: req.user.username || 'Guest',
                    hotelName: hotelData?.name || 'Bupatara Chiangmai',
                    roomName: roomData?.roomType || 'Room',
                    pricePerNight: roomData?.pricePerNight || 0,
                    title: 'Booking Cancellation Confirmation',
                    message: 'Your booking removal has been processed successfully. The following booking has been cancelled.',
                    footer: 'If you did not request this action, please contact the hotel.',
                }),
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

        const roomImages = Array.isArray(roomData.images)
            ? roomData.images.filter((image) => typeof image === 'string' && /^https?:\/\//i.test(image)).slice(0, 8)
            : []

        const { origin } = req.headers
        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY)

        const line_items = [{
            price_data: {
                currency: 'thb',
                product_data: {
                    name: `${roomData.hotel.name} - ${roomData.roomType}`,
                    ...(roomImages.length > 0 ? { images: roomImages } : {}),
                },
                unit_amount: Math.round(Number(booking.totalPrice) * 100),
            },
            quantity: 1,
        }]

        const session = await stripeInstance.checkout.sessions.create({
            line_items,
            mode: 'payment',
            locale: 'auto',
            branding_settings: {
                display_name: roomData.hotel.name || 'Bupatara Chiangmai',
                background_color: '#FAF7F2',
                button_color: '#A96F58',
                border_style: 'rounded',
                font_family: 'pridi',
            },
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
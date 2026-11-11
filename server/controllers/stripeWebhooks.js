import stripe from 'stripe'
import Booking from '../models/Booking.js'
import transporter from '../configs/nodemailer.js'

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

const sendPaymentConfirmationEmail = async (booking) => {
    const recipient = booking.user?.email

    if (!recipient) {
        console.error(`Payment confirmation email skipped: no email found for booking ${booking._id}`)
        return
    }

    const guestName = escapeHtml(booking.guestName || booking.user?.username || 'Guest')
    const hotelName = escapeHtml(booking.hotelName || booking.hotel?.name || 'Bupatara Chiangmai')
    const roomName = escapeHtml(booking.roomName || booking.room?.roomType || 'Room')
    const currency = escapeHtml(process.env.CURRENCY || '฿')

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

    await transporter.sendMail({
        from: process.env.SENDER_EMAIL,
        to: recipient,
        subject: 'Payment Confirmation - Bupatara Chiangmai',
        html: `
            <div style="margin: 0; padding: 32px 16px; background-color: #FAF7F2; font-family: Arial, sans-serif; color: #55443B;">
                <div style="max-width: 600px; margin: 0 auto; padding: 32px; background-color: #FFFDFA; border: 1px solid #E7DAD0; border-radius: 16px;">
                    <p style="margin: 0 0 8px; color: #A96F58; font-size: 12px; font-weight: bold; letter-spacing: 2px;">BUPATARA CHIANGMAI</p>

                    <h2 style="margin: 0 0 16px; color: #55443B;">Thank You for Your Payment!</h2>

                    <p>Dear ${guestName},</p>

                    <p>We have successfully received your payment. Thank you for choosing Bupatara Chiangmai. We look forward to welcoming you!</p>

                    <h3 style="margin: 28px 0 12px; color: #A96F58;">Payment Details</h3>

                    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                        <tr>
                            <td style="padding: 9px 0; border-bottom: 1px solid #E7DAD0;"><strong>Booking ID</strong></td>
                            <td style="padding: 9px 0; border-bottom: 1px solid #E7DAD0; text-align: right;">${escapeHtml(booking._id)}</td>
                        </tr>
                        <tr>
                            <td style="padding: 9px 0; border-bottom: 1px solid #E7DAD0;"><strong>Guest Name</strong></td>
                            <td style="padding: 9px 0; border-bottom: 1px solid #E7DAD0; text-align: right;">${guestName}</td>
                        </tr>
                        <tr>
                            <td style="padding: 9px 0; border-bottom: 1px solid #E7DAD0;"><strong>Hotel</strong></td>
                            <td style="padding: 9px 0; border-bottom: 1px solid #E7DAD0; text-align: right;">${hotelName}</td>
                        </tr>
                        <tr>
                            <td style="padding: 9px 0; border-bottom: 1px solid #E7DAD0;"><strong>Room</strong></td>
                            <td style="padding: 9px 0; border-bottom: 1px solid #E7DAD0; text-align: right;">${roomName}</td>
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
                            <td style="padding: 12px 0; color: #A96F58;"><strong>Amount Paid</strong></td>
                            <td style="padding: 12px 0; color: #A96F58; text-align: right;"><strong>${totalPrice} ${currency}</strong></td>
                        </tr>
                    </table>

                    <p style="margin: 28px 0 0; font-size: 13px; color: #8C7A70;">This email confirms that your payment was successfully processed through Stripe.</p>

                    <p style="margin: 16px 0 0;">Best regards,<br />Bupatara Chiangmai</p>
                </div>
            </div>
        `,
    })
}

// API to handle Stripe Webhooks
export const stripeWebhooks = async (request, response) => {
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY)
    const signature = request.headers['stripe-signature']

    let event

    try {
        event = stripeInstance.webhooks.constructEvent(
            request.body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        )
    } catch (error) {
        console.error('Stripe webhook signature verification failed:', error.message)
        return response.status(400).send(`Webhook Error: ${error.message}`)
    }

    try {
        if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object

            const sessions = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntent.id,
                limit: 1,
            })

            const session = sessions.data.find((item) => item.metadata?.bookingId)

            if (!session) {
                console.error(`Stripe Checkout session not found for payment intent ${paymentIntent.id}`)
                return response.status(500).json({ received: false, message: 'Checkout session not found' })
            }

            const { bookingId } = session.metadata

            // Update only unpaid bookings so repeated Stripe webhook events do not send duplicate emails.
            const booking = await Booking.findOneAndUpdate(
                { _id: bookingId, isPaid: { $ne: true } },
                { $set: { isPaid: true, paymentMethod: 'Stripe' } },
                { new: true }
            ).populate('user room hotel')

            if (!booking) {
                console.log(`Booking ${bookingId} was already paid or could not be found`)
                return response.json({ received: true })
            }

            try {
                await sendPaymentConfirmationEmail(booking)
                console.log(`Payment confirmation email processed for booking ${bookingId}`)
            } catch (mailError) {
                console.error(`Payment confirmation email failed for booking ${bookingId}:`, mailError.message)
            }
        } else {
            console.log('Unhandled event type:', event.type)
        }

        return response.json({ received: true })
    } catch (error) {
        console.error('Stripe webhook processing error:', error.message)
        return response.status(500).json({ received: false, message: 'Webhook processing failed' })
    }
}
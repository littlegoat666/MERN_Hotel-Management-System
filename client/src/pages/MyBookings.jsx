import React, { useEffect, useState } from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

const MyBookings = () => {

    const { axios, getToken, user, currency } = useAppContext()
    const [ bookings, setBookings ] = useState([])
    const [ cancellingBookingId, setCancellingBookingId ] = useState(null)

    const fetchUserBookings = async () => {
        try {
            const { data } = await axios.get('/api/bookings/user', { headers: { Authorization: `Bearer ${ await getToken()}` } })
            if (data.success) {
                setBookings(data.bookings)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const handlePayment = async (bookingId) => {
        try {
            const token = await getToken()
            if (!token) {
                toast.error('Please sign in again')
                return
            }

            const { data } = await axios.post('/api/bookings/stripe-payment', { bookingId }, { headers: { Authorization: `Bearer ${ token }` } })

            if (data.success && data.url) {
                window.location.href = data.url
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message)
        }
    }

    const handleCancelBooking = async (bookingId) => {
        if (!window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) return

        try {
            setCancellingBookingId(bookingId)

            const token = await getToken()
            if (!token) {
                toast.error('Please sign in again')
                return
            }

            const { data } = await axios.delete(`/api/bookings/${bookingId}`, {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (data.success) {
                toast.success('Booking cancelled successfully')
                await fetchUserBookings()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message)
        } finally {
            setCancellingBookingId(null)
        }
    }

    useEffect(() => {
        if (user) {
            fetchUserBookings()
        }
    }, [ user ])

    return (
        <div className = 'py-28 md:pb-35 md:pt-32 px-4 md:px-16 lg:px-24 xl:px-32 bg-[#FAF7F2] min-h-screen'>
            <Title title = 'My Bookings' subTitle = '' align = 'left' font = 'font-mali text-[#55443B]' />

            <div className = 'max-w-6xl mt-8 w-full text-[#51443D]'>
                <div className = 'hidden md:grid md:grid-cols-[3fr_2fr_1fr] w-full border-b border-[#D8C9BC] font-mali text-base py-3'>
                    <div className = 'w-1/3'> Rooms </div>
                    <div className = 'w-1/3'> Date & Timings </div>
                    <div className = 'w-1/3'> Payment </div>
                </div>

                { bookings.map((booking) => (
                    <div key = { booking._id } className = 'grid grid-cols-1 md:grid-cols-[3fr_2fr_1fr] w-full border-b border-[#E5DAD0] py-6 first:border-t'>

                        {/* ------ Room Details ------ */}
                        <div className = 'flex flex-col md:flex-row items-start'>
                            <img
                                src = { booking.room.images[0] }
                                alt = 'hotel-img'
                                className = 'md:w-52 md:h-44 rounded shadow object-contain bg-[#F5EEE7] flex-shrink-0'
                            />

                            <div className = 'flex flex-col gap-1.5 max-md:mt-3 md:ml-5'>
                                <p className = 'font-mali text-2xl text-[#51443D]'>{ booking.room.roomType }</p>

                                <div className = 'flex items-center gap-1 text-sm text-[#918077]'>
                                    <img src = { assets.locationIcon } alt = 'hotel-img' />
                                    <span>{ booking.hotel.address }</span>
                                </div>

                                <div className = 'flex items-center gap-1 text-sm text-[#918077]'>
                                    <img src = { assets.guestsIcon } alt = 'guests-icon' />
                                    <span> Guests: { booking.guests } (Adults: { booking.adults ?? booking.guests }, Children: { booking.children ?? 0 }) </span>
                                </div>

                                <p className = 'text-base text-[#A65F46]'> Total: { currency } { booking.totalPrice } </p>
                            </div>
                        </div>

                        {/* ------ Date & Timings ------ */}
                        <div className = 'flex flex-row md:items-center md:gap-12 mt-3 gap-8'>
                            <div>
                                <p className = 'text-[#51443D]'> Check In: </p>
                                <p className = 'text-[#918077] text-sm'>
                                    { new Date(booking.checkInDate).toDateString() }
                                </p>
                            </div>

                            <div>
                                <p className = 'text-[#51443D]'> Check Out: </p>
                                <p className = 'text-[#918077] text-sm'>
                                    { new Date(booking.checkOutDate).toDateString() }
                                </p>
                            </div>
                        </div>

                        {/* ------ Payment ------ */}
                        <div className = 'flex flex-col items-start justify-center pt-3'>
                            <div className = {`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${ booking.isPaid ? 'bg-[#E4F3E8] text-[#27834A]' : 'bg-[#FFF0E5] text-[#D66A32]'}`}>
                                <div className = {`h-2.5 w-2.5 rounded-full ${ booking.isPaid ? 'bg-[#35A85D]' : 'bg-[#F08A45]'}`}></div>
                                <p>{ booking.isPaid ? 'Paid' : 'Unpaid' }</p>
                            </div>

                            {!booking.isPaid && (
                                <>
                                    <button onClick = {() => handlePayment(booking._id)} className = 'px-5 py-2 mt-4 text-xs font-medium bg-[#C47755] text-white rounded-full hover:bg-[#A85D40] shadow-sm hover:shadow-md transition-all cursor-pointer'>
                                        Pay Now
                                    </button>

                                    <button onClick = {() => handleCancelBooking(booking._id)} disabled = {cancellingBookingId === booking._id} className = 'px-5 py-2 mt-2 text-xs font-medium bg-[#FFF0EF] border border-[#F2C5C1] text-[#D65C55] rounded-full hover:bg-[#FCE0DD] hover:border-[#E9A7A1] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'>
                                        { cancellingBookingId === booking._id ? 'Cancelling...' : 'Cancel Booking' }
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default MyBookings
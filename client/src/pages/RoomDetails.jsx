import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { assets, facilityIcons, roomCommonData } from '../assets/assets'
import StarRating from '../components/StarRating'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

const RoomDetails = () => {
    const { id } = useParams()
    const { rooms, getToken, axios, navigate, currency } = useAppContext()
    const [ room, setRoom ] = useState(null)
    const [ mainImage, setMainImage ] = useState(null)
    const [ checkInDate, setCheckInDate ] = useState(null)
    const [ checkOutDate, setCheckOutDate ] = useState(null)
    const [ adults, setAdults ] = useState(0)
    const [ children, setChildren ] = useState(0)

    const [ isAvailable, setIsAvailable ] = useState(false)
    const [ showBookingConfirmation, setShowBookingConfirmation ] = useState(false)

    const formatBookingDate = (date) => {
        return new Date(`${ date }T00:00:00`).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
    }

    const numberOfNights = checkInDate && checkOutDate
        ? Math.round((new Date(`${ checkOutDate }T00:00:00`) - new Date(`${ checkInDate }T00:00:00`)) / (1000 * 60 * 60 * 24))
        : 0

    // Check if the Room is Available
    const checkAvailability = async () => {
        try {
            if (!checkInDate || !checkOutDate || checkInDate >= checkOutDate) {
                toast.error('Check-In Date should be less than Check-Out Date')
                return
            }

            const token = await getToken()

            const { data } = await axios.post('/api/bookings/check-availability', { room: id, checkInDate, checkOutDate }, { headers: { Authorization: `Bearer ${ token }` }})

            if (data.success) {
                if (data.isAvailable) {
                    setIsAvailable(true)
                    setShowBookingConfirmation(true)
                    toast.success('Room is Available')
                } else {
                    setIsAvailable(false)
                    setShowBookingConfirmation(false)
                    toast.error('Room is Not Available')
                }
            } else {
                setIsAvailable(false)
                setShowBookingConfirmation(false)
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // Open Booking Confirmation
    const onSubmitHandler = async (e) => {
        e.preventDefault()

        if (!isAvailable) {
            return checkAvailability()
        }

        setShowBookingConfirmation(true)
    }

    // Book the Room
    const bookRoom = async () => {
        try {
            const { data } = await axios.post('/api/bookings/book', {
                room: id,
                checkInDate,
                checkOutDate,
                adults: Number(adults),
                children: Number(children),
                guests: Number(adults) + Number(children),
                paymentMethod: 'Pay At Hotel'
            }, { headers: { Authorization: `Bearer ${ await getToken() }` }})

            if (data.success) {
                setShowBookingConfirmation(false)
                toast.success(data.message)
                navigate('/my-bookings')
                scrollTo(0, 0)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(() => {
        const room = rooms.find(room => room._id === id)
        room && setRoom(room)
        room && setMainImage(room.images[0])
    }, [ rooms ])

    return room && (
        <div className = 'py-28 md:py-35 px-4 md:px-16 lg:px-24 xl:px-32'>

            {/* Room Details */}
            <div className = 'flex flex-col md:flex-row items-start md:items-center gap-2'>
                <h1 className = 'text-3xl md:text-4xl font-mali text-[#55443B]'>{ room.roomType }</h1>
                <p className = 'text-xs font-mali py-1.5 px-3 text-white bg-[#A96F58] rounded-full'> 20% OFF </p>
            </div>

            {/* Room Rating */}
            <div className = 'flex items-center gap-1 mt-2 text-[#8C7A70]'>
                <StarRating />
                <p className = 'ml-2'> 200+ Reviews </p>
            </div>

            {/* Room Address */}
            <div className = 'flex items-center gap-1 text-[#8C7A70] mt-2'>
                <img src = { assets.locationIcon } alt = 'location-icon' />
                <span>{ room.hotel.address }</span>
            </div>

            {/* Room Images */}
            <div className = 'flex flex-col lg:flex-row mt-6 gap-6'>
                <div className = 'lg:w-1/2 w-full'>
                    <img src = { mainImage } alt = 'Room Image' className = 'w-full aspect-[4/3] rounded-xl shadow-lg object-contain bg-[#F5EEE7]' />
                </div>

                <div className = 'grid grid-cols-2 gap-4 lg:w-1/2 w-full'>
                    { room?.images.length > 1 && room.images.map((image, index) => (
                        <img onClick = {() => setMainImage(image)} key = { index } src = { image } alt = 'Room Image' className = {`w-full aspect-[4/3] rounded-xl shadow-md object-contain bg-[#F5EEE7] cursor-pointer ${mainImage === image && 'outline-3 outline-[#A96F58]'}`} />
                    ))}
                </div>
            </div>

            {/* Room Highlights */}
            <div className = 'flex flex-col md:flex-row md:justify-between mt-10'>
                <div className = 'flex flex-col'>
                    <h1 className = 'text-3xl md:text-4xl font-mali text-[#55443B]'> Experience Luxury Like Never Before </h1>
                    <div className = 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 mt-3 mb-6 gap-3'>
                        { room.amenities.map((item, index) => (
                            <div key = { index } className = 'flex items-center gap-2 px-3 py-2 rounded-lg bg-[#F5EEE7] min-w-0 text-[#55443B]'>
                                <img src = {facilityIcons[ item ]} alt = { item } className = 'w-5 h-5' />
                                <p className = 'text-xs'>{ item }</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Room Price */}
                <p className = 'text-2xl font-mali text-[#A96F58]'>{ currency } { room.pricePerNight } / Night</p>
            </div>

            {/* CheckIn CheckOut Form */}
            <form onSubmit = { onSubmitHandler } className = 'flex flex-col md:flex-row items-start md:items-center justify-between bg-[#FAF7F2] shadow-[0px_0px_20px_rgba(85,68,59,0.12)] p-6 rounded-xl mx-auto mt-16 max-w-6xl border border-[#E7DAD0]'>

                <div className = 'flex flex-col flex-wrap md:flex-row items-start md:items-center gap-4 md:gap-10 text-[#8C7A70]'>
                    <div className = 'flex flex-col'>
                        <label htmlFor = 'checkInDate' className = 'font-mali text-[#55443B]'> Check-In </label>
                        <input onChange = { (e) => { setCheckInDate(e.target.value); setIsAvailable(false) }} min = { new Date().toISOString().split('T')[0] } type = 'date' id = 'checkInDate' placeholder = 'Check-In' className = 'w-full rounded border border-[#E7DAD0] px-3 py-2 mt-1.5 outline-none text-[#55443B] bg-white focus:border-[#A96F58]' required/>
                    </div>

                    <div className = 'w-px h-15 bg-[#E7DAD0] max-md:hidden'></div>

                    <div className = 'flex flex-col'>
                        <label htmlFor = 'checkOutDate' className = 'font-mali text-[#55443B]'> Check-Out </label>
                        <input onChange = { (e) => { setCheckOutDate(e.target.value); setIsAvailable(false) }} min = { checkInDate } disabled = { !checkInDate } type = 'date' id = 'checkOutDate' placeholder = 'Check-Out' className = 'w-full rounded border border-[#E7DAD0] px-3 py-2 mt-1.5 outline-none text-[#55443B] bg-white focus:border-[#A96F58]' required/>
                    </div>

                    <div className = 'w-px h-15 bg-[#E7DAD0] max-md:hidden'></div>

                    <div className = 'flex flex-col'>
                        <label htmlFor = 'adults' className = 'font-mali text-[#55443B]'> Adults </label>
                        <input onChange = { (e) => { setAdults(e.target.value === '' ? '' : Number(e.target.value)); setIsAvailable(false) }} value = { adults } min = {1} max = {4} type = 'number' id = 'adults' placeholder = '0' className = 'max-w-20 rounded border border-[#E7DAD0] px-3 py-2 mt-1.5 outline-none text-[#55443B] bg-white focus:border-[#A96F58]' required/>
                    </div>

                    <div className = 'w-px h-15 bg-[#E7DAD0] max-md:hidden'></div>

                    <div className = 'flex flex-col'>
                        <label htmlFor = 'children' className = 'font-mali text-[#55443B]'> Children </label>
                        <input onChange = { (e) => { setChildren(e.target.value === '' ? '' : Number(e.target.value)); setIsAvailable(false) }} value = { children } min = {0} max = {3} type = 'number' id = 'children' placeholder = '0' className = 'max-w-20 rounded border border-[#E7DAD0] px-3 py-2 mt-1.5 outline-none text-[#55443B] bg-white focus:border-[#A96F58]' required/>
                    </div>
                </div>

                <button type = 'submit' className = 'bg-[#A96F58] hover:bg-[#8F5946] active:scale-95 transition-all text-white rounded-md max-md:w-full max-md:mt-6 md:px-25 py-3 md:py-4 text-base cursor-pointer'>
                    { isAvailable ? 'Book Now' : 'Check Availability' }
                </button>
            </form>

            {/* Booking Confirmation Popup */}
            { showBookingConfirmation && (
                <div onClick = { (e) => e.target === e.currentTarget && setShowBookingConfirmation(false) } className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6'>
                    <div role = 'dialog' aria-modal = 'true' aria-labelledby = 'booking-confirmation-title' className = 'w-full max-w-5xl rounded-2xl border border-[#E7DAD0] bg-[#FFFDFA] shadow-2xl overflow-hidden'>

                        {/* Header */}
                        <div className = 'px-6 pt-6 md:px-9 md:pt-8'>
                            <h2 id = 'booking-confirmation-title' className = 'text-2xl md:text-3xl font-mali text-[#55443B]'>
                                Confirm Your Booking
                            </h2>
                            <p className = 'mt-2 text-sm text-[#8C7A70]'>
                                Please check your booking details before continuing.
                            </p>
                        </div>

                        {/* Room Image and Booking Details */}
                        <div className = 'flex flex-col md:flex-row gap-8 px-6 py-7 md:px-9 md:py-8'>

                            {/* Room Image */}
                            <div className = 'w-full md:w-[48%] flex items-center justify-center rounded-xl bg-[#F5EEE7] p-3'>
                                <img
                                    src = { mainImage }
                                    alt = { room.roomType }
                                    className = 'w-full h-[260px] md:h-[300px] object-contain rounded-lg'
                                />
                            </div>

                            {/* Booking Details */}
                            <div className = 'w-full md:w-[52%] flex flex-col justify-between'>

                                <div>
                                    <h3 className = 'text-xl md:text-2xl font-mali font-semibold text-[#55443B]'>
                                        { room.roomType }
                                    </h3>

                                    <div className = 'grid grid-cols-2 gap-x-6 gap-y-5 mt-6'>

                                        <div>
                                            <p className = 'text-xs text-[#8C7A70] mb-1'>Check-in</p>
                                            <p className = 'text-sm md:text-base font-medium text-[#55443B]'>
                                                { formatBookingDate(checkInDate) }
                                            </p>
                                        </div>

                                        <div>
                                            <p className = 'text-xs text-[#8C7A70] mb-1'>Check-out</p>
                                            <p className = 'text-sm md:text-base font-medium text-[#55443B]'>
                                                { formatBookingDate(checkOutDate) }
                                            </p>
                                        </div>

                                        <div>
                                            <p className = 'text-xs text-[#8C7A70] mb-1'>Duration</p>
                                            <p className = 'text-sm md:text-base font-medium text-[#55443B]'>
                                                { numberOfNights } { numberOfNights === 1 ? 'night' : 'nights' }
                                            </p>
                                        </div>

                                        <div>
                                            <p className = 'text-xs text-[#8C7A70] mb-1'>Guests</p>
                                            <p className = 'text-sm md:text-base font-medium text-[#55443B]'>
                                                { adults } Adults, { children } Children
                                            </p>
                                        </div>

                                    </div>
                                </div>

                                {/* Price */}
                                <div className = 'border-t border-[#E7DAD0] mt-6 pt-5'>
                                    <div className = 'flex justify-between items-center'>
                                        <p className = 'text-sm text-[#8C7A70]'>
                                            Price / Night
                                        </p>
                                        <p className = 'text-sm font-medium text-[#55443B]'>
                                            { currency } { Number(room.pricePerNight).toLocaleString() }
                                        </p>
                                    </div>

                                    <div className = 'flex justify-between items-center mt-3'>
                                        <p className = 'text-base font-semibold text-[#55443B]'>
                                            Total
                                        </p>
                                        <p className = 'text-2xl font-mali font-semibold text-[#A96F58]'>
                                            { currency } { (Number(room.pricePerNight) * numberOfNights).toLocaleString() }
                                        </p>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Confirmation Buttons */}
                        <div className = 'flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-[#E7DAD0] bg-[#FAF7F2] px-6 py-5 md:px-9'>
                            <button
                                type = 'button'
                                onClick = { () => setShowBookingConfirmation(false) }
                                className = 'rounded-lg border border-[#D9C9BD] bg-white px-7 py-3 font-mali text-[#55443B] transition-all hover:bg-[#F5EEE7]'
                            >
                                Back to Edit
                            </button>

                            <button
                                type = 'button'
                                onClick = { bookRoom }
                                className = 'rounded-lg bg-[#A96F58] px-7 py-3 font-mali text-white transition-all hover:bg-[#8F5946] active:scale-95'
                            >
                                Book Now
                            </button>
                        </div>

                    </div>
                </div>
            )}

            {/* Common Specification */}
            <div className = 'mt-25 space-y-4'>
                { roomCommonData.map((spec, index) => (
                    <div key = { index } className = 'flex items-start gap-2'>
                        <img src = {spec.icon} alt = {`${ spec.title }-icon`} className = 'w-6.5' />
                        <div>
                            <p className = 'text-base text-[#55443B]'>{ spec.title }</p>
                            <p className = 'text-[#8C7A70]'>{ spec.description }</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className = 'max-w-3xl border-y border-[#E7DAD0] my-15 py-10 text-[#8C7A70]'>
                <p> Bupatara Chiangmai is in Chiang Mai's historic Old City, a convenient area for exploring local temples, markets, and walking streets. Room facilities can vary, so review the details for your selected room before booking. </p>
            </div>

            {/* Hosted By */}
            <div className = 'flex flex-col items-start gap-4'>
                <div className = 'flex gap-4'>
                    <img src = { room.hotel.owner.image } alt = 'Host' className = 'h-14 w-14 md:h-18 md:w-18 rounded-full' />
                    <div>
                        <p className = 'text-lg md:text-xl text-[#55443B]'> Hosted By { room.hotel.owner?.username || 'Hotel Owner' }</p>
                        <div className = 'flex items-center mt-1 text-[#8C7A70]'>
                            <StarRating />
                            <p className = 'ml-2'> 200+ Reviews </p>
                        </div>
                    </div>
                </div>
            </div>

            <button className = 'px-6 py-2.5 mt-4 rounded text-white bg-[#A96F58] hover:bg-[#8F5946] transition-all cursor-pointer'> Contact Now </button>

        </div>
    )
}

export default RoomDetails
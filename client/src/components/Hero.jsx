import React, { useState } from 'react'
import { assets } from '../assets/assets'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

const Hero = () => {
    const { navigate, rooms } = useAppContext()
    const [ checkInDate, setCheckInDate ] = useState('')
    const [ checkOutDate, setCheckOutDate ] = useState('')
    const [ adults, setAdults ] = useState(1)
    const [ children, setChildren ] = useState(0)

    // The Hero search is fixed to the hotel attached to the available rooms.
    const hotel = rooms.find((room) => room.hotel?._id)?.hotel
    const hotelId = hotel?._id
    const destination = hotel ? (hotel.name ? `${ hotel.name } — ${ hotel.city }` : hotel.city) : ''
    const today = new Date()
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset())
    const minDate = today.toISOString().split('T')[0]

    const onSearch = (e) => {
        e.preventDefault()

        if (!hotelId) {
            toast.error('Hotel information is not available yet')
            return
        }

        if (!checkInDate || !checkOutDate || checkInDate >= checkOutDate) {
            toast.error('Check-Out Date must be after Check-In Date')
            return
        }

        const searchParams = new URLSearchParams({
            hotelId,
            checkInDate,
            checkOutDate,
            adults: String(adults),
            children: String(children),
        })

        navigate(`/rooms?${ searchParams.toString() }`)
    }

    const handleCheckInChange = (e) => {
        const newCheckInDate = e.target.value
        setCheckInDate(newCheckInDate)

        // If Check-In moves past the selected Check-Out, reset Check-Out.
        if (checkOutDate && checkOutDate <= newCheckInDate) {
            setCheckOutDate('')
        }
    }

    return (
        <div className = 'font-mali flex flex-col items-start justify-center px-6 md:px-16 lg:px-24 xl:px-32 text-black bg-[url("/src/assets/backgroundImage.png")] bg-no-repeat bg-cover bg-center h-screen'>
            <p className = 'bg-[#49B9FF]/50 px-3.5 py-1 rounded-full mt-20'> The Ultimate Hotel Experience </p>
            <h1 className = 'font-mali text-2xl md:text-5xl md:text-[56px] md:leading-14px font-mali md:font-mali max-w-xl mt-4'> Discover Your Perfect Hotel Rooms </h1>
            <p className = 'font-mali max-w-130 mt-2 text-sm md:text-base'> Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s </p>

            <form onSubmit = { onSearch } className = 'bg-white text-black-500 rounded-lg px-6 py-4 mt-8 flex flex-col md:flex-row max-md:items-start gap-4 max-md:mx-auto'>
                <div>
                    <div className = 'flex items-center gap-2'>
                        <img src = { assets.locationIcon } alt = '' className = 'h-4' />
                        <label htmlFor = 'destinationInput'> Destination </label>
                    </div>
                    <input
                        id = 'destinationInput'
                        type = 'text'
                        value = { destination || 'Loading hotel...' }
                        readOnly
                        className = 'rounded border border-gray-200 bg-gray-50 px-3 py-1.5 mt-1.5 text-sm outline-none cursor-not-allowed'
                        aria-label = 'Fixed hotel destination'
                    />
                </div>

                <div>
                    <div className = 'flex items-center gap-2'>
                        <img src = { assets.calenderIcon } alt = '' className = 'h-4' />
                        <label htmlFor = 'checkIn'> Check In </label>
                    </div>
                    <input
                        onChange = { handleCheckInChange }
                        value = { checkInDate }
                        min = { today }
                        id = 'checkIn'
                        type = 'date'
                        className = 'rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none'
                        required
                    />
                </div>

                <div>
                    <div className = 'flex items-center gap-2'>
                        <img src = { assets.calenderIcon } alt = '' className = 'h-4' />
                        <label htmlFor = 'checkOut'> Check Out </label>
                    </div>
                    <input
                        onChange = { (e) => setCheckOutDate(e.target.value) }
                        value = { checkOutDate }
                        min = { checkInDate || today }
                        disabled = { !checkInDate }
                        id = 'checkOut'
                        type = 'date'
                        className = 'rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none disabled:bg-gray-100'
                        required
                    />
                </div>

                <div className = 'flex md:flex-col max-md:gap-2 max-md:items-center'>
                    <label htmlFor = 'adultsInput'> Adults </label>
                    <input
                        onChange = { (e) => setAdults(e.target.value === '' ? '' : Number(e.target.value)) }
                        value = { adults }
                        min = { 1 }
                        max = { 4 }
                        id = 'adultsInput'
                        type = 'number'
                        className = 'rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none max-w-16'
                        required
                    />
                </div>

                <div className = 'flex md:flex-col max-md:gap-2 max-md:items-center'>
                    <label htmlFor = 'childrenInput'> Children </label>
                    <input
                        onChange = { (e) => setChildren(e.target.value === '' ? '' : Number(e.target.value)) }
                        value = { children }
                        min = { 0 }
                        max = { 3 }
                        id = 'childrenInput'
                        type = 'number'
                        className = 'rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none max-w-16'
                    />
                </div>

                <button type = 'submit' disabled = { !hotelId } className = 'flex items-center justify-center gap-1 rounded-md bg-black py-3 px-4 text-white my-auto cursor-pointer max-md:w-full max-md:py-1 disabled:opacity-50 disabled:cursor-not-allowed'>
                    <img src = { assets.searchIcon } alt = '' className = 'h-7' />
                    <span> Search </span>
                </button>
            </form>
        </div>
    )
}

export default Hero

import React, { useState } from 'react'
import { Building2 } from 'lucide-react'
import { assets } from '../assets/assets'
import { useAppContext } from '../context/AppContext'
import LocalizedDatePicker from './LocalizedDatePicker'

const Hero = () => {
    const { navigate, getToken, axios, setSearchedCities, language } = useAppContext()

    const destination = 'Bupatara'

    const [ checkInDate, setCheckInDate ] = useState('')
    const [ checkOutDate, setCheckOutDate ] = useState('')

    const getTodayDate = () => {
        const today = new Date()

        return `${ today.getFullYear() }-${ String(today.getMonth() + 1).padStart(2, '0') }-${ String(today.getDate()).padStart(2, '0') }`
    }

    const getNextDate = (date) => {
        const nextDate = new Date(date + 'T00:00:00')

        nextDate.setDate(nextDate.getDate() + 1)

        return `${ nextDate.getFullYear() }-${ String(nextDate.getMonth() + 1).padStart(2, '0') }-${ String(nextDate.getDate()).padStart(2, '0') }`
    }

    const onSearch = async (e) => {
        e.preventDefault()

        if ( !checkInDate || !checkOutDate || checkOutDate <= checkInDate ) {
            return
        }

        navigate(`/rooms?destination=${ destination }`)

        // Call Api to save recent searched city
        await axios.post(
            '/api/user/store-recent-search',
            { recentSearchedCity: destination },
            { headers: { Authorization: `Bearer ${ await getToken() }` } }
        )

        // Add Destination to searchedCities max 3 recent searched cities
        setSearchedCities((prevSearchedCities) => {
            const updatedSearchedCities = [ ...prevSearchedCities, destination ]

            if ( updatedSearchedCities.length > 3 ) {
                updatedSearchedCities.shift()
            }

            return updatedSearchedCities
        })
    }

    return (
        <div className = 'font-mali flex flex-col items-start justify-center px-6 md:px-16 lg:px-24 xl:px-32 text-black bg-[url("/src/assets/backgroundImage.png")] bg-no-repeat bg-cover bg-center h-screen'>

            <div className = 'mt-20 inline-flex items-center gap-2 rounded-full border border-[#D8B9A5] bg-[#EAD8CA] px-4 py-2 text-xs font-semibold tracking-[0.18em] text-[#A65F46] shadow-sm'>
                <Building2 size = { 15 } />
                A WARM WELCOME IN THE OLD CITY
            </div>

            <h1 className = 'font-mali text-[#black] text-2xl md:text-5xl md:text-[56px] md:leading-14px font-mali md:font-mali max-w-xl mt-4'>
                Discover Your Perfect Hotel Rooms
            </h1>

            <p className = 'font-mali text-[#black] max-w-130 mt-2 text-sm md:text-base'>
                Discover Bupatara Chiangmai, a practical base in Chiang Mai's historic Old City. Explore nearby temples, local markets, and walking streets, then choose a room that fits your trip.
            </p>

            <form
                onSubmit = { onSearch }
                className = 'bg-white text-black-500 rounded-lg px-6 py-4 mt-8 flex flex-col md:flex-row max-md:items-start gap-4 max-md:mx-auto'
            >

                {/* Destination */}
                <div>
                    <div className = 'flex items-center gap-2'>
                        <img src = { assets.calenderIcon } alt = '' className = 'h-4' />
                        <label htmlFor = 'destinationInput'> Destination </label>
                    </div>

                    <input
                        value = { destination }
                        readOnly
                        id = 'destinationInput'
                        type = 'text'
                        className = 'rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none bg-gray-50 cursor-not-allowed'
                    />
                </div>

                {/* Check In */}
                <div className = 'min-w-[190px]'>
                    <div className = 'flex items-center gap-2'>
                        <img src = { assets.calenderIcon } alt = '' className = 'h-4' />
                        <label htmlFor = 'heroCheckIn'> Check In </label>
                    </div>

                    <div className = 'mt-1.5'>
                        <LocalizedDatePicker
                            id = 'heroCheckIn'
                            value = { checkInDate }
                            onChange = { (date) => {
                                setCheckInDate(date)

                                if ( checkOutDate && checkOutDate <= date ) {
                                    setCheckOutDate('')
                                }
                            }}
                            minDate = { getTodayDate() }
                            language = { language }
                        />
                    </div>
                </div>

                {/* Check Out */}
                <div className = 'min-w-[190px]'>
                    <div className = 'flex items-center gap-2'>
                        <img src = { assets.calenderIcon } alt = '' className = 'h-4' />
                        <label htmlFor = 'heroCheckOut'> Check Out </label>
                    </div>

                    <div className = 'mt-1.5'>
                        <LocalizedDatePicker
                            id = 'heroCheckOut'
                            value = { checkOutDate }
                            onChange = { setCheckOutDate }
                            minDate = { checkInDate ? getNextDate(checkInDate) : getTodayDate() }
                            disabled = { !checkInDate }
                            language = { language }
                        />
                    </div>
                </div>

                {/* Adults */}
                <div className = 'flex md:flex-col max-md:gap-2 max-md:items-center'>
                    <label htmlFor = 'adults'> Adults </label>

                    <input
                        min = { 1 }
                        max = { 4 }
                        id = 'adults'
                        type = 'number'
                        className = 'rounded border border-black-200 px-3 py-1.5 mt-1.5 text-sm outline-none max-w-16'
                        placeholder = '0'
                    />
                </div>

                {/* Children */}
                <div className = 'flex md:flex-col max-md:gap-2 max-md:items-center'>
                    <label htmlFor = 'children'> Children </label>

                    <input
                        min = { 0 }
                        max = { 3 }
                        id = 'children'
                        type = 'number'
                        className = 'rounded border border-black-200 px-3 py-1.5 mt-1.5 text-sm outline-none max-w-16'
                        placeholder = '0'
                    />
                </div>

                <button
                    type = 'submit'
                    className = 'flex items-center justify-center gap-1 rounded-md bg-black py-3 px-4 text-white my-auto cursor-pointer max-md:w-full max-md:py-1'
                >
                    <img src = { assets.searchIcon } alt = 'searchIcon' className = 'h-7' />
                    <span> Search </span>
                </button>

            </form>
        </div>
    )
}

export default Hero
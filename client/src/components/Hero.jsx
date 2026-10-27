import React, { useState } from 'react'
import { assets } from '../assets/assets'
import { useAppContext } from '../context/AppContext'

const Hero = () => {
    const { navigate, getToken, axios, setSearchedCities } = useAppContext()
    const destination = 'Bupatara'
    const [ checkInDate, setCheckInDate ] = useState('')
    const [ checkOutDate, setCheckOutDate ] = useState('')

    const getNextDate = (date) => {
        const nextDate = new Date(date + 'T00:00:00')
        nextDate.setDate(nextDate.getDate() + 1)
        return `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(nextDate.getDate()).padStart(2, '0')}`
    }

    const onSearch = async (e) => {
        e.preventDefault()

        if (!checkInDate || !checkOutDate || checkOutDate <= checkInDate) {
            return
        }

        navigate(`/rooms?destination=${destination}`)

            // Call Api to save recent searched city
        await axios.post('/api/user/store-recent-search', { recentSearchedCity: destination }, { headers: { Authorization: `Bearer ${ await getToken() }` }})

            // Add Destination to searchedCities max 3 recent searched cities
        setSearchedCities((prevSearchedCities) => {
            const updatedSearchedCities = [ ...prevSearchedCities, destination ]
            if (updatedSearchedCities.length > 3) {
                updatedSearchedCities.shift()
            }
            return updatedSearchedCities
        })
    }

    return (
        <div className = 'font-mali flex flex-col items-start justify-center px-6 md:px-16 lg:px-24 xl:px-32 text-black bg-[url("/src/assets/backgroundImage.png")] bg-no-repeat bg-cover bg-center h-screen'>
            <p className = 'bg-[#49B9FF]/50 px-3.5 py-1 rounded-full mt-20'> The Ultimate Hotel Experience </p>
            <h1 className = 'font-mali text-2xl md:text-5xl md:text-[56px] md:leading-14px font-mali md:font-mali max-w-xl mt-4'> Discover Your Perfect Hotel Rooms </h1>
            <p className = 'font-mali max-w-130 mt-2 text-sm md:text-base'> Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s </p>

            <form onSubmit = { onSearch } className = 'bg-white text-black-500 rounded-lg px-6 py-4 mt-8 flex flex-col md:flex-row max-md:items-start gap-4 max-md:mx-auto'>

                <div>
                    <div className = 'flex items-center gap-2'>
                        <img src = { assets.calenderIcon } alt = '' className = 'h-4' />
                        <label htmlFor = 'destinationInput'> Destination </label>
                    </div>
                    <input value = { destination } readOnly id = 'destinationInput' type = 'text' className = 'rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none bg-gray-50 cursor-not-allowed' />
                </div>

                <div>
                    <div className = 'flex items-center gap-2'>
                        <img src = { assets.calenderIcon } alt = '' className = 'h-4' />
                        <label htmlFor = 'checkIn'> Check In </label>
                    </div>
                    <input value = { checkInDate } onChange = { (e) => { const date = e.target.value; setCheckInDate(date); if (checkOutDate && checkOutDate <= date) setCheckOutDate('') }} min = { new Date().toLocaleDateString('en-CA') } id = 'checkIn' type = 'date' className = 'rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none' required />
                </div>

                <div>
                    <div className = 'flex items-center gap-2'>
                        <img src = { assets.calenderIcon } alt = '' className = 'h-4' />
                        <label htmlFor = 'checkOut'> Check Out </label>
                    </div>
                    <input value = { checkOutDate } onChange = { (e) => setCheckOutDate(e.target.value) } min = { checkInDate ? getNextDate(checkInDate) : '' } disabled = { !checkInDate } id = 'checkOut' type = 'date' className = 'rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none disabled:bg-gray-100 disabled:cursor-not-allowed' required />
                </div>

                <div className = 'flex md:flex-col max-md:gap-2 max-md:items-center'>
                    <label htmlFor = 'adults'> Adults </label>
                    <input min = {1} max = {4} id = 'adults' type = 'number' className = 'rounded border border-black-200 px-3 py-1.5 mt-1.5 text-sm outline-none max-w-16' placeholder = '0' />
                </div>

                <div className = 'flex md:flex-col max-md:gap-2 max-md:items-center'>
                    <label htmlFor = 'children'> Children </label>
                    <input min = {0} max = {3} id = 'children' type = 'number' className = 'rounded border border-black-200 px-3 py-1.5 mt-1.5 text-sm outline-none max-w-16' placeholder = '0' />
                </div>

                <button type = 'submit' className = 'flex items-center justify-center gap-1 rounded-md bg-black py-3 px-4 text-white my-auto cursor-pointer max-md:w-full max-md:py-1'>
                    <img src = { assets.searchIcon } alt = 'searchIcon' className = 'h-7' />
                    <span> Search </span>
                </button>
            </form>
        </div>
    )
}

export default Hero
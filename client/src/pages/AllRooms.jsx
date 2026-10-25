import React, { useEffect, useState } from 'react'
import { assets, facilityIcons } from '../assets/assets'
import { useSearchParams } from 'react-router-dom'
import StarRating from '../components/StarRating'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

const CheckBox = ({ label, selected = false, onChange = () => {}}) => {
    return (
        <label className = 'flex gap-3 items-center cursor-pointer mt-2 text-sm'>
            <input type = 'checkbox' checked = { selected } onChange = {(e) => onChange(e.target.checked, label)} />
            <span className = 'font-mali select-none'>{ label }</span>
        </label>
    )
}

const RadioButton = ({ label, selected = false, onChange = () => {}}) => {
    return (
        <label className = 'flex gap-3 items-center cursor-pointer mt-2 text-sm'>
            <input type = 'radio' name = 'sortOption' checked = { selected } onChange = {() => onChange(label)} />
            <span className = 'font-mali select-none'>{ label }</span>
        </label>
    )
}

const AllRooms = () => {

    const [ searchParams, setSearchParams ] = useSearchParams()
    const { rooms, navigate, currency, axios, getToken } = useAppContext();

    const hotelId = searchParams.get('hotelId') || ''
    const checkInDate = searchParams.get('checkInDate') || ''
    const checkOutDate = searchParams.get('checkOutDate') || ''
    const adults = Number(searchParams.get('adults') || 1)
    const children = Number(searchParams.get('children') || 0)
    const hasSearchDates = Boolean(hotelId && checkInDate && checkOutDate && checkInDate < checkOutDate)

    const [ availableRoomIds, setAvailableRoomIds ] = useState(null)
    const [ checkingAvailability, setCheckingAvailability ] = useState(false)
    const [ bookingRoomId, setBookingRoomId ] = useState('')
    const [ openFilters, setOpenFilters ] = useState(false)
    const [ selectedFilters, setSelectedFilters ] = useState({
        roomType: [],
        priceRange: [],
    });
    const [ selectedSort, setSelectedSort ] = useState('')

    useEffect(() => {
        if (!hasSearchDates) {
            setAvailableRoomIds(null)
            setCheckingAvailability(false)
            return
        }

        if (!rooms.length) return

        let cancelled = false
        const roomIds = rooms
            .filter((room) => String(room.hotel?._id) === String(hotelId) && room.isAvailable !== false)
            .map((room) => room._id)

        setAvailableRoomIds(null)
        setCheckingAvailability(true)

        axios.post('/api/bookings/check-availability', { rooms: roomIds, checkInDate, checkOutDate })
            .then(({ data }) => {
                if (cancelled) return
                if (data.success) {
                    setAvailableRoomIds(data.availableRoomIds || [])
                } else {
                    setAvailableRoomIds([])
                    toast.error(data.message || 'Could not check room availability')
                }
            })
            .catch((error) => {
                if (cancelled) return
                setAvailableRoomIds([])
                toast.error(error.response?.data?.message || 'Could not check room availability')
            })
            .finally(() => {
                if (!cancelled) setCheckingAvailability(false)
            })

        return () => {
            cancelled = true
        }
    }, [ rooms, hotelId, checkInDate, checkOutDate, hasSearchDates, axios ])

    const goToRoomDetails = (room) => {
        const detailsParams = new URLSearchParams()
        if (checkInDate) detailsParams.set('checkInDate', checkInDate)
        if (checkOutDate) detailsParams.set('checkOutDate', checkOutDate)
        if (adults) detailsParams.set('adults', String(adults))
        if (Number.isFinite(children)) detailsParams.set('children', String(children))

        const query = detailsParams.toString()
        navigate(`/rooms/${ room._id }${ query ? `?${ query }` : '' }`)
        scrollTo(0, 0)
    }

    const handleSelectRoom = async (room) => {
        if (!hasSearchDates) {
            toast.error('Please choose check-in and check-out dates on the Home page first')
            return
        }

        setBookingRoomId(room._id)
        try {
            const token = await getToken()
            const { data } = await axios.post('/api/bookings/book', {
                room: room._id,
                checkInDate,
                checkOutDate,
                adults,
                children,
                guests: adults + children,
                paymentMethod: 'Pay At Hotel',
            }, { headers: { Authorization: `Bearer ${ token }` } })

            if (data.success) {
                toast.success(data.message)
                navigate('/my-bookings')
                scrollTo(0, 0)
            } else {
                toast.error(data.message || 'Failed to book room')
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || 'Failed to book room')
        } finally {
            setBookingRoomId('')
        }
    }

    const roomTypes = [
        'Standard Room',
        'Standard Double',
        'Superior Room',
        'Superior Double',
        'Deluxe Room',
        'Deluxe Double',
        'Junior Suite',
        'Family Suite'
    ];

    const priceRanges = [
        '0 to 250',
        '251 to 500',
        '501 to 750',
        '751 to 1000',
    ];

    const sortOptions = [
        'Price Low to High',
        'Price High to Low',
        'Newest First',
    ];

        // Handle Change for Filters and Sorting
    const handleFilterChange = (checked, value, type) => {
        setSelectedFilters((prevFilters) => {
            const updatedFilters = { ...prevFilters };

            if(checked) {
                updatedFilters[type].push(value);
            } else {
                updatedFilters[type] = updatedFilters[type].filter(item => item !== value);
            }
            return updatedFilters;
        })
    }

    const handlerSortChange = (sortOption) => {
        setSelectedSort(sortOption);
    }

        // Function to check if a room matches the selected room type
    const matchesRoomType = (room) => {
        return selectedFilters.roomType.length === 0 || selectedFilters.roomType.includes(room.roomType);
    }

        // Function to check if a room matches the selected price ranges
    const matchesPriceRange = (room) => {
        return selectedFilters.priceRange.length === 0 || selectedFilters.priceRange.some(range => {
            const [ min, max ] = range.split(' to ').map(Number);
            return room.pricePerNight >= min && room.pricePerNight <= max;
        })
    }

        // Function to sort rooms based on the selected sort option
    const sortRooms = (a, b) => {
        if (selectedSort === 'Price Low to High') {
            return a.pricePerNight - b.pricePerNight;
        }
        if (selectedSort === 'Price High to Low') {
            return b.pricePerNight - a.pricePerNight;
        }
        if (selectedSort === 'Newest First') {
            return new Date(b.createdAt) - new Date(a.createdAt)
        }
        return 0;
    }

        // Limit search results to the one hotel selected by the Hero form.
    const filterHotel = (room) => {
        if (!hotelId) return true
        return String(room.hotel?._id) === String(hotelId)
    }

        // Apply room filters and, when dates are supplied, show only rooms available for the full stay.
    const filteredRooms = rooms.filter((room) => {
        const matchesAvailability = !hasSearchDates || (Array.isArray(availableRoomIds) && availableRoomIds.includes(room._id))
        return filterHotel(room) && matchesRoomType(room) && matchesPriceRange(room) && matchesAvailability
    }).sort(sortRooms)

        // Clear All filters
    const clearFilters = () => {
        setSelectedFilters({
            roomType: [],
            priceRange: [],
        });
        setSelectedSort('');
        setSearchParams({});
    }

    return (
        <div className = 'flex flex-col-reverse lg:flex-row items-start justify-between pt-28 md:pt-35 px-4 md:px-16 lg:px-24 xl:px-32'>
            <div>
                <div className = 'flex flex-col items-start text-left'>
                    <h1 className = 'font-mali text-4xl md:text-[40px]'> Hotel Rooms </h1>
                    <p className = 'text-sm md:text-base text-gray-500/90 mt-2 max-w-174'> Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. </p>
                </div>

                { filteredRooms.map((room) => (
                    <div key = {room._id} className = 'flex flex-col md:flex-row items-start py-10 gap-6 border-b border-gray-300 last:pb-30 last:border-0'>
                        <img onClick = {() => goToRoomDetails(room)} src = {room.images[0]} alt = 'hotel-img' title = 'View Room Details' className = 'max-h-65 md:w-1/2 rounded-xl shadow-lg object-cover cursor-pointer' />
                        
                        <div className = 'md:w-1/2 flex flex-col gap-2'>
                            <p className = 'text-gray-500'>{ room.hotel.city }</p>
                            <p onClick = {() => goToRoomDetails(room)} className = 'text-gray-800 text-3xl font-mali cursor-pointer'>{ room.roomType }</p>

                            <div className = 'flex items-center'>
                                <StarRating />
                                <p className = 'ml-2'> 200+ Reviews </p>
                            </div>

                            <div className = 'flex items-center gap-1 text-gray-500 mt-2 text-sm'>
                                <img src = { assets.locationIcon } alt = 'location-icon' />
                                <span>{ room.hotel.address }</span>
                            </div>

                            {/* Room Amenities */}
                                <div className = 'flex flex-wrap items-center mt-3 mb-6 gap-4'>
                                    { room.amenities.map((item, index) => (
                                        <div key = { index } className = 'flex items-center gap-2 px-3 py-2 rounded-lg bg-[#F5F5FF]/70'>
                                            <img src = { facilityIcons[item] } alt = {item} className = 'w-5 h-5' />
                                            <p className = 'text-xs'>{ item }</p>
                                        </div>
                                    ))}
                                </div>

                            {/* Room Price per Night */}
                                <p className = 'text-xl font-mali text-gray-700'>{ currency } { room.pricePerNight } / night</p>

                            { hasSearchDates && (
                                <button
                                    type = 'button'
                                    onClick = { () => handleSelectRoom(room) }
                                    disabled = { checkingAvailability || bookingRoomId === room._id || !Array.isArray(availableRoomIds) || !availableRoomIds.includes(room._id) }
                                    className = 'mt-3 rounded-md bg-black px-5 py-3 text-white cursor-pointer disabled:cursor-not-allowed disabled:opacity-50'
                                >
                                    { bookingRoomId === room._id ? 'Booking...' : 'Select Room & Book' }
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                { filteredRooms.length === 0 && (
                    <p className = 'font-mali text-gray-500 py-8'>
                        { checkingAvailability
                            ? 'Checking room availability...'
                            : hasSearchDates
                                ? 'No rooms are available for these dates, or no matching room was found.'
                                : 'No rooms found.' }
                    </p>
                )}
            </div>

            {/* Filters */}
                <div className = 'bg-white w-80 border border-gray-300 text-gray-600 max-lg:mb-8 lg:mt-16'>
                    <div className = {`flex items-center justify-between px-5 py-2.5 lg:border-b border-gray-300 ${ openFilters && 'border-b'}`}>
                        <p className = 'text-base font-mali text-gray-800'> Filters </p>

                        <div className = 'text-xs cursor-pointer'>
                            <span onClick = {() => setOpenFilters(!openFilters)} className = 'lg:hidden'>{ openFilters ? 'HIDE' : 'SHOW'}</span>
                            <span onClick={ clearFilters } className='hidden lg:block cursor-pointer'> CLEAR </span>
                        </div>
                    </div>

                    <div className = {`${ openFilters ? 'h-auto' : 'h-0 lg:h-auto'} overflow-hidden transition-all duration-700 `}>
                        <div className = 'px-5 pt-5'>
                            <p className = 'font-mali text-gray-800 pb-2'> Popular Filters </p>

                            { roomTypes.map((room, index) => (
                                <CheckBox key = { index } label = { room } selected = { selectedFilters.roomType.includes(room) } onChange = { (checked) => handleFilterChange(checked, room, 'roomType') } />
                            ))}
                        </div>

                        <div className = 'px-5 pt-5'>
                            <p className = 'font-mali text-gray-800 pb-2'> Price Range </p>

                            { priceRanges.map((range, index) => (
                                <CheckBox key = { index } label = {`${ currency } ${ range }`} selected = { selectedFilters.priceRange.includes(range) } onChange = { (checked) => handleFilterChange(checked, range, 'priceRange') } />
                            ))}
                        </div>

                        <div className = 'px-5 pt-5 pb-7'>
                            <p className = 'font-mali text-gray-800 pb-2'> Sort By </p>

                            { sortOptions.map((option, index) => (
                            <RadioButton key = { index } label = { option } selected = { selectedSort === option } onChange = { () => handlerSortChange(option) } />
                            ))}
                        </div>

                    </div>
                </div>

        </div>
  )
}

export default AllRooms
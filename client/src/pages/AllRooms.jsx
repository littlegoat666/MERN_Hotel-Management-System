import React, { useMemo, useState } from 'react'
import { Wifi, Coffee, Bell, Mountain, Waves, TreePine, Camera, Sofa, Car, Cigarette, Accessibility, ChevronDown, ChevronUp } from 'lucide-react'
import { assets } from '../assets/assets'
import { useSearchParams } from 'react-router-dom'
import StarRating from '../components/StarRating'
import { useAppContext } from '../context/AppContext'

// Amenities icons and colors
const amenityIcons = {
    'Free Wi-Fi': { icon: Wifi, color: 'bg-sky-50 text-sky-700' },
    'Free Wifi': { icon: Wifi, color: 'bg-sky-50 text-sky-700' },
    'Free WiFi': { icon: Wifi, color: 'bg-sky-50 text-sky-700' },
    'Free Breakfast': { icon: Coffee, color: 'bg-amber-50 text-amber-700' },
    'Room Service': { icon: Bell, color: 'bg-violet-50 text-violet-700' },
    'Mountain View': { icon: Mountain, color: 'bg-emerald-50 text-emerald-700' },
    'Pool Access': { icon: Waves, color: 'bg-cyan-50 text-cyan-700' },
    'Garden': { icon: TreePine, color: 'bg-green-50 text-green-700' },
    'Security Cameras': { icon: Camera, color: 'bg-indigo-50 text-indigo-700' },
    'Furniture Included': { icon: Sofa, color: 'bg-orange-50 text-orange-700' },
    'Parking': { icon: Car, color: 'bg-blue-50 text-blue-700' },
    'Smoking Area': { icon: Cigarette, color: 'bg-stone-100 text-stone-700' },
    'Accessible to Disabled': { icon: Accessibility, color: 'bg-rose-50 text-rose-700' },
}

const amenityOrder = [
    'Free Wi-Fi',
    'Free Breakfast',
    'Room Service',
    'Mountain View',
    'Pool Access',
    'Garden',
    'Parking',
    'Furniture Included',
    'Security Cameras',
    'Accessible to Disabled',
    'Smoking Area',
]

const CheckBox = ({ label, selected = false, onChange = () => {} }) => {
    return (
        <label className = 'flex gap-3 items-center cursor-pointer mt-2 text-sm text-[#8C7A70]'>
            <input type = 'checkbox' checked = { selected } onChange = {(e) => onChange(e.target.checked, label)} className = 'accent-[#A96F58]' />
            <span className = 'font-mali select-none'>{ label }</span>
        </label>
    )
}

const RadioButton = ({ label, selected = false, onChange = () => {} }) => {
    return (
        <label className = 'flex gap-3 items-center cursor-pointer mt-2 text-sm text-[#8C7A70]'>
            <input type = 'radio' name = 'sortOption' checked = { selected } onChange = {() => onChange(label)} className = 'accent-[#A96F58]' />
            <span className = 'font-mali select-none'>{ label }</span>
        </label>
    )
}

const AllRooms = () => {

    const [ searchParams, setSearchParams ] = useSearchParams()
    const { rooms, navigate, currency } = useAppContext()

    const [ openFilters, setOpenFilters ] = useState(false)
    const [ selectedFilters, setSelectedFilters ] = useState({
        roomType: [],
        priceRange: [],
    })
    const [ selectedSort, setSelectedSort ] = useState('')
    const [ expandedAmenities, setExpandedAmenities ] = useState({})

    const roomTypes = useMemo(() => {
        const uniqueRoomTypes = new Map()

        rooms.forEach((room) => {
            const roomType = room.roomType?.trim()

            if (roomType && !uniqueRoomTypes.has(roomType.toLowerCase())) {
                uniqueRoomTypes.set(roomType.toLowerCase(), roomType)
            }
        })

        return [...uniqueRoomTypes.values()].sort((a, b) => a.localeCompare(b))
    }, [rooms])

    const priceRanges = [
        '0 to 200',
        '201 to 400',
        '401 to 600',
        '601 to 800',
        '801 to 1000',
    ]

    const sortOptions = [
        'Price Low to High',
        'Price High to Low',
        'Newest First',
    ]

    // Handle Change for Filters and Sorting
    const handleFilterChange = (checked, value, type) => {
        setSelectedFilters((prevFilters) => {
            const updatedFilters = { ...prevFilters }

            if (checked) {
                updatedFilters[type].push(value)
            } else {
                updatedFilters[type] = updatedFilters[type].filter(item => item !== value)
            }

            return updatedFilters
        })
    }

    const handlerSortChange = (sortOption) => {
        setSelectedSort(sortOption)
    }

    // Function to check if a room matches the selected room type
    const matchesRoomType = (room) => {
        return selectedFilters.roomType.length === 0 || selectedFilters.roomType.includes(room.roomType)
    }

    // Function to check if a room matches the selected price ranges
    const matchesPriceRange = (room) => {
        return selectedFilters.priceRange.length === 0 || selectedFilters.priceRange.some(range => {
            const [ min, max ] = range.split(' to ').map(Number)
            return room.pricePerNight >= min && room.pricePerNight <= max
        })
    }

    // Function to sort rooms based on the selected sort option
    const sortRooms = (a, b) => {
        if (selectedSort === 'Price Low to High') {
            return a.pricePerNight - b.pricePerNight
        }

        if (selectedSort === 'Price High to Low') {
            return b.pricePerNight - a.pricePerNight
        }

        if (selectedSort === 'Newest First') {
            return new Date(b.createdAt) - new Date(a.createdAt)
        }

        return 0
    }

    // Filter Destination
    const filterDestination = (room) => {
        const destination = searchParams.get('destination')

        if (!destination) return true

        return room.hotel.city.toLowerCase().includes(destination.toLowerCase())
    }

    // Filter and sort rooms based on the selected filters and sort option
    const filteredRooms = useMemo(() => {
        return rooms.filter(room => matchesRoomType(room) && matchesPriceRange(room) && filterDestination(room)).sort(sortRooms)
    }, [ rooms, selectedFilters, selectedSort, searchParams ])

    // Clear All filters
    const clearFilters = () => {
        setSelectedFilters({
            roomType: [],
            priceRange: [],
        })

        setSelectedSort('')
        setSearchParams({})
    }

    // Show or hide all amenities for each room
    const toggleAmenities = (roomId) => {
        setExpandedAmenities((previous) => ({
            ...previous,
            [roomId]: !previous[roomId],
        }))
    }

    return (
        <div className = 'flex flex-col-reverse lg:flex-row items-start justify-between pt-28 md:pt-35 px-4 md:px-16 lg:px-24 xl:px-32 bg-[#FAF7F2] text-[#55443B]'>
            <div>
                <div className = 'flex flex-col items-start text-left'>
                    <h1 className = 'font-mali text-4xl md:text-[40px] text-[#55443B]'> Hotel Rooms </h1>
                </div>

                { filteredRooms.map((room) => {
                    const sortedAmenities = [...(room.amenities || [])].sort((a, b) => {
                        const normalize = (item) => ['Free Wifi', 'Free WiFi'].includes(item) ? 'Free Wi-Fi' : item
                        const aIndex = amenityOrder.indexOf(normalize(a))
                        const bIndex = amenityOrder.indexOf(normalize(b))

                        return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex)
                    })

                    const isExpanded = Boolean(expandedAmenities[room._id])
                    const visibleAmenities = isExpanded ? sortedAmenities : sortedAmenities.slice(0, 3)

                    return (
                        <div key = { room._id } className = 'flex flex-col md:flex-row items-start py-10 gap-6 border-b border-[#E7DAD0] last:pb-30 last:border-0'>
                            <img onClick = {() => { navigate(`/rooms/${room._id}`); scrollTo(0, 0) }} src = { room.images[0] } alt = 'hotel-img' title = 'View Room Details' className = 'max-h-65 md:w-1/2 rounded-xl shadow-lg object-contain cursor-pointer' />

                            <div className = 'md:w-1/2 flex flex-col gap-2'>
                                <p className = 'text-[#8C7A70]'>{ room.hotel.city }</p>
                                <p onClick = {() => { navigate(`/rooms/${room._id}`); scrollTo(0, 0) }} className = 'text-[#55443B] text-3xl font-mali cursor-pointer'>{ room.roomType }</p>

                                <div className = 'flex items-center text-[#8C7A70]'>
                                    <StarRating />
                                    <p className = 'ml-2'> 200+ Reviews </p>
                                </div>

                                <div className = 'flex items-center gap-1 text-[#8C7A70] mt-2 text-sm'>
                                    <img src = { assets.locationIcon } alt = 'location-icon' />
                                    <span>{ room.hotel.address }</span>
                                </div>

                                {/* Room Amenities */}
                                <div className = 'flex flex-wrap items-center mt-3 mb-6 gap-2'>
                                    { visibleAmenities.map((item, index) => {
                                        const amenity = amenityIcons[item]
                                        const Icon = amenity?.icon

                                        return (
                                            <div key = { index } className = {`flex items-center gap-1.5 px-3 py-2 rounded-full ${amenity?.color || 'bg-[#F2E9E1] text-[#8C7A70]'}`}>
                                                { Icon && <Icon size = { 15 } strokeWidth = { 2 } /> }
                                                <p className = 'text-xs font-mali'>{ item }</p>
                                            </div>
                                        )
                                    })}

                                    { sortedAmenities.length > 3 && (
                                        <button type = 'button' onClick = {() => toggleAmenities(room._id)} className = 'inline-flex items-center gap-1 px-3 py-2 rounded-full bg-[#F2E9E1] text-[#8C7A70] hover:bg-[#E7DAD0] hover:text-[#55443B] transition text-xs font-mali'>
                                            { isExpanded ? (
                                                <>
                                                    Show less <ChevronUp size = { 14 } />
                                                </>
                                            ) : (
                                                <>
                                                    +{ sortedAmenities.length - 3 } more <ChevronDown size = { 14 } />
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>

                                {/* Room Price per Night */}
                                <p className = 'text-xl font-mali text-[#A96F58]'>{ currency } { room.pricePerNight } / night</p>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Filters */}
            <div className = 'bg-[#FFFDFA] w-80 border border-[#E7DAD0] text-[#8C7A70] max-lg:mb-8 lg:mt-16 rounded-lg'>
                <div className = {`flex items-center justify-between px-5 py-2.5 lg:border-b border-[#E7DAD0] ${ openFilters && 'border-b'}`}>
                    <p className = 'text-base font-mali text-[#55443B]'> Filters </p>

                    <div className = 'text-xs cursor-pointer text-[#A96F58]'>
                        <span onClick = {() => setOpenFilters(!openFilters)} className = 'lg:hidden'>{ openFilters ? 'HIDE' : 'SHOW' }</span>
                        <span onClick = { clearFilters } className = 'hidden lg:block cursor-pointer hover:text-[#8F5946]'> CLEAR </span>
                    </div>
                </div>

                <div className = {`${ openFilters ? 'h-auto' : 'h-0 lg:h-auto'} overflow-hidden transition-all duration-700`}>
                    <div className = 'px-5 pt-5'>
                        <p className = 'font-mali text-[#55443B] pb-2'> Popular Filters </p>

                        { roomTypes.map((room, index) => (
                            <CheckBox key = { index } label = { room } selected = { selectedFilters.roomType.includes(room) } onChange = { (checked) => handleFilterChange(checked, room, 'roomType') } />
                        ))}
                    </div>

                    <div className = 'px-5 pt-5'>
                        <p className = 'font-mali text-[#55443B] pb-2'> Price Range </p>

                        { priceRanges.map((range, index) => (
                            <CheckBox key = { index } label = {`${ currency } ${ range }`} selected = { selectedFilters.priceRange.includes(range) } onChange = { (checked) => handleFilterChange(checked, range, 'priceRange') } />
                        ))}
                    </div>

                    <div className = 'px-5 pt-5 pb-7'>
                        <p className = 'font-mali text-[#55443B] pb-2'> Sort By </p>

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
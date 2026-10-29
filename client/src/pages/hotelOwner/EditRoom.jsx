
import React, { useEffect, useState } from 'react'
import Title from '../../components/Title'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'

const amenityOptions = [
    'Free Wi-Fi',
    'Room Service',
    'Mountain View',
    'Pool Access',
    'Garden',
    'Security Cameras',
    'Furniture Included',
    'Parking',
    'Smoking Area',
    'Accessible to Disabled',
]

const EditRoom = () => {
    const { axios, getToken, user, currency } = useAppContext()

    const [ rooms, setRooms ] = useState([])
    const [ selectedRoomId, setSelectedRoomId ] = useState('')
    const [ form, setForm ] = useState({ roomType: '', pricePerNight: '', amenities: [] })
    const [ keptImages, setKeptImages ] = useState([])
    const [ newImages, setNewImages ] = useState([])
    const [ loading, setLoading ] = useState(false)
    const [ fetching, setFetching ] = useState(false)

    const fetchRooms = async (preferredRoomId = '') => {
        setFetching(true)

        try {
            const { data } = await axios.get('/api/rooms/owner', {
                headers: { Authorization: `Bearer ${await getToken()}` }
            })

            if (!data.success) {
                toast.error(data.message)
                return
            }

            const roomList = data.rooms || []
            setRooms(roomList)

            const selectedRoom = roomList.find(room => room._id === preferredRoomId) || roomList[0]

            if (selectedRoom) {
                setSelectedRoomId(selectedRoom._id)
                setForm({
                    roomType: selectedRoom.roomType || '',
                    pricePerNight: selectedRoom.pricePerNight ?? '',
                    amenities: Array.isArray(selectedRoom.amenities) ? [...selectedRoom.amenities] : [],
                })
                setKeptImages(Array.isArray(selectedRoom.images) ? [...selectedRoom.images] : [])
            } else {
                setSelectedRoomId('')
                setForm({ roomType: '', pricePerNight: '', amenities: [] })
                setKeptImages([])
            }

            setNewImages([])
        } catch (error) {
            toast.error(error.response?.data?.message || error.message)
        } finally {
            setFetching(false)
        }
    }

    useEffect(() => {
        if (user) {
            fetchRooms()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user])

    const handleRoomSelect = (roomId) => {
        const room = rooms.find(item => item._id === roomId)
        if (!room) return

        setSelectedRoomId(room._id)
        setForm({
            roomType: room.roomType || '',
            pricePerNight: room.pricePerNight ?? '',
            amenities: Array.isArray(room.amenities) ? [...room.amenities] : [],
        })
        setKeptImages(Array.isArray(room.images) ? [...room.images] : [])
        setNewImages([])
    }

    const toggleAmenity = (amenity) => {
        setForm(previous => ({
            ...previous,
            amenities: previous.amenities.includes(amenity)
                ? previous.amenities.filter(item => item !== amenity)
                : [...previous.amenities, amenity]
        }))
    }

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files || [])
        const remainingSlots = Math.max(0, 4 - keptImages.length)

        if (files.length > remainingSlots) {
            toast.error(`You can upload up to 4 images. ${remainingSlots} image slot(s) remaining.`)
        }

        setNewImages(files.slice(0, remainingSlots))
        e.target.value = ''
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!selectedRoomId) {
            toast.error('Please select a room')
            return
        }

        if (!form.roomType.trim()) {
            toast.error('Please enter a room name')
            return
        }

        if (!Number.isFinite(Number(form.pricePerNight)) || Number(form.pricePerNight) <= 0) {
            toast.error('Please enter a valid price')
            return
        }

        if (keptImages.length + newImages.length === 0) {
            toast.error('Please keep or upload at least one room image')
            return
        }

        if (keptImages.length + newImages.length > 4) {
            toast.error('A room can have up to 4 images')
            return
        }

        setLoading(true)

        try {
            const formData = new FormData()
            formData.append('roomType', form.roomType.trim())
            formData.append('pricePerNight', String(form.pricePerNight))
            formData.append('amenities', JSON.stringify(form.amenities))
            formData.append('keptImages', JSON.stringify(keptImages))

            newImages.forEach(image => formData.append('images', image))

            const { data } = await axios.put(`/api/rooms/${selectedRoomId}`, formData, {
                headers: { Authorization: `Bearer ${await getToken()}` }
            })

            if (data.success) {
                toast.success(data.message)
                await fetchRooms(selectedRoomId)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message)
        } finally {
            setLoading(false)
        }
    }

    const selectedRoom = rooms.find(room => room._id === selectedRoomId)
    const availableAmenities = [...new Set([...amenityOptions, ...form.amenities])]

    return (
        <div>
            <Title
                align = 'left'
                font = 'outfit'
                title = 'Edit Room'
                subTitle = 'Update room details, nightly prices, amenities, and photos for Bupatara Chiangmai.'
            />

            <div className = 'mt-8 max-w-3xl'>
                <label className = 'block text-gray-800 mb-2'>Select Room</label>

                <select
                    value = { selectedRoomId }
                    onChange = { e => handleRoomSelect(e.target.value) }
                    disabled = { fetching || rooms.length === 0 }
                    className = 'border border-gray-300 rounded p-2 w-full max-w-md'
                >
                    { rooms.length === 0 && <option value = ''>No rooms available</option> }
                    { rooms.map(room => (
                        <option key = { room._id } value = { room._id }>
                            { room.roomType } — { currency } { room.pricePerNight }
                        </option>
                    )) }
                </select>

                { fetching && <p className = 'text-gray-500 mt-3'>Loading rooms...</p> }

                { selectedRoom && (
                    <form onSubmit = { handleSubmit } className = 'mt-6'>
                        <label className = 'block text-gray-800 mb-2'>Room Name / Type</label>
                        <input
                            type = 'text'
                            value = { form.roomType }
                            onChange = { e => setForm({ ...form, roomType: e.target.value }) }
                            maxLength = { 100 }
                            required
                            className = 'border border-gray-300 rounded p-2 w-full'
                            placeholder = 'e.g. Deluxe Mountain View'
                        />

                        <label className = 'block text-gray-800 mt-5 mb-2'>Price per Night ({currency})</label>
                        <input
                            type = 'number'
                            min = '1'
                            step = '0.01'
                            value = { form.pricePerNight }
                            onChange = { e => setForm({ ...form, pricePerNight: e.target.value }) }
                            required
                            className = 'border border-gray-300 rounded p-2 w-full max-w-xs'
                        />

                        <p className = 'text-gray-800 mt-6 mb-2'>Amenities</p>
                        <div className = 'grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-700'>
                            { availableAmenities.map((amenity, index) => (
                                <label key = { amenity } className = 'flex items-center gap-2'>
                                    <input
                                        type = 'checkbox'
                                        id = { `editAmenity${index}` }
                                        checked = { form.amenities.includes(amenity) }
                                        onChange = { () => toggleAmenity(amenity) }
                                    />
                                    { amenity }
                                </label>
                            )) }
                        </div>

                        <p className = 'text-gray-800 mt-6 mb-2'>Current Images</p>
                        <div className = 'grid grid-cols-2 sm:grid-cols-4 gap-3'>
                            { keptImages.map((image, index) => (
                                <div key = { `${image}-${index}` } className = 'border border-gray-200 rounded p-2'>
                                    <img
                                        src = { image }
                                        alt = { `${form.roomType} ${index + 1}` }
                                        className = 'w-full h-28 object-cover rounded'
                                    />
                                    <button
                                        type = 'button'
                                        onClick = { () => setKeptImages(previous => previous.filter((_, i) => i !== index)) }
                                        className = 'text-red-600 text-sm mt-2'
                                    >
                                        Remove Image
                                    </button>
                                </div>
                            )) }
                        </div>

                        <label className = 'block text-gray-800 mt-5 mb-2'>Upload Replacement / Additional Images</label>
                        <input
                            type = 'file'
                            accept = 'image/*'
                            multiple
                            disabled = { keptImages.length >= 4 }
                            onChange = { handleImageChange }
                            className = 'border border-gray-300 rounded p-2 w-full'
                        />
                        <p className = 'text-gray-500 text-sm mt-1'>
                            Keep the existing images you want to retain. Remove an image above to make room for a replacement. Maximum 4 images.
                        </p>

                        { newImages.length > 0 && (
                            <div className = 'grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4'>
                                { newImages.map((image, index) => (
                                    <div key = { `${image.name}-${index}` } className = 'border border-blue-200 rounded p-2'>
                                        <img
                                            src = { URL.createObjectURL(image) }
                                            alt = { image.name }
                                            className = 'w-full h-28 object-cover rounded'
                                        />
                                        <p className = 'text-xs text-gray-500 mt-1 truncate'>{ image.name }</p>
                                        <button
                                            type = 'button'
                                            onClick = { () => setNewImages(previous => previous.filter((_, i) => i !== index)) }
                                            className = 'text-red-600 text-sm mt-1'
                                        >
                                            Remove
                                        </button>
                                    </div>
                                )) }
                            </div>
                        ) }

                        <button
                            type = 'submit'
                            disabled = { loading || fetching }
                            className = 'bg-primary text-white px-8 py-2 rounded mt-8 cursor-pointer disabled:opacity-50'
                        >
                            { loading ? 'Saving...' : 'Save Changes' }
                        </button>
                    </form>
                ) }

                { !fetching && rooms.length === 0 && (
                    <p className = 'text-gray-500 mt-5'>There are no rooms to edit. Add a room first.</p>
                ) }
            </div>
        </div>
    )
}

export default EditRoom
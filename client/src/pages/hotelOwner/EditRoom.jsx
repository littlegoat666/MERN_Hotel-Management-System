import React, { useEffect, useState } from 'react'
import { BedDouble, PencilLine, Images, Save, RefreshCw, Trash2, Sparkles } from 'lucide-react'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'

const defaultAmenities = [
    'Free Wi-Fi', 'Room Service', 'Mountain View', 'Pool Access', 'Garden',
    'Security Cameras', 'Furniture Included', 'Parking', 'Smoking Area',
    'Accessible to Disabled', 'Free Breakfast',
]

const EditRoom = () => {
    const { axios, getToken, user, currency } = useAppContext()
    const [rooms, setRooms] = useState([])
    const [selectedRoomId, setSelectedRoomId] = useState('')
    const [form, setForm] = useState({ roomType: '', pricePerNight: '', amenities: [] })
    const [keptImages, setKeptImages] = useState([])
    const [newImages, setNewImages] = useState([])
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(false)

    const applyRoom = (room) => {
        if (!room) {
            setSelectedRoomId('')
            setForm({ roomType: '', pricePerNight: '', amenities: [] })
            setKeptImages([])
            setNewImages([])
            return
        }
        setSelectedRoomId(room._id)
        setForm({ roomType: room.roomType || '', pricePerNight: room.pricePerNight ?? '', amenities: Array.isArray(room.amenities) ? [...room.amenities] : [] })
        setKeptImages(Array.isArray(room.images) ? [...room.images] : [])
        setNewImages([])
    }

    const fetchRooms = async (preferredRoomId = '') => {
        setFetching(true)
        try {
            const { data } = await axios.get('/api/rooms/owner', { headers: { Authorization: `Bearer ${await getToken()}` } })
            if (!data.success) return toast.error(data.message || 'Unable to load rooms')
            const roomList = data.rooms || []
            setRooms(roomList)
            applyRoom(roomList.find((room) => room._id === preferredRoomId) || roomList[0])
        } catch (error) {
            toast.error(error.response?.data?.message || error.message)
        } finally {
            setFetching(false)
        }
    }

    useEffect(() => { if (user) fetchRooms() }, [user])

    const toggleAmenity = (amenity) => {
        setForm((previous) => ({ ...previous, amenities: previous.amenities.includes(amenity) ? previous.amenities.filter((item) => item !== amenity) : [...previous.amenities, amenity] }))
    }

    const handleImageChange = (event) => {
        const files = Array.from(event.target.files || [])
        const slots = Math.max(0, 4 - keptImages.length)
        if (files.length > slots) toast.error(`Only ${slots} image slot(s) remaining`)
        setNewImages((previous) => [...previous, ...files.slice(0, slots)].slice(0, slots))
        event.target.value = ''
    }

    const removeNewImage = (index) => setNewImages((previous) => previous.filter((_, itemIndex) => itemIndex !== index))

    const handleSubmit = async (event) => {
        event.preventDefault()
        if (!selectedRoomId) return toast.error('Please select a room')
        if (!form.roomType.trim()) return toast.error('Please enter a room name')
        if (!Number.isFinite(Number(form.pricePerNight)) || Number(form.pricePerNight) <= 0) return toast.error('Please enter a valid price')
        if (keptImages.length + newImages.length < 1) return toast.error('At least one room image is required')
        if (keptImages.length + newImages.length > 4) return toast.error('A room can have up to 4 images')

        setLoading(true)
        try {
            const formData = new FormData()
            formData.append('roomType', form.roomType.trim())
            formData.append('pricePerNight', String(form.pricePerNight))
            formData.append('amenities', JSON.stringify(form.amenities))
            formData.append('keptImages', JSON.stringify(keptImages))
            newImages.forEach((image) => formData.append('images', image))

            const { data } = await axios.put(`/api/rooms/${selectedRoomId}`, formData, { headers: { Authorization: `Bearer ${await getToken()}` } })
            if (!data.success) return toast.error(data.message || 'Unable to update room')
            toast.success(data.message || 'Room updated successfully')
            await fetchRooms(selectedRoomId)
        } catch (error) {
            toast.error(error.response?.data?.message || error.message)
        } finally {
            setLoading(false)
        }
    }

    const inputClass = 'w-full rounded-xl border border-[#e3d7cc] bg-[#fcfaf7] px-4 py-3 text-sm text-[#55463e] outline-none transition focus:border-[#bd886e] focus:bg-white focus:ring-4 focus:ring-[#bd886e]/10'
    const availableAmenities = [...new Set([...defaultAmenities, ...form.amenities])]

    return (
        <div className = 'space-y-6 font-mali text-[#302925]'>
            <section className = 'relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#493832] via-[#76564b] to-[#a27560] px-6 py-8 text-[#fffaf5] shadow-lg shadow-[#76564b]/10 md:px-9 md:py-10'>
                <div className = 'pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full border border-white/10' />
                <div className = 'pointer-events-none absolute -right-3 -top-8 h-52 w-52 rounded-full border border-white/10' />
                <div className = 'pointer-events-none absolute -bottom-24 right-1/4 h-64 w-64 rounded-full bg-[#d9a58e]/10 blur-3xl' />
                <div className = 'relative z-10 flex flex-wrap items-end justify-between gap-5'>
                    <div>
                        <h1 className = 'text-3xl font-semibold tracking-tight md:text-4xl'>Edit Room</h1>
                        <p className = 'mt-3 max-w-xl text-sm leading-7 text-[#f1e2d8]/80'>Update room names, nightly rates, facilities, and photos.</p>
                    </div>
                </div>
            </section>

            <section className = 'w-full overflow-hidden rounded-3xl border border-[#e9ded5] bg-[#fffdfa] shadow-sm'>
                <div className = 'flex items-center gap-3 border-b border-[#eee5de] bg-[#faf5f0] px-5 py-4 sm:px-7'>
                    <span className = 'flex h-10 w-10 items-center justify-center rounded-xl bg-[#f9e8ed] text-[#bd6c83]'><PencilLine size = {20} /></span>
                    <div><h2 className = 'font-semibold text-[#57463d]'>Edit Room Details</h2><p className = 'text-xs text-[#a09287]'>Select a listing and update its information</p></div>
                </div>

                <div className = 'space-y-6 p-5 sm:p-7'>
                    <div>
                        <label className = 'mb-2 block text-sm font-semibold text-[#65544a]'>Select Room</label>
                        <select value = {selectedRoomId} onChange = {(event) => applyRoom(rooms.find((room) => room._id === event.target.value))} disabled = {fetching || !rooms.length} className = {inputClass}>
                            {!rooms.length && <option value = ''>No rooms available</option>}
                            {rooms.map((room) => <option key = {room._id} value = {room._id}>{room.roomType} — {currency} {room.pricePerNight}</option>)}
                        </select>
                    </div>

                    {fetching ? <div className = 'flex min-h-32 items-center justify-center'><RefreshCw size = {22} className = 'animate-spin text-[#b87962]' /></div> : selectedRoomId ? (
                        <form onSubmit = {handleSubmit} className = 'space-y-7'>
                            <div className = 'grid grid-cols-1 gap-5 sm:grid-cols-[1fr_210px]'>
                                <div><label className = 'mb-2 block text-sm font-semibold text-[#65544a]'>Room Name</label><input value = {form.roomType} onChange = {(event) => setForm({ ...form, roomType: event.target.value })} maxLength = {100} required className = {inputClass} /></div>
                                <div><label className = 'mb-2 block text-sm font-semibold text-[#65544a]'>Price per Night ({currency})</label><input type = 'number' min = '1' step = '0.01' value = {form.pricePerNight} onChange = {(event) => setForm({ ...form, pricePerNight: event.target.value })} required className = {inputClass} /></div>
                            </div>

                            <div>
                                <div className = 'mb-3 flex items-center gap-2'><Sparkles size = {18} className = 'text-[#9a6ab0]' /><h3 className = 'font-semibold text-[#59483f]'>Amenities</h3></div>
                                <div className = 'grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3'>
                                    {availableAmenities.map((amenity) => <label key = {amenity} className = {`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 ${form.amenities.includes(amenity) ? 'border-[#c28b71] bg-[#f7ece5]' : 'border-[#eee5de] bg-[#fcfaf7]'}`}><input type = 'checkbox' checked = {form.amenities.includes(amenity)} onChange = {() => toggleAmenity(amenity)} className = 'h-4 w-4 accent-[#a96f58]' /><span className = 'text-xs text-[#6e5b50]'>{amenity}</span></label>)}
                                </div>
                            </div>

                            <div>
                                <div className = 'mb-3 flex items-center gap-2'><Images size = {18} className = 'text-[#478f91]' /><h3 className = 'font-semibold text-[#59483f]'>Room Images</h3></div>
                                <div className = 'grid grid-cols-2 gap-3 sm:grid-cols-4'>
                                    {keptImages.map((image, index) => <div key = {`${image}-${index}`} className = 'rounded-xl border border-[#e9ded5] bg-[#fcfaf7] p-2'><img src = {image} alt = {`${form.roomType} ${index + 1}`} className = 'h-28 w-full rounded-lg object-cover' /><button type = 'button' onClick = {() => setKeptImages((previous) => previous.filter((_, imageIndex) => imageIndex !== index))} className = 'mt-2 inline-flex items-center gap-1 text-xs font-medium text-[#bd5b52]'><Trash2 size = {13} /> Remove</button></div>)}
                                    {newImages.map((image, index) => <div key = {`${image.name}-${index}`} className = 'rounded-xl border border-[#e9ded5] bg-[#fcfaf7] p-2'><img src = {URL.createObjectURL(image)} alt = {image.name} className = 'h-28 w-full rounded-lg object-cover' /><button type = 'button' onClick = {() => removeNewImage(index)} className = 'mt-2 inline-flex items-center gap-1 text-xs font-medium text-[#bd5b52]'><Trash2 size = {13} /> Remove</button></div>)}
                                    {keptImages.length + newImages.length < 4 && <label className = 'flex min-h-[150px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#dfcfc1] bg-[#faf6f1] text-[#a17a64] transition hover:border-[#b87962]'><Images size = {23} /><span className = 'mt-2 text-xs font-semibold'>Add image</span><input type = 'file' accept = 'image/*' multiple hidden onChange = {handleImageChange} /></label>}
                                </div>
                                <p className = 'mt-2 text-[11px] text-[#a99a90]'>Up to four images per room. Remove an existing image to make room for a replacement.</p>
                            </div>

                            <div className = 'flex flex-wrap items-center justify-between gap-3 border-t border-[#eee5de] pt-5'>
                                <p className = 'text-xs text-[#a09287]'>Changes are saved to the room record in MongoDB.</p>
                                <button type = 'submit' disabled = {loading} className = 'inline-flex items-center gap-2 rounded-xl bg-[#a96f58] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#8f5946] disabled:opacity-50'><Save size = {17} />{loading ? 'Saving...' : 'Save Changes'}</button>
                            </div>
                        </form>
                    ) : <div className = 'py-12 text-center'><BedDouble size = {30} className = 'mx-auto mb-3 text-[#c1afa2]' /><p className = 'font-semibold text-[#806d61]'>No room selected</p><p className = 'mt-1 text-xs text-[#aa9a90]'>Add a room before using Edit Room.</p></div>}
                </div>
            </section>
        </div>
    )
}

export default EditRoom
import React, { useState } from 'react'
import { ImagePlus, BedDouble, BadgeDollarSign, PlusCircle, Sparkles } from 'lucide-react'
import { assets } from '../../assets/assets'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'

const defaultAmenities = [
    'Free Wi-Fi', 'Room Service', 'Mountain View', 'Pool Access', 'Garden',
    'Security Cameras', 'Furniture Included', 'Parking', 'Smoking Area',
    'Accessible to Disabled', 'Free Breakfast',
]

const AddRoom = () => {
    const { axios, getToken, fetchRooms } = useAppContext()
    const [images, setImages] = useState({ 1: null, 2: null, 3: null, 4: null })
    const [inputs, setInputs] = useState({ roomType: '', pricePerNight: '', amenities: {} })
    const [loading, setLoading] = useState(false)

    const onSubmitHandler = async (event) => {
        event.preventDefault()

        if (!inputs.roomType.trim()) return toast.error('Please enter a room name')
        if (!Number.isFinite(Number(inputs.pricePerNight)) || Number(inputs.pricePerNight) <= 0) return toast.error('Please enter a valid nightly price')
        if (!Object.values(images).some(Boolean)) return toast.error('Please upload at least one room image')

        setLoading(true)
        try {
            const formData = new FormData()
            formData.append('roomType', inputs.roomType.trim())
            formData.append('pricePerNight', inputs.pricePerNight)
            formData.append('amenities', JSON.stringify(Object.keys(inputs.amenities).filter((key) => inputs.amenities[key])))
            Object.values(images).forEach((image) => image && formData.append('images', image))

            const { data } = await axios.post('/api/rooms/', formData, {
                headers: { Authorization: `Bearer ${await getToken()}` },
            })

            if (!data.success) return toast.error(data.message || 'Unable to add room')

            toast.success(data.message || 'Room added successfully')
            setInputs({ roomType: '', pricePerNight: '', amenities: {} })
            setImages({ 1: null, 2: null, 3: null, 4: null })
            if (fetchRooms) await fetchRooms()
        } catch (error) {
            toast.error(error.response?.data?.message || error.message)
        } finally {
            setLoading(false)
        }
    }

    const inputClass = 'w-full rounded-xl border border-[#e3d7cc] bg-[#fcfaf7] px-4 py-3 text-sm text-[#55463e] outline-none transition placeholder:text-[#b3a49b] focus:border-[#bd886e] focus:bg-white focus:ring-4 focus:ring-[#bd886e]/10'

    return (
        <div className = 'space-y-6 font-mali text-[#302925]'>
            <section className = 'relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#493832] via-[#76564b] to-[#a27560] px-6 py-8 text-[#fffaf5] shadow-lg shadow-[#76564b]/10 md:px-9 md:py-10'>
                <div className = 'pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full border border-white/10' />
                <div className = 'pointer-events-none absolute -right-3 -top-8 h-52 w-52 rounded-full border border-white/10' />
                <div className = 'pointer-events-none absolute -bottom-24 right-1/4 h-64 w-64 rounded-full bg-[#d9a58e]/10 blur-3xl' />
                <div className = 'relative z-10 flex flex-wrap items-end justify-between gap-5'>
                    <div>
                        <h1 className = 'text-3xl font-semibold tracking-tight md:text-4xl'>Add Room</h1>
                        <p className = 'mt-3 max-w-xl text-sm leading-7 text-[#f1e2d8]/80'>Create a room listing with its own name, nightly price, photos, and amenities.</p>
                    </div>
                </div>
            </section>

            <form onSubmit = {onSubmitHandler} className = 'w-full overflow-hidden rounded-3xl border border-[#e9ded5] bg-[#fffdfa] shadow-sm'>
                <div className = 'flex items-center justify-between gap-3 border-b border-[#eee5de] bg-[#faf5f0] px-5 py-4 sm:px-7'>
                    <div className = 'flex items-center gap-3'>
                        <span className = 'flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff0df] text-[#d58c32]'><BedDouble size = {20} /></span>
                        <div><h2 className = 'font-semibold text-[#57463d]'>Room Information</h2><p className = 'text-xs text-[#a09287]'>Complete the details below</p></div>
                    </div>
                    <span className = 'rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-[#9a7057] ring-1 ring-[#eadbd0]'>NEW LISTING</span>
                </div>

                <div className = 'space-y-7 p-5 sm:p-7'>
                    <section>
                        <div className = 'mb-3 flex items-center gap-2'><ImagePlus size = {18} className = 'text-[#b87962]' /><h3 className = 'font-semibold text-[#59483f]'>Room Photos</h3></div>
                        <p className = 'mb-4 text-xs text-[#a09287]'>Upload up to four images. At least one image is required.</p>
                        <div className = 'grid grid-cols-2 gap-3 sm:grid-cols-4'>
                            {Object.keys(images).map((key) => (
                                <label htmlFor = {`roomImage${key}`} key = {key} className = 'group cursor-pointer'>
                                    <div className = 'flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-[#dfcfc1] bg-[#faf6f1] transition group-hover:border-[#b87962]'>
                                        <img src = {images[key] ? URL.createObjectURL(images[key]) : assets.uploadArea} alt = '' className = {`h-full w-full ${images[key] ? 'object-cover' : 'object-contain p-8 opacity-60'}`} />
                                    </div>
                                    <p className = 'mt-2 text-center text-xs text-[#9a897e]'>Image {key}</p>
                                    <input id = {`roomImage${key}`} type = 'file' accept = 'image/*' hidden onChange = {(event) => setImages((previous) => ({ ...previous, [key]: event.target.files?.[0] || null }))} />
                                </label>
                            ))}
                        </div>
                    </section>

                    <div className = 'h-px bg-[#eee5de]' />

                    <section className = 'grid grid-cols-1 gap-5 sm:grid-cols-[1fr_210px]'>
                        <div>
                            <label className = 'mb-2 flex items-center gap-2 text-sm font-semibold text-[#65544a]'><BedDouble size = {16} className = 'text-[#d58c32]' /> Room Name</label>
                            <input type = 'text' value = {inputs.roomType} onChange = {(event) => setInputs((previous) => ({ ...previous, roomType: event.target.value }))} className = {inputClass} placeholder = 'e.g. Deluxe Mountain View' maxLength = {100} required />
                            <p className = 'mt-2 text-[11px] text-[#a99a90]'>You can create any room name. No fixed room types.</p>
                        </div>
                        <div>
                            <label className = 'mb-2 flex items-center gap-2 text-sm font-semibold text-[#65544a]'><BadgeDollarSign size = {16} className = 'text-[#478f91]' /> Price / Night</label>
                            <div className = 'relative'><span className = 'absolute left-4 top-1/2 -translate-y-1/2 text-[#9a897e]'>฿</span><input type = 'number' min = '1' step = '0.01' value = {inputs.pricePerNight} onChange = {(event) => setInputs((previous) => ({ ...previous, pricePerNight: event.target.value }))} className = {`${inputClass} pl-9`} placeholder = '0.00' required /></div>
                        </div>
                    </section>

                    <section>
                        <div className = 'mb-4 flex items-center gap-2'><Sparkles size = {18} className = 'text-[#9a6ab0]' /><h3 className = 'font-semibold text-[#59483f]'>Room Amenities</h3></div>
                        <div className = 'grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3'>
                            {defaultAmenities.map((amenity, index) => (
                                <label key = {amenity} className = {`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition ${inputs.amenities[amenity] ? 'border-[#c28b71] bg-[#f7ece5]' : 'border-[#eee5de] bg-[#fcfaf7] hover:bg-[#f8f2ec]'}`}>
                                    <input type = 'checkbox' checked = {Boolean(inputs.amenities[amenity])} onChange = {() => setInputs((previous) => ({ ...previous, amenities: { ...previous.amenities, [amenity]: !previous.amenities[amenity] } }))} className = 'h-4 w-4 accent-[#a96f58]' />
                                    <span className = 'text-xs text-[#6e5b50]'>{amenity}</span>
                                </label>
                            ))}
                        </div>
                    </section>
                </div>

                <div className = 'flex flex-wrap items-center justify-between gap-3 border-t border-[#eee5de] bg-[#faf7f3] px-5 py-4 sm:px-7'>
                    <p className = 'text-xs text-[#a09287]'>New room details will be saved to MongoDB.</p>
                    <button type = 'submit' disabled = {loading} className = 'inline-flex items-center gap-2 rounded-xl bg-[#a96f58] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#8f5946] disabled:opacity-50'><PlusCircle size = {17} />{loading ? 'Adding Room...' : 'Add Room'}</button>
                </div>
            </form>
        </div>
    )
}

export default AddRoom
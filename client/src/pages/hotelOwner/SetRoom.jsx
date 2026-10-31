import React, { useEffect, useState } from 'react'
import { BedDouble, ToggleLeft, ToggleRight, Wifi, RefreshCw } from 'lucide-react'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'

const SetRoom = () => {
    const { axios, getToken, user, currency } = useAppContext()
    const [rooms, setRooms] = useState([])
    const [loading, setLoading] = useState(true)
    const [updatingId, setUpdatingId] = useState('')

    const fetchRooms = async () => {
        try {
            setLoading(true)
            const { data } = await axios.get('/api/rooms/owner', { headers: { Authorization: `Bearer ${await getToken()}` } })
            if (data.success) setRooms(data.rooms || [])
            else toast.error(data.message || 'Unable to load rooms')
        } catch (error) {
            toast.error(error.response?.data?.message || error.message)
        } finally {
            setLoading(false)
        }
    }

    const toggleAvailability = async (roomId) => {
        try {
            setUpdatingId(roomId)
            const { data } = await axios.post('/api/rooms/toggle-availability', { roomId }, { headers: { Authorization: `Bearer ${await getToken()}` } })
            if (data.success) {
                toast.success(data.message || 'Room availability updated')
                await fetchRooms()
            } else toast.error(data.message || 'Unable to update room')
        } catch (error) {
            toast.error(error.response?.data?.message || error.message)
        } finally {
            setUpdatingId('')
        }
    }

    useEffect(() => { if (user) fetchRooms() }, [user])

    return (
        <div className = 'space-y-6 font-mali text-[#302925]'>
            <section className = 'relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#493832] via-[#76564b] to-[#a27560] px-6 py-8 text-[#fffaf5] shadow-lg shadow-[#76564b]/10 md:px-9 md:py-10'>
                <div className = 'pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full border border-white/10' />
                <div className = 'pointer-events-none absolute -right-3 -top-8 h-52 w-52 rounded-full border border-white/10' />
                <div className = 'pointer-events-none absolute -bottom-24 right-1/4 h-64 w-64 rounded-full bg-[#d9a58e]/10 blur-3xl' />
                <div className = 'relative z-10 flex flex-wrap items-end justify-between gap-5'>
                    <div>
                        <h1 className = 'text-3xl font-semibold tracking-tight md:text-4xl'>Set Room</h1>
                        <p className = 'mt-3 max-w-xl text-sm leading-7 text-[#f1e2d8]/80'>Control which room listings are visible and available for guests.</p>
                    </div>
                </div>
            </section>

            <section className = 'w-full overflow-hidden rounded-3xl border border-[#e9ded5] bg-[#fffdfa] shadow-sm'>
                <div className = 'flex flex-wrap items-center justify-between gap-3 border-b border-[#eee5de] bg-[#faf5f0] px-5 py-4 sm:px-7'>
                    <div className = 'flex items-center gap-3'><span className = 'flex h-10 w-10 items-center justify-center rounded-xl bg-[#e4f3f1] text-[#478f91]'><ToggleRight size = {21} /></span><div><h2 className = 'font-semibold text-[#57463d]'>Room Availability</h2><p className = 'text-xs text-[#a09287]'>Turn room listings on or off</p></div></div>
                    <div className = 'flex items-center gap-2'><span className = 'rounded-full bg-[#e5f1e7] px-3 py-1.5 text-xs font-semibold text-[#4d8059]'>{rooms.filter((room) => room.isAvailable).length} Available</span><span className = 'rounded-full bg-[#f7e8e3] px-3 py-1.5 text-xs font-semibold text-[#a45f50]'>{rooms.filter((room) => !room.isAvailable).length} Unavailable</span></div>
                </div>

                <div className = 'p-4 sm:p-6'>
                    {loading ? <div className = 'flex min-h-40 items-center justify-center'><RefreshCw size = {22} className = 'animate-spin text-[#b87962]' /></div> : rooms.length ? (
                        <div className = 'grid grid-cols-1 gap-3 md:grid-cols-2'>
                            {rooms.map((room) => (
                                <article key = {room._id} className = 'rounded-2xl border border-[#eee5de] bg-[#fcfaf7] p-4 transition hover:border-[#dfc9ba] hover:shadow-sm'>
                                    <div className = 'flex items-start justify-between gap-3'>
                                        <div className = 'flex min-w-0 items-start gap-3'>
                                            <span className = 'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#fff0df] text-[#d58c32]'><BedDouble size = {20} /></span>
                                            <div className = 'min-w-0'><h3 className = 'truncate font-semibold text-[#59483f]'>{room.roomType}</h3><p className = 'mt-1 text-sm font-medium text-[#866f61]'>{currency} {Number(room.pricePerNight || 0).toLocaleString()} <span className = 'text-xs font-normal text-[#aa9a90]'>/ night</span></p></div>
                                        </div>
                                        <span className = {`rounded-full px-2.5 py-1 text-[10px] font-bold ${room.isAvailable ? 'bg-[#e5f1e7] text-[#4d8059]' : 'bg-[#f7e8e3] text-[#a45f50]'}`}>{room.isAvailable ? 'AVAILABLE' : 'UNAVAILABLE'}</span>
                                    </div>
                                    <p className = 'mt-3 flex items-center gap-1.5 truncate text-xs text-[#9b8b80]'><Wifi size = {13} />{(room.amenities || []).join(' · ') || 'No amenities listed'}</p>
                                    <button type = 'button' disabled = {updatingId === room._id} onClick = {() => toggleAvailability(room._id)} className = {`mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition disabled:opacity-50 ${room.isAvailable ? 'bg-[#f8e9e4] text-[#a45f50] hover:bg-[#f3ddd5]' : 'bg-[#e5f1e7] text-[#4d8059] hover:bg-[#d8eadc]'}`}>
                                        {room.isAvailable ? <ToggleLeft size = {17} /> : <ToggleRight size = {17} />}
                                        {updatingId === room._id ? 'Updating...' : room.isAvailable ? 'Set as Unavailable' : 'Set as Available'}
                                    </button>
                                </article>
                            ))}
                        </div>
                    ) : <div className = 'py-14 text-center'><BedDouble size = {30} className = 'mx-auto mb-3 text-[#c1afa2]' /><p className = 'font-semibold text-[#806d61]'>No rooms found</p><p className = 'mt-1 text-xs text-[#aa9a90]'>Add a room to manage its availability.</p></div>}
                </div>
            </section>
        </div>
    )
}

export default SetRoom
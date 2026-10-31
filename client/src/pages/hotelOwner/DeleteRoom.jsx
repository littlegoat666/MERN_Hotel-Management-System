import React, { useEffect, useState } from 'react'
import { BedDouble, ShieldAlert, Trash2, SearchCheck, AlertTriangle, RefreshCw } from 'lucide-react'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'

const DeleteRoom = () => {
    const { axios, getToken, user, currency } = useAppContext()
    const [rooms, setRooms] = useState([])
    const [selectedRoomId, setSelectedRoomId] = useState('')
    const [impact, setImpact] = useState(null)
    const [fetching, setFetching] = useState(true)
    const [checkingId, setCheckingId] = useState('')
    const [deleting, setDeleting] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState(false)

    const fetchRooms = async () => {
        setFetching(true)
        try {
            const { data } = await axios.get('/api/rooms/owner', { headers: { Authorization: `Bearer ${await getToken()}` } })
            if (data.success) setRooms(data.rooms || [])
            else toast.error(data.message || 'Unable to load rooms')
        } catch (error) {
            toast.error(error.response?.data?.message || error.message)
        } finally {
            setFetching(false)
        }
    }

    useEffect(() => { if (user) fetchRooms() }, [user])

    const checkBookingImpact = async (roomId) => {
        setSelectedRoomId(roomId)
        setImpact(null)
        setConfirmDelete(false)
        setCheckingId(roomId)
        try {
            const { data } = await axios.get(`/api/rooms/${roomId}/booking-impact`, { headers: { Authorization: `Bearer ${await getToken()}` } })
            if (data.success) setImpact(data)
            else toast.error(data.message || 'Unable to check booking impact')
        } catch (error) {
            toast.error(error.response?.data?.message || error.message)
        } finally {
            setCheckingId('')
        }
    }

    const handleDelete = async () => {
        if (!selectedRoomId || !impact || Number(impact.bookingCount) !== 0) return toast.error('This room has booking records and cannot be deleted')
        setDeleting(true)
        try {
            const { data } = await axios.delete(`/api/rooms/${selectedRoomId}`, { headers: { Authorization: `Bearer ${await getToken()}` } })
            if (!data.success) return toast.error(data.message || 'Unable to delete room')
            toast.success(data.message || 'Room deleted successfully')
            setSelectedRoomId('')
            setImpact(null)
            setConfirmDelete(false)
            await fetchRooms()
        } catch (error) {
            const errorData = error.response?.data
            toast.error(errorData?.message || error.message)
            if (errorData?.bookingCount !== undefined) setImpact(errorData)
        } finally {
            setDeleting(false)
        }
    }

    const selectedRoom = rooms.find((room) => room._id === selectedRoomId)

    return (
        <div className = 'space-y-6 font-mali text-[#302925]'>
            <section className = 'relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#493832] via-[#76564b] to-[#a27560] px-6 py-8 text-[#fffaf5] shadow-lg shadow-[#76564b]/10 md:px-9 md:py-10'>
                <div className = 'pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full border border-white/10' />
                <div className = 'pointer-events-none absolute -right-3 -top-8 h-52 w-52 rounded-full border border-white/10' />
                <div className = 'pointer-events-none absolute -bottom-24 right-1/4 h-64 w-64 rounded-full bg-[#d9a58e]/10 blur-3xl' />
                <div className = 'relative z-10 flex flex-wrap items-end justify-between gap-5'>
                    <div>
                        <h1 className = 'text-3xl font-semibold tracking-tight md:text-4xl'>Delete Room</h1>
                        <p className = 'mt-3 max-w-xl text-sm leading-7 text-[#f1e2d8]/80'>Review booking records and room history before permanently removing a listing.</p>
                    </div>
                </div>
            </section>

            <section className = 'w-full overflow-hidden rounded-3xl border border-[#e9ded5] bg-[#fffdfa] shadow-sm'>
                <div className = 'flex items-center gap-3 border-b border-[#eee5de] bg-[#faf5f0] px-5 py-4 sm:px-7'>
                    <span className = 'flex h-10 w-10 items-center justify-center rounded-xl bg-[#fbe8e4] text-[#c45e53]'><Trash2 size = {20} /></span>
                    <div><h2 className = 'font-semibold text-[#57463d]'>Room Removal Review</h2><p className = 'text-xs text-[#a09287]'>Check the booking impact before deleting</p></div>
                </div>

                <div className = 'p-5 sm:p-7'>
                    {fetching ? <div className = 'flex min-h-32 items-center justify-center'><RefreshCw size = {22} className = 'animate-spin text-[#b87962]' /></div> : rooms.length ? (
                        <div className = 'grid grid-cols-1 gap-3 md:grid-cols-2'>
                            {rooms.map((room) => (
                                <article key = {room._id} className = {`rounded-2xl border p-4 transition ${selectedRoomId === room._id ? 'border-[#c28b71] bg-[#fbf4ef] shadow-sm' : 'border-[#eee5de] bg-[#fcfaf7] hover:border-[#dfc9ba]'}`}>
                                    <div className = 'flex items-start justify-between gap-3'>
                                        <div className = 'flex min-w-0 items-center gap-3'><span className = 'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff0df] text-[#d58c32]'><BedDouble size = {19} /></span><div className = 'min-w-0'><h3 className = 'truncate font-semibold text-[#59483f]'>{room.roomType}</h3><p className = 'mt-1 text-xs text-[#9b897d]'>{currency} {Number(room.pricePerNight || 0).toLocaleString()} / night</p></div></div>
                                        <span className = {`rounded-full px-2.5 py-1 text-[10px] font-bold ${room.isAvailable ? 'bg-[#e5f1e7] text-[#4d8059]' : 'bg-[#f7e8e3] text-[#a45f50]'}`}>{room.isAvailable ? 'AVAILABLE' : 'CLOSED'}</span>
                                    </div>
                                    <button type = 'button' disabled = {Boolean(checkingId) || deleting} onClick = {() => checkBookingImpact(room._id)} className = 'mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#e6d7cc] bg-white px-4 py-2.5 text-xs font-semibold text-[#8e624e] transition hover:bg-[#f8eee7] disabled:opacity-50'><SearchCheck size = {16} />{checkingId === room._id ? 'Checking...' : 'Check Booking Impact'}</button>
                                </article>
                            ))}
                        </div>
                    ) : <div className = 'py-12 text-center'><BedDouble size = {30} className = 'mx-auto mb-3 text-[#c1afa2]' /><p className = 'font-semibold text-[#806d61]'>No rooms available</p></div>}

                    {selectedRoom && impact && (
                        <div className = 'mt-6 rounded-2xl border border-[#e9ded5] bg-white p-4 sm:p-5'>
                            <div className = 'flex flex-wrap items-center justify-between gap-3'><div><p className = 'text-[10px] font-bold tracking-[0.15em] text-[#a09287]'>BOOKING IMPACT</p><h3 className = 'mt-1 text-lg font-semibold text-[#59483f]'>{selectedRoom.roomType}</h3></div><span className = 'rounded-full bg-[#f4ede7] px-3 py-1.5 text-xs font-semibold text-[#8f6b58]'>{impact.bookingCount} stored booking records</span></div>

                            {Number(impact.bookingCount) > 0 ? (
                                <div className = 'mt-4 space-y-4'>
                                    <div className = 'flex gap-3 rounded-xl border border-[#efc9bd] bg-[#fcf0eb] p-4'><ShieldAlert size = {21} className = 'mt-0.5 shrink-0 text-[#b85d4e]' /><div><p className = 'font-semibold text-[#984c41]'>This room cannot be deleted.</p><p className = 'mt-1 text-xs leading-6 text-[#9a7068]'>Existing booking records reference this room. Deleting it could damage booking history. Set the room to unavailable in Set Room instead.</p></div></div>
                                    <div className = 'overflow-x-auto rounded-xl border border-[#eee5de]'><table className = 'w-full min-w-[620px] text-left text-xs'><thead className = 'bg-[#faf5f0] text-[#806f64]'><tr><th className = 'px-4 py-3'>Booking ID</th><th className = 'px-4 py-3'>Check-in</th><th className = 'px-4 py-3'>Check-out</th><th className = 'px-4 py-3'>Guests</th><th className = 'px-4 py-3'>Payment</th></tr></thead><tbody className = 'divide-y divide-[#f0e8e2]'>{(impact.bookings || []).map((booking) => <tr key = {booking._id}><td className = 'px-4 py-3 text-[#806f64]'>{booking._id}</td><td className = 'px-4 py-3'>{new Date(booking.checkInDate).toLocaleDateString('en-GB')}</td><td className = 'px-4 py-3'>{new Date(booking.checkOutDate).toLocaleDateString('en-GB')}</td><td className = 'px-4 py-3'>{booking.guests}</td><td className = 'px-4 py-3'>{booking.isPaid ? 'Paid' : 'Unpaid'}</td></tr>)}</tbody></table></div>
                                </div>
                            ) : (
                                <div className = 'mt-4 space-y-4'>
                                    <div className = 'flex gap-3 rounded-xl border border-[#e8dfc8] bg-[#fbf7e9] p-4'><AlertTriangle size = {20} className = 'mt-0.5 shrink-0 text-[#a8813d]' /><div><p className = 'font-semibold text-[#866b3d]'>No existing booking records found.</p><p className = 'mt-1 text-xs leading-6 text-[#9b8967]'>This room can be removed. The action permanently deletes the room listing from MongoDB.</p></div></div>
                                    {!confirmDelete ? <button type = 'button' onClick = {() => setConfirmDelete(true)} className = 'inline-flex items-center gap-2 rounded-xl bg-[#b85f52] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#984b41]'><Trash2 size = {16} /> Delete Room</button> : <div className = 'rounded-xl border border-[#efc9bd] bg-[#fcf6f2] p-4'><p className = 'font-semibold text-[#59483f]'>Confirm deletion of “{selectedRoom.roomType}”?</p><p className = 'mt-1 text-xs text-[#9b897d]'>This action cannot be undone.</p><div className = 'mt-4 flex flex-wrap gap-2'><button type = 'button' disabled = {deleting} onClick = {handleDelete} className = 'rounded-lg bg-[#b85f52] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#984b41] disabled:opacity-50'>{deleting ? 'Deleting...' : 'Confirm Delete'}</button><button type = 'button' disabled = {deleting} onClick = {() => setConfirmDelete(false)} className = 'rounded-lg border border-[#e3d7cc] bg-white px-5 py-2.5 text-xs font-semibold text-[#806f64]'>Cancel</button></div></div>}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}

export default DeleteRoom
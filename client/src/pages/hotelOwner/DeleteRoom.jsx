
import React, { useEffect, useState } from 'react'
import Title from '../../components/Title'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'

const DeleteRoom = () => {
    const { axios, getToken, user, currency } = useAppContext()

    const [ rooms, setRooms ] = useState([])
    const [ selectedRoomId, setSelectedRoomId ] = useState('')
    const [ impact, setImpact ] = useState(null)
    const [ fetching, setFetching ] = useState(false)
    const [ checkingId, setCheckingId ] = useState('')
    const [ deleting, setDeleting ] = useState(false)
    const [ confirmDelete, setConfirmDelete ] = useState(false)

    const fetchRooms = async () => {
        setFetching(true)

        try {
            const { data } = await axios.get('/api/rooms/owner', {
                headers: { Authorization: `Bearer ${await getToken()}` }
            })

            if (data.success) {
                setRooms(data.rooms || [])
            } else {
                toast.error(data.message)
            }
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

    const checkBookingImpact = async (roomId) => {
        setSelectedRoomId(roomId)
        setImpact(null)
        setConfirmDelete(false)
        setCheckingId(roomId)

        try {
            const { data } = await axios.get(`/api/rooms/${roomId}/booking-impact`, {
                headers: { Authorization: `Bearer ${await getToken()}` }
            })

            if (data.success) {
                setImpact(data)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message)
        } finally {
            setCheckingId('')
        }
    }

    const handleDelete = async () => {
        if (!selectedRoomId || !impact || impact.bookingCount !== 0) {
            toast.error('Check the booking impact before deleting a room')
            return
        }

        setDeleting(true)

        try {
            const { data } = await axios.delete(`/api/rooms/${selectedRoomId}`, {
                headers: { Authorization: `Bearer ${await getToken()}` }
            })

            if (data.success) {
                toast.success(data.message)
                setSelectedRoomId('')
                setImpact(null)
                setConfirmDelete(false)
                await fetchRooms()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            const errorData = error.response?.data

            toast.error(errorData?.message || error.message)

            if (errorData?.bookingCount !== undefined) {
                setImpact(errorData)
                setConfirmDelete(false)
            } else if (selectedRoomId) {
                await checkBookingImpact(selectedRoomId)
            }
        } finally {
            setDeleting(false)
        }
    }

    const selectedRoom = rooms.find(room => room._id === selectedRoomId)

    return (
        <div>
            <Title
                align = 'left'
                font = 'outfit'
                title = 'Delete Room'
                subTitle = 'Review the room and its booking history before removing a room listing.'
            />

            <div className = 'mt-8 w-full max-w-4xl'>
                <p className = 'text-gray-500 mb-3'>Room Listings</p>

                <div className = 'overflow-x-auto border border-gray-300 rounded-lg'>
                    <table className = 'w-full text-left'>
                        <thead className = 'bg-gray-50'>
                            <tr>
                                <th className = 'py-3 px-4 text-gray-800'>Room Name</th>
                                <th className = 'py-3 px-4 text-gray-800'>Price / Night</th>
                                <th className = 'py-3 px-4 text-gray-800 text-center'>Action</th>
                            </tr>
                        </thead>

                        <tbody className = 'text-sm'>
                            { rooms.map(room => (
                                <tr key = { room._id }>
                                    <td className = 'py-3 px-4 border-t border-gray-200 text-gray-700'>
                                        { room.roomType }
                                    </td>
                                    <td className = 'py-3 px-4 border-t border-gray-200 text-gray-700'>
                                        { currency } { room.pricePerNight }
                                    </td>
                                    <td className = 'py-3 px-4 border-t border-gray-200 text-center'>
                                        <button
                                            type = 'button'
                                            disabled = { checkingId !== '' || deleting }
                                            onClick = { () => checkBookingImpact(room._id) }
                                            className = 'bg-blue-50 text-blue-700 border border-blue-200 rounded px-3 py-2 disabled:opacity-50'
                                        >
                                            { checkingId === room._id ? 'Checking...' : 'Check Booking Impact' }
                                        </button>
                                    </td>
                                </tr>
                            )) }

                            { !fetching && rooms.length === 0 && (
                                <tr>
                                    <td colSpan = { 3 } className = 'py-6 px-4 text-center text-gray-500'>
                                        No rooms available to delete.
                                    </td>
                                </tr>
                            ) }
                        </tbody>
                    </table>
                </div>

                { fetching && <p className = 'text-gray-500 mt-3'>Loading rooms...</p> }

                { selectedRoom && impact && (
                    <div className = 'mt-6 border border-gray-300 rounded-lg p-5'>
                        <h2 className = 'text-lg text-gray-800 font-semibold'>
                            Booking Impact: { selectedRoom.roomType }
                        </h2>

                        <p className = 'text-gray-600 mt-2'>
                            Stored Booking Records: <strong>{ impact.bookingCount }</strong>
                        </p>

                        { impact.bookingCount > 0 ? (
                            <div className = 'mt-4'>
                                <div className = 'border border-red-200 bg-red-50 rounded p-4'>
                                    <p className = 'text-red-700 font-semibold'>This room cannot be deleted.</p>
                                    <p className = 'text-red-700 text-sm mt-1'>
                                        Existing Booking records reference this room. Deleting it could break booking history and room details.
                                        Set the room to unavailable in Room Availability instead.
                                    </p>
                                </div>

                                <div className = 'mt-4 overflow-x-auto'>
                                    <table className = 'w-full text-left text-sm'>
                                        <thead className = 'bg-gray-50'>
                                            <tr>
                                                <th className = 'py-2 px-3'>Booking ID</th>
                                                <th className = 'py-2 px-3'>Check-in</th>
                                                <th className = 'py-2 px-3'>Check-out</th>
                                                <th className = 'py-2 px-3'>Guests</th>
                                                <th className = 'py-2 px-3'>Payment</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            { (impact.bookings || []).map(booking => (
                                                <tr key = { booking._id }>
                                                    <td className = 'py-2 px-3 border-t border-gray-200'>
                                                        { booking._id }
                                                    </td>
                                                    <td className = 'py-2 px-3 border-t border-gray-200'>
                                                        { new Date(booking.checkInDate).toLocaleDateString('en-GB') }
                                                    </td>
                                                    <td className = 'py-2 px-3 border-t border-gray-200'>
                                                        { new Date(booking.checkOutDate).toLocaleDateString('en-GB') }
                                                    </td>
                                                    <td className = 'py-2 px-3 border-t border-gray-200'>
                                                        { booking.guests }
                                                    </td>
                                                    <td className = 'py-2 px-3 border-t border-gray-200'>
                                                        { booking.isPaid ? 'Paid' : 'Unpaid' }
                                                    </td>
                                                </tr>
                                            )) }
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className = 'mt-4'>
                                <p className = 'text-green-700'>
                                    No existing Booking records were found for this room.
                                </p>
                                <p className = 'text-gray-600 text-sm mt-1'>
                                    Deleting the room will permanently remove its room listing from MongoDB.
                                </p>

                                { !confirmDelete ? (
                                    <button
                                        type = 'button'
                                        onClick = { () => setConfirmDelete(true) }
                                        className = 'bg-red-600 text-white px-5 py-2 rounded mt-4'
                                    >
                                        Delete Room
                                    </button>
                                ) : (
                                    <div className = 'mt-4 border border-red-200 rounded p-4'>
                                        <p className = 'text-gray-800 font-semibold'>
                                            Confirm deletion of “{ selectedRoom.roomType }”?
                                        </p>
                                        <p className = 'text-gray-500 text-sm mt-1'>
                                            This action cannot be undone.
                                        </p>
                                        <div className = 'flex flex-wrap gap-3 mt-4'>
                                            <button
                                                type = 'button'
                                                disabled = { deleting }
                                                onClick = { handleDelete }
                                                className = 'bg-red-600 text-white px-5 py-2 rounded disabled:opacity-50'
                                            >
                                                { deleting ? 'Deleting...' : 'Confirm Delete' }
                                            </button>
                                            <button
                                                type = 'button'
                                                disabled = { deleting }
                                                onClick = { () => setConfirmDelete(false) }
                                                className = 'border border-gray-300 text-gray-700 px-5 py-2 rounded'
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) }
                            </div>
                        ) }
                    </div>
                ) }
            </div>
        </div>
    )
}

export default DeleteRoom
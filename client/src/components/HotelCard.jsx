import React from 'react'
import { Link } from 'react-router-dom'
import { assets } from '../assets/assets'
import { useAppContext } from '../context/AppContext'
import { ArrowUpRight, Star } from 'lucide-react'

const HotelCard = ({ room, index }) => {
    const { currency } = useAppContext()

    return (
        <Link to = { '/rooms/' + room._id } onClick = {() => scrollTo(0, 0)} key = { room._id } className = 'group relative flex w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[#E8DDD3] bg-white text-[#75665D] shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#725747]/10'>

            {/* Room Image */}
            <div className = 'relative flex h-52 items-center justify-center overflow-hidden bg-[#F5F0EA]'>
                <img src = { room.images[0] } alt = { room.roomType } className = 'h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.04]' />

                { index % 2 === 0 && (
                    <span className = 'absolute left-3 top-3 rounded-full border border-white/70 bg-[#FFFDFA]/95 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-[#A65F46] shadow-sm backdrop-blur'>
                        Best Booking
                    </span>
                )}

                <span className = 'absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-[#9A713B] shadow-sm'>
                    <Star size = {13} fill = '#E3B55B' stroke = '#E3B55B' />
                    4.5
                </span>
            </div>

            {/* Room Details */}
            <div className = 'flex flex-1 flex-col p-4'>
                <div className = 'flex items-start justify-between gap-2'>
                    <p className = 'min-w-0 font-mali text-xl font-semibold text-[#51443D] transition-colors group-hover:text-[#A65F46]'>
                        { room.roomType }
                    </p>
                </div>

                <div className = 'mt-2 flex items-start gap-2 text-xs leading-5 text-[#918077]'>
                    <img src = { assets.locationIcon } alt = 'location-icon' className = 'mt-0.5 h-4 w-4 shrink-0' />
                    <span>{ room.hotel.address }</span>
                </div>

                <div className = 'mt-5 flex items-center justify-between gap-2 border-t border-[#F0E5DC] pt-4'>
                    <p className = 'text-sm text-[#918077]'>
                        <span className = 'font-mali text-xl font-semibold text-[#A65F46]'>{ currency } { room.pricePerNight }</span>
                        <span className = 'ml-1 text-xs'>/ Night</span>
                    </p>

                    <span className = 'inline-flex shrink-0 items-center gap-1 rounded-full bg-[#F8EEE7] px-3 py-2 text-xs font-semibold text-[#A65F46] transition group-hover:bg-[#B96F4D] group-hover:text-white'>
                        Book Now
                        <ArrowUpRight size = {14} />
                    </span>
                </div>
            </div>
        </Link>
    )
}

export default HotelCard
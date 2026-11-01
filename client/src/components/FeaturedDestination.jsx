import React from 'react'
import HotelCard from './HotelCard'
import Title from './Title'
import { useAppContext } from '../context/AppContext'
import { ArrowRight, Sparkles } from 'lucide-react'

const FeaturedDestination = () => {

    const { rooms, navigate } = useAppContext();

    return rooms.length > 0 && (
        <section className = 'bg-[#FAF7F2] px-6 py-20 md:px-16 md:py-24 lg:px-24 xl:px-32'>
            <div className = 'mx-auto flex max-w-7xl flex-col items-center'>

                <div className = 'mb-3 flex items-center gap-2 rounded-full bg-[#F2E5DC] px-4 py-2 text-xs font-semibold tracking-wider text-[#A96F58]'>
                    <Sparkles size = {15} />
                    A PLACE TO STAY
                </div>

                <div className = '[&_h1]:!text-[#55443B] [&_h2]:!text-[#55443B] [&_p]:!text-[#8C7A70]'>
                    <Title title = 'Our Recommended Rooms' subTitle = 'Explore our top-rated rooms in popular stay' />
                </div>

                <div className = 'mt-10 grid w-full max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
                    { rooms.slice(0, 4).map((room, index) => (
                        <HotelCard key = {room._id} room = {room} index = {index}/>
                    ))}
                </div>

                <button onClick = {() => { navigate('/rooms'); scrollTo(0, 0) }} className = 'group mt-12 inline-flex items-center gap-3 rounded-full border border-[#D8C3B6] bg-[#FFFDFA] px-7 py-3 text-sm font-semibold text-[#A96F58] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#A96F58] hover:text-white hover:shadow-md cursor-pointer'>
                    View All Rooms
                    <ArrowRight size = {17} className = 'transition-transform group-hover:translate-x-1' />
                </button>
            </div>
        </section>
    )
}

export default FeaturedDestination
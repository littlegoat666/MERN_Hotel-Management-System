import React from 'react'
import { Link } from 'react-router-dom'

const offers = [
    {
        number: '01',
        category: 'CITY BREAK',
        title: 'Old City Discovery',
        subtitle: 'A few days to find your Chiang Mai favourites.',
        description: 'A sample short-stay idea for travellers who want time for historic sights, neighbourhood cafés, and unhurried walks through the Old City.',
        image: 'https://images.unsplash.com/photo-1765833733487-0d72eeaaf8a6?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=1400',
        imageAlt: 'Historic temple architecture in Chiang Mai',
        details: ['Choose dates that leave room to explore', 'Compare available room types before booking', 'Keep a flexible plan for local discoveries'],
    },
    {
        number: '02',
        category: 'LONG WEEKEND',
        title: 'Slow Days in Chiang Mai',
        subtitle: 'Stay curious, without filling every hour.',
        description: 'A sample long-weekend theme built around relaxed mornings, local food, and a mix of well-known landmarks and quieter streets.',
        image: 'https://www.weseektravel.com/wp-content/uploads/2024/03/cafe-chiang-mai-old-city-1-1024x667.jpg',
        imageAlt: 'A relaxed cafe courtyard in Chiang Mai Old City',
        details: ['Make a short list of must-see places', 'Leave time for cafés and markets', 'Check your exact check-in and check-out dates'],
    },
    {
        number: '03',
        category: 'PLAN AHEAD',
        title: 'Your Next Northern Escape',
        subtitle: 'Start with the room, then shape the trip.',
        description: 'An illustrative planning concept for guests who prefer to organise their trip early and choose a room that suits the size of their group.',
        image: 'https://images.trvl-media.com/lodging/9000000/8420000/8419900/8419876/b13e65d4.jpg?h=800&impolicy=fcrop&quality=medium&w=1200',
        imageAlt: 'Bright hotel bedroom with a city view',
        details: ['Review room capacity and listed amenities', 'Confirm the total for your selected dates', 'Keep your booking details available before arrival'],
    },
    {
        number: '04',
        category: 'A LITTLE EXTRA TIME',
        title: 'Make a Day of It',
        subtitle: 'One more walk. One more local favourite.',
        description: 'A sample itinerary idea for visitors who like to explore slowly, discover nearby food spots, and build a trip around their own interests.',
        image: 'https://chiangmaibrief.com/images/featured/chiang-mai-street-in-early-cool-season-with-clear-.webp',
        imageAlt: 'A relaxed street-side cafe scene in Chiang Mai',
        details: ['Explore the Phra Sing neighbourhood', 'Use the map to plan your route', 'Check local opening times before setting out'],
    },
]

const Offers = () => {
    return (
        <main data-bupatara-visuals = 'v2' className = 'min-h-[70vh] bg-white text-gray-800'>
            <section className = 'bg-gradient-to-br from-blue-50 via-white to-emerald-50 px-6 pb-16 pt-32 md:px-16 md:pb-20 md:pt-40 lg:px-24 xl:px-32'>
                <div className = 'mx-auto max-w-6xl'>
                    <p className = 'text-xs font-semibold uppercase tracking-[0.22em] text-blue-600 md:text-sm'>Bupatara Chiangmai · Stay ideas</p>
                    <div className = 'mt-4 grid gap-8 md:grid-cols-[1fr_0.7fr] md:items-end'>
                        <div>
                            <h1 className = 'max-w-3xl font-mali text-4xl leading-tight md:text-5xl lg:text-6xl'>A little inspiration for your next stay.</h1>
                            <p className = 'mt-6 max-w-2xl text-base leading-8 text-gray-600 md:text-lg'>Explore sample offer concepts inspired by Chiang Mai’s Old City. Pick a travel mood, browse the rooms, and build a stay around the places you want to discover.</p>
                        </div>
                        <div className = 'space-y-4'>
                            <div data-bupatara-visuals = 'v2' className = 'group relative h-56 overflow-hidden rounded-2xl shadow-md md:h-64'>
                                <img src = 'https://images.unsplash.com/photo-1765833733487-0d72eeaaf8a6?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=1400' alt = 'Historic temple spires in Chiang Mai' loading = 'lazy' className = 'h-full w-full object-cover transition duration-500 group-hover:scale-105' />
                                <div className = 'absolute inset-0 bg-gradient-to-t from-gray-950/70 via-transparent to-transparent' />
                                <p className = 'absolute bottom-4 left-5 font-mali text-xl text-white'>A little inspiration, close to the Old City</p>
                            </div>
                            <div className = 'rounded-2xl border border-blue-100 bg-white/90 p-5 shadow-sm md:p-6'>
                                <p className = 'text-sm font-semibold text-gray-800'>A quick note</p>
                                <p className = 'mt-2 text-sm leading-6 text-gray-500'>The cards below are illustrative website content, not live discount codes or confirmed promotions. Prices and availability are shown only through the room and booking flow.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className = 'px-6 py-14 md:px-16 md:py-20 lg:px-24 xl:px-32'>
                <div className = 'mx-auto max-w-6xl'>
                    <div className = 'mb-9 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
                        <div>
                            <p className = 'text-xs font-semibold uppercase tracking-[0.2em] text-blue-600'>Choose your mood</p>
                            <h2 className = 'mt-3 font-mali text-3xl md:text-4xl'>Stay ideas, made for exploring.</h2>
                        </div>
                        <Link to = '/rooms' className = 'text-sm font-semibold text-blue-600 transition hover:text-blue-800'>View available rooms →</Link>
                    </div>

                    <div className = 'grid gap-6 md:grid-cols-2'>
                        { offers.map((offer) => (
                            <article key = { offer.number } className = 'group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md'>
                                <div className = 'h-56 overflow-hidden md:h-64'>
                                    <img src = { offer.image } alt = { offer.imageAlt } loading = 'lazy' className = 'h-full w-full object-cover transition duration-500 group-hover:scale-105' />
                                </div>
                                <div className = 'flex flex-1 flex-col p-6 md:p-8'>
                                    <div className = 'flex items-center justify-between gap-4'>
                                        <span className = 'rounded-full bg-blue-50 px-3 py-1.5 text-[11px] font-semibold tracking-[0.16em] text-blue-700'>{ offer.category }</span>
                                        <span className = 'font-mali text-sm text-gray-300'>{ offer.number }</span>
                                    </div>
                                    <h3 className = 'mt-5 font-mali text-2xl md:text-3xl'>{ offer.title }</h3>
                                    <p className = 'mt-2 text-sm font-medium text-gray-600'>{ offer.subtitle }</p>
                                    <p className = 'mt-4 text-sm leading-7 text-gray-500'>{ offer.description }</p>
                                    <ul className = 'mt-5 space-y-3 border-t border-slate-100 pt-5'>
                                        { offer.details.map((detail) => <li key = { detail } className = 'flex gap-3 text-sm leading-6 text-gray-600'><span className = 'mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500' />{ detail }</li>) }
                                    </ul>
                                    <div className = 'mt-auto pt-7'>
                                        <Link to = '/rooms' className = 'inline-flex rounded-full border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:border-blue-600 hover:text-blue-600'>Explore Rooms</Link>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className = 'bg-slate-50 px-6 py-14 md:px-16 md:py-20 lg:px-24 xl:px-32'>
                <div className = 'mx-auto grid max-w-6xl items-center gap-8 overflow-hidden rounded-3xl bg-white shadow-sm md:grid-cols-2'>
                    <div className = 'p-7 md:p-10 lg:p-12'>
                        <p className = 'text-xs font-semibold uppercase tracking-[0.2em] text-blue-600'>Plan with confidence</p>
                        <h2 className = 'mt-3 font-mali text-3xl md:text-4xl'>Your dates make the difference.</h2>
                        <p className = 'mt-4 leading-7 text-gray-500'>Choose your check-in and check-out dates, compare the rooms currently listed, and review your booking details before you confirm.</p>
                        <Link to = '/rooms' className = 'mt-7 inline-flex rounded-full bg-gray-900 px-7 py-3 text-sm font-medium text-white transition hover:bg-blue-600'>Check Rooms</Link>
                    </div>
                    <div className = 'h-64 overflow-hidden md:h-full md:min-h-[320px]'>
                        <img src = 'https://www.weseektravel.com/wp-content/uploads/2024/03/cafe-chiang-mai-old-city-1-1024x667.jpg' alt = 'Outdoor cafe with greenery in Chiang Mai Old City' loading = 'lazy' className = 'h-full w-full object-cover' />
                    </div>
                </div>
            </section>
        </main>
    )
}

export default Offers
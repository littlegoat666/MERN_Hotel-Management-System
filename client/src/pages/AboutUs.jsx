import React from 'react'
import { Link } from 'react-router-dom'

const values = [
    { number: '01', title: 'A well-placed base', description: 'Set in Chiang Mai’s Phra Sing area, Bupatara gives travellers a practical starting point for exploring the Old City, nearby temples, local food, and everyday neighbourhood life.', image: 'https://www.momondo.com/rimg/himg/85/bd/0d/expedia_group-616838-150293966-178019.jpg?crop=true&height=607&width=968', imageAlt: 'Bupatara hotel reception and lobby' },
    { number: '02', title: 'Comfort without the fuss', description: 'Choose from the room options shown on our Rooms page, compare the listed facilities, and review your dates before confirming a stay.', image: 'https://images.trvl-media.com/lodging/9000000/8420000/8419900/8419876/b13e65d4.jpg?h=800&impolicy=fcrop&quality=medium&w=1200', imageAlt: 'Bright hotel bedroom with a city view' },
    { number: '03', title: 'Make the day your own', description: 'Spend the morning discovering historic lanes, pause for a local coffee, and leave room in the afternoon for markets, cafés, or simply taking things slowly.', image: 'https://images.unsplash.com/photo-1765833733487-0d72eeaaf8a6?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=1400', imageAlt: 'Historic temple architecture in Chiang Mai' },
]

const nearbyIdeas = [
    { title: 'Historic Chiang Mai', description: 'Explore the temples, old walls, and stories that give the Old City its distinctive character.', image: 'https://images.unsplash.com/photo-1765833733487-0d72eeaaf8a6?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=1400', imageAlt: 'Historic temple spires in Chiang Mai' },
    { title: 'Local flavours', description: 'Look out for northern Thai dishes, small cafés, fresh fruit, and neighbourhood restaurants around the city.', image: 'https://www.weseektravel.com/wp-content/uploads/2024/03/cafe-chiang-mai-old-city-1-1024x667.jpg', imageAlt: 'A relaxed cafe courtyard in Chiang Mai Old City' },
    { title: 'Walkable discoveries', description: 'Build your own route through market streets, craft shops, and quiet lanes, with time to stop along the way.', image: 'https://chiangmaibrief.com/images/featured/chiang-mai-street-in-early-cool-season-with-clear-.webp', imageAlt: 'A street-side cafe scene in Chiang Mai' },
]

const AboutUs = () => {
    return (
        <main data-bupatara-visuals = 'v2' className = 'min-h-[70vh] bg-white text-gray-800'>
            <section className = 'relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50 px-6 pb-16 pt-32 md:px-16 md:pb-24 md:pt-40 lg:px-24 xl:px-32'>
                <div className = 'mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]'>
                    <div>
                        <p className = 'text-xs font-semibold uppercase tracking-[0.22em] text-blue-600 md:text-sm'>Bupatara Chiangmai · Chiang Mai, Thailand</p>
                        <h1 className = 'mt-5 max-w-3xl font-mali text-4xl leading-tight md:text-5xl lg:text-6xl'>A comfortable base for discovering the Old City.</h1>
                        <p className = 'mt-6 max-w-2xl text-base leading-8 text-gray-600 md:text-lg'>Welcome to Bupatara Chiangmai, a place to pause between city adventures. Located on Phra Pok Klao Road Soi 4 in the Phra Sing neighbourhood, the hotel puts you in a useful position for exploring Chiang Mai at your own pace.</p>
                        <div className = 'mt-8 flex flex-wrap gap-3'>
                            <Link to = '/rooms' className = 'rounded-full bg-blue-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-700'>Explore Rooms</Link>

                        </div>
                    </div>
                    <div data-bupatara-visuals = 'v2' className = 'group relative min-h-[340px] overflow-hidden rounded-3xl shadow-lg md:min-h-[470px]'>
                        <img src = 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/611716159.jpg?k=e637a02e71e57efad7f41deec8eb11b9a6318fd85f85b140ba03bb4e0f4c9b82&o=' alt = 'Exterior of Hotel O Bupatara Chiangmai' loading = 'lazy' className = 'absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105' />
                        <div className = 'absolute inset-0 bg-gradient-to-t from-gray-950/80 via-gray-900/15 to-transparent' />
                        <div className = 'absolute inset-x-0 bottom-0 p-6 text-white md:p-8'>
                            <p className = 'text-xs font-semibold uppercase tracking-[0.2em] text-white/80'>The Bupatara point of view</p>
                            <p className = 'mt-3 max-w-lg font-mali text-2xl leading-relaxed md:text-3xl'>“See more of Chiang Mai. Leave a little room for the unexpected.”</p>
                            <p className = 'mt-3 max-w-lg text-sm leading-6 text-white/80'>A starting point for days filled with old-city walks, local flavours, and discoveries of your own.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className = 'px-6 py-16 md:px-16 md:py-20 lg:px-24 xl:px-32'>
                <div className = 'mx-auto max-w-6xl'>
                    <div className = 'max-w-3xl'>
                        <p className = 'text-xs font-semibold uppercase tracking-[0.2em] text-blue-600'>Our approach</p>
                        <h2 className = 'mt-3 font-mali text-3xl md:text-4xl'>A neighbourhood stay, with space to explore.</h2>
                        <p className = 'mt-5 leading-8 text-gray-600'>Chiang Mai is best enjoyed with a little flexibility. Start with the places you have been dreaming of, then let the cafés, food stalls, and smaller streets you find along the way become part of the trip. This page uses the hotel’s location as its starting point and offers a few ideas for planning your visit.</p>
                    </div>
                    <div className = 'mt-10 grid gap-5 md:grid-cols-3'>
                        { values.map((item) => (
                            <article key = { item.number } className = 'group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-md'>
                                <div className = 'h-48 overflow-hidden md:h-52'>
                                    <img src = { item.image } alt = { item.imageAlt } loading = 'lazy' className = 'h-full w-full object-cover transition duration-500 group-hover:scale-105' />
                                </div>
                                <div className = 'p-6 md:p-7'>
                                    <span className = 'text-sm font-semibold tracking-widest text-blue-600'>{ item.number }</span>
                                    <h3 className = 'mt-4 font-mali text-xl'>{ item.title }</h3>
                                    <p className = 'mt-3 text-sm leading-7 text-gray-500'>{ item.description }</p>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className = 'bg-slate-50 px-6 py-16 md:px-16 md:py-20 lg:px-24 xl:px-32'>
                <div className = 'mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr]'>
                    <div>
                        <p className = 'text-xs font-semibold uppercase tracking-[0.2em] text-blue-600'>Beyond the room</p>
                        <h2 className = 'mt-3 font-mali text-3xl md:text-4xl'>Make Chiang Mai part of the stay.</h2>
                        <p className = 'mt-5 leading-8 text-gray-600'>Use these ideas as a starting point, then plan around your own interests, weather, and pace.</p>
                    </div>
                    <div className = 'grid gap-5 sm:grid-cols-2 xl:grid-cols-3'>
                        { nearbyIdeas.map((item) => (
                            <article key = { item.title } className = 'group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md'>
                                <div className = 'h-44 overflow-hidden'>
                                    <img src = { item.image } alt = { item.imageAlt } loading = 'lazy' className = 'h-full w-full object-cover transition duration-500 group-hover:scale-105' />
                                </div>
                                <div className = 'p-5 md:p-6'>
                                    <h3 className = 'font-mali text-lg'>{ item.title }</h3>
                                    <p className = 'mt-2 text-sm leading-7 text-gray-500'>{ item.description }</p>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className = 'px-6 py-16 md:px-16 md:py-20 lg:px-24 xl:px-32'>
                <div className = 'mx-auto grid max-w-6xl items-center gap-8 overflow-hidden rounded-3xl bg-slate-50 md:grid-cols-2'>
                    <div className = 'p-7 md:p-10 lg:p-12'>
                        <p className = 'text-xs font-semibold uppercase tracking-[0.2em] text-blue-600'>Your Chiang Mai stay</p>
                        <h2 className = 'mt-3 font-mali text-3xl md:text-4xl'>Find a room that fits your plans.</h2>
                        <p className = 'mt-4 leading-7 text-gray-500'>Compare available room types, nightly rates, and the amenities listed for each room before booking.</p>
                        <Link to = '/rooms' className = 'mt-7 inline-flex rounded-full bg-gray-900 px-7 py-3 text-sm font-medium text-white transition hover:bg-blue-600'>Browse Rooms</Link>
                    </div>
                    <div className = 'h-64 overflow-hidden md:h-full md:min-h-[320px]'>
                        <img src = 'https://images.trvl-media.com/lodging/9000000/8420000/8419900/8419876/b13e65d4.jpg?h=800&impolicy=fcrop&quality=medium&w=1200' alt = 'Bright hotel room with a balcony view' loading = 'lazy' className = 'h-full w-full object-cover' />
                    </div>
                </div>
            </section>
        </main>
    )
}

export default AboutUs
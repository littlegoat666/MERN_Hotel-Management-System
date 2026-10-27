
import React from 'react'

const mapUrl = 'https://maps.google.com/maps?q=Hotel%20O%20Bupatara%20Chiangmai%2C%2012%2F1%20Phra%20Pok%20Klao%20Road%20Soi%204%2C%20Phra%20Sing%2C%20Chiang%20Mai%2050200%2C%20Thailand&z=16&output=embed'

const directionsUrl = 'https://www.google.com/maps/search/?api=1&query=Hotel%20O%20Bupatara%20Chiangmai%2C%2012%2F1%20Phra%20Pok%20Klao%20Road%20Soi%204%2C%20Chiang%20Mai%2050200%2C%20Thailand'

const HotelLocation = () => {
    return (
        <section className = 'w-full bg-slate-50 px-6 md:px-16 lg:px-24 xl:px-32 py-16 md:py-20'>
            <div className = 'max-w-6xl mx-auto'>
                <div className = 'text-center mb-10'>
                    <p className = 'text-sm font-medium uppercase tracking-widest text-blue-600'>Visit Bupatara</p>
                    <h2 className = 'font-mali text-3xl md:text-4xl text-gray-800 mt-3'>Find Us in Chiang Mai</h2>
                    <p className = 'text-gray-500 text-sm md:text-base mt-4 max-w-2xl mx-auto'>
                        Discover our location in Chiang Mai's Old City and plan your visit with ease.
                    </p>
                </div>

                <div className = 'grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6 items-stretch'>
                    <div className = 'overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'>
                        <iframe
                            title = 'Bupatara Chiangmai location on Google Maps'
                            src = { mapUrl }
                            className = 'block w-full h-[320px] md:h-[420px]'
                            loading = 'lazy'
                            allowFullScreen
                            referrerPolicy = 'strict-origin-when-cross-origin'
                        />
                    </div>

                    <div className = 'flex flex-col justify-center rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm'>
                        <p className = 'text-sm uppercase tracking-widest text-blue-600'>Our Location</p>
                        <h3 className = 'font-mali text-2xl text-gray-800 mt-3'>Bupatara Chiangmai</h3>
                        <p className = 'text-gray-500 leading-7 mt-4'>
                            12/1 Phra Pok Klao Road, Soi 4, Phra Sing, Mueang Chiang Mai, Chiang Mai 50200, Thailand
                        </p>

                        <a
                            href = { directionsUrl }
                            target = '_blank'
                            rel = 'noopener noreferrer'
                            className = 'inline-flex items-center justify-center mt-6 rounded-lg bg-blue-600 px-5 py-3 text-sm text-white hover:bg-blue-700 transition-colors'
                        >
                            Get Directions
                        </a>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default HotelLocation
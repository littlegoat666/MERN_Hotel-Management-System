import React from 'react'

const mapUrl = 'https://maps.google.com/maps?q=Hotel%20O%20Bupatara%20Chiangmai%2C%2012%2F1%20Phra%20Pok%20Klao%20Road%20Soi%204%2C%20Phra%20Sing%2C%20Chiang%20Mai%2050200%2C%20Thailand&z=16&output=embed'
const directionsUrl = 'https://www.google.com/maps/search/?api=1&query=Hotel%20O%20Bupatara%20Chiangmai%2C%2012%2F1%20Phra%20Pok%20Klao%20Road%20Soi%204%2C%20Phra%20Sing%2C%20Chiang%20Mai%2050200%2C%20Thailand'

const HotelLocation = () => {
    return (
        <section id = 'contact' className = 'w-full scroll-mt-24 bg-slate-50 px-6 py-16 md:px-16 md:py-20 lg:px-24 xl:px-32'>
            <div className = 'mx-auto max-w-6xl'>
                <div className = 'mb-10 text-center'>
                    <p className = 'text-sm font-medium uppercase tracking-[0.18em] text-blue-600'>Visit Bupatara</p>
                    <h2 className = 'mt-3 font-mali text-3xl text-gray-800 md:text-4xl'>Find Us in Chiang Mai</h2>
                    <p className = 'mx-auto mt-4 max-w-2xl text-sm text-gray-500 md:text-base'>Use the map to plan your visit, or contact the property before you travel.</p>
                </div>

                <div className = 'grid grid-cols-1 items-stretch gap-6 lg:grid-cols-[1.5fr_1fr]'>
                    <div className = 'overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'>
                        <iframe title = 'Bupatara Chiangmai location on Google Maps' src = { mapUrl } className = 'block h-[320px] w-full md:h-[420px]' loading = 'lazy' allowFullScreen referrerPolicy = 'strict-origin-when-cross-origin' />
                    </div>

                    <div className = 'flex flex-col justify-center rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8'>
                        <p className = 'text-sm uppercase tracking-[0.18em] text-blue-600'>Contact & Directions</p>
                        <h3 className = 'mt-3 font-mali text-2xl text-gray-800'>Bupatara Chiangmai</h3>
                        <p className = 'mt-4 leading-7 text-gray-500'>12/1 Phra Pok Klao Road, Soi 4, Phra Sing, Mueang Chiang Mai, Chiang Mai 50200, Thailand</p>
                        <div className = 'mt-5 border-t border-slate-100 pt-5'>
                            <p className = 'text-xs font-semibold uppercase tracking-wider text-gray-400'>Telephone listing</p>
                            <a href = 'tel:+6653814679' className = 'mt-1 inline-block text-gray-700 transition hover:text-blue-600'>+66 53 814 679</a>
                        </div>
                        <a href = { directionsUrl } target = '_blank' rel = 'noopener noreferrer' className = 'mt-6 inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-3 text-sm text-white transition-colors hover:bg-blue-700'>Get Directions</a>
                        <p className = 'mt-3 text-xs leading-5 text-gray-400'>Contact details may change; please verify the current number with the property before travelling.</p>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default HotelLocation
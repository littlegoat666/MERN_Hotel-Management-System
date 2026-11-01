import React from 'react'
import { MapPin, Phone, ExternalLink, Navigation } from 'lucide-react'

const mapUrl = 'https://maps.google.com/maps?q=Hotel%20O%20Bupatara%20Chiangmai%2C%2012%2F1%20Phra%20Pok%20Klao%20Road%20Soi%204%2C%20Phra%20Sing%2C%20Chiang%20Mai%2050200%2C%20Thailand&z=16&output=embed'
const directionsUrl = 'https://www.google.com/maps/search/?api=1&query=Hotel%20O%20Bupatara%20Chiangmai%2C%2012%2F1%20Phra%20Pok%20Klao%20Road%20Soi%204%2C%20Phra%20Sing%2C%20Chiang%20Mai%2050200%2C%20Thailand'

const HotelLocation = () => {
    return (
        <section id = 'contact' className = 'w-full scroll-mt-24 bg-[#F2E9E1] px-6 py-20 md:px-16 md:py-24 lg:px-24 xl:px-32'>
            <div className = 'mx-auto max-w-7xl'>

                <div className = 'mb-10 text-center'>
                    <p className = 'inline-flex items-center gap-2 rounded-full bg-[#EAD8CA] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#A65F46]'>
                        <MapPin size = {14} />
                        Visit Bupatara
                    </p>

                    <h2 className = 'mt-4 font-mali text-3xl text-[#51443D] md:text-4xl'>
                        Find Us in Chiang Mai
                    </h2>

                    <p className = 'mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#918077] md:text-base'>
                        Use the map to plan your visit, or contact the property before you travel.
                    </p>
                </div>

                <div className = 'grid grid-cols-1 items-stretch gap-6 lg:grid-cols-[1.5fr_1fr]'>

                    {/* Google Maps */}
                    <div className = 'overflow-hidden rounded-[24px] border-[5px] border-white bg-white shadow-lg shadow-[#725747]/10'>
                        <iframe title = 'Bupatara Chiangmai location on Google Maps' src = { mapUrl } className = 'block h-[320px] w-full md:h-[420px]' loading = 'lazy' allowFullScreen referrerPolicy = 'strict-origin-when-cross-origin' />
                    </div>

                    {/* Contact Details */}
                    <div className = 'flex flex-col justify-center rounded-[24px] border border-[#E8DDD3] bg-[#FFFDFA] p-6 shadow-sm md:p-8'>
                        <p className = 'text-xs font-semibold uppercase tracking-[0.18em] text-[#A65F46]'>
                            Contact & Directions
                        </p>

                        <h3 className = 'mt-3 font-mali text-2xl text-[#51443D]'>
                            Bupatara Chiangmai
                        </h3>

                        <div className = 'mt-6 flex items-start gap-3'>
                            <span className = 'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F5EAE1] text-[#B96F4D]'>
                                <MapPin size = {19} />
                            </span>

                            <p className = 'pt-1 text-sm leading-7 text-[#817168]'>
                                12/1 Phra Pok Klao Road, Soi 4, Phra Sing, Mueang Chiang Mai, Chiang Mai 50200, Thailand
                            </p>
                        </div>

                        <div className = 'mt-5 flex items-center gap-3 border-t border-[#F0E5DC] pt-5'>
                            <span className = 'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF4EC] text-[#668F70]'>
                                <Phone size = {18} />
                            </span>

                            <div>
                                <p className = 'text-xs font-semibold uppercase tracking-wider text-[#A18473]'>
                                    Telephone listing
                                </p>
                                <a href = 'tel:+6653814679' className = 'mt-1 inline-block text-sm font-medium text-[#51443D] transition hover:text-[#A65F46]'>
                                    +66 53 814 679
                                </a>
                            </div>
                        </div>

                        <a href = { directionsUrl } target = '_blank' rel = 'noopener noreferrer' className = 'mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-[#B96F4D] px-5 py-3 text-sm font-semibold text-white shadow-md shadow-[#B96F4D]/15 transition hover:-translate-y-0.5 hover:bg-[#9F5B40]'>
                            <Navigation size = {17} />
                            Get Directions
                            <ExternalLink size = {14} />
                        </a>

                        <p className = 'mt-4 text-xs leading-5 text-[#AA9B90]'>
                            Contact details may change; please verify the current number with the property before travelling.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default HotelLocation
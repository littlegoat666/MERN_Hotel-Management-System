import React from 'react'
import { Link } from 'react-router-dom'
import { assets } from '../assets/assets'

const Footer = () => {
    return (
        <footer className = 'mt-16 border-t border-[#E7DAD0] bg-[#F5EEE7] text-[#8C7A70] md:mt-24'>
            <div className = 'mx-auto max-w-[1440px] px-6 pt-12 pb-6 md:px-16 md:pt-14 lg:px-24 xl:px-32'>

                <div className = 'grid grid-cols-1 gap-10 sm:grid-cols-2 xl:grid-cols-[1.45fr_0.75fr_0.9fr_1.25fr] xl:gap-12'>

                    {/* HOTEL INFORMATION */}
                    <div className = 'max-w-sm'>
                        <div className = 'mb-5 inline-flex items-center gap-2 rounded-full border border-[#E7DAD0] bg-[#FAF7F2] px-3 py-1.5'>
                            <span className = 'h-1.5 w-1.5 rounded-full bg-[#A96F58]' />
                            <span className = 'text-[10px] font-semibold tracking-[0.18em] text-[#A96F58]'>
                                BUPATARA CHIANGMAI
                            </span>
                        </div>

                        <img src = { assets.logo } alt = 'Bupatara Chiangmai' className = 'mb-4 h-8 object-contain opacity-90 md:h-9' />

                        <p className = 'text-sm leading-7 text-[#8C7A70]'>
                            Bupatara Chiangmai is located in Chiang Mai's Old City, near Chiang Mai Gate, Wat Chedi Luang, and local walking streets. Review your room details and booking conditions before arrival.
                        </p>

                        <div className = 'mt-5 flex items-center gap-2.5'>
                            <div className = 'flex h-10 w-10 items-center justify-center rounded-full border border-[#E7DAD0] bg-[#FAF7F2] transition-colors hover:bg-[#F2E5DC]'>
                                <img src = { assets.instagramIcon } alt = 'Instagram' className = 'w-5' />
                            </div>

                            <div className = 'flex h-10 w-10 items-center justify-center rounded-full border border-[#E7DAD0] bg-[#FAF7F2] transition-colors hover:bg-[#F2E5DC]'>
                                <img src = { assets.facebookIcon } alt = 'Facebook' className = 'w-5' />
                            </div>

                            <div className = 'flex h-10 w-10 items-center justify-center rounded-full border border-[#E7DAD0] bg-[#FAF7F2] transition-colors hover:bg-[#F2E5DC]'>
                                <img src = { assets.gmailIcon } alt = 'Email' className = 'w-5' />
                            </div>

                            <div className = 'flex h-10 w-10 items-center justify-center rounded-full border border-[#E7DAD0] bg-[#FAF7F2] transition-colors hover:bg-[#F2E5DC]'>
                                <img src = { assets.phoneCallIcon } alt = 'Telephone' className = 'w-5' />
                            </div>
                        </div>
                    </div>

                    {/* COMPANY */}
                    <div className = 'pt-1'>
                        <p className = 'font-mali text-sm font-semibold tracking-[0.15em] text-[#55443B]'>
                            COMPANY
                        </p>

                        <div className = 'mt-3 mb-5 h-0.5 w-8 rounded-full bg-[#A96F58]' />

                        <ul className = 'flex flex-col gap-3 text-sm'>
                            <li><Link to = '/about' className = 'transition-colors hover:text-[#A96F58]'>About Us</Link></li>
                            <li><Link to = '/rooms' className = 'transition-colors hover:text-[#A96F58]'>Rooms</Link></li>
                            <li><Link to = '/offers' className = 'transition-colors hover:text-[#A96F58]'>Offers</Link></li>
                            <li><Link to = '/gallery' className = 'transition-colors hover:text-[#A96F58]'>Gallery</Link></li>
                            <li><Link to = '/' className = 'transition-colors hover:text-[#A96F58]'>Home</Link></li>
                        </ul>
                    </div>

                    {/* SUPPORT */}
                    <div className = 'pt-1'>
                        <p className = 'font-mali text-sm font-semibold tracking-[0.15em] text-[#55443B]'>
                            SUPPORT
                        </p>

                        <div className = 'mt-3 mb-5 h-0.5 w-8 rounded-full bg-[#A96F58]' />

                        <ul className = 'flex flex-col gap-3 text-sm'>
                            <li><Link to = '/my-bookings' className = 'transition-colors hover:text-[#A96F58]'>My Bookings</Link></li>
                            <li><Link to = '/rooms' className = 'transition-colors hover:text-[#A96F58]'>Room Information</Link></li>
                            <li><Link to = '/my-bookings' className = 'transition-colors hover:text-[#A96F58]'>Booking Details</Link></li>
                            <li><a href = '/#contact' className = 'transition-colors hover:text-[#A96F58]'>Contact &amp; Directions</a></li>
                            <li><Link to = '/about' className = 'transition-colors hover:text-[#A96F58]'>About the Hotel</Link></li>
                        </ul>
                    </div>

                    {/* NEWSLETTER */}
                    <div className = 'pt-1'>
                        <p className = 'font-mali text-sm font-semibold tracking-[0.15em] text-[#55443B]'>
                            STAY UPDATED
                        </p>

                        <div className = 'mt-3 mb-5 h-0.5 w-8 rounded-full bg-[#A96F58]' />

                        <p className = 'text-sm leading-7 text-[#8C7A70]'>
                            Subscribe to our newsletter for inspiration and exclusive offers.
                        </p>

                        <div className = 'mt-5 flex max-w-sm items-center rounded-xl border border-[#E7DAD0] bg-[#FAF7F2] p-1.5 shadow-sm'>
                            <input
                                type = 'text'
                                className = 'h-10 min-w-0 flex-1 bg-transparent px-3 text-sm text-[#55443B] outline-none placeholder:text-[#B2A39A]'
                                placeholder = 'Your email'
                            />

                            <button className = 'flex h-10 w-11 shrink-0 items-center justify-center rounded-lg bg-[#A96F58] transition-colors hover:bg-[#8F5946]'>
                                <img src = { assets.arrowIcon } alt = 'Subscribe' className = 'w-3.5 brightness-0 invert' />
                            </button>
                        </div>
                    </div>

                </div>

                {/* BOTTOM FOOTER */}
                <div className = 'mt-12 border-t border-[#E7DAD0] pt-5'>
                    <div className = 'flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left'>
                        <p className = 'text-xs text-[#8C7A70]'>
                            © { new Date().getFullYear() } Bupatara. All rights reserved.
                        </p>

                        <ul className = 'flex items-center gap-5 text-xs'>
                            <li><a href = '#' className = 'transition-colors hover:text-[#A96F58]'>Privacy</a></li>
                            <li><a href = '#' className = 'transition-colors hover:text-[#A96F58]'>Terms</a></li>
                            <li><a href = '#' className = 'transition-colors hover:text-[#A96F58]'>Sitemap</a></li>
                        </ul>
                    </div>
                </div>

            </div>
        </footer>
    )
}

export default Footer
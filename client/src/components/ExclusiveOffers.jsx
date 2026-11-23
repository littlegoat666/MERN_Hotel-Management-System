import React from 'react'
import { Link } from 'react-router-dom'
import Title from './Title'
import { exclusiveOffers } from '../assets/assets'
import { ArrowRight, Gift } from 'lucide-react'

const ExclusiveOffers = () => {
    return (
        <section className = 'bg-[#F2E9E1] px-6 py-20 md:px-16 md:py-24 lg:px-24 xl:px-32'>
            <div className = 'mx-auto max-w-7xl'>

                <div className = 'flex flex-col items-start justify-between gap-5 md:flex-row md:items-end'>
                    <div>
                        <div className = 'mb-3 inline-flex items-center gap-2 rounded-full border border-[#D8B9A5] bg-[#EAD8CA] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#A65F46] shadow-sm'>
                            <Gift size = {15} />
                            SPECIAL MOMENTS
                        </div>

                        <div className = '[&_h1]:!text-[#55443B] [&_h2]:!text-[#55443B] [&_p]:!text-[#8C7A70]'>
                            <Title
                                align = 'left'
                                title = 'Our Exclusive Offers'
                                subTitle = 'Discover thoughtful ways to make the most of your time in Chiang Mai, with ideas for a stay that feels entirely your own.'
                            />
                        </div>
                    </div>

                    <Link to = '/offers' className = 'group inline-flex shrink-0 items-center gap-2 rounded-full border border-[#D8C3B6] bg-[#FFFDFA] px-5 py-3 text-sm font-semibold text-[#A96F58] transition hover:bg-[#A96F58] hover:text-white'>
                        View All Offers
                        <ArrowRight size = {16} className = 'transition-transform group-hover:translate-x-1' />
                    </Link>
                </div>

                <div className = 'mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                    { exclusiveOffers.map((item) => (
                        <article key = { item._id } className = 'group relative flex min-h-[340px] flex-col justify-between overflow-hidden rounded-[24px] border border-white/50 bg-[#594337] bg-cover bg-center p-6 text-white shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl md:min-h-[380px] md:p-7' style = {{ backgroundImage: `url(${ item.image })` }}>

                            <div className = 'absolute inset-0 bg-gradient-to-t from-[#261A14]/90 via-[#38271D]/45 to-[#38271D]/10 transition duration-500 group-hover:from-[#261A14]/95' />

                            <div className = 'relative z-10 flex items-start justify-between gap-3'>
                                <span className = 'rounded-full border border-white/60 bg-[#FFFDFA]/95 px-4 py-1.5 text-xs font-semibold text-[#A96F58] shadow-sm backdrop-blur'>
                                    { item.priceOff }% OFF
                                </span>

                                <span className = 'rounded-full bg-black/20 px-3 py-1.5 text-xs text-white/80 backdrop-blur-sm'>
                                    Expires { item.expiryDate }
                                </span>
                            </div>

                            <div className = 'relative z-10 mt-auto'>
                                <p className = 'font-mali text-2xl font-semibold leading-tight text-white md:text-3xl'>
                                    { item.title }
                                </p>

                                <p className = 'mt-3 max-w-sm text-sm leading-7 text-white/85'>
                                    { item.description }
                                </p>

                                <Link to = '/offers' className = 'group/button mt-6 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white hover:text-[#8F5946]'>
                                    View Offer
                                    <ArrowRight size = {16} className = 'transition-transform group-hover/button:translate-x-1' />
                                </Link>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default ExclusiveOffers
import React from 'react'
import { assets } from '../assets/assets'
import Title from './Title'

const NewsLetter = () => {
    return (
        <section className = 'bg-white px-4 py-12 md:px-8 md:py-16'>
            <div className = 'mx-auto my-8 flex w-full max-w-5xl flex-col items-center overflow-hidden rounded-2xl bg-gray-900 px-5 py-12 text-white shadow-xl shadow-gray-900/10 md:py-16 md:px-10'>

                <div className = 'mb-5 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold tracking-[0.15em] text-white/80'>
                    STAY CONNECTED
                </div>

                <div className = 'w-full'>
                    <Title title = 'Subscribe to Our Newsletter' subTitle = "Receive occasional updates about Chiang Mai travel ideas, nearby attractions, and booking announcements for Bupatara Chiangmai." />
                </div>

                <div className = 'mt-8 flex w-full max-w-xl flex-col items-center justify-center gap-3 sm:flex-row'>
                    <input type = 'text' className = 'w-full min-w-0 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm text-white outline-none transition placeholder:text-gray-400 focus:border-white/50 focus:bg-white/15' placeholder = 'Enter your email' />

                    <button className = 'group flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-black px-7 py-3 text-sm font-semibold text-white transition-all hover:bg-gray-800 active:scale-95 sm:w-auto'>
                        Subscribe
                        <img src = { assets.arrowIcon } alt = 'arrow-icon' className = 'w-3.5 invert transition-all group-hover:translate-x-1' />
                    </button>
                </div>

                <p className = 'mt-6 text-center text-xs leading-6 text-gray-500'>
                    By subscribing, you agree to our Privacy Policy and consent to receive updates.
                </p>
            </div>
        </section>
    )
}

export default NewsLetter
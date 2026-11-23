import React from 'react'
import Title from './Title'
import { testimonials } from '../assets/assets'
import StarRating from './StarRating'
import { MessagesSquare, Quote } from 'lucide-react'

const Testimonial = () => {
    return (
        <section className = 'bg-[#FAF7F2] px-6 py-20 md:px-16 md:py-24 lg:px-24 xl:px-32'>
            <div className = 'mx-auto flex max-w-7xl flex-col items-center'>

                <div className = 'mb-3 inline-flex items-center gap-2 rounded-full border border-[#D8B9A5] bg-[#EAD8CA] px-4 py-2 text-xs font-semibold tracking-[0.18em] text-[#A65F46] shadow-sm'>
                    <MessagesSquare size = {15} />
                    GUEST EXPERIENCES
                </div>

                <div className = '[&_h1]:!text-[#55443B] [&_h2]:!text-[#55443B] [&_p]:!text-[#8C7A70]'>
                    <Title
                        title = 'Guest Stories'
                        subTitle = 'Thoughtful details, a welcoming atmosphere, and time well spent can make every visit to Chiang Mai memorable.'
                    />
                </div>

                <div className = 'mt-12 grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                    { testimonials.map((testimonial) => (
                        <article key = { testimonial.id } className = 'group relative flex h-full flex-col rounded-[22px] border border-[#E7DAD0] bg-[#FFFDFA] p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#725747]/10 md:p-7'>

                            <Quote size = {30} strokeWidth = {1.5} className = 'mb-5 text-[#C99D82]' />

                            <div className = 'flex items-center gap-3'>
                                <img className = 'h-12 w-12 rounded-full border-2 border-[#F2E5DC] object-cover' src = { testimonial.image } alt = { testimonial.name } />

                                <div className = 'min-w-0'>
                                    <p className = 'truncate font-mali text-lg font-semibold text-[#55443B]'>
                                        { testimonial.name }
                                    </p>
                                    <p className = 'truncate text-xs text-[#8C7A70]'>
                                        { testimonial.address }
                                    </p>
                                </div>
                            </div>

                            <div className = 'mt-5 flex items-center gap-1'>
                                <StarRating />
                            </div>

                            <p className = 'mt-4 flex-1 text-sm leading-7 text-[#8C7A70]'>
                                "{ testimonial.review }"
                            </p>

                            <div className = 'mt-6 border-t border-[#E7DAD0] pt-4'>
                                <span className = 'text-xs font-medium tracking-wide text-[#A96F58]'>
                                    GUEST STORY
                                </span>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Testimonial
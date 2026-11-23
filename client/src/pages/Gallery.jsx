import React, { useEffect, useMemo, useState } from 'react'
import { X, ChevronLeft, ChevronRight, Camera } from 'lucide-react'

const hotelSource = 'https://www.hotels.com/ho464758/bupatara-hotel-chiang-mai-thailand/'
const travelokaSource = 'https://www.traveloka.com/en-en/hotel/thailand/-hotel-o-bupatara-chiangmai-3000010034339'

const galleryImages = [
    // BUPATARA CHIANGMAI
    {
        id: 'hotel-exterior',
        title: 'Bupatara Chiangmai',
        description: 'Hotel exterior',
        category: 'Exterior',
        location: 'Bupatara Chiangmai',
        image: 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/611716159.jpg?k=e637a02e71e57efad7f41deec8eb11b9a6318fd85f85b140ba03bb4e0f4c9b82&o=',
        alt: 'Exterior of Bupatara Chiangmai hotel',
        credit: 'Hotel O Bupatara Chiangmai · Booking.com',
        source: 'https://www.booking.com/hotel/th/oyo-75531-bupatara-chiangmai.html',
    },
    {
        id: 'hotel-reception',
        title: 'A Warm Welcome',
        description: 'The hotel reception',
        category: 'Common Areas',
        location: 'Bupatara Chiangmai',
        image: 'https://images.oyoroomscdn.com/uploads/hotel_image/254421/ymqcqydkkpam.jpg',
        alt: 'Bupatara hotel reception desk',
        credit: 'Hotel O Bupatara Chiangmai · OYO',
        source: 'https://www.oyorooms.com/th/254421/',
    },
    {
        id: 'hotel-pool',
        title: 'Outdoor Swimming Pool',
        description: 'A relaxing place to cool down',
        category: 'Common Areas',
        location: 'Bupatara Chiangmai',
        image: 'https://images.trvl-media.com/lodging/9000000/8420000/8419900/8419876/cdb68bcb.jpg?h=800&impolicy=fcrop&quality=medium&w=1200',
        alt: 'Outdoor swimming pool at Bupatara Chiangmai',
        credit: 'Hotel O Bupatara Chiangmai · Hotels.com',
        source: hotelSource,
    },
    {
        id: 'hotel-garden',
        title: 'A Quiet Corner',
        description: 'The hotel garden',
        category: 'Common Areas',
        location: 'Bupatara Chiangmai',
        image: 'https://images.trvl-media.com/lodging/9000000/8420000/8419900/8419876/ce0dbf8b.jpg?h=800&impolicy=fcrop&quality=medium&w=1200',
        alt: 'Garden area at Bupatara Chiangmai',
        credit: 'Hotel O Bupatara Chiangmai · Expedia',
        source: 'https://www.expedia.co.th/Chiang-Mai-Hotels-Bupatara-Hotel.h8419876.Hotel-Information',
    },
    {
        id: 'hotel-double-room',
        title: 'Standard Double Room',
        description: 'A comfortable room with natural light',
        category: 'Rooms',
        location: 'Bupatara Chiangmai',
        image: 'https://images.trvl-media.com/lodging/9000000/8420000/8419900/8419876/85d92d44.jpg?h=800&impolicy=fcrop&quality=medium&w=1200',
        alt: 'Double bedroom at Bupatara Chiangmai',
        credit: 'Hotel O Bupatara Chiangmai · Hotels.com',
        source: hotelSource,
    },
    {
        id: 'hotel-superior-room',
        title: 'Superior Double Room',
        description: 'A room with a balcony and city view',
        category: 'Rooms',
        location: 'Bupatara Chiangmai',
        image: 'https://images.trvl-media.com/lodging/9000000/8420000/8419900/8419876/b13e65d4.jpg?h=800&impolicy=fcrop&quality=medium&w=1200',
        alt: 'Superior double bedroom with balcony at Bupatara Chiangmai',
        credit: 'Hotel O Bupatara Chiangmai · Hotels.com',
        source: hotelSource,
    },
    {
        id: 'hotel-twin-room',
        title: 'Twin Room',
        description: 'A guest room with two beds',
        category: 'Rooms',
        location: 'Bupatara Chiangmai',
        image: 'https://images.trvl-media.com/lodging/9000000/8420000/8419900/8419876/75269e3e.jpg?h=800&impolicy=fcrop&quality=medium&w=1200',
        alt: 'Twin bedroom at Bupatara Chiangmai',
        credit: 'Hotel O Bupatara Chiangmai · Hotels.com',
        source: hotelSource,
    },
    {
        id: 'hotel-balcony-room',
        title: 'A Room with a View',
        description: 'A balcony overlooking the neighbourhood',
        category: 'Rooms',
        location: 'Bupatara Chiangmai',
        image: 'https://images.trvl-media.com/lodging/9000000/8420000/8419900/8419876/072defe4.jpg?h=800&impolicy=fcrop&quality=medium&w=1200',
        alt: 'Hotel room balcony and Chiang Mai neighbourhood view',
        credit: 'Hotel O Bupatara Chiangmai · Hotels.com',
        source: hotelSource,
    },

    // ADDITIONAL HOTEL PHOTOS
    {
        id: 'hotel-pool-deck',
        title: 'Poolside',
        description: 'The outdoor swimming pool and wooden deck',
        category: 'Common Areas',
        location: 'Bupatara Chiangmai',
        image: 'https://images.trvl-media.com/lodging/9000000/8420000/8419900/8419876/af5c1227.jpg?impolicy=resizecrop&ra=fit&rw=598',
        alt: 'Outdoor swimming pool with wooden deck at Bupatara Chiangmai',
        credit: 'Hotel O Bupatara Chiangmai · Expedia',
        source: hotelSource,
    },
    {
        id: 'hotel-exterior-side',
        title: 'The Hotel Building',
        description: 'Another view of the Bupatara building',
        category: 'Exterior',
        location: 'Bupatara Chiangmai',
        image: 'https://ik.imagekit.io/tvlk/apr-asset/Ixf4aptF5N2Qdfmh4fGGYhTN274kJXuNMkUAzpL5HuD9jzSxIGG5kZNhhHY-p7nw/hotel/asset/10034339-a4c9d9ccb272f08ab90e99e9fa23c68e.jpeg',
        alt: 'Exterior view of Hotel O Bupatara Chiangmai',
        credit: 'Hotel O Bupatara Chiangmai · Traveloka',
        source: travelokaSource,
    },
    {
        id: 'hotel-twin-balcony',
        title: 'Twin Room with Balcony',
        description: 'A bright room with two single beds and balcony access',
        category: 'Rooms',
        location: 'Bupatara Chiangmai',
        image: 'https://ik.imagekit.io/tvlk/apr-asset/Ixf4aptF5N2Qdfmh4fGGYhTN274kJXuNMkUAzpL5HuD9jzSxIGG5kZNhhHY-p7nw/hotel/asset/10034339-3ad1a71fa490388c718a1131d4ed85f0.jpeg',
        alt: 'Twin bedroom with balcony at Hotel O Bupatara Chiangmai',
        credit: 'Hotel O Bupatara Chiangmai · Traveloka',
        source: travelokaSource,
    },
    {
        id: 'hotel-city-view-room',
        title: 'City View Room',
        description: 'A guest room with a bed and large windows',
        category: 'Rooms',
        location: 'Bupatara Chiangmai',
        image: 'https://images.trvl-media.com/lodging/9000000/8420000/8419900/8419876/9da6c6c7.jpg?h=800&impolicy=fcrop&w=1200',
        alt: 'Bedroom with rolled towels and a city view through large windows',
        credit: 'Hotel O Bupatara Chiangmai · Expedia',
        source: hotelSource,
    },
    {
        id: 'hotel-standard-twin',
        title: 'Standard Twin Room',
        description: 'A twin room with two beds and a wooden cabinet',
        category: 'Rooms',
        location: 'Bupatara Chiangmai',
        image: 'https://images.trvl-media.com/lodging/9000000/8420000/8419900/8419876/74a5de20.jpg?h=800&impolicy=fcrop&w=1200',
        alt: 'Standard twin room with two beds, a window and wooden cabinet',
        credit: 'Hotel O Bupatara Chiangmai · Expedia',
        source: hotelSource,
    },
    {
        id: 'hotel-shared-dormitory',
        title: 'Shared Dormitory',
        description: 'A shared room with bunk beds',
        category: 'Rooms',
        location: 'Bupatara Chiangmai',
        image: 'https://images.trvl-media.com/lodging/9000000/8420000/8419900/8419876/a6b5faff.jpg?h=800&impolicy=fcrop&w=1200',
        alt: 'Shared dormitory room with bunk beds at Bupatara Chiangmai',
        credit: 'Hotel O Bupatara Chiangmai · Expedia',
        source: hotelSource,
    },
    {
        id: 'hotel-twin-room-balcony-extra',
        title: 'Twin Comfort with a View',
        description: 'A guest room with two beds and a balcony view',
        category: 'Rooms',
        location: 'Bupatara Chiangmai',
        image: 'https://images.trvl-media.com/lodging/9000000/8420000/8419900/8419876/2d6bbd81.jpg?impolicy=resizecrop&ra=fit&rw=1200',
        alt: 'Twin bedroom with balcony at Bupatara Chiangmai',
        credit: 'Hotel O Bupatara Chiangmai · Expedia',
        source: 'https://www.expedia.co.th/en/Chiang-Mai-Hotels-Bupatara-Hotel.h8419876.Hotel-Information',
    },

    // CHIANG MAI
    {
        id: 'tha-phae-gate',
        title: 'Tha Phae Gate',
        description: 'The historic eastern gate of the Old City',
        category: 'Chiang Mai',
        location: 'Chiang Mai Old City',
        image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e0/20171105_Tha_Phae_Gate_Chiang_Mai_9784_DxO.jpg/960px-20171105_Tha_Phae_Gate_Chiang_Mai_9784_DxO.jpg',
        alt: 'Tha Phae Gate in Chiang Mai',
        credit: 'Jakub Hałun · CC BY-SA 4.0',
        source: 'https://commons.wikimedia.org/wiki/File:20171105_Tha_Phae_Gate_Chiang_Mai_9784_DxO.jpg',
    },
    {
        id: 'chedi-luang-main',
        title: 'Wat Chedi Luang',
        description: 'The ancient brick chedi',
        category: 'Chiang Mai',
        location: 'Chiang Mai Old City',
        image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/20/20171105_Wat_Chedi_Luang_Chiang_Mai_9897_DxO.jpg/960px-20171105_Wat_Chedi_Luang_Chiang_Mai_9897_DxO.jpg',
        alt: 'Ancient chedi at Wat Chedi Luang',
        credit: 'Jakub Hałun · CC BY-SA 4.0',
        source: 'https://commons.wikimedia.org/wiki/File:20171105_Wat_Chedi_Luang_Chiang_Mai_9897_DxO.jpg',
    },
    {
        id: 'chedi-luang-naga',
        title: 'Naga Stairway',
        description: 'Decorative naga sculptures at Wat Chedi Luang',
        category: 'Chiang Mai',
        location: 'Wat Chedi Luang',
        image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/29/20171105_Wat_Chedi_Luang_Chiang_Mai_9910_DxO.jpg/960px-20171105_Wat_Chedi_Luang_Chiang_Mai_9910_DxO.jpg',
        alt: 'Naga sculpture beside the stairs at Wat Chedi Luang',
        credit: 'Jakub Hałun · CC BY-SA 4.0',
        source: 'https://commons.wikimedia.org/wiki/File:20171105_Wat_Chedi_Luang_Chiang_Mai_9910_DxO.jpg',
    },
    {
        id: 'chedi-luang-dusk',
        title: 'Wat Chedi Luang at Dusk',
        description: 'The ancient chedi illuminated after sunset',
        category: 'Chiang Mai',
        location: 'Wat Chedi Luang',
        image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/91/Wat_Chedi_Luang_at_dusk.jpg/960px-Wat_Chedi_Luang_at_dusk.jpg',
        alt: 'Wat Chedi Luang illuminated at dusk',
        credit: 'C980040 · CC BY-SA 4.0',
        source: 'https://commons.wikimedia.org/wiki/File:Wat_Chedi_Luang_at_dusk.jpg',
    },
    {
        id: 'wat-chiang-man',
        title: 'Wat Chiang Man',
        description: 'An elephant statue inside the temple grounds',
        category: 'Chiang Mai',
        location: 'Chiang Mai Old City',
        image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3b/20171105_Wat_Chiang_Man%2C_Chiang_Mai_0047_DxO.jpg/960px-20171105_Wat_Chiang_Man%2C_Chiang_Mai_0047_DxO.jpg',
        alt: 'Elephant statue at Wat Chiang Man',
        credit: 'Jakub Hałun · CC BY-SA 4.0',
        source: 'https://commons.wikimedia.org/wiki/File:20171105_Wat_Chiang_Man,_Chiang_Mai_0047_DxO.jpg',
    },
    {
        id: 'phra-sing-library',
        title: 'Wat Phra Singh',
        description: 'Guardian statues at the temple library',
        category: 'Chiang Mai',
        location: 'Chiang Mai Old City',
        image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3c/20171105_Library_Hall%2C_Wat_Phra_Sing%2C_Chiang_Mai_-_9863_DxO.jpg/960px-20171105_Library_Hall%2C_Wat_Phra_Sing%2C_Chiang_Mai_-_9863_DxO.jpg',
        alt: 'Guardian statues at Wat Phra Singh library',
        credit: 'Jakub Hałun · CC BY-SA 4.0',
        source: 'https://commons.wikimedia.org/wiki/File:20171105_Library_Hall,_Wat_Phra_Sing,_Chiang_Mai_-_9863_DxO.jpg',
    },
    {
        id: 'phra-sing-statue',
        title: 'Temple Details',
        description: 'A golden statue at Wat Phra Singh',
        category: 'Chiang Mai',
        location: 'Wat Phra Singh',
        image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e7/20171105_Statue_in_front_of_Wat_Phra_Singh%2C_Chiang_Mai%2C_Thailand_9867_DxO.jpg/960px-20171105_Statue_in_front_of_Wat_Phra_Singh%2C_Chiang_Mai%2C_Thailand_9867_DxO.jpg',
        alt: 'Golden statue at Wat Phra Singh',
        credit: 'Jakub Hałun · CC BY-SA 4.0',
        source: 'https://commons.wikimedia.org/wiki/File:20171105_Statue_in_front_of_Wat_Phra_Singh,_Chiang_Mai,_Thailand_9867_DxO.jpg',
    },
    {
        id: 'phra-sing-white-temple',
        title: 'Wat Phra Singh',
        description: 'The white temple courtyard',
        category: 'Chiang Mai',
        location: 'Wat Phra Singh',
        image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e7/Wat_Phra_Singh_%2C_Chiangmai_%2C_Thailand.jpg/960px-Wat_Phra_Singh_%2C_Chiangmai_%2C_Thailand.jpg',
        alt: 'White temple building at Wat Phra Singh',
        credit: 'Kokunut555 · CC BY-SA 3.0',
        source: 'https://commons.wikimedia.org/wiki/File:Wat_Phra_Singh_,_Chiangmai_,_Thailand.jpg',
    },
    {
        id: 'phra-sing-chedi',
        title: 'Golden Chedi',
        description: 'The golden pagodas of Wat Phra Singh',
        category: 'Chiang Mai',
        location: 'Wat Phra Singh',
        image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/dc/Wat_Phra_Singh%2C_Chiang_Mai.jpg/960px-Wat_Phra_Singh%2C_Chiang_Mai.jpg',
        alt: 'Golden chedi at Wat Phra Singh',
        credit: 'Chalerm-a · CC BY-SA 4.0',
        source: 'https://commons.wikimedia.org/wiki/File:Wat_Phra_Singh,_Chiang_Mai.jpg',
    },
    {
        id: 'phra-sing-hall',
        title: 'Temple Grounds',
        description: 'Traditional temple hall and gongs',
        category: 'Chiang Mai',
        location: 'Wat Phra Singh',
        image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/96/Wat_Phra_Sing%2C_Chiang_Mai-gongs_and_hall.jpg/960px-Wat_Phra_Sing%2C_Chiang_Mai-gongs_and_hall.jpg',
        alt: 'Temple hall and gongs at Wat Phra Singh',
        credit: 'Immanuelle · CC BY 4.0',
        source: 'https://commons.wikimedia.org/wiki/File:Wat_Phra_Sing,_Chiang_Mai-gongs_and_hall.jpg',
    },
    {
        id: 'three-kings',
        title: 'Three Kings Monument',
        description: 'The monument of Chiang Mai’s three kings',
        category: 'Chiang Mai',
        location: 'Chiang Mai Old City',
        image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b1/Three_Kings_Monument%2C_Chiang_Mai_%28I%29.jpg/960px-Three_Kings_Monument%2C_Chiang_Mai_%28I%29.jpg',
        alt: 'Three Kings Monument in Chiang Mai',
        credit: 'Supanut Arunoprayote · CC BY 4.0',
        source: 'https://commons.wikimedia.org/wiki/File:Three_Kings_Monument,_Chiang_Mai_(I).jpg',
    },
    {
        id: 'sunday-walking-street',
        title: 'Sunday Walking Street',
        description: 'An evening market along the Old City streets',
        category: 'Chiang Mai',
        location: 'Ratchadamnoen Road',
        image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1b/Chiang_Mai_sunday_evening_walking_street.jpg/960px-Chiang_Mai_sunday_evening_walking_street.jpg',
        alt: 'Sunday Walking Street market in Chiang Mai',
        credit: 'Takeaway · CC BY-SA 4.0',
        source: 'https://commons.wikimedia.org/wiki/File:Chiang_Mai_sunday_evening_walking_street.jpg',
    },
    {
        id: 'wualai-market',
        title: 'Wua Lai Walking Street',
        description: 'The Saturday night market',
        category: 'Chiang Mai',
        location: 'Wua Lai Road',
        image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/dd/Night_Market_Chiang_Mai.jpg/960px-Night_Market_Chiang_Mai.jpg',
        alt: 'Saturday Walking Street market on Wua Lai Road',
        credit: 'Adbar · CC BY-SA 3.0',
        source: 'https://commons.wikimedia.org/wiki/File:Night_Market_Chiang_Mai.jpg',
    },
    {
        id: 'night-bazaar',
        title: 'Chiang Mai Night Bazaar',
        description: 'Colourful lights and market stalls',
        category: 'Chiang Mai',
        location: 'Chang Khlan Road',
        image: 'https://upload.wikimedia.org/wikipedia/commons/a/af/Night_Bazaar_ChiangMai.jpg',
        alt: 'Colourful lanterns at Chiang Mai Night Bazaar',
        credit: 'Manop · CC BY-SA 2.5',
        source: 'https://commons.wikimedia.org/wiki/File:Night_Bazaar_ChiangMai.jpg',
    },
    {
        id: 'chedi-luang-hall',
        title: 'Wat Chedi Luang',
        description: 'Traditional Lanna temple architecture',
        category: 'Chiang Mai',
        location: 'Chiang Mai Old City',
        image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/96/Chiang-Mai_Thailand_Wat-Chedi-Luang-01.jpg/960px-Chiang-Mai_Thailand_Wat-Chedi-Luang-01.jpg',
        alt: 'Traditional temple building at Wat Chedi Luang',
        credit: 'Uwe Aranas · CC BY-SA 4.0',
        source: 'https://commons.wikimedia.org/wiki/File:Chiang-Mai_Thailand_Wat-Chedi-Luang-01.jpg',
    },
]

const categories = [
    'All',
    'Rooms',
    'Exterior',
    'Common Areas',
    'Chiang Mai',
]

const Gallery = () => {
    const [ activeCategory, setActiveCategory ] = useState('All')
    const [ activeImageId, setActiveImageId ] = useState(null)

    const filteredImages = useMemo(() => {
        if (activeCategory === 'All') return galleryImages

        return galleryImages.filter((image) => image.category === activeCategory)
    }, [ activeCategory ])

    const activeImageIndex = filteredImages.findIndex((image) => image.id === activeImageId)
    const activeImage = activeImageIndex >= 0 ? filteredImages[activeImageIndex] : null

    const showPrevious = () => {
        const previousIndex = (activeImageIndex - 1 + filteredImages.length) % filteredImages.length
        setActiveImageId(filteredImages[previousIndex].id)
    }

    const showNext = () => {
        const nextIndex = (activeImageIndex + 1) % filteredImages.length
        setActiveImageId(filteredImages[nextIndex].id)
    }

    useEffect(() => {
        if (!activeImageId) return

        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'

        return () => {
            document.body.style.overflow = previousOverflow
        }
    }, [ activeImageId ])

    useEffect(() => {
        if (!activeImage) return

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') setActiveImageId(null)
            if (event.key === 'ArrowLeft') showPrevious()
            if (event.key === 'ArrowRight') showNext()
        }

        window.addEventListener('keydown', handleKeyDown)

        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [ activeImage, activeImageIndex, filteredImages ])

    return (
        <main data-bupatara-visuals = 'v2' className = 'min-h-[70vh] bg-[#FAF7F2] text-[#51443D]'>

            {/* ------ Page Heading ------ */}
            <section className = 'px-6 pb-8 pt-32 md:px-16 md:pb-10 md:pt-40 lg:px-24 xl:px-32'>
                <div className = 'mx-auto max-w-7xl'>

                    <div className = 'mt-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between'>
                        <div>
                            <h1 className = 'font-mali text-4xl text-[#51443D] md:text-5xl lg:text-6xl'>
                                Gallery
                            </h1>

                            <p className = 'mt-3 max-w-2xl text-base leading-7 text-[#918077] md:text-lg'>
                                A closer look at Bupatara and the places around Chiang Mai.
                            </p>
                        </div>

                        <div className = 'flex items-center gap-2 text-sm text-[#A18473]'>
                            <Camera size = {17} />
                            <span>{ filteredImages.length } photos</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ------ Photo Gallery ------ */}
            <section className = 'px-6 pb-16 md:px-16 md:pb-20 lg:px-24 xl:px-32'>
                <div className = 'mx-auto max-w-7xl'>

                    {/* Category Filters */}
                    <div className = 'mb-8 flex gap-2 overflow-x-auto pb-2'>
                        { categories.map((category) => (
                            <button
                                key = { category }
                                type = 'button'
                                onClick = {() => {
                                    setActiveCategory(category)
                                    setActiveImageId(null)
                                }}
                                aria-pressed = { activeCategory === category }
                                className = {`shrink-0 rounded-full border px-5 py-2.5 text-sm font-medium transition ${
                                    activeCategory === category
                                        ? 'border-[#A96F58] bg-[#A96F58] text-white shadow-md shadow-[#A96F58]/15'
                                        : 'border-[#E7DAD0] bg-[#FFFDFA] text-[#75665D] hover:border-[#C47755] hover:text-[#A65F46]'
                                }`}
                            >
                                { category }
                            </button>
                        ))}
                    </div>

                    {/* Photo Grid */}
                    <div className = 'grid auto-rows-[230px] gap-5 sm:grid-cols-2 lg:grid-cols-3'>
                        { filteredImages.map((image, index) => (
                            <button
                                key = { image.id }
                                type = 'button'
                                onClick = {() => setActiveImageId(image.id)}
                                aria-label = {`View ${image.title}`}
                                className = {`group relative overflow-hidden rounded-[22px] bg-[#E9DDD3] text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#725747]/15 focus:outline-none focus:ring-4 focus:ring-[#C47755]/30 ${
                                    index === 0 ? 'sm:col-span-2 lg:row-span-2' : ''
                                }`}
                            >
                                <img
                                    src = { image.image }
                                    alt = { image.alt }
                                    loading = 'lazy'
                                    decoding = 'async'
                                    referrerPolicy = 'no-referrer'
                                    className = 'h-full w-full object-cover transition duration-700 group-hover:scale-105'
                                />

                                <div className = 'absolute inset-0 bg-gradient-to-t from-[#251B16]/80 via-[#251B16]/5 to-transparent opacity-90 transition group-hover:opacity-100' />

                                <span className = 'absolute left-4 top-4 rounded-full border border-white/50 bg-[#FFFDFA]/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#A65F46] backdrop-blur'>
                                    { image.category }
                                </span>

                                <div className = 'absolute inset-x-0 bottom-0 p-5 md:p-6'>
                                    <h2 className = 'font-mali text-xl text-white md:text-2xl'>
                                        { image.title }
                                    </h2>

                                    <p className = 'mt-1 text-sm text-white/80'>
                                        { image.description }
                                    </p>

                                    <p className = 'mt-2 text-xs text-white/60'>
                                        { image.location }
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* ------ Lightbox ------ */}
            { activeImage && (
                <div
                    role = 'dialog'
                    aria-modal = 'true'
                    aria-label = {`Photo viewer: ${activeImage.title}`}
                    onClick = {(event) => {
                        if (event.target === event.currentTarget) setActiveImageId(null)
                    }}
                    className = 'fixed inset-0 z-[100] flex items-center justify-center bg-[#1D1714]/95 p-4 backdrop-blur-sm md:p-8'
                >
                    <button
                        type = 'button'
                        onClick = {() => setActiveImageId(null)}
                        aria-label = 'Close photo viewer'
                        className = 'absolute right-4 top-4 z-20 rounded-full border border-white/20 bg-white/10 p-3 text-white transition hover:bg-white/20 md:right-7 md:top-7'
                    >
                        <X size = {22} />
                    </button>

                    { filteredImages.length > 1 && (
                        <>
                            <button
                                type = 'button'
                                onClick = { showPrevious }
                                aria-label = 'Previous photo'
                                className = 'absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/20 bg-white/10 p-3 text-white transition hover:bg-white/20 md:left-8'
                            >
                                <ChevronLeft size = {25} />
                            </button>

                            <button
                                type = 'button'
                                onClick = { showNext }
                                aria-label = 'Next photo'
                                className = 'absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/20 bg-white/10 p-3 text-white transition hover:bg-white/20 md:right-8'
                            >
                                <ChevronRight size = {25} />
                            </button>
                        </>
                    )}

                    <div className = 'flex max-h-full w-full max-w-6xl flex-col items-center justify-center'>
                        <div className = 'flex min-h-0 w-full flex-1 items-center justify-center'>
                            <img
                                src = { activeImage.image }
                                alt = { activeImage.alt }
                                referrerPolicy = 'no-referrer'
                                className = 'max-h-[72vh] max-w-full rounded-xl object-contain shadow-2xl md:max-h-[78vh]'
                            />
                        </div>

                        <div className = 'w-full max-w-3xl px-12 pt-5 text-center text-white'>
                            <h2 className = 'font-mali text-xl md:text-2xl'>
                                { activeImage.title }
                            </h2>

                            <p className = 'mt-1 text-sm text-white/65'>
                                { activeImage.description }
                            </p>

                            <p className = 'mt-3 text-xs leading-5 text-white/50'>
                                { activeImage.credit }
                            </p>

                            <div className = 'mt-3 flex items-center justify-center gap-4 text-xs text-white/60'>
                                <span>{ activeImageIndex + 1 } / { filteredImages.length }</span>

                                <a
                                    href = { activeImage.source }
                                    target = '_blank'
                                    rel = 'noreferrer'
                                    className = 'underline underline-offset-4 transition hover:text-white'
                                >
                                    View photo source
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    )
}

export default Gallery
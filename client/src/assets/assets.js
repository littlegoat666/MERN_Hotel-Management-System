import logo from './logo.svg'
import searchIcon from './searchIcon.svg'
import userIcon from './userIcon.svg'
import calenderIcon from './calenderIcon.svg'
import locationIcon from './locationIcon.svg'
import starIconFilled from './starIconFilled.svg'
import arrowIcon from './arrowIcon.svg'
import starIconOutlined from './starIconOutlined.svg'

import instagramIcon from './instagramIcon.svg'
import facebookIcon from './facebookIcon.svg'
import gmailIcon from './gmailIcon.svg'
import phoneCallIcon from './phoneCallIcon.svg'

import freeWifiIcon from './freeWifiIcon.svg'
import roomServiceIcon from './roomServiceIcon.svg'
import mountainIcon from './mountainIcon.svg'
import poolIcon from './poolIcon.svg'
import  furnitureIcon from './furniture-icon.svg'
import  parkingIcon from './parking-line.svg'
import gardenIcon from './tree-plant-icon.svg'
import cctvIcon from './cctv-icon.svg'
import smokingIcon from './smoking-icon.svg'
import accessibleIcon from './wheelchair-icon.svg'
import homeIcon from './homeIcon.svg'
import closeIcon from './closeIcon.svg'
import locationFilledIcon from './locationFilledIcon.svg'
import heartIcon from './heartIcon.svg'
import badgeIcon from './badgeIcon.svg'
import menuIcon from './menuIcon.svg'
import closeMenu from './closeMenu.svg'
import guestsIcon from './guestsIcon.svg'
import roomImg1 from './roomImg1.png'
import roomImg2 from './roomImg2.png'
import roomImg3 from './roomImg3.png'
import roomImg4 from './roomImg4.png'
import regImage from './regImage.png'

import exclusiveOfferCardImg1 from './exclusiveOfferCardImg1.png';
import exclusiveOfferCardImg2 from './exclusiveOfferCardImg2.png';
import exclusiveOfferCardImg3 from './exclusiveOfferCardImg3.png';

import addIcon from './addIcon.svg';
import dashboardIcon from './dashboardIcon.svg';
import listIcon from './listIcon.svg';
import uploadArea from './uploadArea.svg';
import totalBookingIcon from './totalBookingIcon.svg';
import totalRevenueIcon from './totalRevenueIcon.svg';

export const assets = {
    logo,
    searchIcon,
    userIcon,
    calenderIcon,
    locationIcon,
    starIconFilled,
    arrowIcon,
    starIconOutlined,
    instagramIcon,
    facebookIcon,
    gmailIcon,
    phoneCallIcon,
    freeWifiIcon,
    roomServiceIcon,
    mountainIcon,
    furnitureIcon,
    parkingIcon,
    gardenIcon,
    cctvIcon,
    smokingIcon,
    accessibleIcon,
    poolIcon,
    closeIcon,
    homeIcon,
    locationFilledIcon,
    heartIcon,
    badgeIcon,
    menuIcon,
    closeMenu,
    guestsIcon,
    regImage,
    addIcon,
    dashboardIcon,
    listIcon,
    uploadArea,
    totalBookingIcon,
    totalRevenueIcon,
}

export const cities = [
    'Bupatara',
];

// Exclusive Offers Dummy Data
export const exclusiveOffers = [
    { _id: 1, title: 'Summer Escape Package', description: 'Enjoy a complimentary night and daily breakfast', priceOff: 25, expiryDate: 'Aug 31', image: exclusiveOfferCardImg1 },
    { _id: 2, title: 'Romantic Getaway', description: 'Special couples package including spa treatment', priceOff: 20, expiryDate: 'Sep 20', image: exclusiveOfferCardImg2 },
    { _id: 3, title: 'Luxury Retreat', description: 'Book 60 days in advance and save on your stay at any of our luxury properties worldwide.', priceOff: 30, expiryDate: 'Sep 25', image: exclusiveOfferCardImg3 },
]

// Testimonials Dummy Data
export const testimonials = [
    { id: 1, name: 'Emma Rodriguez', address: 'Barcelona, Spain', image: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200', rating: 5, review: 'Sample comment: The Old City location is useful for planning visits to nearby temples and local markets.' },
    { id: 2, name: 'Liam Johnson', address: 'New York, USA', image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200', rating: 4, review: 'Sample comment: Comparing room types, nightly rates, and listed amenities helps travelers plan their stay.' },
    { id: 3, name: 'Sophia Lee', address: 'Seoul, South Korea', image: 'https://images.unsplash.com/photo-1701615004837-40d8573b6652?q=80&w=200', rating: 5, review: 'Sample comment: Chiang Mai Gate, Wat Chedi Luang, and nearby walking streets are useful landmarks to explore in the area.' }
];

// Facility Icon
export const facilityIcons = {
    'Free Wi-Fi': assets.freeWifiIcon,
    'Room Service': assets.roomServiceIcon,
    'Mountain View': assets.mountainIcon,
    'Pool Access': assets.poolIcon,
    'Garden': assets.gardenIcon,
    'Security Cameras': assets.cctvIcon,
    'Furniture Included': assets.furnitureIcon,
    'Parking': assets.parkingIcon,
    'Smoking Area': assets.smokingIcon,
    'Accessible to Disabled': assets.accessibleIcon,
};

// For Room Details Page
export const roomCommonData = [
    { icon: assets.homeIcon, title: 'Room Details', description: 'Review the selected room information and listed facilities before you book.' },
    { icon: assets.badgeIcon, title: 'Amenities', description: 'Confirm which amenities are included with your chosen room.' },
    { icon: assets.locationFilledIcon, title: 'Old City Location', description: "Bupatara is in Chiang Mai's Old City, near historic temples and local walking streets." },
    { icon: assets.heartIcon, title: 'Plan Your Arrival', description: 'Check the arrival and departure times shown in your booking details.' },
];

// User Dummy Data
export const userDummyData = {
    '_id': 'user_2unqyL4diJFP1E3pIBnasc7w8hP',
    'username': 'Jirayut',
    'email': 'user.test@gmail.com',
    'image': 'https://f.ptcdn.info/275/082/000/s3ux77seqhWBDhp3lOf4-o.jpg',
    'role': 'hotelOwner',
    'createdAt': '2025-03-25T09:29:16.367Z',
    'updatedAt': '2025-04-10T06:34:48.719Z',
    '__v': 1,
    'recentSearchedCities': [
        'Bupatara'
    ]
}

// Hotel Dummy Data
export const hotelDummyData = {
    '_id': '67f76393197ac559e4089b72',
    'name': 'Urbanza Suites',
    'address': 'Main Road  123 Street , 23 Colony',
    'contact': '+0123456789',
    'owner': userDummyData,
    'city': 'New York',
    'createdAt': '2025-04-10T06:22:11.663Z',
    'updatedAt': '2025-04-10T06:22:11.663Z',
    '__v': 0
}

// Rooms Dummy Data
export const roomsDummyData = [
    {
        '_id': '67f7647c197ac559e4089b96',
        'hotel': hotelDummyData,
        'roomType': 'Double Bed',
        'pricePerNight': 399,
        'amenities': ['Room Service', 'Mountain View', 'Pool Access'],
        'images': [roomImg1, roomImg2, roomImg3, roomImg4],
        'isAvailable': true,
        'createdAt': '2025-04-10T06:26:04.013Z',
        'updatedAt': '2025-04-10T06:26:04.013Z',
        '__v': 0
    },
    {
        '_id': '67f76452197ac559e4089b8e',
        'hotel': hotelDummyData,
        'roomType': 'Double Bed',
        'pricePerNight': 299,
        'amenities': ['Room Service', 'Mountain View', 'Pool Access'],
        'images': [roomImg2, roomImg3, roomImg4, roomImg1],
        'isAvailable': true,
        'createdAt': '2025-04-10T06:25:22.593Z',
        'updatedAt': '2025-04-10T06:25:22.593Z',
        '__v': 0
    },
    {
        '_id': '67f76406197ac559e4089b82',
        'hotel': hotelDummyData,
        'roomType': 'Double Bed',
        'pricePerNight': 249,
        'amenities': ['Free WiFi', 'Free Breakfast', 'Room Service'],
        'images': [roomImg3, roomImg4, roomImg1, roomImg2],
        'isAvailable': true,
        'createdAt': '2025-04-10T06:24:06.285Z',
        'updatedAt': '2025-04-10T06:24:06.285Z',
        '__v': 0
    },
    {
        '_id': '67f763d8197ac559e4089b7a',
        'hotel': hotelDummyData,
        'roomType': 'Single Bed',
        'pricePerNight': 199,
        'amenities': ['Free WiFi', 'Room Service', 'Pool Access'],
        'images': [roomImg4, roomImg1, roomImg2, roomImg3],
        'isAvailable': true,
        'createdAt': '2025-04-10T06:23:20.252Z',
        'updatedAt': '2025-04-10T06:23:20.252Z',
        '__v': 0
    }
]



// User Bookings Dummy Data
export const userBookingsDummyData = [
    {
        '_id': '67f76839994a731e97d3b8ce',
        'user': userDummyData,
        'room': roomsDummyData[1],
        'hotel': hotelDummyData,
        'checkInDate': '2025-04-30T00:00:00.000Z',
        'checkOutDate': '2025-05-01T00:00:00.000Z',
        'totalPrice': 299,
        'guests': 1,
        'status': 'pending',
        'paymentMethod': 'Stripe',
        'isPaid': true,
        'createdAt': '2025-04-10T06:42:01.529Z',
        'updatedAt': '2025-04-10T06:43:54.520Z',
        '__v': 0
    },
    {
        '_id': '67f76829994a731e97d3b8c3',
        'user': userDummyData,
        'room': roomsDummyData[0],
        'hotel': hotelDummyData,
        'checkInDate': '2025-04-27T00:00:00.000Z',
        'checkOutDate': '2025-04-28T00:00:00.000Z',
        'totalPrice': 399,
        'guests': 1,
        'status': 'pending',
        'paymentMethod': 'Pay At Hotel',
        'isPaid': false,
        'createdAt': '2025-04-10T06:41:45.873Z',
        'updatedAt': '2025-04-10T06:41:45.873Z',
        '__v': 0
    },
    {
        '_id': '67f76810994a731e97d3b8b4',
        'user': userDummyData,
        'room': roomsDummyData[3],
        'hotel': hotelDummyData,
        'checkInDate': '2025-04-11T00:00:00.000Z',
        'checkOutDate': '2025-04-12T00:00:00.000Z',
        'totalPrice': 199,
        'guests': 1,
        'status': 'pending',
        'paymentMethod': 'Pay At Hotel',
        'isPaid': false,
        'createdAt': '2025-04-10T06:41:20.501Z',
        'updatedAt': '2025-04-10T06:41:20.501Z',
        '__v': 0
    }
]

// Dashboard Dummy Data
export const dashboardDummyData = {
    'totalBookings': 3,
    'totalRevenue': 897,
    'bookings': userBookingsDummyData
}
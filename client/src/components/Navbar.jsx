import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { assets } from '../assets/assets'
import { useClerk, UserButton } from '@clerk/clerk-react'
import { useAppContext } from '../context/AppContext'

const BookIcon = () => (
    <svg className = 'w-4 h-4 text-gray-700' aria-hidden = 'true' xmlns = 'http://www.w3.org/2000/svg' width = '24' height = '24' fill = 'none' viewBox = '0 0 24 24'>
        <path stroke = 'currentColor' strokeLinecap = 'round' strokeLinejoin = 'round' strokeWidth = '2' d = 'M5 19V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v13H7a2 2 0 0 0-2 2Zm00a2 2 0 0 0 2 2h12M9 3V14m7 0v4' />
    </svg>
)

const languages = [
    { code: 'EN', label: 'English' },
    { code: 'TH', label: 'ไทย' },
    { code: '中文', label: '中文' },
    { code: '日本語', label: '日本語' },
]

const Navbar = () => {
    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'About Us', path: '/about' },
        { name: 'Rooms', path: '/rooms' },
        { name: 'Offers', path: '/offers' },
        { name: 'Gallery', path: '/gallery' },
    ]

    const [ isScrolled, setIsScrolled ] = useState(false)
    const [ isMenuOpen, setIsMenuOpen ] = useState(false)
    const [ selectedLanguage, setSelectedLanguage ] = useState('EN')

    const { openSignIn } = useClerk()
    const location = useLocation()
    const { user, navigate, isOwner } = useAppContext()

    useEffect(() => {
        const handleScroll = () => setIsScrolled(location.pathname !== '/' || window.scrollY > 10)
        handleScroll()
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [ location.pathname ])

    const isActive = (path) => path === '/' ? location.pathname === '/' : location.pathname === path || location.pathname.startsWith(path + '/')
    const languageOptions = languages.map((language) => <option key = { language.code } value = { language.code }>{ language.label }</option>)

    return (
        <nav className = {`fixed top-0 left-0 w-full flex items-center justify-between gap-3 px-4 md:px-8 lg:px-16 xl:px-24 transition-all duration-300 z-50 ${ isScrolled || isMenuOpen ? 'bg-white/95 shadow-md text-gray-700 backdrop-blur-lg py-3 md:py-4' : 'py-4 md:py-6'}`}>
            <Link to = '/' onClick = {() => setIsMenuOpen(false)} className = 'shrink-0'>
                <img src = { assets.logo } alt = 'Bupatara Chiangmai home' className = 'h-9' />
            </Link>

            {/* Desktop navigation */}
            <div className = 'hidden md:flex items-center justify-center gap-3 lg:gap-6 xl:gap-8'>
                { navLinks.map((link) => (
                    <Link key = { link.path } to = { link.path } aria-current = { isActive(link.path) ? 'page' : undefined } className = {`group flex flex-col gap-1 whitespace-nowrap text-sm transition-colors ${ isScrolled ? 'text-gray-700' : 'text-gray-800'} ${ isActive(link.path) ? 'font-semibold' : 'font-medium'}`}>
                        { link.name }
                        <span className = {`h-0.5 rounded-full transition-all duration-300 ${ isActive(link.path) ? 'w-full bg-blue-600' : 'w-0 bg-blue-600 group-hover:w-full'}`} />
                    </Link>
                ))}
            </div>

            {/* Desktop actions */}
            <div className = 'hidden md:flex items-center gap-3 lg:gap-4 shrink-0'>
                <label className = 'flex items-center gap-1 text-sm text-gray-700' title = 'Language selection preview; translations are not connected yet'>
                    <span className = 'sr-only'>Choose language</span>
                    <select value = { selectedLanguage } onChange = {(event) => setSelectedLanguage(event.target.value)} aria-label = 'Choose language (preview only)' className = 'max-w-28 cursor-pointer rounded-lg border border-gray-200 bg-white/70 px-2 py-2 text-sm outline-none focus:border-blue-500'>
                        { languageOptions }
                    </select>
                </label>

                { user && isOwner && <button className = 'rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-800 transition hover:border-blue-600 hover:text-blue-600' onClick = {() => navigate('/owner')}>Dashboard</button> }

                <img src = { assets.searchIcon } alt = '' aria-hidden = 'true' className = {`${ isScrolled ? 'invert-0' : ''} h-6 w-6 opacity-80`} />
                { user ? (
                    <UserButton>
                        <UserButton.MenuItems>
                            <UserButton.Action label = 'My Booking' labelIcon = {<BookIcon />} onClick = {() => navigate('/my-bookings')} />
                        </UserButton.MenuItems>
                    </UserButton>
                ) : (
                    <button onClick = { openSignIn } className = 'rounded-full bg-black px-5 py-2.5 text-sm text-white transition hover:bg-gray-800'>Login</button>
                )}
            </div>

            {/* Mobile controls */}
            <div className = 'flex items-center gap-3 md:hidden'>
                { user && <UserButton>
                    <UserButton.MenuItems>
                        <UserButton.Action label = 'My Booking' labelIcon = {<BookIcon />} onClick = {() => navigate('/my-bookings')} />
                    </UserButton.MenuItems>
                </UserButton> }
                <button type = 'button' onClick = {() => setIsMenuOpen(!isMenuOpen)} aria-label = { isMenuOpen ? 'Close navigation menu' : 'Open navigation menu' } aria-expanded = { isMenuOpen } className = 'rounded-md p-2'>
                    <img src = { isMenuOpen ? assets.closeMenu : assets.menuIcon } alt = '' className = 'h-5 w-5' />
                </button>
            </div>

            {/* Mobile navigation: same links and language options as desktop */}
            <div className = {`fixed inset-0 z-40 flex h-screen flex-col items-center justify-center gap-7 bg-white px-6 text-gray-800 transition-all duration-300 md:hidden ${ isMenuOpen ? 'translate-x-0 opacity-100' : 'pointer-events-none -translate-x-full opacity-0'}`}>
                <button type = 'button' onClick = {() => setIsMenuOpen(false)} aria-label = 'Close navigation menu' className = 'absolute right-5 top-5 rounded-full border border-gray-200 px-4 py-2 text-sm'>Close</button>
                { navLinks.map((link) => (
                    <Link key = { link.path } to = { link.path } onClick = {() => setIsMenuOpen(false)} aria-current = { isActive(link.path) ? 'page' : undefined } className = {`text-lg transition-colors ${ isActive(link.path) ? 'font-semibold text-blue-600' : 'text-gray-800'}`}>
                        { link.name }
                    </Link>
                ))}

                <label className = 'flex items-center gap-2 text-sm text-gray-700' title = 'Language selection preview; translations are not connected yet'>
                    <span>Language</span>
                    <select value = { selectedLanguage } onChange = {(event) => setSelectedLanguage(event.target.value)} aria-label = 'Choose language (preview only)' className = 'rounded-lg border border-gray-200 bg-white px-3 py-2 outline-none focus:border-blue-500'>
                        { languageOptions }
                    </select>
                </label>

                { user && isOwner && <button className = 'rounded-full border border-gray-300 px-5 py-2 text-sm font-medium' onClick = {() => { setIsMenuOpen(false); navigate('/owner') }}>Owner Dashboard</button> }
                { !user && <button onClick = {() => { setIsMenuOpen(false); openSignIn() }} className = 'rounded-full bg-black px-8 py-2.5 text-white'>Login</button> }
            </div>
        </nav>
    )
}

export default Navbar
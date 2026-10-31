import React from 'react'
import { Link } from 'react-router-dom'
import { UserButton } from '@clerk/clerk-react'
import { assets } from '../../assets/assets'

const Navbar = () => {
    return (
        <header className = 'sticky top-0 z-40 flex items-center justify-between gap-4 border-b border-[#e8ded1] bg-[#fffdfa]/95 px-4 py-3 shadow-sm backdrop-blur-md sm:px-6 lg:px-8'>
            <Link to = '/' className = 'flex min-w-0 items-center gap-3'>
                <img src = {assets.logo} alt = 'Hotel logo' className = 'h-9 max-w-[150px] object-contain' />
            </Link>

            <div className = 'flex shrink-0 items-center gap-3'>
                <div className = 'rounded-full border border-[#e8ded1] bg-white p-1 shadow-sm'>
                    <UserButton />
                </div>
            </div>
        </header>
    )
}

export default Navbar
import React, { useEffect } from 'react'
import Navbar from '../../components/hotelOwner/Navbar'
import Sidebar from '../../components/hotelOwner/Sidebar'
import { Outlet } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { useAppContext } from '../../context/AppContext'

const Layout = () => {
    const { isOwner, isOwnerChecked, navigate } = useAppContext()
    const { isLoaded, user } = useUser()

    useEffect(() => {
        if (!isLoaded) return

        if (!user) {
            navigate('/', { replace: true })
            return
        }

        if (isOwnerChecked && !isOwner) {
            navigate('/', { replace: true })
        }
    }, [ isLoaded, user, isOwnerChecked, isOwner, navigate ])

    return (
        <div className = 'flex flex-col min-h-screen'>
            <Navbar />

            <div className = 'flex flex-1'>
                <Sidebar />

                <div className = 'flex-1 min-w-0 p-4 pt-10 md:px-10'>
                    <Outlet />
                </div>
            </div>
        </div>
    )
}

export default Layout
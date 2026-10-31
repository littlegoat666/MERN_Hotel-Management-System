import React, { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import Navbar from '../../components/hotelOwner/Navbar'
import Sidebar from '../../components/hotelOwner/Sidebar'
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
        if (isOwnerChecked && !isOwner) navigate('/', { replace: true })
    }, [isLoaded, user, isOwnerChecked, isOwner, navigate])

    if (!isLoaded || !isOwnerChecked) {
        return (
            <div className = 'flex min-h-screen items-center justify-center bg-[#f7f3ed]'>
                <div className = 'h-9 w-9 animate-spin rounded-full border-4 border-[#eadbd0] border-t-[#a96f58]' />
            </div>
        )
    }

    if (!user || !isOwner) return null

    return (
        <div className = 'flex min-h-screen flex-col bg-[#f7f3ed] text-[#302925]'>
            <Navbar />
            <div className = 'flex min-h-0 flex-1'>
                <Sidebar />
                <main className = 'min-w-0 flex-1 p-4 sm:p-6 lg:p-9'>
                    <div className = 'mx-auto max-w-[1500px]'>
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )
}

export default Layout
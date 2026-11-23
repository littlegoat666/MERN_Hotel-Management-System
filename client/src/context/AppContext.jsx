import axios from 'axios'
import { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser, useAuth } from '@clerk/clerk-react'
import { toast } from 'react-hot-toast'

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL

const AppContext = createContext()

const supportedLanguages = [ 'en', 'th', 'zh', 'ja' ]

const getSavedLanguage = () => {
    try {
        const savedLanguage = localStorage.getItem('bupatara-language')

        return supportedLanguages.includes(savedLanguage)
            ? savedLanguage
            : 'en'
    } catch {
        return 'en'
    }
}

export const AppProvider = ({ children }) => {
    const currency = '฿'
    const navigate = useNavigate()
    const { isLoaded, user } = useUser()
    const { getToken } = useAuth()

    const [ isOwner, setIsOwner ] = useState(false)
    const [ isOwnerChecked, setIsOwnerChecked ] = useState(false)
    const [ showHotelReg, setShowHotelReg ] = useState(false)
    const [ searchedCities, setSearchedCities ] = useState([])
    const [ rooms, setRooms ] = useState([])
    const [ language, setLanguageState ] = useState(getSavedLanguage)

    const setLanguage = (nextLanguage) => {
        const normalizedLanguage = String(nextLanguage || '').toLowerCase()

        if (!supportedLanguages.includes(normalizedLanguage)) return

        try {
            localStorage.setItem('bupatara-language', normalizedLanguage)
        } catch (error) {
            console.error('Unable to save language preference:', error)
        }

        setLanguageState(normalizedLanguage)
    }

    const fetchRooms = async () => {
        try {
            const { data } = await axios.get('/api/rooms')

            if (data.success) {
                setRooms(data.rooms)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(() => {
        document.documentElement.lang = language === 'zh' ? 'zh-CN' : language
    }, [ language ])

    useEffect(() => {
        if (!isLoaded) return

        let cancelled = false

        const fetchUser = async () => {
            setIsOwnerChecked(false)

            if (!user) {
                setIsOwner(false)
                setSearchedCities([])
                setIsOwnerChecked(true)
                return
            }

            try {
                const token = await getToken()

                if (!token) {
                    setIsOwner(false)
                    setIsOwnerChecked(true)
                    return
                }

                const { data } = await axios.get('/api/user', {
                    headers: { Authorization: `Bearer ${token}` }
                })

                if (cancelled) return

                if (data.success) {
                    setIsOwner(data.role === 'hotelOwner')
                    setSearchedCities(data.recentSearchedCities || [])
                } else {
                    setIsOwner(false)
                }
            } catch (error) {
                if (!cancelled) {
                    setIsOwner(false)
                    toast.error(error.message)
                }
            } finally {
                if (!cancelled) setIsOwnerChecked(true)
            }
        }

        fetchUser()

        return () => {
            cancelled = true
        }
    }, [ isLoaded, user, getToken ])

    useEffect(() => {
        fetchRooms()
    }, [])

    const value = {
        currency,
        navigate,
        user,
        getToken,
        isOwner,
        isOwnerChecked,
        setIsOwner,
        axios,
        showHotelReg,
        setShowHotelReg,
        searchedCities,
        setSearchedCities,
        rooms,
        setRooms,
        fetchRooms,
        language,
        setLanguage,
    }

    return (
        <AppContext.Provider value = { value }>
            { children }
        </AppContext.Provider>
    )
}

export const useAppContext = () => useContext(AppContext)
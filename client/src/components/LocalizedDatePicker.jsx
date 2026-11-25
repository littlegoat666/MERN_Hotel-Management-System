import React, { useEffect, useRef, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'

const dateLocales = {
    en: 'en-GB',
    th: 'th-TH',
    zh: 'zh-CN',
    ja: 'ja-JP',
}

const datePlaceholders = {
    en: 'DD/MM/YYYY',
    th: 'วว/ดด/ปปปป',
    zh: 'YYYY/MM/DD',
    ja: 'YYYY/MM/DD',
}

const parseDate = (value) => {
    if ( !value ) return null

    const [ year, month, day ] = value.split('-').map(Number)

    if ( !year || !month || !day ) return null

    return new Date(year, month - 1, day)
}

const formatISODate = (date) => {
    return `${ date.getFullYear() }-${ String(date.getMonth() + 1).padStart(2, '0') }-${ String(date.getDate()).padStart(2, '0') }`
}

const LocalizedDatePicker = ({
    id,
    value,
    onChange,
    language = 'en',
    minDate = '',
    disabled = false,
}) => {
    const containerRef = useRef(null)

    const locale = dateLocales[ language ] || 'en-GB'
    const placeholder = datePlaceholders[ language ] || 'DD/MM/YYYY'

    const selectedDate = parseDate(value)
    const minimumDate = parseDate(minDate)

    const initialDate = selectedDate || minimumDate || new Date()

    const [ isOpen, setIsOpen ] = useState(false)

    const [ viewDate, setViewDate ] = useState(
        () => new Date(initialDate.getFullYear(), initialDate.getMonth(), 1)
    )

    // Keep calendar month synchronized with selected date
    useEffect(() => {
        if ( selectedDate ) {
            setViewDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1))
        }
    }, [ value ])

    // Close calendar when clicking outside
    useEffect(() => {
        if ( !isOpen ) return undefined

        const handleOutsideClick = (event) => {
            if ( !containerRef.current?.contains(event.target) ) {
                setIsOpen(false)
            }
        }

        const handleKeyDown = (event) => {
            if ( event.key === 'Escape' ) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleOutsideClick)
        document.addEventListener('touchstart', handleOutsideClick)
        document.addEventListener('keydown', handleKeyDown)

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick)
            document.removeEventListener('touchstart', handleOutsideClick)
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [ isOpen ])

    // Close calendar after switching language
    useEffect(() => {
        setIsOpen(false)
    }, [ language ])

    const formatDisplayDate = (date) => {
        return new Intl.DateTimeFormat(locale, {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        }).format(date)
    }

    const monthTitle = new Intl.DateTimeFormat(locale, {
        month: 'long',
        year: 'numeric',
    }).format(viewDate)

    // Determine the first day of the week based on locale
    const getFirstDayOfWeek = () => {
        try {
            const firstDay = new Intl.Locale(locale).weekInfo?.firstDay

            if ( firstDay !== undefined ) {
                return firstDay % 7
            }
        } catch {
            return language === 'zh' ? 1 : 0
        }

        return language === 'zh' ? 1 : 0
    }

    const firstDayOfWeek = getFirstDayOfWeek()

    const weekdayLabels = Array.from({ length: 7 }, (_, index) => {
        const dayIndex = (firstDayOfWeek + index) % 7
        const date = new Date(2023, 0, 1 + dayIndex)

        return new Intl.DateTimeFormat(locale, {
            weekday: 'short',
        }).format(date)
    })

    const year = viewDate.getFullYear()
    const month = viewDate.getMonth()

    const firstDateOfMonth = new Date(year, month, 1)
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const emptyCells = (firstDateOfMonth.getDay() - firstDayOfWeek + 7) % 7
    const totalCells = Math.ceil((emptyCells + daysInMonth) / 7) * 7

    const calendarDays = Array.from({ length: totalCells }, (_, index) => {
        const day = index - emptyCells + 1

        if ( day < 1 || day > daysInMonth ) {
            return null
        }

        return new Date(year, month, day)
    })

    const numberFormatter = new Intl.NumberFormat(locale, {
        useGrouping: false,
    })

    const todayValue = formatISODate(new Date())

    const changeMonth = (amount) => {
        setViewDate((currentDate) => (
            new Date(
                currentDate.getFullYear(),
                currentDate.getMonth() + amount,
                1
            )
        ))
    }

    const selectDate = (date) => {
        const selectedValue = formatISODate(date)

        if ( minDate && selectedValue < minDate ) return

        onChange(selectedValue)
        setIsOpen(false)
    }

    const openCalendar = () => {
        if ( disabled ) return

        const dateToShow = selectedDate || minimumDate || new Date()

        setViewDate(new Date(dateToShow.getFullYear(), dateToShow.getMonth(), 1))
        setIsOpen((current) => !current)
    }

    return (
        <div
            ref = { containerRef }
            data-no-translate = 'true'
            className = 'relative w-full'
            lang = { locale }
        >

            {/* Date Input */}
            <button
                id = { id }
                type = 'button'
                onClick = { openCalendar }
                disabled = { disabled }
                aria-label = 'Choose date'
                aria-haspopup = 'dialog'
                aria-expanded = { isOpen }
                className = 'flex h-12 w-full min-w-0 items-center justify-between gap-3 rounded border border-[#B8C2CC] bg-white px-3 text-left text-sm text-[#55443B] outline-none transition-colors hover:border-[#8795A3] focus:border-[#8795A3] focus:ring-2 focus:ring-[#B8C2CC]/30 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60'
            >
                <span className = { selectedDate ? 'whitespace-nowrap' : 'whitespace-nowrap text-gray-400' }>
                    { selectedDate ? formatDisplayDate(selectedDate) : placeholder }
                </span>

                <CalendarDays size = { 18 } className = 'shrink-0 text-[#55443B]' />
            </button>

            {/* Calendar Popup */}
            { isOpen && !disabled && (
                <div
                    role = 'dialog'
                    aria-label = 'Choose date'
                    data-no-translate = 'true'
                    className = 'absolute left-0 top-full z-[60] mt-2 w-[min(20rem,calc(100vw-2rem))] rounded-xl border border-[#B8C2CC] bg-white p-4 shadow-xl'
                >

                    {/* Calendar Header */}
                    <div className = 'mb-4 flex items-center justify-between gap-2'>

                        <button
                            type = 'button'
                            onClick = { () => changeMonth(-1) }
                            aria-label = 'Previous month'
                            className = 'flex h-9 w-9 items-center justify-center rounded-lg text-[#55443B] transition hover:bg-[#F5EEE7]'
                        >
                            <ChevronLeft size = { 20 } />
                        </button>

                        <p className = 'text-sm font-semibold capitalize text-[#55443B]'>
                            { monthTitle }
                        </p>

                        <button
                            type = 'button'
                            onClick = { () => changeMonth(1) }
                            aria-label = 'Next month'
                            className = 'flex h-9 w-9 items-center justify-center rounded-lg text-[#55443B] transition hover:bg-[#F5EEE7]'
                        >
                            <ChevronRight size = { 20 } />
                        </button>

                    </div>

                    {/* Weekday Names */}
                    <div className = 'mb-2 grid grid-cols-7 gap-1'>
                        { weekdayLabels.map((day, index) => (
                            <div
                                key = { index }
                                className = 'flex h-8 items-center justify-center text-xs font-medium text-[#918077]'
                            >
                                { day }
                            </div>
                        ))}
                    </div>

                    {/* Calendar Days */}
                    <div className = 'grid grid-cols-7 gap-1'>

                        { calendarDays.map((date, index) => {
                            if ( !date ) {
                                return <div key = { `empty-${index}` } className = 'h-9' />
                            }

                            const dateValue = formatISODate(date)
                            const isSelected = dateValue === value
                            const isToday = dateValue === todayValue
                            const isDisabled = Boolean(minDate && dateValue < minDate)

                            return (
                                <button
                                    key = { dateValue }
                                    type = 'button'
                                    disabled = { isDisabled }
                                    onClick = { () => selectDate(date) }
                                    aria-label = { new Intl.DateTimeFormat(locale, {
                                        dateStyle: 'full',
                                    }).format(date) }
                                    aria-pressed = { isSelected }
                                    className = {`flex h-9 items-center justify-center rounded-lg text-sm transition
                                        ${ isSelected ? 'bg-[#A96F58] font-semibold text-white hover:bg-[#8F5946]' : ''}
                                        ${ !isSelected && isToday ? 'border border-[#A96F58] font-semibold text-[#A96F58]' : ''}
                                        ${ !isSelected && !isToday ? 'text-[#55443B] hover:bg-[#F5EEE7]' : ''}
                                        ${ isDisabled ? 'cursor-not-allowed opacity-25 hover:bg-transparent' : 'cursor-pointer'}`}
                                >
                                    { numberFormatter.format(date.getDate()) }
                                </button>
                            )
                        })}

                    </div>

                    {/* Today Button */}
                    <div className = 'mt-3 flex justify-end border-t border-[#EEE5DE] pt-3'>
                        <button
                            type = 'button'
                            onClick = { () => {
                                const today = new Date()
                                const todayString = formatISODate(today)

                                if ( !minDate || todayString >= minDate ) {
                                    selectDate(today)
                                    setViewDate(new Date(today.getFullYear(), today.getMonth(), 1))
                                }
                            }}
                            disabled = { Boolean(minDate && todayValue < minDate) }
                            className = 'rounded-lg px-3 py-1.5 text-xs font-medium text-[#A96F58] transition hover:bg-[#F5EEE7] disabled:cursor-not-allowed disabled:opacity-40'
                        >
                            { language === 'th' ? 'วันนี้' : language === 'zh' ? '今天' : language === 'ja' ? '今日' : 'Today' }
                        </button>
                    </div>

                </div>
            )}

        </div>
    )
}

export default LocalizedDatePicker
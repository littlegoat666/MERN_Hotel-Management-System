import React, { useEffect, useState } from 'react'
import {
    FileSpreadsheet, Download, CalendarDays, Users, UserRoundX,
    Wallet, ClipboardList, Filter, Search, RotateCcw, CalendarRange,
    TrendingUp, Clock3, BedDouble, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { useAppContext } from '../../context/AppContext'

const defaultFilters = { dateField: 'checkInDate', startDate: '', endDate: '', paymentStatus: 'all', roomType: 'all', search: '' }
const getParams = (filters) => Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== '' && value !== 'all' && value !== undefined))
const formatNumber = (value) => Number(value || 0).toLocaleString('en-US')
const formatMoney = (value, currency) => `${currency} ${Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const formatDate = (value) => value ? new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Bangkok' }) : '-'
const paymentStyle = (status) => status === 'Paid' ? 'bg-[#e3f4e7] text-[#258047] ring-[#bde2c6]' : 'bg-[#fde8e7] text-[#bd3f3c] ring-[#f3c7c4]'

const getBangkokDateParts = (value) => {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Bangkok',
        year: 'numeric',
        month: 'numeric',
    }).formatToParts(new Date(value))

    return {
        year: Number(parts.find((part) => part.type === 'year')?.value),
        month: Number(parts.find((part) => part.type === 'month')?.value),
    }
}

const sumBookings = (bookings) => bookings.reduce((total, booking) => total + Number(booking.totalPrice || 0), 0)

const ExportReports = () => {
    const { axios, getToken, currency, toast } = useAppContext()
    const [report, setReport] = useState(null)
    const [filters, setFilters] = useState(defaultFilters)
    const [activeFilters, setActiveFilters] = useState(defaultFilters)
    const [loading, setLoading] = useState(true)
    const [exporting, setExporting] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)

    const itemsPerPage = 10

    const fetchReport = async (selectedFilters = defaultFilters) => {
        try {
            setLoading(true)

            const { data } = await axios.get('/api/reports', {
                headers: { Authorization: `Bearer ${await getToken()}` },
                params: getParams(selectedFilters),
            })

            if (data.success) {
                setReport(data)
                setActiveFilters({ ...selectedFilters })
                setCurrentPage(1)
            } else {
                toast.error(data.message || 'Failed to load reports')
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || 'Failed to load reports')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchReport(defaultFilters)
    }, [])

    const changeFilter = (field, value) => {
        setFilters((previous) => ({ ...previous, [field]: value }))
    }

    const applyFilters = (event) => {
        event.preventDefault()

        if (filters.startDate && filters.endDate && filters.startDate > filters.endDate) {
            return toast.error('End date must be after start date')
        }

        fetchReport(filters)
    }

    const resetFilters = () => {
        setFilters(defaultFilters)
        fetchReport(defaultFilters)
    }

    const downloadExcel = async () => {
        try {
            setExporting(true)

            const response = await axios.get('/api/reports/export', {
                headers: { Authorization: `Bearer ${await getToken()}` },
                params: getParams(activeFilters),
                responseType: 'blob',
            })

            const file = new Blob([response.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            })

            const url = window.URL.createObjectURL(file)
            const link = document.createElement('a')

            link.href = url
            link.download = `Hotel_Report_${new Date().toISOString().slice(0, 10)}.xlsx`

            document.body.appendChild(link)
            link.click()
            link.remove()

            window.URL.revokeObjectURL(url)

            toast.success('Excel report downloaded successfully')
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to export Excel report')
        } finally {
            setExporting(false)
        }
    }

    // ======================================
    // BOOKING DATA + PAGINATION
    // ======================================

    const filteredBookings = report?.bookings || []

    const totalPages = Math.max(1, Math.ceil(filteredBookings.length / itemsPerPage))

    const paginatedBookings = filteredBookings.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1)

    // ======================================
    // HOTEL OVERVIEW
    // ======================================

    const paidBookings = filteredBookings.filter((booking) => Boolean(booking.isPaid) || booking.paymentStatus === 'Paid')
    const unpaidBookings = filteredBookings.filter((booking) => !Boolean(booking.isPaid) && booking.paymentStatus !== 'Paid')

    const bookingValue = sumBookings(filteredBookings)
    const paidRevenue = sumBookings(paidBookings)
    const currentPeriod = getBangkokDateParts(new Date())

    const paidBookingsInCurrentYear = paidBookings.filter((booking) => {
        if (!booking.bookingDate) return false
        return getBangkokDateParts(booking.bookingDate).year === currentPeriod.year
    })

    const paidBookingsInCurrentMonth = paidBookings.filter((booking) => {
        if (!booking.bookingDate) return false

        const bookingPeriod = getBangkokDateParts(booking.bookingDate)

        return bookingPeriod.year === currentPeriod.year && bookingPeriod.month === currentPeriod.month
    })

    const renterCard = activeFilters.paymentStatus === 'paid'
        ? {
            label: 'Paid Current Renters',
            value: paidBookings.length,
            note: 'Paid booking records matching filters',
            icon: Users,
            color: 'bg-[#e3f4e7] text-[#258047]',
        }
        : activeFilters.paymentStatus === 'unpaid'
            ? {
                label: 'Unpaid Current Renters',
                value: unpaidBookings.length,
                note: 'Unpaid booking records matching filters',
                icon: UserRoundX,
                color: 'bg-[#fde8e7] text-[#cf4944]',
            }
            : {
                label: 'Current Renters',
                value: filteredBookings.length,
                note: 'Booking records matching filters',
                icon: Users,
                color: 'bg-[#e5f2ff] text-[#3884c7]',
            }

    const summaryCards = [
        {
            label: 'Total Bookings',
            value: formatNumber(filteredBookings.length),
            note: 'Matching booking records',
            icon: ClipboardList,
            color: 'bg-[#fff0df] text-[#d97732]',
        },
        {
            ...renterCard,
            value: formatNumber(renterCard.value),
        },
        {
            label: 'Total Booking Value',
            value: formatMoney(bookingValue, currency),
            note: 'Paid and unpaid bookings',
            icon: CalendarDays,
            color: 'bg-[#eee7ff] text-[#8259c4]',
            money: true,
        },
        {
            label: 'Total Revenue',
            value: formatMoney(paidRevenue, currency),
            note: 'Paid bookings only',
            icon: Wallet,
            color: 'bg-[#e3f4e7] text-[#258047]',
            money: true,
        },
        {
            label: 'Annual Revenue',
            value: formatMoney(sumBookings(paidBookingsInCurrentYear), currency),
            note: `Paid revenue · ${currentPeriod.year}`,
            icon: CalendarRange,
            color: 'bg-[#eee7ff] text-[#8259c4]',
            money: true,
        },
        {
            label: 'Monthly Revenue',
            value: formatMoney(sumBookings(paidBookingsInCurrentMonth), currency),
            note: 'Paid revenue · This month',
            icon: TrendingUp,
            color: 'bg-[#ffe9dc] text-[#d66b35]',
            money: true,
        },
    ]

    const roomTypes = [...new Set((report?.rooms || []).map((room) => room.roomType).filter(Boolean))]

    const inputClass = 'w-full rounded-xl border border-[#e8ddd3] bg-[#faf7f3] px-3 py-3 text-sm text-[#63534a] outline-none transition focus:border-[#bf927b] focus:bg-white focus:ring-4 focus:ring-[#f1e4db]'

    // ======================================
    // RENDER
    // ======================================

    return (
        <div className = 'w-full space-y-7 pb-10 font-mali text-[#302925]'>

            <section className = 'relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#493832] via-[#76564b] to-[#a27560] p-6 text-[#fffaf5] shadow-lg shadow-[#76564b]/10 md:p-9'>
                <div className = 'pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border border-white/10' />
                <div className = 'pointer-events-none absolute -right-3 -top-10 h-52 w-52 rounded-full border border-white/10' />

                <div className = 'relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center'>
                    <div className = 'max-w-2xl'>
                        <h1 className = 'text-3xl font-semibold tracking-tight md:text-4xl'>Export & Reports</h1>
                        <p className = 'mt-3 max-w-xl text-sm leading-7 text-[#f1e2d8]/80 md:text-base'>Bookings, guest stays, and paid revenue at a glance.</p>
                    </div>

                    <div className = 'flex shrink-0 flex-col gap-2 md:items-end'>
                        <button type = 'button' onClick = {downloadExcel} disabled = {loading || exporting || !report} className = 'inline-flex items-center justify-center gap-3 rounded-xl bg-[#fffaf5] px-5 py-3.5 text-sm font-semibold text-[#76564b] shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50'>
                            <Download size = {18} />
                            {exporting ? 'Preparing Excel...' : 'Download Excel'}
                        </button>

                        <span className = 'text-xs text-[#f1e2d8]/70'>.xlsx · 2 worksheets</span>
                    </div>
                </div>
            </section>

            {/* HOTEL OVERVIEW */}
            <section>
                <div className = 'mb-4 flex flex-wrap items-end justify-between gap-2'>
                    <div>
                        <h2 className = 'text-lg font-semibold text-[#493a34]'>Hotel Overview</h2>
                        <p className = 'mt-1 text-xs text-[#a09287]'>Summary uses the same booking records shown below after applying Report Filters.</p>
                    </div>

                    {loading && <span className = 'text-xs font-medium text-[#a66f58]'>Updating report...</span>}
                </div>

                <div className = 'grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3'>
                    {summaryCards.map((item) => {
                        const Icon = item.icon

                        return (
                            <article key = {item.label} className = 'relative overflow-hidden rounded-2xl border border-[#e9ded5] bg-[#fffdfa] p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md'>
                                <div className = 'flex items-start justify-between gap-3'>
                                    <div className = 'min-w-0'>
                                        <p className = 'text-sm font-semibold text-[#806f64]'>{item.label}</p>
                                        <p className = {`mt-3 break-words font-semibold tracking-tight text-[#493a34] ${item.money ? 'text-xl' : 'text-3xl'}`}>{item.value}</p>
                                        <p className = 'mt-2 text-xs text-[#aa9a90]'>{item.note}</p>
                                    </div>

                                    <span className = {`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${item.color}`}>
                                        <Icon size = {22} strokeWidth = {2.1} />
                                    </span>
                                </div>
                            </article>
                        )
                    })}
                </div>
            </section>

            {/* REPORT FILTERS */}
            <section className = 'overflow-hidden rounded-2xl border border-[#e9ded5] bg-[#fffdfa] shadow-sm'>
                <div className = 'flex flex-wrap items-center justify-between gap-3 border-b border-[#eee5de] px-5 py-4 md:px-6'>
                    <div>
                        <div className = 'flex items-center gap-2'>
                            <Filter size = {18} className = 'text-[#a66f58]' />
                            <h2 className = 'font-semibold text-[#493a34]'>Report Filters</h2>
                        </div>
                        <p className = 'mt-1 text-xs text-[#a09287]'>Filter records before previewing or downloading the report.</p>
                    </div>

                    <span className = 'rounded-full bg-[#f5eee8] px-3 py-1 text-xs font-semibold text-[#92705e]'>Advanced Search</span>
                </div>

                <form onSubmit = {applyFilters} className = 'space-y-5 p-5 md:p-6'>
                    <div className = 'grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3'>
                        <div>
                            <label className = 'mb-2 block text-xs font-semibold text-[#806f64]'>Date Type</label>
                            <select value = {filters.dateField} onChange = {(event) => changeFilter('dateField', event.target.value)} className = {inputClass}>
                                <option value = 'bookingDate'>Booking Date</option>
                                <option value = 'checkInDate'>Check-in Date</option>
                                <option value = 'checkOutDate'>Check-out Date</option>
                            </select>
                        </div>

                        <div>
                            <label className = 'mb-2 block text-xs font-semibold text-[#806f64]'>Start Date</label>
                            <input type = 'date' value = {filters.startDate} onChange = {(event) => changeFilter('startDate', event.target.value)} className = {inputClass} />
                        </div>

                        <div>
                            <label className = 'mb-2 block text-xs font-semibold text-[#806f64]'>End Date</label>
                            <input type = 'date' value = {filters.endDate} onChange = {(event) => changeFilter('endDate', event.target.value)} className = {inputClass} />
                        </div>

                        <div>
                            <label className = 'mb-2 block text-xs font-semibold text-[#806f64]'>Payment Status</label>
                            <select value = {filters.paymentStatus} onChange = {(event) => changeFilter('paymentStatus', event.target.value)} className = {inputClass}>
                                <option value = 'all'>All Payments</option>
                                <option value = 'paid'>Paid</option>
                                <option value = 'unpaid'>Unpaid</option>
                            </select>
                        </div>

                        <div>
                            <label className = 'mb-2 block text-xs font-semibold text-[#806f64]'>Room Name</label>
                            <select value = {filters.roomType} onChange = {(event) => changeFilter('roomType', event.target.value)} className = {inputClass}>
                                <option value = 'all'>All Rooms</option>
                                {roomTypes.map((room) => <option key = {room} value = {room}>{room}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className = 'mb-2 block text-xs font-semibold text-[#806f64]'>Search</label>
                            <div className = 'relative'>
                                <Search size = {16} className = 'absolute left-3 top-1/2 -translate-y-1/2 text-[#ad9b90]' />
                                <input type = 'text' value = {filters.search} onChange = {(event) => changeFilter('search', event.target.value)} placeholder = 'Guest, email, room, booking ID...' className = {`${inputClass} pl-10`} />
                            </div>
                        </div>
                    </div>

                    <div className = 'flex flex-wrap justify-end gap-3 border-t border-[#eee5de] pt-5'>
                        <button type = 'button' onClick = {resetFilters} className = 'inline-flex items-center gap-2 rounded-xl border border-[#e5d9cf] px-5 py-2.5 text-sm font-semibold text-[#806f64] transition hover:bg-[#f8f3ee]'>
                            <RotateCcw size = {15} /> Reset Filters
                        </button>

                        <button type = 'submit' disabled = {loading} className = 'rounded-xl bg-[#9b6b55] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#9b6b55]/15 transition hover:bg-[#805541] disabled:opacity-50'>
                            {loading ? 'Applying...' : 'Apply Filters'}
                        </button>
                    </div>
                </form>
            </section>

            {/* BOOKING DETAILS */}
            <section className = 'overflow-hidden rounded-2xl border border-[#e9ded5] bg-[#fffdfa] shadow-sm'>
                <div className = 'flex flex-wrap items-center justify-between gap-3 border-b border-[#eee5de] px-5 py-4 md:px-6'>
                    <div>
                        <div className = 'flex items-center gap-2'>
                            <FileSpreadsheet size = {18} className = 'text-[#a66f58]' />
                            <h2 className = 'font-semibold text-[#493a34]'>Booking Details</h2>
                        </div>
                        <p className = 'mt-1 text-xs text-[#a09287]'>Full booking records for detailed checking and Excel export.</p>
                    </div>

                    <span className = 'rounded-full bg-[#f5eee8] px-3 py-1.5 text-xs font-semibold text-[#92705e]'>{filteredBookings.length} records</span>
                </div>

                {loading ? (
                    <div className = 'flex min-h-48 items-center justify-center text-sm text-[#a09287]'>Loading booking data...</div>
                ) : filteredBookings.length ? (
                    <div className = 'max-h-[560px] overflow-auto'>
                        <table className = 'w-full min-w-[1120px] border-collapse text-left text-sm'>
                            <thead className = 'sticky top-0 z-10 bg-[#f8f3ee]'>
                                <tr className = 'text-xs font-semibold uppercase tracking-wide text-[#927f73]'>
                                    <th className = 'px-5 py-4'>Guest</th>
                                    <th className = 'px-4 py-4'>Room</th>
                                    <th className = 'px-4 py-4'>Booking Date</th>
                                    <th className = 'px-4 py-4'>Check-in</th>
                                    <th className = 'px-4 py-4'>Check-out</th>
                                    <th className = 'px-4 py-4 text-center'>Adults</th>
                                    <th className = 'px-4 py-4 text-center'>Children</th>
                                    <th className = 'px-4 py-4 text-right'>Amount</th>
                                    <th className = 'px-5 py-4 text-center'>Payment</th>
                                </tr>
                            </thead>

                            <tbody className = 'divide-y divide-[#f0e8e2]'>
                                {paginatedBookings.map((booking) => (
                                    <tr key = {booking._id} className = 'transition hover:bg-[#fbf7f2]'>
                                        <td className = 'px-5 py-4'>
                                            <p className = 'font-semibold text-[#534239]'>{booking.guestName}</p>
                                            <p className = 'mt-1 text-xs text-[#aa9a90]'>{booking.guestEmail || 'No email'}</p>
                                        </td>

                                        <td className = 'px-4 py-4'>
                                            <span className = 'rounded-lg bg-[#f4ede7] px-2.5 py-1.5 text-xs font-medium text-[#80685a]'>{booking.roomName}</span>
                                        </td>

                                        <td className = 'px-4 py-4 text-[#88776c]'>{formatDate(booking.bookingDate)}</td>
                                        <td className = 'px-4 py-4 text-[#63534a]'>{formatDate(booking.checkInDate)}</td>
                                        <td className = 'px-4 py-4 text-[#63534a]'>{formatDate(booking.checkOutDate)}</td>
                                        <td className = 'px-4 py-4 text-center'>{booking.adults}</td>
                                        <td className = 'px-4 py-4 text-center'>{booking.children}</td>

                                        <td className = 'px-4 py-4 text-right font-semibold tabular-nums text-[#534239]'>
                                            {formatMoney(booking.totalPrice, currency)}
                                        </td>

                                        <td className = 'px-5 py-4 text-center'>
                                            <span className = {`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ring-1 ring-inset ${paymentStyle(booking.paymentStatus)}`}>
                                                {booking.paymentStatus}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className = 'flex min-h-56 flex-col items-center justify-center px-5 text-center'>
                        <FileSpreadsheet size = {28} className = 'mb-3 text-[#c1afa2]' />
                        <h3 className = 'font-semibold text-[#63534a]'>No bookings found</h3>
                        <p className = 'mt-2 max-w-sm text-xs leading-6 text-[#aa9a90]'>No records match the selected filters. Try changing the date range or payment status.</p>
                    </div>
                )}

                {/* PAGINATION */}
                {!loading && filteredBookings.length > 0 && (
                    <div className = 'flex flex-col gap-3 border-t border-[#eee5de] bg-[#fffdfa] px-5 py-4 sm:flex-row sm:items-center sm:justify-between'>
                        <p className = 'text-xs text-[#aa9a90]'>
                            Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredBookings.length)} of {filteredBookings.length} bookings
                        </p>

                        {totalPages > 1 && (
                            <div className = 'flex flex-wrap items-center justify-center gap-1.5'>
                                <button
                                    type = 'button'
                                    onClick = {() => setCurrentPage((page) => Math.max(1, page - 1))}
                                    disabled = {currentPage === 1}
                                    aria-label = 'Previous page'
                                    className = 'flex h-9 w-9 items-center justify-center rounded-lg border border-[#e8ddd3] text-[#806f64] transition hover:bg-[#f8f3ee] disabled:cursor-not-allowed disabled:opacity-40'
                                >
                                    <ChevronLeft size = {17} />
                                </button>

                                {pageNumbers.map((page) => (
                                    <button
                                        key = {page}
                                        type = 'button'
                                        onClick = {() => setCurrentPage(page)}
                                        aria-label = {`Go to page ${page}`}
                                        aria-current = {currentPage === page ? 'page' : undefined}
                                        className = {`h-9 min-w-9 rounded-lg px-3 text-xs font-semibold transition ${currentPage === page ? 'bg-[#9b6b55] text-white shadow-sm' : 'border border-[#e8ddd3] text-[#806f64] hover:bg-[#f8f3ee]'}`}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    type = 'button'
                                    onClick = {() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                                    disabled = {currentPage === totalPages}
                                    aria-label = 'Next page'
                                    className = 'flex h-9 w-9 items-center justify-center rounded-lg border border-[#e8ddd3] text-[#806f64] transition hover:bg-[#f8f3ee] disabled:cursor-not-allowed disabled:opacity-40'
                                >
                                    <ChevronRight size = {17} />
                                </button>
                            </div>
                        )}
                    </div>
                )}

                <div className = 'flex flex-wrap items-center justify-between gap-2 border-t border-[#eee5de] bg-[#faf7f3] px-5 py-3 text-xs text-[#aa9a90]'>
                    <span>Data reflects the selected report filters. Excel export includes all matching bookings.</span>
                    <span>Currency: {currency}</span>
                </div>
            </section>

            {/* REVENUE INFORMATION */}
            <section className = 'flex flex-col gap-3 rounded-2xl border border-[#e9ded5] bg-[#f8f3ee] p-5 md:flex-row md:items-center md:justify-between md:px-6'>
                <div className = 'flex items-start gap-3'>
                    <div className = 'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#a66f58]'>
                        <Clock3 size = {18} />
                    </div>

                    <div>
                        <p className = 'text-sm font-semibold text-[#6b5549]'>Revenue calculation</p>
                        <p className = 'mt-1 text-xs leading-6 text-[#927f73]'>
                            Payment status is based on the isPaid flag. Revenue is grouped by Booking Date (createdAt) in Bangkok time, not by Check-in Date or payment timestamp. Date Type only controls which booking records are included.
                        </p>
                    </div>
                </div>

                <span className = 'shrink-0 text-xs font-semibold text-[#a17a64]'>{currentPeriod.year}</span>
            </section>

        </div>
    )
}

export default ExportReports
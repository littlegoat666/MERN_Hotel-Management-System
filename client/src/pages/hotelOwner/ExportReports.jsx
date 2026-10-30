import React, { useEffect, useState } from 'react'
import { useAppContext } from '../../context/AppContext'

const defaultFilters = {
    dateField: 'bookingDate',
    startDate: '',
    endDate: '',
    paymentStatus: 'all',
    roomType: 'all',
    search: '',
}

const getParams = (selectedFilters) => {
    const params = { ...selectedFilters }

    Object.keys(params).forEach((key) => {
        if (
            params[key] === '' ||
            params[key] === 'all' ||
            params[key] === undefined
        ) {
            delete params[key]
        }
    })

    return params
}

const formatMoney = (value, currency) => {
    return `${currency} ${Number(value || 0).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`
}

const formatDate = (value) => {
    if (!value) return '-'

    return new Date(value).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'Asia/Bangkok',
    })
}

const getStatusStyle = (status) => {
    switch (status) {
        case 'Paid':
            return 'bg-emerald-50 text-emerald-700 ring-emerald-200'

        case 'Unpaid':
            return 'bg-amber-50 text-amber-700 ring-amber-200'

        case 'Cancelled':
            return 'bg-rose-50 text-rose-700 ring-rose-200'

        case 'Refund':
            return 'bg-violet-50 text-violet-700 ring-violet-200'

        default:
            return 'bg-slate-50 text-slate-600 ring-slate-200'
    }
}

const ExportReports = () => {
    const { axios, getToken, currency, toast } = useAppContext()

    const [report, setReport] = useState(null)
    const [filters, setFilters] = useState(defaultFilters)
    const [activeFilters, setActiveFilters] = useState(defaultFilters)

    const [loading, setLoading] = useState(true)
    const [exporting, setExporting] = useState(false)

    const fetchReport = async (selectedFilters = defaultFilters) => {
        try {
            setLoading(true)

            const token = await getToken()

            const { data } = await axios.get('/api/reports', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: getParams(selectedFilters),
            })

            if (data.success) {
                setReport(data)
                setActiveFilters({ ...selectedFilters })
            } else {
                toast.error(data.message || 'Failed to load reports')
            }

        } catch (error) {
            toast.error(
                error.response?.data?.message || error.message || 'Failed to load reports'
            )
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchReport(defaultFilters)
    }, [])

    const handleFilterChange = (field, value) => {
        setFilters((previous) => ({
            ...previous,
            [field]: value,
        }))
    }

    const handleApplyFilters = (event) => {
        event.preventDefault()

        if (
            filters.startDate &&
            filters.endDate &&
            filters.startDate > filters.endDate
        ) {
            toast.error('End date must be after start date')
            return
        }

        fetchReport(filters)
    }

    const handleReset = () => {
        setFilters(defaultFilters)
        fetchReport(defaultFilters)
    }

    const handleExport = async () => {
        try {
            setExporting(true)

            const token = await getToken()

            const response = await axios.get('/api/reports/export', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: getParams(activeFilters),
                responseType: 'blob',
            })

            const file = new Blob(
                [response.data],
                {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                }
            )

            const url = window.URL.createObjectURL(file)
            const link = document.createElement('a')

            link.href = url
            link.download = `Bupatara_Report_${new Date().toISOString().slice(0, 10)}.xlsx`

            document.body.appendChild(link)
            link.click()
            link.remove()

            window.URL.revokeObjectURL(url)

            toast.success('Excel report downloaded successfully')

        } catch (error) {
            toast.error('Failed to export Excel report')
        } finally {
            setExporting(false)
        }
    }

    const summary = report?.summary || {}

    const roomTypes = [
        ...new Set(
            (report?.rooms || [])
                .map((room) => room.roomType)
                .filter(Boolean)
        ),
    ]

    const summaryCards = [
        {
            label: 'Total Bookings',
            value: summary.totalBookings || 0,
            description: 'All matching reservations',
            icon: '▦',
            theme: 'from-blue-50 to-white border-blue-100 text-blue-700',
            iconTheme: 'bg-blue-100 text-blue-700',
        },
        {
            label: 'Paid Bookings',
            value: summary.paidBookings || 0,
            description: 'Successfully paid',
            icon: '✓',
            theme: 'from-emerald-50 to-white border-emerald-100 text-emerald-700',
            iconTheme: 'bg-emerald-100 text-emerald-700',
        },
        {
            label: 'Unpaid Bookings',
            value: summary.unpaidBookings || 0,
            description: 'Waiting for payment',
            icon: '◷',
            theme: 'from-amber-50 to-white border-amber-100 text-amber-700',
            iconTheme: 'bg-amber-100 text-amber-700',
        },
        {
            label: 'Cancelled',
            value: summary.cancelledBookings || 0,
            description: 'Cancelled reservations',
            icon: '×',
            theme: 'from-rose-50 to-white border-rose-100 text-rose-700',
            iconTheme: 'bg-rose-100 text-rose-700',
        },
        {
            label: 'Refunded',
            value: summary.refundedBookings || 0,
            description: 'Refund status records',
            icon: '↶',
            theme: 'from-violet-50 to-white border-violet-100 text-violet-700',
            iconTheme: 'bg-violet-100 text-violet-700',
        },
        {
            label: 'Paid Revenue',
            value: formatMoney(summary.paidRevenue, currency),
            description: 'Excludes refunded and cancelled',
            icon: '฿',
            theme: 'from-indigo-50 to-white border-indigo-100 text-indigo-700',
            iconTheme: 'bg-indigo-100 text-indigo-700',
            isMoney: true,
        },
    ]

    return (
        <div className = 'w-full space-y-7 pb-10 font-mali'>

            {/* Page Header */}
            <section className = 'relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-900 p-6 text-white shadow-xl shadow-blue-950/10 md:p-9'>

                <div className = 'pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border border-white/10' />
                <div className = 'pointer-events-none absolute -right-3 -top-10 h-52 w-52 rounded-full border border-white/10' />
                <div className = 'pointer-events-none absolute -bottom-28 right-1/4 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl' />

                <div className = 'relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center'>

                    <div className = 'max-w-2xl'>
                        <div className = 'mb-4 inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wider text-blue-100'>
                            <span className = 'h-2 w-2 rounded-full bg-emerald-400' />
                            HOTEL MANAGEMENT · REPORT CENTER
                        </div>

                        <h1 className = 'text-3xl font-semibold tracking-tight md:text-4xl'>
                            Export & Reports
                        </h1>

                        <p className = 'mt-3 max-w-xl text-sm leading-7 text-blue-100/80 md:text-base'>
                            Review booking activity, monitor payment performance, and export your hotel reports into an organized Excel workbook.
                        </p>

                        <p className = 'mt-4 text-xs font-medium tracking-wide text-blue-200/70'>
                            {report?.hotel?.name || 'Bupatara Chiangmai'}
                            {report?.hotel?.city ? ` · ${report.hotel.city}` : ''}
                        </p>
                    </div>

                    <div className = 'flex shrink-0 flex-col gap-2 md:items-end'>
                        <button
                            type = 'button'
                            onClick = { handleExport }
                            disabled = { loading || exporting || !report }
                            className = 'inline-flex items-center justify-center gap-3 rounded-xl bg-white px-5 py-3.5 text-sm font-semibold text-blue-950 shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50'
                        >
                            <span className = 'text-lg'>↓</span>
                            { exporting ? 'Preparing Excel...' : 'Download Excel' }
                        </button>

                        <span className = 'text-xs text-blue-100/60'>
                            .xlsx · 2 worksheets
                        </span>
                    </div>

                </div>
            </section>

            {/* Summary Cards */}
            <section>
                <div className = 'mb-4 flex flex-wrap items-end justify-between gap-2'>
                    <div>
                        <h2 className = 'text-lg font-semibold text-slate-800'>
                            Booking Overview
                        </h2>
                        <p className = 'mt-1 text-xs text-slate-500'>
                            Summary based on your selected filters
                        </p>
                    </div>

                    {loading && (
                        <span className = 'text-xs font-medium text-blue-600'>
                            Updating report...
                        </span>
                    )}
                </div>

                <div className = 'grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3'>
                    {summaryCards.map((item) => (
                        <div
                            key = { item.label }
                            className = {`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md ${item.theme}`}
                        >
                            <div className = 'flex items-start justify-between gap-3'>
                                <div>
                                    <p className = 'text-sm font-semibold opacity-80'>
                                        {item.label}
                                    </p>

                                    <p className = {`mt-3 font-semibold tracking-tight ${item.isMoney ? 'text-xl' : 'text-3xl'}`}>
                                        {item.value}
                                    </p>

                                    <p className = 'mt-2 text-xs opacity-60'>
                                        {item.description}
                                    </p>
                                </div>

                                <div className = {`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl font-semibold ${item.iconTheme}`}>
                                    {item.icon}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Filters */}
            <section className = 'overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'>

                <div className = 'flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 md:px-6'>
                    <div>
                        <h2 className = 'font-semibold text-slate-800'>
                            Report Filters
                        </h2>
                        <p className = 'mt-1 text-xs text-slate-500'>
                            Narrow down the bookings you want to review or export.
                        </p>
                    </div>

                    <span className = 'rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700'>
                        Advanced search
                    </span>
                </div>

                <form onSubmit = { handleApplyFilters } className = 'space-y-5 p-5 md:p-6'>

                    <div className = 'grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3'>

                        <div>
                            <label className = 'mb-2 block text-xs font-semibold text-slate-600'>
                                Date Type
                            </label>

                            <select
                                value = { filters.dateField }
                                onChange = { (event) => handleFilterChange('dateField', event.target.value) }
                                className = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100'
                            >
                                <option value = 'bookingDate'>Booking Date</option>
                                <option value = 'checkInDate'>Check-in Date</option>
                                <option value = 'checkOutDate'>Check-out Date</option>
                            </select>
                        </div>

                        <div>
                            <label className = 'mb-2 block text-xs font-semibold text-slate-600'>
                                Start Date
                            </label>

                            <input
                                type = 'date'
                                value = { filters.startDate }
                                onChange = { (event) => handleFilterChange('startDate', event.target.value) }
                                className = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100'
                            />
                        </div>

                        <div>
                            <label className = 'mb-2 block text-xs font-semibold text-slate-600'>
                                End Date
                            </label>

                            <input
                                type = 'date'
                                value = { filters.endDate }
                                onChange = { (event) => handleFilterChange('endDate', event.target.value) }
                                className = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100'
                            />
                        </div>

                        <div>
                            <label className = 'mb-2 block text-xs font-semibold text-slate-600'>
                                Payment Status
                            </label>

                            <select
                                value = { filters.paymentStatus }
                                onChange = { (event) => handleFilterChange('paymentStatus', event.target.value) }
                                className = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100'
                            >
                                <option value = 'all'>All Statuses</option>
                                <option value = 'paid'>Paid</option>
                                <option value = 'unpaid'>Unpaid</option>
                                <option value = 'cancelled'>Cancelled</option>
                                <option value = 'refunded'>Refund</option>
                            </select>
                        </div>

                        <div>
                            <label className = 'mb-2 block text-xs font-semibold text-slate-600'>
                                Room Type
                            </label>

                            <select
                                value = { filters.roomType }
                                onChange = { (event) => handleFilterChange('roomType', event.target.value) }
                                className = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100'
                            >
                                <option value = 'all'>All Room Types</option>

                                {roomTypes.map((roomType) => (
                                    <option key = { roomType } value = { roomType }>
                                        {roomType}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className = 'mb-2 block text-xs font-semibold text-slate-600'>
                                Search
                            </label>

                            <input
                                type = 'text'
                                value = { filters.search }
                                onChange = { (event) => handleFilterChange('search', event.target.value) }
                                placeholder = 'Guest, email, room, booking ID...'
                                className = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100'
                            />
                        </div>

                    </div>

                    <div className = 'flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5'>
                        <button
                            type = 'button'
                            onClick = { handleReset }
                            className = 'rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50'
                        >
                            Reset Filters
                        </button>

                        <button
                            type = 'submit'
                            disabled = { loading }
                            className = 'rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50'
                        >
                            {loading ? 'Applying...' : 'Apply Filters'}
                        </button>
                    </div>

                </form>
            </section>

            {/* Booking Preview */}
            <section className = 'overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'>

                <div className = 'flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 md:px-6'>
                    <div>
                        <h2 className = 'font-semibold text-slate-800'>
                            Booking Details
                        </h2>
                        <p className = 'mt-1 text-xs text-slate-500'>
                            Preview of the records included in your Excel export.
                        </p>
                    </div>

                    <div className = 'rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600'>
                        {report?.bookings?.length || 0} records
                    </div>
                </div>

                {loading ? (
                    <div className = 'flex min-h-48 items-center justify-center'>
                        <div className = 'flex items-center gap-3 text-sm text-slate-500'>
                            <span className = 'h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent' />
                            Loading booking data...
                        </div>
                    </div>
                ) : report?.bookings?.length ? (
                    <div className = 'max-h-[560px] overflow-auto'>
                        <table className = 'w-full min-w-[1050px] border-collapse text-left text-sm'>

                            <thead className = 'sticky top-0 z-10 bg-slate-50'>
                                <tr className = 'text-xs font-semibold uppercase tracking-wide text-slate-500'>
                                    <th className = 'px-5 py-4'>Guest</th>
                                    <th className = 'px-4 py-4'>Room</th>
                                    <th className = 'px-4 py-4'>Booking Date</th>
                                    <th className = 'px-4 py-4'>Stay</th>
                                    <th className = 'px-4 py-4 text-center'>Guests</th>
                                    <th className = 'px-4 py-4 text-right'>Amount</th>
                                    <th className = 'px-5 py-4 text-center'>Payment</th>
                                </tr>
                            </thead>

                            <tbody className = 'divide-y divide-slate-100'>
                                {report.bookings.map((booking) => (
                                    <tr key = { booking._id } className = 'transition hover:bg-blue-50/40'>

                                        <td className = 'px-5 py-4'>
                                            <p className = 'font-semibold text-slate-800'>
                                                {booking.guestName}
                                            </p>
                                            <p className = 'mt-1 text-xs text-slate-400'>
                                                {booking.guestEmail || 'No email'}
                                            </p>
                                        </td>

                                        <td className = 'px-4 py-4'>
                                            <span className = 'rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-700'>
                                                {booking.roomName}
                                            </span>
                                        </td>

                                        <td className = 'px-4 py-4 text-slate-500'>
                                            {formatDate(booking.bookingDate)}
                                        </td>

                                        <td className = 'px-4 py-4'>
                                            <p className = 'text-slate-700'>
                                                {formatDate(booking.checkInDate)}
                                            </p>
                                            <p className = 'mt-1 text-xs text-slate-400'>
                                                to {formatDate(booking.checkOutDate)}
                                            </p>
                                        </td>

                                        <td className = 'px-4 py-4 text-center'>
                                            <p className = 'font-semibold text-slate-700'>
                                                {booking.guests}
                                            </p>
                                            <p className = 'mt-1 text-xs text-slate-400'>
                                                {booking.adults} Adult · {booking.children} Child
                                            </p>
                                        </td>

                                        <td className = 'px-4 py-4 text-right font-semibold tabular-nums text-slate-800'>
                                            {formatMoney(booking.totalPrice, currency)}
                                        </td>

                                        <td className = 'px-5 py-4 text-center'>
                                            <span className = {`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${getStatusStyle(booking.paymentStatus)}`}>
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
                        <div className = 'mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl text-slate-400'>
                            ▦
                        </div>

                        <h3 className = 'font-semibold text-slate-700'>
                            No bookings found
                        </h3>

                        <p className = 'mt-2 max-w-sm text-xs leading-6 text-slate-400'>
                            No records match your current filters. Try changing the date range or selecting another payment status.
                        </p>
                    </div>
                )}

                <div className = 'flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-3 text-xs text-slate-400'>
                    <span>Data is based on the selected report filters.</span>
                    <span>Currency: {currency}</span>
                </div>

            </section>

        </div>
    )
}

export default ExportReports
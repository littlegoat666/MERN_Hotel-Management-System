import React, { useEffect, useMemo, useState } from 'react'
import {
    Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer,
    Tooltip, XAxis, YAxis,
} from 'recharts'
import {
    CalendarDays, Wallet, TrendingUp, ChartColumnIncreasing, ChartLine,
    BedDouble, Users, Clock3,
} from 'lucide-react'
import { useAppContext } from '../../context/AppContext'

const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
]

const formatMoney = (value, currency) => `${currency} ${Number(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
})}`

const formatCompactMoney = (value, currency) => {
    const amount = Number(value || 0)
    if (amount >= 1000000) return `${currency}${(amount / 1000000).toFixed(1)}M`
    if (amount >= 1000) return `${currency}${(amount / 1000).toFixed(1)}K`
    return `${currency}${Math.round(amount).toLocaleString('en-US')}`
}

const formatDate = (value) => value ? new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Bangkok',
}) : '-'

const userColors = [
    { backgroundColor: '#D8C4EE', color: '#69459A' },
    { backgroundColor: '#C5DDF0', color: '#3E6790' },
    { backgroundColor: '#C6E5D2', color: '#35704F' },
    { backgroundColor: '#F0C9D8', color: '#914A68' },
    { backgroundColor: '#F1D0B8', color: '#96552F' },
    { backgroundColor: '#E9D9A8', color: '#80651D' },
    { backgroundColor: '#C5E2E6', color: '#36737B' },
    { backgroundColor: '#D9C7E5', color: '#714A83' },
    { backgroundColor: '#D8E3B8', color: '#5E7330' },
    { backgroundColor: '#F3C9B8', color: '#9A563E' },
    { backgroundColor: '#C9D7F0', color: '#49658F' },
    { backgroundColor: '#E5C9E8', color: '#7A4D82' },
]

const getUserColor = (booking) => {
    const key = String(booking.user?._id || booking.user?.id || booking.user?.email || booking.user?.username || booking.guestName || booking._id || 'guest')
    let hash = 0
    for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) | 0
    return userColors[Math.abs(hash) % userColors.length]
}

const RevenueTooltip = ({ active, payload, label, currency }) => {
    if (!active || !payload?.length) return null

    return (
        <div className = 'min-w-[175px] rounded-2xl border border-[#B8C2CC] bg-gradient-to-br from-[#493832] via-[#62483d] to-[#76564b] px-4 py-3 shadow-2xl shadow-[#493832]/30'>
            <p className = 'text-[11px] font-semibold uppercase tracking-[0.12em] text-[#e8cdbd]'>{label}</p>
            {payload.map((item) => (
                <div key = {item.dataKey} className = 'mt-2 flex items-center justify-between gap-4'>
                    <div className = 'flex items-center gap-2 text-[10px] text-[#ead8cc]'>
                        <span className = 'h-2 w-2 rounded-full' style = {{ backgroundColor: item.dataKey === 'paidRevenue' ? '#62B77B' : '#E56B68' }} />
                        {item.dataKey === 'paidRevenue' ? 'Paid Revenue' : 'Unpaid'}
                    </div>
                    <p className = 'text-sm font-bold text-[#fffaf5]'>{formatMoney(item.value, currency)}</p>
                </div>
            ))}
        </div>
    )
}

const Dashboard = () => {
    const { currency, user, getToken, toast, axios } = useAppContext()
    const now = new Date()
    const [chartPeriod, setChartPeriod] = useState('year')
    const [chartType, setChartType] = useState('area')
    const [selectedYear, setSelectedYear] = useState(now.getFullYear())
    const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1)
    const [loading, setLoading] = useState(true)
    const [dashboardData, setDashboardData] = useState({
        bookings: [], totalBookings: 0, totalRevenue: 0,
        monthlyRevenue: [], dailyRevenue: [], yearlyRevenue: [],
        availableYears: [now.getFullYear()], currentYear: now.getFullYear(),
        selectedYear: now.getFullYear(), selectedMonth: now.getMonth() + 1,
    })

    useEffect(() => {
        if (!user) return undefined
        let active = true

        const load = async () => {
            try {
                setLoading(true)
                const { data } = await axios.get('/api/bookings/hotel', {
                    headers: { Authorization: `Bearer ${await getToken()}` },
                    params: { year: selectedYear, month: selectedMonth },
                })

                if (!active) return
                if (data.success) {
                    setDashboardData(data.dashboardData)
                } else {
                    toast.error(data.message || 'Unable to load dashboard')
                }
            } catch (error) {
                if (active) toast.error(error.response?.data?.message || error.message)
            } finally {
                if (active) setLoading(false)
            }
        }

        load()
        return () => { active = false }
    }, [user, selectedYear, selectedMonth])

    const chartData = useMemo(() => {
        const bookings = dashboardData.bookings || []

        const getUnpaid = (year, month, day = null) => bookings
            .filter((booking) => {
                if (booking.isPaid || !booking.createdAt) return false

                const date = new Date(booking.createdAt)
                const bookingYear = Number(new Intl.DateTimeFormat('en-US', {
                    timeZone: 'Asia/Bangkok', year: 'numeric',
                }).format(date))
                const bookingMonth = Number(new Intl.DateTimeFormat('en-US', {
                    timeZone: 'Asia/Bangkok', month: 'numeric',
                }).format(date))
                const bookingDay = Number(new Intl.DateTimeFormat('en-US', {
                    timeZone: 'Asia/Bangkok', day: 'numeric',
                }).format(date))

                return bookingYear === year && bookingMonth === month && (day === null || bookingDay === day)
            })
            .reduce((total, booking) => total + Number(booking.totalPrice || 0), 0)

        if (chartPeriod === 'year') {
            return (dashboardData.monthlyRevenue || []).map((item, index) => ({
                label: item.month,
                paidRevenue: Number(item.revenue || 0),
                unpaidRevenue: getUnpaid(selectedYear, index + 1),
            }))
        }

        return (dashboardData.dailyRevenue || []).map((item) => ({
            label: String(item.day),
            paidRevenue: Number(item.revenue || 0),
            unpaidRevenue: getUnpaid(selectedYear, selectedMonth, item.day),
        }))
    }, [chartPeriod, dashboardData.monthlyRevenue, dashboardData.dailyRevenue, dashboardData.bookings, selectedYear, selectedMonth])

    const totalForPeriod = chartData.reduce((total, item) => total + item.paidRevenue, 0)
    const bestPoint = chartData.reduce((best, item) => item.paidRevenue > (best?.paidRevenue ?? -1) ? item : best, null)
    const years = dashboardData.availableYears?.length ? dashboardData.availableYears : [now.getFullYear()]
    const periodName = chartPeriod === 'year' ? String(selectedYear) : `${monthNames[selectedMonth - 1]} ${selectedYear}`

    // Show only the 10 newest bookings. Fewer records display their actual count.
    const latestBookings = (dashboardData.bookings || []).slice(0, 10)

    const statusStyle = (booking) => booking.isPaid
        ? 'bg-[#e3f4e7] text-[#258047] ring-[#bde2c6]'
        : 'bg-[#fde8e7] text-[#bd3f3c] ring-[#f3c7c4]'

    return (
        <div className = 'w-full space-y-7 pb-10 font-mali text-[#302925]'>
            <section className = 'relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#493832] via-[#76564b] to-[#a27560] px-6 py-8 text-[#fffaf5] shadow-lg shadow-[#76564b]/10 md:px-9 md:py-10'>
                <div className = 'pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full border border-white/10' />
                <div className = 'pointer-events-none absolute -right-3 -top-8 h-52 w-52 rounded-full border border-white/10' />
                <div className = 'pointer-events-none absolute -bottom-24 right-1/4 h-64 w-64 rounded-full bg-[#d9a58e]/10 blur-3xl' />
                <div className = 'relative z-10 flex flex-wrap items-end justify-between gap-5'>
                    <div>
                        <h1 className = 'text-4xl font-semibold tracking-tight md:text-5xl'>Dashboard</h1>
                    </div>
                </div>
            </section>

            <section className = 'grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <article className = 'rounded-2xl border border-[#e9ded5] bg-[#fffdfa] p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md md:p-6'>
                    <div className = 'flex items-start justify-between gap-4'>
                        <div><p className = 'text-sm font-medium text-[#8d7b70]'>Total Bookings</p><p className = 'mt-3 text-3xl font-semibold text-[#493a34]'>{Number(dashboardData.totalBookings || 0).toLocaleString()}</p><p className = 'mt-2 text-xs text-[#aa9a90]'>All reservations recorded</p></div>
                        <span className = 'flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff0df] text-[#d97732]'><CalendarDays size = {22} /></span>
                    </div>
                </article>
                <article className = 'rounded-2xl border border-[#e9ded5] bg-[#fffdfa] p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md md:p-6'>
                    <div className = 'flex items-start justify-between gap-4'>
                        <div><p className = 'text-sm font-medium text-[#8d7b70]'>Paid Revenue</p><p className = 'mt-3 break-words text-2xl font-semibold text-[#493a34] md:text-3xl'>{formatMoney(dashboardData.totalRevenue, currency)}</p><p className = 'mt-2 text-xs text-[#aa9a90]'>Paid bookings only</p></div>
                        <span className = 'flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e3f4e7] text-[#258047]'><Wallet size = {22} /></span>
                    </div>
                </article>
            </section>

            <section className = 'overflow-hidden rounded-3xl border border-[#e9ded5] bg-[#fffdfa] shadow-sm'>
                <div className = 'border-b border-[#eee5de] px-5 py-5 md:px-7 md:py-6'>
                    <div className = 'flex flex-col justify-between gap-5 xl:flex-row xl:items-center'>
                        <div className = 'flex items-center gap-3'>
                            <span className = 'flex h-11 w-11 items-center justify-center rounded-xl bg-[#c5e2e6] text-[#36737b]'><TrendingUp size = {21} /></span>
                            <div><h2 className = 'text-lg font-semibold text-[#493a34]'>Revenue Analytics</h2></div>
                        </div>

                        <div className = 'flex flex-wrap items-center gap-2'>
                            <div className = 'flex rounded-xl bg-[#f5eee8] p-1'>
                                <button type = 'button' onClick = {() => setChartPeriod('year')} className = {`rounded-lg px-4 py-2 text-xs font-semibold transition ${chartPeriod === 'year' ? 'bg-white text-[#965f49] shadow-sm' : 'text-[#927f73] hover:text-[#6c5145]'}`}>Year · 12 months</button>
                                <button type = 'button' onClick = {() => setChartPeriod('month')} className = {`rounded-lg px-4 py-2 text-xs font-semibold transition ${chartPeriod === 'month' ? 'bg-white text-[#965f49] shadow-sm' : 'text-[#927f73] hover:text-[#6c5145]'}`}>Month · Daily</button>
                            </div>

                            <select value = {selectedYear} onChange = {(event) => setSelectedYear(Number(event.target.value))} className = 'rounded-xl border border-[#e8ddd3] bg-white px-3 py-2.5 text-xs font-semibold text-[#806f64] outline-none focus:border-[#bf927b]'>
                                {years.map((year) => <option key = {year} value = {year}>{year}</option>)}
                            </select>

                            {chartPeriod === 'month' && (
                                <select value = {selectedMonth} onChange = {(event) => setSelectedMonth(Number(event.target.value))} className = 'rounded-xl border border-[#e8ddd3] bg-white px-3 py-2.5 text-xs font-semibold text-[#806f64] outline-none focus:border-[#bf927b]'>
                                    {monthNames.map((month, index) => <option key = {month} value = {index + 1}>{month}</option>)}
                                </select>
                            )}

                            <div className = 'flex rounded-xl border border-[#e9ded5] bg-white p-1'>
                                <button type = 'button' title = 'Area chart' onClick = {() => setChartType('area')} className = {`flex h-9 w-10 items-center justify-center rounded-lg transition ${chartType === 'area' ? 'bg-[#e3f4e7] text-[#258047]' : 'text-[#8c9aa5] hover:bg-[#f2f6f7]'}`}><ChartLine size = {18} /></button>
                                <button type = 'button' title = 'Bar chart' onClick = {() => setChartType('bar')} className = {`flex h-9 w-10 items-center justify-center rounded-lg transition ${chartType === 'bar' ? 'bg-[#e3f4e7] text-[#258047]' : 'text-[#8c9aa5] hover:bg-[#f2f6f7]'}`}><ChartColumnIncreasing size = {18} /></button>
                            </div>
                        </div>
                    </div>

                    <div className = 'mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3'>
                        <div className = 'rounded-2xl bg-[#f8f3ee] p-4'><p className = 'text-[10px] font-bold tracking-[0.14em] text-[#a09287]'>{chartPeriod === 'year' ? 'YEAR REVENUE' : 'MONTH REVENUE'}</p><p className = 'mt-2 text-xl font-semibold tracking-tight text-[#76564b]'>{formatMoney(totalForPeriod, currency)}</p><p className = 'mt-1 text-[13px] font-semibold text-[#806d61]'>{periodName}</p></div>
                        <div className = 'rounded-2xl bg-[#f8f3ee] p-4'><p className = 'text-[10px] font-bold tracking-[0.14em] text-[#a09287]'>BEST {chartPeriod === 'year' ? 'MONTH' : 'DAY'}</p><p className = 'mt-2 text-xl font-semibold tracking-tight text-[#76564b]'>{bestPoint?.label || '-'}</p><p className = 'mt-1 text-[13px] font-semibold text-[#806d61]'>{formatMoney(bestPoint?.paidRevenue || 0, currency)}</p></div>
                        <div className = 'rounded-2xl bg-[#f8f3ee] p-4'><p className = 'text-[10px] font-bold tracking-[0.14em] text-[#a09287]'>DATA POINTS</p><p className = 'mt-2 text-xl font-semibold tracking-tight text-[#76564b]'>{chartData.length}</p><p className = 'mt-1 text-[13px] font-semibold text-[#806d61]'>{chartPeriod === 'year' ? '12 months in selected year' : `days in ${monthNames[selectedMonth - 1]}`}</p></div>
                    </div>
                </div>

                <div className = 'px-3 pb-5 pt-6 md:px-7 md:pb-7'>
                    {loading ? (
                        <div className = 'flex h-[360px] items-center justify-center text-sm text-[#a09287]'>Loading revenue data...</div>
                    ) : chartData.length ? (
                        <div className = 'rounded-2xl border border-[#B8C2CC] bg-[#fbf0e8] p-3'>
                            <div className = 'h-[320px] w-full sm:h-[370px]'>
                            <ResponsiveContainer width = '100%' height = '100%'>
                                {chartType === 'area' ? (
                                    <AreaChart data = {chartData} margin = {{ top: 14, right: 20, left: 8, bottom: 4 }}>
                                        <defs>
                                            <linearGradient id = 'bupataraPaidRevenueGradient' x1 = '0' y1 = '0' x2 = '0' y2 = '1'>
                                                <stop offset = '0%' stopColor = '#62B77B' stopOpacity = {0.30} />
                                                <stop offset = '72%' stopColor = '#8AC79A' stopOpacity = {0.10} />
                                                <stop offset = '100%' stopColor = '#B8DCC0' stopOpacity = {0.015} />
                                            </linearGradient>
                                            <linearGradient id = 'bupataraUnpaidRevenueGradient' x1 = '0' y1 = '0' x2 = '0' y2 = '1'>
                                                <stop offset = '0%' stopColor = '#E56B68' stopOpacity = {0.28} />
                                                <stop offset = '72%' stopColor = '#E99A98' stopOpacity = {0.09} />
                                                <stop offset = '100%' stopColor = '#F0C3C1' stopOpacity = {0.015} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid stroke = '#eee5de' strokeDasharray = '4 7' vertical = {false} />
                                        <XAxis dataKey = 'label' axisLine = {false} tickLine = {false} tick={{ fill: '#9f8d81', fontSize: chartPeriod === 'year' ? 12 : 10 }} interval = {chartPeriod === 'year' ? 0 : 2} dy = {10} />
                                        <YAxis axisLine = {false} tickLine = {false} width = {76} tick={{ fill: '#a99a90', fontSize: 11 }} tickFormatter = {(value) => formatCompactMoney(value, currency)} />
                                        <Tooltip content = {<RevenueTooltip currency = {currency} />} cursor = {{ stroke: '#c8a18d', strokeDasharray: '4 4' }} />
                                        <Area type = 'monotone' dataKey = 'paidRevenue' name = 'Paid Revenue' stroke = '#3F9A5D' strokeWidth = {3.5} fill = 'url(#bupataraPaidRevenueGradient)' activeDot = {{ r: 7, fill: '#fffdfa', stroke: '#3F9A5D', strokeWidth: 3 }} dot = {chartPeriod === 'year' ? { r: 3, fill: '#fffdfa', stroke: '#3F9A5D', strokeWidth: 2 } : false} animationDuration = {650} />
                                        <Area type = 'monotone' dataKey = 'unpaidRevenue' name = 'Unpaid' stroke = '#D94F4C' strokeWidth = {3} fill = 'url(#bupataraUnpaidRevenueGradient)' activeDot = {{ r: 6, fill: '#fffdfa', stroke: '#D94F4C', strokeWidth: 3 }} dot = {chartPeriod === 'year' ? { r: 3, fill: '#fffdfa', stroke: '#D94F4C', strokeWidth: 2 } : false} animationDuration = {650} />
                                    </AreaChart>
                                ) : (
                                    <BarChart data = {chartData} margin = {{ top: 14, right: 20, left: 8, bottom: 4 }} barCategoryGap = {chartPeriod === 'year' ? '32%' : '18%'}>
                                        <defs>
                                            <linearGradient id = 'bupataraPaidRevenueBarGradient' x1 = '0' y1 = '0' x2 = '0' y2 = '1'>
                                                <stop offset = '0%' stopColor = '#63B77B' />
                                                <stop offset = '100%' stopColor = '#3F9A5D' />
                                            </linearGradient>
                                            <linearGradient id = 'bupataraUnpaidRevenueBarGradient' x1 = '0' y1 = '0' x2 = '0' y2 = '1'>
                                                <stop offset = '0%' stopColor = '#E56B68' />
                                                <stop offset = '100%' stopColor = '#D94F4C' />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid stroke = '#eee5de' strokeDasharray = '4 7' vertical = {false} />
                                        <XAxis dataKey = 'label' axisLine = {false} tickLine = {false} tick={{ fill: '#9f8d81', fontSize: chartPeriod === 'year' ? 12 : 10 }} interval = {chartPeriod === 'year' ? 0 : 2} dy = {10} />
                                        <YAxis axisLine = {false} tickLine = {false} width = {76} tick={{ fill: '#a99a90', fontSize: 11 }} tickFormatter = {(value) => formatCompactMoney(value, currency)} />
                                        <Tooltip content = {<RevenueTooltip currency = {currency} />} cursor = {{ fill: '#f7eee7', opacity: 0.7 }} />
                                        <Bar dataKey = 'paidRevenue' name = 'Paid Revenue' fill = 'url(#bupataraPaidRevenueBarGradient)' radius = {[7, 7, 2, 2]} maxBarSize = {chartPeriod === 'year' ? 42 : 19} animationDuration = {650} />
                                        <Bar dataKey = 'unpaidRevenue' name = 'Unpaid' fill = 'url(#bupataraUnpaidRevenueBarGradient)' radius = {[7, 7, 2, 2]} maxBarSize = {chartPeriod === 'year' ? 42 : 19} animationDuration = {650} />
                                    </BarChart>
                                )}
                            </ResponsiveContainer>
                            </div>
                        </div>
                    ) : (
                        <div className = 'flex h-[320px] flex-col items-center justify-center text-center'><TrendingUp size = {34} className = 'mb-3 text-[#c1afa2]' /><p className = 'font-semibold text-[#806d61]'>No revenue data for this period</p><p className = 'mt-1 text-xs text-[#aa9a90]'>Paid bookings will appear here when available.</p></div>
                    )}

                    <div className = 'mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#f0e8e2] pt-4 text-xs text-[#a09287]'>
                        <div className = 'flex flex-wrap items-center gap-4'>
                            <div className = 'flex items-center gap-2'><span className = 'h-2.5 w-2.5 rounded-full bg-[#3F9A5D]' /> Paid Revenue</div>
                            <div className = 'flex items-center gap-2'><span className = 'h-2.5 w-2.5 rounded-full bg-[#D94F4C]' /> Unpaid</div>
                        </div>
                        <span>{chartPeriod === 'year' ? `12 monthly points · ${selectedYear}` : `${chartData.length} daily points · ${periodName}`}</span>
                    </div>
                </div>
            </section>

            <section className = 'overflow-hidden rounded-2xl border border-[#e9ded5] bg-[#fffdfa] shadow-sm'>
                <div className = 'flex flex-wrap items-center justify-between gap-3 border-b border-[#eee5de] px-5 py-5 md:px-7'>
                    <div className = 'flex items-center gap-2'><span className = 'flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0c9d8] text-[#914a68]'><Clock3 size = {19} /></span><div><h2 className = 'text-lg font-semibold text-[#493a34]'>Latest Booking Activity</h2><p className = 'mt-1 text-xs text-[#a09287]'>Showing the {latestBookings.length} most recent reservations.</p></div></div>
                    <span className = 'rounded-full bg-[#f5eee8] px-3 py-1.5 text-xs font-semibold text-[#92705e]'>Latest {latestBookings.length}</span>
                </div>
                <div className = 'divide-y divide-[#f0e8e2]'>
                    {latestBookings.map((item) => (
                        <div key = {item._id} className = 'flex flex-col gap-3 px-5 py-4 transition hover:bg-[#fbf7f2] sm:flex-row sm:items-center sm:justify-between md:px-7'>
                            <div className = 'flex min-w-0 items-center gap-3'><span className = 'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl' style = { getUserColor(item) }><Users size = {19} /></span><div className = 'min-w-0'><p className = 'truncate text-sm font-semibold text-[#534239]'>{item.user?.username || item.guestName || item.user?.email || 'Guest'}</p><p className = 'mt-1 text-xs text-[#aa9a90]'>{item.room?.roomType || item.roomName || 'Room'}</p></div></div>
                            <div className = 'flex flex-wrap items-center gap-x-5 gap-y-2 pl-[52px] sm:pl-0'><div className = 'text-xs text-[#927f73]'><span className = 'mb-1 block text-[10px] text-[#b1a298]'>STAY</span>{formatDate(item.checkInDate)} <span className = 'px-1'>—</span> {formatDate(item.checkOutDate)}</div><span className = {`inline-flex rounded-full px-3 py-1.5 text-[11px] font-bold ring-1 ring-inset ${statusStyle(item)}`}>{item.isPaid ? 'PAID' : 'UNPAID'}</span></div>
                        </div>
                    ))}
                    {!latestBookings.length && <div className = 'px-5 py-14 text-center'><BedDouble size = {30} className = 'mx-auto mb-3 text-[#c1afa2]' /><p className = 'font-semibold text-[#806d61]'>No bookings yet</p><p className = 'mt-1 text-xs text-[#aa9a90]'>New reservations will appear here.</p></div>}
                </div>
            </section>
        </div>
    )
}

export default Dashboard
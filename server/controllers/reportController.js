import ExcelJS from 'exceljs'
import Booking from '../models/Booking.js'
import Hotel from '../models/Hotel.js'
import Room from '../models/Room.js'

const FONT = 'MaliThin'

const COLORS = {
    title: 'FF253B37',
    titleText: 'FFF7FAF8',
    subtitle: 'FFE7EFEB',
    subtitleText: 'FF435F55',
    info: 'FFF4F7F5',
    infoText: 'FF66756F',
    tableHeader: 'FF486B61',
    section: 'FF253B37',
    accent: 'FF8BAF9F',
    border: 'FFDCE6E1',
    total: 'FFE3ECE7',
}

const dateFields = {
    bookingDate: 'createdAt',
    checkInDate: 'checkInDate',
    checkOutDate: 'checkOutDate',
}

const getBangkokParts = (date = new Date()) => {
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Bangkok',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).formatToParts(date)

    return Object.fromEntries(
        parts.filter((part) => part.type !== 'literal').map((part) => [part.type, part.value])
    )
}

const getPaymentStatus = (booking) => booking.isPaid ? 'Paid' : 'Unpaid'

const getBookingNights = (checkInDate, checkOutDate) => {
    if (!checkInDate || !checkOutDate) return 0
    const nights = Math.ceil((new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24))
    return Math.max(0, nights)
}

const sumPrice = (items) => items.reduce((total, booking) => total + Number(booking.totalPrice || 0), 0)
const countGuests = (items) => items.reduce((total, booking) => total + Number(booking.guests ?? (Number(booking.adults || 1) + Number(booking.children || 0))), 0)

const getOverviewMetrics = async (hotelId) => {
    const now = new Date()
    const parts = getBangkokParts(now)
    const year = Number(parts.year)
    const month = Number(parts.month)
    const todayKey = `${parts.year}-${parts.month}-${parts.day}`
    const monthStart = new Date(`${year}-${String(month).padStart(2, '0')}-01T00:00:00.000+07:00`)
    const yearStart = new Date(`${year}-01-01T00:00:00.000+07:00`)

    const toBangkokDateKey = (value) => {
        if (!value) return ''
        const dateParts = getBangkokParts(value)
        return `${dateParts.year}-${dateParts.month}-${dateParts.day}`
    }

    const bookings = await Booking.find({ hotel: hotelId })
        .select('createdAt checkInDate checkOutDate status isPaid totalPrice guests adults children')
        .lean()

    const paidBookings = bookings.filter((booking) => booking.isPaid === true)
    const currentStays = bookings.filter((booking) => {
        if (!booking.checkInDate || !booking.checkOutDate || booking.status === 'cancelled') return false
        const checkInKey = toBangkokDateKey(booking.checkInDate)
        const checkOutKey = toBangkokDateKey(booking.checkOutDate)
        return checkInKey <= todayKey && checkOutKey > todayKey
    })
    const unpaidCurrentStays = currentStays.filter((booking) => booking.isPaid !== true)

    const isThisMonth = (booking) => booking.createdAt && new Date(booking.createdAt) >= monthStart && new Date(booking.createdAt) <= now
    const isThisYear = (booking) => booking.createdAt && new Date(booking.createdAt) >= yearStart && new Date(booking.createdAt) <= now

    return {
        totalBookings: bookings.length,
        bookingsThisMonth: bookings.filter(isThisMonth).length,
        currentRenters: countGuests(currentStays),
        currentRenterBookings: currentStays.length,
        unpaidCurrentRenters: countGuests(unpaidCurrentStays),
        unpaidCurrentBookings: unpaidCurrentStays.length,
        totalRevenue: sumPrice(paidBookings),
        yearlyRevenue: sumPrice(paidBookings.filter(isThisYear)),
        monthlyRevenue: sumPrice(paidBookings.filter(isThisMonth)),
        currentYear: year,
    }
}

// ======================================
// REPORT DATA
// ======================================

const getReportData = async (req) => {
    const {
        dateField = 'bookingDate',
        startDate,
        endDate,
        paymentStatus = 'all',
        roomType = 'all',
        search = '',
    } = req.query

    const hotel = await Hotel.findOne({ owner: req.auth.userId })
    if (!hotel) throw new Error('Hotel not found')

    const selectedDateField = dateFields[dateField] || 'createdAt'
    const bookingQuery = { hotel: hotel._id }

    // Inclusive Bangkok calendar-day filtering.
    // Start Date: >= 00:00 Bangkok
    // End Date: < 00:00 Bangkok on the following day
    if (startDate || endDate) {
        bookingQuery[selectedDateField] = {}

        if (startDate) {
            const startBoundary = new Date(`${startDate}T00:00:00.000+07:00`)
            if (Number.isNaN(startBoundary.getTime())) throw new Error('Invalid start date')
            bookingQuery[selectedDateField].$gte = startBoundary
        }

        if (endDate) {
            const endBoundary = new Date(`${endDate}T00:00:00.000+07:00`)
            if (Number.isNaN(endBoundary.getTime())) throw new Error('Invalid end date')
            endBoundary.setTime(endBoundary.getTime() + (24 * 60 * 60 * 1000))
            bookingQuery[selectedDateField].$lt = endBoundary
        }
    }

    if (paymentStatus === 'paid') bookingQuery.isPaid = true
    if (paymentStatus === 'unpaid') bookingQuery.isPaid = { $ne: true }

    let bookings = await Booking.find(bookingQuery)
        .populate('room', 'roomType pricePerNight')
        .populate('user', 'username email')
        .sort({ createdAt: -1 })

    let formattedBookings = bookings.map((booking) => {
        const populatedUser = booking.user && typeof booking.user === 'object' ? booking.user : null
        const userId = populatedUser?._id || booking.user
        const guestName = booking.guestName || populatedUser?.username || populatedUser?.email || 'Guest'
        const guestEmail = populatedUser?.email || ''
        const guestKey = String(userId || guestEmail || `booking:${booking._id}`).trim().toLowerCase()

        return {
            _id: booking._id.toString(),
            guestKey,
            guestName,
            guestEmail,
            roomName: booking.roomName || booking.room?.roomType || 'Room',
            bookingDate: booking.createdAt,
            checkInDate: booking.checkInDate,
            checkOutDate: booking.checkOutDate,
            nights: getBookingNights(booking.checkInDate, booking.checkOutDate),
            guests: Number(booking.guests || 0),
            adults: Number(booking.adults ?? booking.guests ?? 1),
            children: Number(booking.children ?? 0),
            totalPrice: Number(booking.totalPrice || 0),
            paymentMethod: booking.paymentMethod || 'Pay At Hotel',
            paymentStatus: getPaymentStatus(booking),
            isPaid: Boolean(booking.isPaid),
        }
    })

    if (roomType !== 'all') {
        formattedBookings = formattedBookings.filter((booking) => booking.roomName === roomType)
    }

    if (search.trim()) {
        const keyword = search.trim().toLowerCase()
        formattedBookings = formattedBookings.filter((booking) => (
            booking._id.toLowerCase().includes(keyword) ||
            booking.guestName.toLowerCase().includes(keyword) ||
            booking.guestEmail.toLowerCase().includes(keyword) ||
            booking.roomName.toLowerCase().includes(keyword)
        ))
    }

    const paidBookings = formattedBookings.filter((booking) => booking.paymentStatus === 'Paid')
    const unpaidBookings = formattedBookings.filter((booking) => booking.paymentStatus === 'Unpaid')

    const summary = {
        totalBookings: formattedBookings.length,
        paidBookings: paidBookings.length,
        unpaidBookings: unpaidBookings.length,
        totalBookingValue: sumPrice(formattedBookings),
        paidRevenue: sumPrice(paidBookings),
        unpaidAmount: sumPrice(unpaidBookings),
    }

    const rooms = await Room.find({ hotel: hotel._id }).select('roomType').lean()
    const overview = await getOverviewMetrics(hotel._id)

    return {
        hotel: { name: hotel.name, city: hotel.city },
        dateField,
        startDate: startDate || '',
        endDate: endDate || '',
        summary,
        overview,
        bookings: formattedBookings,
        rooms,
    }
}

// ======================================
// MONTHLY REVENUE SUMMARY
// ======================================

const getMonthKey = (dateValue) => {
    if (!dateValue) return null
    const parts = getBangkokParts(new Date(dateValue))
    return `${parts.year}-${parts.month}`
}

const getMonthLabel = (monthKey) => {
    const [year, month] = monthKey.split('-').map(Number)
    return new Date(Date.UTC(year, month - 1, 1, 12)).toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' })
}

const createMonthlySummary = (bookings, dateField, startDate, endDate) => {
    const monthlyData = new Map()
    const getDate = (booking) => dateField === 'checkInDate' ? booking.checkInDate : dateField === 'checkOutDate' ? booking.checkOutDate : booking.bookingDate
    const validDates = bookings.map(getDate).filter(Boolean).map((value) => new Date(value)).filter((date) => !Number.isNaN(date.getTime()))

    let firstMonth = startDate ? getMonthKey(new Date(`${startDate}T12:00:00.000+07:00`)) : null
    let lastMonth = endDate ? getMonthKey(new Date(`${endDate}T12:00:00.000+07:00`)) : null

    if (!firstMonth && validDates.length) firstMonth = getMonthKey(new Date(Math.min(...validDates.map((date) => date.getTime()))))
    if (!lastMonth && validDates.length) lastMonth = getMonthKey(new Date(Math.max(...validDates.map((date) => date.getTime()))))

    const createMonth = (key) => ({ month: getMonthLabel(key), totalBookings: 0, paidBookings: 0, unpaidBookings: 0, paidRevenue: 0, unpaidAmount: 0, averageBookingValue: 0 })

    if (firstMonth && lastMonth) {
        const [startYear, startMonth] = firstMonth.split('-').map(Number)
        const [endYear, endMonth] = lastMonth.split('-').map(Number)
        let current = startYear * 12 + startMonth - 1
        const last = endYear * 12 + endMonth - 1
        while (current <= last) {
            const year = Math.floor(current / 12)
            const month = current % 12 + 1
            const key = `${year}-${String(month).padStart(2, '0')}`
            monthlyData.set(key, createMonth(key))
            current++
        }
    }

    bookings.forEach((booking) => {
        const key = getMonthKey(getDate(booking))
        if (!key) return
        if (!monthlyData.has(key)) monthlyData.set(key, createMonth(key))
        const month = monthlyData.get(key)
        const price = Number(booking.totalPrice || 0)
        month.totalBookings++
        if (booking.paymentStatus === 'Paid') {
            month.paidBookings++
            month.paidRevenue += price
        } else {
            month.unpaidBookings++
            month.unpaidAmount += price
        }
    })

    return Array.from(monthlyData.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([, month]) => {
        const paidOrUnpaid = month.totalBookings
        month.averageBookingValue = paidOrUnpaid ? (month.paidRevenue + month.unpaidAmount) / paidOrUnpaid : 0
        return month
    })
}

// ======================================
// EXCEL STYLING
// ======================================

const fillCell = (cell, color) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color } }
}

const styleMainTitle = (sheet, range, title) => {
    sheet.mergeCells(range)
    const cell = sheet.getCell(range.split(':')[0])
    cell.value = title
    fillCell(cell, 'FF253B37')
    cell.font = { name: FONT, size: 19, bold: true, color: { argb: 'FFF7FAF8' } }
    cell.alignment = { vertical: 'middle', horizontal: 'left' }
    sheet.getRow(cell.row).height = 42
}

const styleSubTitle = (sheet, range, value) => {
    sheet.mergeCells(range)
    const cell = sheet.getCell(range.split(':')[0])
    cell.value = value
    fillCell(cell, 'FFE7EFEB')
    cell.font = { name: FONT, size: 11, bold: true, color: { argb: 'FF435F55' } }
    cell.alignment = { vertical: 'middle', horizontal: 'left' }
    sheet.getRow(cell.row).height = 28
}

const styleInfoRow = (sheet, range, value) => {
    sheet.mergeCells(range)
    const cell = sheet.getCell(range.split(':')[0])
    cell.value = value
    fillCell(cell, 'FFF4F7F5')
    cell.font = { name: FONT, size: 9, italic: true, color: { argb: 'FF66756F' } }
    cell.alignment = { vertical: 'middle', horizontal: 'left' }
    sheet.getRow(cell.row).height = 24
}

const styleTableHeader = (row) => {
    row.height = 32
    row.eachCell((cell) => {
        fillCell(cell, 'FF486B61')
        cell.font = { name: FONT, size: 10, bold: true, color: { argb: 'FFFFFFFF' } }
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
        cell.border = { bottom: { style: 'medium', color: { argb: 'FF8BAF9F' } } }
    })
}

const styleSectionTitle = (sheet, rowNumber, lastColumn, title) => {
    sheet.mergeCells(rowNumber, 1, rowNumber, lastColumn)
    const cell = sheet.getCell(rowNumber, 1)
    cell.value = title
    fillCell(cell, 'FF253B37')
    cell.font = { name: FONT, size: 13, bold: true, color: { argb: 'FFF7FAF8' } }
    cell.alignment = { vertical: 'middle', horizontal: 'left' }
    sheet.getRow(rowNumber).height = 34
}

const styleBodyRow = (row, background, accent = 'FF8BAF9F') => {
    row.height = 30
    row.eachCell((cell) => {
        fillCell(cell, background)
        cell.font = { name: FONT, size: 10, color: { argb: 'FF334A43' } }
        cell.alignment = { vertical: 'middle' }
        cell.border = { bottom: { style: 'thin', color: { argb: 'FFDCE6E1' } } }
    })
    row.getCell(2).border = { left: { style: 'medium', color: { argb: accent } }, bottom: { style: 'thin', color: { argb: 'FFDCE6E1' } } }
}

const paymentStyles = {
    Paid: ['FFDDF3E3', 'FF187A3D'],
    Unpaid: ['FFFCE2E1', 'FFB42318'],
}

const guestColor = (index) => {
    const hue = (index * 137.508 + 18) % 360
    const toHex = (saturation, lightness) => {
        const s = saturation / 100
        const l = lightness / 100
        const a = s * Math.min(l, 1 - l)
        const f = (n) => {
            const k = (n + hue / 30) % 12
            const channel = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))
            return Math.round(255 * channel).toString(16).padStart(2, '0')
        }
        return `${f(0)}${f(8)}${f(4)}`.toUpperCase()
    }
    return { background: `FF${toHex(62, 76)}`, accent: `FF${toHex(58, 38)}` }
}

// ======================================
// GET REPORTS API
// ======================================

export const getReports = async (req, res) => {
    try {
        const report = await getReportData(req)
        return res.json({ success: true, ...report })
    } catch (error) {
        console.error('Get reports error:', error.message)
        return res.status(400).json({ success: false, message: error.message || 'Failed to fetch reports' })
    }
}

// ======================================
// EXPORT EXCEL API
// ======================================

export const exportReports = async (req, res) => {
    try {
        const report = await getReportData(req)
        const { hotel, bookings, summary, dateField, startDate, endDate } = report
        const workbook = new ExcelJS.Workbook()
        workbook.creator = hotel.name || 'Bupatara Chiangmai'
        workbook.created = new Date()
        workbook.subject = 'Hotel Booking and Revenue Report'
        workbook.company = hotel.name || 'Bupatara Chiangmai'

        // Sheet 1: Booking Details
        const bookingSheet = workbook.addWorksheet('Booking Details')
        bookingSheet.properties.tabColor = { argb: 'FF8BAF9F' }
        bookingSheet.views = [{ state: 'frozen', ySplit: 4, zoomScale: 85 }]
        bookingSheet.columns = [
            { key: 'bookingId', width: 28 }, { key: 'guestName', width: 24 },
            { key: 'guestEmail', width: 30 }, { key: 'roomName', width: 21 },
            { key: 'bookingDate', width: 17 }, { key: 'checkInDate', width: 17 },
            { key: 'checkOutDate', width: 17 }, { key: 'nights', width: 10 },
            { key: 'adults', width: 10 }, { key: 'children', width: 10 },
            { key: 'guests', width: 13 }, { key: 'totalPrice', width: 18 },
            { key: 'paymentMethod', width: 19 }, { key: 'paymentStatus', width: 16 },
        ]

        styleMainTitle(bookingSheet, 'A1:N1', 'BUPATARA CHIANGMAI')
        styleSubTitle(bookingSheet, 'A2:N2', 'BOOKING DETAILS REPORT')
        const dateLabel = { bookingDate: 'Booking Date', checkInDate: 'Check-in Date', checkOutDate: 'Check-out Date' }[dateField] || 'Booking Date'
        styleInfoRow(bookingSheet, 'A3:N3', `${bookings.length} records | ${dateLabel} | Generated: ${new Date().toLocaleString('en-GB', { timeZone: 'Asia/Bangkok' })} (Bangkok Time)`)

        const bookingHeader = bookingSheet.addRow(['Booking ID', 'Guest Name', 'Guest Email', 'Room Name', 'Booking Date', 'Check-in', 'Check-out', 'Nights', 'Adults', 'Children', 'Total Guests', 'Total Amount', 'Payment Method', 'Payment Status'])
        styleTableHeader(bookingHeader)

        const guestColorMap = new Map()
        bookings.forEach((booking) => {
            const key = booking.guestKey || `booking:${booking._id}`
            if (!guestColorMap.has(key)) guestColorMap.set(key, guestColor(guestColorMap.size))
            const color = guestColorMap.get(key)
            const row = bookingSheet.addRow([
                booking._id, booking.guestName, booking.guestEmail, booking.roomName,
                booking.bookingDate ? new Date(booking.bookingDate) : null,
                booking.checkInDate ? new Date(booking.checkInDate) : null,
                booking.checkOutDate ? new Date(booking.checkOutDate) : null,
                booking.nights, booking.adults, booking.children, booking.guests,
                booking.totalPrice, booking.paymentMethod, booking.paymentStatus,
            ])
            styleBodyRow(row, color.background, color.accent)
            row.getCell(2).font = { name: FONT, size: 10, bold: true, color: { argb: 'FF344F46' } }
            row.getCell(2).border = { left: { style: 'medium', color: { argb: color.accent } }, bottom: { style: 'thin', color: { argb: 'FFDCE6E1' } } }
            const payment = paymentStyles[booking.paymentStatus]
            fillCell(row.getCell(14), payment[0])
            row.getCell(14).font = { name: FONT, size: 10, bold: true, color: { argb: payment[1] } }
            row.getCell(14).alignment = { horizontal: 'center', vertical: 'middle' }
            ;[5, 6, 7].forEach((column) => { row.getCell(column).numFmt = 'dd mmm yyyy'; row.getCell(column).alignment = { horizontal: 'center', vertical: 'middle' } })
            ;[8, 9, 10, 11].forEach((column) => { row.getCell(column).numFmt = '#,##0'; row.getCell(column).alignment = { horizontal: 'center', vertical: 'middle' } })
            row.getCell(12).numFmt = '฿#,##0.00'
            row.getCell(12).alignment = { horizontal: 'right', vertical: 'middle' }
        })

        bookingSheet.autoFilter = { from: 'A4', to: `N${Math.max(4, bookingSheet.rowCount)}` }
        bookingSheet.pageSetup = { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0, paperSize: 9, margins: { left: 0.25, right: 0.25, top: 0.5, bottom: 0.5, header: 0.2, footer: 0.2 } }
        bookingSheet.headerFooter.oddFooter = '&LBupatara Chiangmai - Booking Details&RPage &P of &N'

        // Sheet 2: Revenue Summary
        const revenueSheet = workbook.addWorksheet('Revenue Summary')
        revenueSheet.properties.tabColor = { argb: 'FF486B61' }
        revenueSheet.views = [{ state: 'frozen', ySplit: 5, zoomScale: 90 }]
        revenueSheet.columns = [{ width: 30 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 22 }, { width: 22 }, { width: 23 }]
        styleMainTitle(revenueSheet, 'A1:G1', 'BUPATARA CHIANGMAI | REVENUE REPORT')
        styleSubTitle(revenueSheet, 'A2:G2', `Hotel: ${hotel.name || 'Bupatara Chiangmai'} | City: ${hotel.city || '-'}`)
        styleInfoRow(revenueSheet, 'A3:G3', `${dateLabel} | ${startDate || 'All dates'} to ${endDate || 'All dates'} | Generated: ${new Date().toLocaleString('en-GB', { timeZone: 'Asia/Bangkok' })} (Bangkok Time)`)

        styleSectionTitle(revenueSheet, 5, 2, 'BOOKING & REVENUE OVERVIEW')
        const overviewHeader = revenueSheet.addRow(['Metric', 'Value'])
        styleTableHeader(overviewHeader)
        const overviewRows = [
            ['Total Bookings', summary.totalBookings, 'count'],
            ['Paid Bookings', summary.paidBookings, 'count'],
            ['Unpaid Bookings', summary.unpaidBookings, 'count'],
            ['Total Booking Value', summary.totalBookingValue, 'money'],
            ['Paid Revenue', summary.paidRevenue, 'money'],
            ['Outstanding Amount', summary.unpaidAmount, 'money'],
        ]
        const themes = {
            'Total Bookings': ['FFE4EDF2', 'FF3D6478'],
            'Paid Bookings': ['FFDDF3E3', 'FF187A3D'],
            'Unpaid Bookings': ['FFFCE2E1', 'FFB42318'],
            'Total Booking Value': ['FFE4EDF2', 'FF3D6478'],
            'Paid Revenue': ['FFDDF3E3', 'FF187A3D'],
            'Outstanding Amount': ['FFFCE2E1', 'FFB42318'],
        }
        overviewRows.forEach(([label, value, type]) => {
            const row = revenueSheet.addRow([label, value])
            const theme = themes[label]
            styleBodyRow(row, theme[0])
            row.getCell(1).font = { name: FONT, size: 10, bold: true, color: { argb: theme[1] } }
            row.getCell(2).font = { name: FONT, size: 10, bold: true, color: { argb: 'FF1F332D' } }
            row.getCell(2).alignment = { horizontal: 'right', vertical: 'middle' }
            row.getCell(2).numFmt = type === 'money' ? '฿#,##0.00' : '#,##0'
        })

        const monthlyTitleRow = revenueSheet.rowCount + 2
        styleSectionTitle(revenueSheet, monthlyTitleRow, 7, 'MONTHLY PERFORMANCE')
        const monthlyHeaderRow = monthlyTitleRow + 1
        const monthlyHeader = revenueSheet.addRow(['Month', 'Total Bookings', 'Paid', 'Unpaid', 'Paid Revenue', 'Outstanding Amount', 'Average Booking Value'])
        styleTableHeader(monthlyHeader)

        const monthlySummary = createMonthlySummary(bookings, dateField, startDate, endDate)
        monthlySummary.forEach((month, index) => {
            const row = revenueSheet.addRow([month.month, month.totalBookings, month.paidBookings, month.unpaidBookings, month.paidRevenue, month.unpaidAmount, month.averageBookingValue])
            styleBodyRow(row, index % 2 === 0 ? 'FFFFFFFF' : 'FFF0F4F1')
            row.getCell(1).font = { name: FONT, size: 10, bold: true, color: { argb: 'FF435F55' } }
            ;[2, 3, 4].forEach((column) => { row.getCell(column).numFmt = '#,##0'; row.getCell(column).alignment = { horizontal: 'center', vertical: 'middle' } })
            ;[5, 6, 7].forEach((column) => { row.getCell(column).numFmt = '฿#,##0.00'; row.getCell(column).alignment = { horizontal: 'right', vertical: 'middle' } })
        })

        if (monthlySummary.length) {
            const totals = monthlySummary.reduce((acc, month) => ({
                totalBookings: acc.totalBookings + month.totalBookings,
                paidBookings: acc.paidBookings + month.paidBookings,
                unpaidBookings: acc.unpaidBookings + month.unpaidBookings,
                paidRevenue: acc.paidRevenue + month.paidRevenue,
                unpaidAmount: acc.unpaidAmount + month.unpaidAmount,
            }), { totalBookings: 0, paidBookings: 0, unpaidBookings: 0, paidRevenue: 0, unpaidAmount: 0 })
            const totalRow = revenueSheet.addRow(['GRAND TOTAL', totals.totalBookings, totals.paidBookings, totals.unpaidBookings, totals.paidRevenue, totals.unpaidAmount, totals.totalBookings ? (totals.paidRevenue + totals.unpaidAmount) / totals.totalBookings : 0])
            totalRow.height = 32
            totalRow.eachCell((cell) => {
                fillCell(cell, COLORS.total)
                cell.font = { name: FONT, size: 10, bold: true, color: { argb: 'FF435F55' } }
                cell.alignment = { vertical: 'middle', horizontal: 'center' }
                cell.border = { top: { style: 'medium', color: { argb: COLORS.accent } } }
            })
            ;[2, 3, 4].forEach((column) => { totalRow.getCell(column).numFmt = '#,##0' })
            ;[5, 6, 7].forEach((column) => { totalRow.getCell(column).numFmt = '฿#,##0.00' })
        } else {
            const emptyRow = revenueSheet.addRow(['No booking data is available for the selected filters.'])
            revenueSheet.mergeCells(emptyRow.number, 1, emptyRow.number, 7)
            emptyRow.height = 28
            emptyRow.getCell(1).font = { name: FONT, italic: true, color: { argb: 'FF66756F' } }
        }

        revenueSheet.autoFilter = { from: `A${monthlyHeaderRow}`, to: `G${monthlyHeaderRow + monthlySummary.length}` }
        revenueSheet.pageSetup = { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0, paperSize: 9, margins: { left: 0.25, right: 0.25, top: 0.5, bottom: 0.5, header: 0.2, footer: 0.2 } }
        revenueSheet.headerFooter.oddFooter = '&LBupatara Chiangmai - Revenue Summary&RPage &P of &N'

        const buffer = await workbook.xlsx.writeBuffer()
        const fileName = `Bupatara_Report_${new Date().toISOString().slice(0, 10)}.xlsx`
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)
        return res.send(Buffer.from(buffer))
    } catch (error) {
        console.error('Export reports error:', error.message)
        return res.status(400).json({ success: false, message: error.message || 'Failed to export report' })
    }
}
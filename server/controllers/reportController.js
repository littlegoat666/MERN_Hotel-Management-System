import ExcelJS from 'exceljs'
import Booking from '../models/Booking.js'
import Hotel from '../models/Hotel.js'
import Room from '../models/Room.js'

const FONT = 'MaliThin'

const COLORS = {
    title: 'FF493746',
    titleText: 'FFFFF8F0',
    subtitle: 'FFF2E6EA',
    subtitleText: 'FF704D62',
    info: 'FFFAF4ED',
    infoText: 'FF806F72',
    tableHeader: 'FF76566B',
    section: 'FF493746',
    accent: 'FFC28B72',
    border: 'FFE9DDE1',
    total: 'FFF2E6EA',
}

const dateFields = {
    bookingDate: 'createdAt',
    checkInDate: 'checkInDate',
    checkOutDate: 'checkOutDate',
}

const getPaymentStatus = (booking) => {
    if (booking.isRefunded) return 'Refund'
    if (booking.status === 'cancelled') return 'Cancelled'
    if (booking.isPaid) return 'Paid'
    return 'Unpaid'
}

const getBookingNights = (checkInDate, checkOutDate) => {
    if (!checkInDate || !checkOutDate) return 0

    const nights = Math.ceil(
        (new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24)
    )

    return Math.max(0, nights)
}

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

    if (!hotel) {
        throw new Error('Hotel not found')
    }

    const selectedDateField = dateFields[dateField] || 'createdAt'
    const bookingQuery = { hotel: hotel._id }

    if (startDate || endDate) {
        bookingQuery[selectedDateField] = {}

        if (startDate) {
            bookingQuery[selectedDateField].$gte = new Date(
                `${startDate}T00:00:00.000+07:00`
            )
        }

        if (endDate) {
            bookingQuery[selectedDateField].$lte = new Date(
                `${endDate}T23:59:59.999+07:00`
            )
        }
    }

    if (roomType !== 'all') {
        bookingQuery.roomName = roomType
    }

    switch (paymentStatus) {
        case 'paid':
            bookingQuery.isPaid = true
            bookingQuery.isRefunded = { $ne: true }
            bookingQuery.status = { $ne: 'cancelled' }
            break

        case 'unpaid':
            bookingQuery.isPaid = false
            bookingQuery.isRefunded = { $ne: true }
            bookingQuery.status = { $ne: 'cancelled' }
            break

        case 'cancelled':
            bookingQuery.status = 'cancelled'
            bookingQuery.isRefunded = { $ne: true }
            break

        case 'refunded':
            bookingQuery.isRefunded = true
            break

        default:
            break
    }

    let bookings = await Booking.find(bookingQuery)
        .populate('room', 'roomType pricePerNight')
        .populate('user', 'username email')
        .sort({ createdAt: -1 })

    if (search.trim()) {
        const keyword = search.trim().toLowerCase()

        bookings = bookings.filter((booking) => {
            const guestName = (
                booking.guestName ||
                booking.user?.username ||
                ''
            ).toLowerCase()

            const guestEmail = (
                booking.user?.email ||
                ''
            ).toLowerCase()

            const roomName = (
                booking.roomName ||
                booking.room?.roomType ||
                ''
            ).toLowerCase()

            return (
                booking._id.toString().toLowerCase().includes(keyword) ||
                guestName.includes(keyword) ||
                guestEmail.includes(keyword) ||
                roomName.includes(keyword)
            )
        })
    }

    const formattedBookings = bookings.map((booking) => {
        const guestName =
            booking.guestName ||
            booking.user?.username ||
            booking.user?.email ||
            'Guest'

        const guestEmail = booking.user?.email || ''

        return {
            _id: booking._id.toString(),

            guestKey: (
                booking.user?._id ||
                guestEmail ||
                guestName
            ).toString().toLowerCase(),

            guestName,
            guestEmail,

            roomName:
                booking.roomName ||
                booking.room?.roomType ||
                'Room',

            bookingDate: booking.createdAt,
            checkInDate: booking.checkInDate,
            checkOutDate: booking.checkOutDate,

            nights: getBookingNights(
                booking.checkInDate,
                booking.checkOutDate
            ),

            guests: Number(booking.guests || 0),
            adults: Number(booking.adults ?? booking.guests ?? 1),
            children: Number(booking.children ?? 0),

            totalPrice: Number(booking.totalPrice || 0),

            paymentMethod: booking.paymentMethod || 'Pay At Hotel',
            paymentStatus: getPaymentStatus(booking),

            isPaid: Boolean(booking.isPaid),
            isRefunded: Boolean(booking.isRefunded),
        }
    })

    const sumPrice = (items) =>
        items.reduce((total, booking) => total + booking.totalPrice, 0)

    const paidBookings = formattedBookings.filter(
        (booking) => booking.paymentStatus === 'Paid'
    )

    const unpaidBookings = formattedBookings.filter(
        (booking) => booking.paymentStatus === 'Unpaid'
    )

    const cancelledBookings = formattedBookings.filter(
        (booking) => booking.paymentStatus === 'Cancelled'
    )

    const refundedBookings = formattedBookings.filter(
        (booking) => booking.paymentStatus === 'Refund'
    )

    const summary = {
        totalBookings: formattedBookings.length,

        paidBookings: paidBookings.length,
        unpaidBookings: unpaidBookings.length,
        cancelledBookings: cancelledBookings.length,
        refundedBookings: refundedBookings.length,

        totalBookingValue: sumPrice(formattedBookings),
        paidRevenue: sumPrice(paidBookings),
        unpaidAmount: sumPrice(unpaidBookings),
        cancelledAmount: sumPrice(cancelledBookings),
        refundAmount: sumPrice(refundedBookings),
    }

    const rooms = await Room.find({ hotel: hotel._id })
        .select('roomType')
        .lean()

    return {
        hotel: {
            name: hotel.name,
            city: hotel.city,
        },
        dateField,
        startDate: startDate || '',
        endDate: endDate || '',
        summary,
        bookings: formattedBookings,
        rooms,
    }
}

// ======================================
// MONTHLY SUMMARY
// ======================================

const getMonthKey = (dateValue) => {
    if (!dateValue) return null

    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Bangkok',
        year: 'numeric',
        month: '2-digit',
    }).formatToParts(new Date(dateValue))

    const year = parts.find((part) => part.type === 'year')?.value
    const month = parts.find((part) => part.type === 'month')?.value

    return year && month ? `${year}-${month}` : null
}

const getMonthLabel = (monthKey) => {
    const [year, month] = monthKey.split('-').map(Number)

    return new Date(Date.UTC(year, month - 1, 1, 12)).toLocaleDateString(
        'en-GB',
        {
            month: 'long',
            year: 'numeric',
            timeZone: 'UTC',
        }
    )
}

const createMonthlySummary = (bookings, dateField, startDate, endDate) => {
    const monthlyData = new Map()

    const getDate = (booking) => {
        if (dateField === 'checkInDate') return booking.checkInDate
        if (dateField === 'checkOutDate') return booking.checkOutDate
        return booking.bookingDate
    }

    const bookingDates = bookings
        .map(getDate)
        .filter(Boolean)
        .map((date) => new Date(date))
        .filter((date) => !Number.isNaN(date.getTime()))

    let firstMonth = startDate
        ? getMonthKey(new Date(`${startDate}T12:00:00.000+07:00`))
        : null

    let lastMonth = endDate
        ? getMonthKey(new Date(`${endDate}T12:00:00.000+07:00`))
        : null

    if (!firstMonth && bookingDates.length) {
        firstMonth = getMonthKey(
            new Date(Math.min(...bookingDates.map((date) => date.getTime())))
        )
    }

    if (!lastMonth && bookingDates.length) {
        lastMonth = getMonthKey(
            new Date(Math.max(...bookingDates.map((date) => date.getTime())))
        )
    }

    const createMonth = (key) => ({
        month: getMonthLabel(key),
        totalBookings: 0,
        paidBookings: 0,
        unpaidBookings: 0,
        cancelledBookings: 0,
        refundedBookings: 0,
        paidRevenue: 0,
        unpaidAmount: 0,
        refundAmount: 0,
        cancelledAmount: 0,
        averageBookingValue: 0,
    })

    if (firstMonth && lastMonth) {
        const [startYear, startMonth] = firstMonth.split('-').map(Number)
        const [endYear, endMonth] = lastMonth.split('-').map(Number)

        let current = startYear * 12 + startMonth - 1
        const finalMonth = endYear * 12 + endMonth - 1

        while (current <= finalMonth) {
            const year = Math.floor(current / 12)
            const month = (current % 12) + 1
            const key = `${year}-${String(month).padStart(2, '0')}`

            monthlyData.set(key, createMonth(key))
            current++
        }
    }

    bookings.forEach((booking) => {
        const monthKey = getMonthKey(getDate(booking))

        if (!monthKey) return

        if (!monthlyData.has(monthKey)) {
            monthlyData.set(monthKey, createMonth(monthKey))
        }

        const month = monthlyData.get(monthKey)
        const price = Number(booking.totalPrice || 0)

        month.totalBookings++

        switch (booking.paymentStatus) {
            case 'Paid':
                month.paidBookings++
                month.paidRevenue += price
                break

            case 'Unpaid':
                month.unpaidBookings++
                month.unpaidAmount += price
                break

            case 'Cancelled':
                month.cancelledBookings++
                month.cancelledAmount += price
                break

            case 'Refund':
                month.refundedBookings++
                month.refundAmount += price
                break

            default:
                break
        }
    })

    return Array.from(monthlyData.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([, month]) => {
            const activeBookings =
                month.paidBookings + month.unpaidBookings

            month.averageBookingValue = activeBookings
                ? (month.paidRevenue + month.unpaidAmount) / activeBookings
                : 0

            return month
        })
}

// ======================================
// EXCEL STYLING HELPERS
// ======================================

const fillCell = (cell, color) => {
    cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: color },
    }
}

const styleMainTitle = (sheet, range, title) => {
    sheet.mergeCells(range)

    const cell = sheet.getCell(range.split(':')[0])
    cell.value = title

    fillCell(cell, COLORS.title)

    cell.font = {
        name: FONT,
        size: 19,
        bold: true,
        color: { argb: COLORS.titleText },
    }

    cell.alignment = {
        vertical: 'middle',
        horizontal: 'left',
    }

    sheet.getRow(cell.row).height = 42
}

const styleSubTitle = (sheet, range, value) => {
    sheet.mergeCells(range)

    const cell = sheet.getCell(range.split(':')[0])
    cell.value = value

    fillCell(cell, COLORS.subtitle)

    cell.font = {
        name: FONT,
        size: 11,
        bold: true,
        color: { argb: COLORS.subtitleText },
    }

    cell.alignment = {
        vertical: 'middle',
        horizontal: 'left',
    }

    sheet.getRow(cell.row).height = 28
}

const styleInfoRow = (sheet, range, value) => {
    sheet.mergeCells(range)

    const cell = sheet.getCell(range.split(':')[0])
    cell.value = value

    fillCell(cell, COLORS.info)

    cell.font = {
        name: FONT,
        size: 9,
        italic: true,
        color: { argb: COLORS.infoText },
    }

    cell.alignment = {
        vertical: 'middle',
        horizontal: 'left',
    }

    sheet.getRow(cell.row).height = 24
}

const styleTableHeader = (row) => {
    row.height = 32

    row.eachCell((cell) => {
        fillCell(cell, COLORS.tableHeader)

        cell.font = {
            name: FONT,
            size: 10,
            bold: true,
            color: { argb: 'FFFFFFFF' },
        }

        cell.alignment = {
            vertical: 'middle',
            horizontal: 'center',
            wrapText: true,
        }

        cell.border = {
            bottom: {
                style: 'medium',
                color: { argb: COLORS.accent },
            },
        }
    })
}

const styleSectionTitle = (sheet, rowNumber, lastColumn, title) => {
    sheet.mergeCells(rowNumber, 1, rowNumber, lastColumn)

    const cell = sheet.getCell(rowNumber, 1)
    cell.value = title

    fillCell(cell, COLORS.section)

    cell.font = {
        name: FONT,
        size: 13,
        bold: true,
        color: { argb: 'FFFFF8F0' },
    }

    cell.alignment = {
        vertical: 'middle',
        horizontal: 'left',
    }

    sheet.getRow(rowNumber).height = 34
}

const styleBodyRow = (row, background) => {
    row.height = 28

    row.eachCell((cell) => {
        fillCell(cell, background)

        cell.font = {
            name: FONT,
            size: 10,
            color: { argb: 'FF334155' },
        }

        cell.alignment = {
            vertical: 'middle',
        }

        cell.border = {
            bottom: {
                style: 'thin',
                color: { argb: COLORS.border },
            },
        }
    })
}

const paymentStyles = {
    Paid: ['FFD1FAE5', 'FF047857'],
    Unpaid: ['FFFEF3C7', 'FF92400E'],
    Cancelled: ['FFFFE4E6', 'FFBE123C'],
    Refund: ['FFEDE9FE', 'FF6D28D9'],
}

// ======================================
// GET REPORTS
// ======================================

export const getReports = async (req, res) => {
    try {
        const report = await getReportData(req)

        return res.json({
            success: true,
            ...report,
        })

    } catch (error) {
        console.error('Get reports error:', error.message)

        return res.status(400).json({
            success: false,
            message: error.message || 'Failed to fetch reports',
        })
    }
}

// ======================================
// EXPORT EXCEL
// ======================================

export const exportReports = async (req, res) => {
    try {
        const report = await getReportData(req)

        const {
            hotel,
            bookings,
            summary,
            dateField,
            startDate,
            endDate,
        } = report

        const workbook = new ExcelJS.Workbook()

        workbook.creator = hotel.name || 'Bupatara Chiangmai'
        workbook.created = new Date()
        workbook.subject = 'Hotel Booking and Revenue Report'
        workbook.company = hotel.name || 'Bupatara Chiangmai'

        // ======================================
        // SHEET 1: BOOKING DETAILS
        // ======================================

        const bookingSheet = workbook.addWorksheet('Booking Details')

        bookingSheet.properties.tabColor = { argb: 'FFC28B72' }
        bookingSheet.views = [{ state: 'frozen', ySplit: 4, zoomScale: 85 }]

        bookingSheet.columns = [
            { key: 'bookingId', width: 28 },
            { key: 'guestName', width: 24 },
            { key: 'guestEmail', width: 30 },
            { key: 'roomName', width: 19 },
            { key: 'bookingDate', width: 17 },
            { key: 'checkInDate', width: 17 },
            { key: 'checkOutDate', width: 17 },
            { key: 'nights', width: 10 },
            { key: 'adults', width: 10 },
            { key: 'children', width: 10 },
            { key: 'guests', width: 13 },
            { key: 'totalPrice', width: 18 },
            { key: 'paymentMethod', width: 19 },
            { key: 'paymentStatus', width: 17 },
        ]

        styleMainTitle(
            bookingSheet,
            'A1:N1',
            'BUPATARA CHIANGMAI'
        )

        styleSubTitle(
            bookingSheet,
            'A2:N2',
            'BOOKING DETAILS REPORT'
        )

        const dateLabel = {
            bookingDate: 'Booking Date',
            checkInDate: 'Check-in Date',
            checkOutDate: 'Check-out Date',
        }[dateField] || 'Booking Date'

        styleInfoRow(
            bookingSheet,
            'A3:N3',
            `${bookings.length} records | ${dateLabel} | Generated: ${new Date().toLocaleString('en-GB', { timeZone: 'Asia/Bangkok' })} (Bangkok Time)`
        )

        const bookingHeader = bookingSheet.addRow([
            'Booking ID',
            'Guest Name',
            'Guest Email',
            'Room Type',
            'Booking Date',
            'Check-in',
            'Check-out',
            'Nights',
            'Adults',
            'Children',
            'Total Guests',
            'Total Amount',
            'Payment Method',
            'Payment Status',
        ])

        styleTableHeader(bookingHeader)

        const guestColors = [
            'FFEAF2FF',
            'FFE8F7F1',
            'FFFFF3E6',
            'FFF3ECFF',
            'FFFFEDEF',
            'FFE8F5FA',
            'FFF5F5E8',
            'FFEDEFFF',
            'FFFFF0DB',
            'FFE6F4F1',
            'FFFCEBFA',
            'FFEFF2F7',
        ]

        const guestColorMap = new Map()

        bookings.forEach((booking) => {
            const guestKey = booking.guestKey || booking.guestName || 'guest'

            if (!guestColorMap.has(guestKey)) {
                guestColorMap.set(
                    guestKey,
                    guestColors[guestColorMap.size % guestColors.length]
                )
            }

            const row = bookingSheet.addRow([
                booking._id,
                booking.guestName,
                booking.guestEmail,
                booking.roomName,
                booking.bookingDate ? new Date(booking.bookingDate) : null,
                booking.checkInDate ? new Date(booking.checkInDate) : null,
                booking.checkOutDate ? new Date(booking.checkOutDate) : null,
                booking.nights,
                booking.adults,
                booking.children,
                booking.guests,
                booking.totalPrice,
                booking.paymentMethod,
                booking.paymentStatus,
            ])

            styleBodyRow(row, guestColorMap.get(guestKey))

            row.getCell(2).font = {
                name: FONT,
                size: 10,
                bold: true,
                color: { argb: 'FF1E3A8A' },
            }

            row.getCell(2).border = {
                left: {
                    style: 'medium',
                    color: { argb: COLORS.accent },
                },
                bottom: {
                    style: 'thin',
                    color: { argb: COLORS.border },
                },
            }

            const paymentStyle = paymentStyles[booking.paymentStatus] || [
                'FFF1F5F9',
                'FF475569',
            ]

            const paymentCell = row.getCell(14)

            fillCell(paymentCell, paymentStyle[0])

            paymentCell.font = {
                name: FONT,
                size: 10,
                bold: true,
                color: { argb: paymentStyle[1] },
            }

            paymentCell.alignment = {
                horizontal: 'center',
                vertical: 'middle',
            }

            ;[5, 6, 7].forEach((column) => {
                row.getCell(column).numFmt = 'dd mmm yyyy'
                row.getCell(column).alignment = {
                    horizontal: 'center',
                    vertical: 'middle',
                }
            })

            ;[8, 9, 10, 11].forEach((column) => {
                row.getCell(column).numFmt = '#,##0'
                row.getCell(column).alignment = {
                    horizontal: 'center',
                    vertical: 'middle',
                }
            })

            row.getCell(12).numFmt = '฿#,##0.00'
            row.getCell(12).alignment = {
                horizontal: 'right',
                vertical: 'middle',
            }
        })

        bookingSheet.autoFilter = {
            from: 'A4',
            to: `N${Math.max(4, bookingSheet.rowCount)}`,
        }

        bookingSheet.pageSetup = {
            orientation: 'landscape',
            fitToPage: true,
            fitToWidth: 1,
            fitToHeight: 0,
            paperSize: 9,
            margins: {
                left: 0.25,
                right: 0.25,
                top: 0.5,
                bottom: 0.5,
                header: 0.2,
                footer: 0.2,
            },
        }

        bookingSheet.headerFooter.oddFooter =
            '&LBupatara Chiangmai - Booking Details&RPage &P of &N'

        // ======================================
        // SHEET 2: REVENUE SUMMARY
        // ======================================

        const revenueSheet = workbook.addWorksheet('Revenue Summary')

        revenueSheet.properties.tabColor = { argb: 'FF9B7189' }
        revenueSheet.views = [{ state: 'frozen', ySplit: 5, zoomScale: 90 }]

        revenueSheet.columns = [
            { width: 29 },
            { width: 19 },
            { width: 19 },
            { width: 19 },
            { width: 19 },
            { width: 19 },
            { width: 20 },
            { width: 21 },
            { width: 19 },
            { width: 19 },
            { width: 22 },
        ]

        styleMainTitle(
            revenueSheet,
            'A1:K1',
            'BUPATARA CHIANGMAI | REVENUE REPORT'
        )

        styleSubTitle(
            revenueSheet,
            'A2:K2',
            `Hotel: ${hotel.name || 'Bupatara Chiangmai'} | City: ${hotel.city || '-'}`
        )

        const revenueDateLabel = {
            bookingDate: 'Booking Date',
            checkInDate: 'Check-in Date',
            checkOutDate: 'Check-out Date',
        }[dateField] || 'Booking Date'

        styleInfoRow(
            revenueSheet,
            'A3:K3',
            `${revenueDateLabel} | ${startDate || 'All dates'} to ${endDate || 'All dates'} | Generated: ${new Date().toLocaleString('en-GB', { timeZone: 'Asia/Bangkok' })} (Bangkok Time)`
        )

        styleSectionTitle(
            revenueSheet,
            5,
            2,
            'FINANCIAL OVERVIEW'
        )

        const overviewHeader = revenueSheet.addRow([
            'Metric',
            'Value',
        ])

        styleTableHeader(overviewHeader)

        const overviewRows = [
            ['Total Bookings', summary.totalBookings, 'count'],
            ['Paid Bookings', summary.paidBookings, 'count'],
            ['Unpaid Bookings', summary.unpaidBookings, 'count'],
            ['Cancelled Bookings', summary.cancelledBookings, 'count'],
            ['Refunded Bookings', summary.refundedBookings, 'count'],
            ['Total Booking Value', summary.totalBookingValue, 'money'],
            ['Paid Revenue', summary.paidRevenue, 'money'],
            ['Outstanding Amount', summary.unpaidAmount, 'money'],
            ['Cancelled Amount', summary.cancelledAmount, 'money'],
            ['Refund Amount', summary.refundAmount, 'money'],
        ]

        const overviewThemes = {
            'Total Bookings': ['FFEFF6FF', 'FF1D4ED8'],
            'Paid Bookings': ['FFECFDF5', 'FF047857'],
            'Unpaid Bookings': ['FFFFFBEB', 'FFB45309'],
            'Cancelled Bookings': ['FFFFF1F2', 'FFE11D48'],
            'Refunded Bookings': ['FFF5F3FF', 'FF7C3AED'],
            'Total Booking Value': ['FFEFF6FF', 'FF1D4ED8'],
            'Paid Revenue': ['FFECFDF5', 'FF047857'],
            'Outstanding Amount': ['FFFFFBEB', 'FFB45309'],
            'Cancelled Amount': ['FFFFF1F2', 'FFE11D48'],
            'Refund Amount': ['FFF5F3FF', 'FF7C3AED'],
        }

        overviewRows.forEach(([label, value, type]) => {
            const row = revenueSheet.addRow([label, value])
            const theme = overviewThemes[label]

            styleBodyRow(row, theme[0])

            row.getCell(1).font = {
                name: FONT,
                size: 10,
                bold: true,
                color: { argb: theme[1] },
            }

            row.getCell(2).font = {
                name: FONT,
                size: 10,
                bold: true,
                color: { argb: 'FF1E293B' },
            }

            row.getCell(2).alignment = {
                horizontal: 'right',
                vertical: 'middle',
            }

            row.getCell(2).numFmt =
                type === 'money' ? '฿#,##0.00' : '#,##0'
        })

        const monthlyTitleRow = revenueSheet.rowCount + 2

        styleSectionTitle(
            revenueSheet,
            monthlyTitleRow,
            11,
            'MONTHLY PERFORMANCE'
        )

        const monthlyHeaderRow = monthlyTitleRow + 1

        const monthlyHeader = revenueSheet.addRow([
            'Month',
            'Total Bookings',
            'Paid',
            'Unpaid',
            'Cancelled',
            'Refunded',
            'Paid Revenue',
            'Outstanding Amount',
            'Refund Amount',
            'Cancelled Amount',
            'Average Booking Value',
        ])

        styleTableHeader(monthlyHeader)

        const monthlySummary = createMonthlySummary(
            bookings,
            dateField,
            startDate,
            endDate
        )

        monthlySummary.forEach((month, index) => {
            const row = revenueSheet.addRow([
                month.month,
                month.totalBookings,
                month.paidBookings,
                month.unpaidBookings,
                month.cancelledBookings,
                month.refundedBookings,
                month.paidRevenue,
                month.unpaidAmount,
                month.refundAmount,
                month.cancelledAmount,
                month.averageBookingValue,
            ])

            styleBodyRow(
                row,
                index % 2 === 0 ? 'FFFFFFFF' : 'FFFAF4F6'
            )

            row.getCell(1).font = {
                name: FONT,
                size: 10,
                bold: true,
                color: { argb: 'FF704D62' },
            }

            ;[2, 3, 4, 5, 6].forEach((column) => {
                row.getCell(column).numFmt = '#,##0'
                row.getCell(column).alignment = {
                    horizontal: 'center',
                    vertical: 'middle',
                }
            })

            ;[7, 8, 9, 10, 11].forEach((column) => {
                row.getCell(column).numFmt = '฿#,##0.00'
                row.getCell(column).alignment = {
                    horizontal: 'right',
                    vertical: 'middle',
                }
            })
        })

        if (monthlySummary.length > 0) {
            const monthlyTotals = monthlySummary.reduce((total, month) => ({
                totalBookings: total.totalBookings + month.totalBookings,
                paidBookings: total.paidBookings + month.paidBookings,
                unpaidBookings: total.unpaidBookings + month.unpaidBookings,
                cancelledBookings: total.cancelledBookings + month.cancelledBookings,
                refundedBookings: total.refundedBookings + month.refundedBookings,
                paidRevenue: total.paidRevenue + month.paidRevenue,
                unpaidAmount: total.unpaidAmount + month.unpaidAmount,
                refundAmount: total.refundAmount + month.refundAmount,
                cancelledAmount: total.cancelledAmount + month.cancelledAmount,
            }), {
                totalBookings: 0,
                paidBookings: 0,
                unpaidBookings: 0,
                cancelledBookings: 0,
                refundedBookings: 0,
                paidRevenue: 0,
                unpaidAmount: 0,
                refundAmount: 0,
                cancelledAmount: 0,
            })

            const activeBookings =
                monthlyTotals.paidBookings + monthlyTotals.unpaidBookings

            const totalRow = revenueSheet.addRow([
                'GRAND TOTAL',
                monthlyTotals.totalBookings,
                monthlyTotals.paidBookings,
                monthlyTotals.unpaidBookings,
                monthlyTotals.cancelledBookings,
                monthlyTotals.refundedBookings,
                monthlyTotals.paidRevenue,
                monthlyTotals.unpaidAmount,
                monthlyTotals.refundAmount,
                monthlyTotals.cancelledAmount,
                activeBookings
                    ? (monthlyTotals.paidRevenue + monthlyTotals.unpaidAmount) / activeBookings
                    : 0,
            ])

            totalRow.height = 32

            totalRow.eachCell((cell) => {
                fillCell(cell, COLORS.total)

                cell.font = {
                    name: FONT,
                    size: 10,
                    bold: true,
                    color: { argb: 'FF704D62' },
                }

                cell.alignment = {
                    vertical: 'middle',
                    horizontal: 'center',
                }

                cell.border = {
                    top: {
                        style: 'medium',
                        color: { argb: COLORS.accent },
                    },
                }
            })

            ;[2, 3, 4, 5, 6].forEach((column) => {
                totalRow.getCell(column).numFmt = '#,##0'
            })

            ;[7, 8, 9, 10, 11].forEach((column) => {
                totalRow.getCell(column).numFmt = '฿#,##0.00'
            })
        } else {
            const emptyRow = revenueSheet.addRow([
                'No booking data is available for the selected filters.',
            ])

            revenueSheet.mergeCells(
                emptyRow.number,
                1,
                emptyRow.number,
                11
            )

            emptyRow.height = 28

            emptyRow.getCell(1).font = {
                name: FONT,
                italic: true,
                color: { argb: 'FF806F72' },
            }
        }

        revenueSheet.autoFilter = {
            from: `A${monthlyHeaderRow}`,
            to: `K${monthlyHeaderRow + monthlySummary.length}`,
        }

        revenueSheet.pageSetup = {
            orientation: 'landscape',
            fitToPage: true,
            fitToWidth: 1,
            fitToHeight: 0,
            paperSize: 9,
            margins: {
                left: 0.25,
                right: 0.25,
                top: 0.5,
                bottom: 0.5,
                header: 0.2,
                footer: 0.2,
            },
        }

        revenueSheet.headerFooter.oddFooter =
            '&LBupatara Chiangmai - Revenue Summary&RPage &P of &N'

        // ======================================
        // DOWNLOAD WORKBOOK
        // ======================================

        const buffer = await workbook.xlsx.writeBuffer()

        const fileName = `Bupatara_Report_${new Date()
            .toISOString()
            .slice(0, 10)}.xlsx`

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )

        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${fileName}"`
        )

        return res.send(Buffer.from(buffer))

    } catch (error) {
        console.error('Export reports error:', error.message)

        return res.status(400).json({
            success: false,
            message: error.message || 'Failed to export report',
        })
    }
}
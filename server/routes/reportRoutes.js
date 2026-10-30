import express from 'express'
import { getReports, exportReports } from '../controllers/reportController.js'
import { protect } from '../middleware/authMiddleware.js'

const reportRouter = express.Router()

reportRouter.get('/', protect, getReports)
reportRouter.get('/export', protect, exportReports)

export default reportRouter
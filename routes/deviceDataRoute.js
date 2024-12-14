import express from 'express';
import { getDeviceData, getDeviceAnalytics, getDeviceTrends, getDeviceBatchData, getGraphData, getTimeSeriesData } from '../controllers/deviceDataController.js';
import { authenticateUser } from '../middleware/userAuth.js';

const router = express.Router();
router.use(authenticateUser);

// Now this will be accessed as /api/v1/device-data/:deviceId
router.get('/:deviceId', getDeviceData);
router.get('/:deviceId/analytics', getDeviceAnalytics);
router.get('/:deviceId/trends', getDeviceTrends);
router.get('/:deviceId/batch', getDeviceBatchData);
router.get('/:deviceId/graph', getGraphData);
router.get('/:deviceId/timeseries', getTimeSeriesData);

export default router;

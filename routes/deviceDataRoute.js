import express from 'express';
import { getDeviceData } from '../controllers/deviceDataController.js';
import { authenticateUser } from '../middleware/userAuth.js';

const router = express.Router();
router.use(authenticateUser);


// Now this will be accessed as /api/v1/device-data/:deviceId
router.get('/:deviceId', getDeviceData);

export default router;

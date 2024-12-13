import express from 'express';
import { getDeviceData } from '../controllers/deviceDataController.js';
import { authenticateUser } from '../middleware/userAuth.js';

const router = express.Router();

router.get('/:deviceId', authenticateUser, getDeviceData);

export default router;

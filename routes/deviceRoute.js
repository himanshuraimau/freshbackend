import { Router } from 'express';
import { addDevice, getUserDevices, deleteDevice } from '../controllers/deviceController.js';
import { authenticateUser } from '../middleware/userAuth.js';

const router = Router();

// Protect all device routes with authentication
router.use(authenticateUser);

router.post('/add', addDevice);
router.get('/list', getUserDevices);
router.delete('/:deviceId', deleteDevice);

export default router;

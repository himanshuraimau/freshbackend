import express from 'express';
import { addProduct, getDeviceProducts, createProduct, deleteProduct } from '../controllers/productController.js';
import { authenticateUser } from '../middleware/userAuth.js';

const router = express.Router();

router.use(authenticateUser)

router.post('/:deviceId', addProduct);
router.get('/:deviceId',  getDeviceProducts);
router.post('/', createProduct);
router.delete('/:id', deleteProduct);

export default router;
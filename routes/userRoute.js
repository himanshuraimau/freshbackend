import { Router } from "express";
import userController from "../controllers/userController.js"; // Added .js extension

const router = Router();

router.post('/signup', userController.signup);
router.post('/login', userController.login);

export default router;
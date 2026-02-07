import express from 'express';
import * as userControllers from '../controllers/userControllers.js';

const router = express.Router();

router.post("/user/register", userControllers.registerUser);
router.post("/user/login", userControllers.loginUser);

export default router;
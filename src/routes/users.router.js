import { Router } from 'express';
import { getAllUsers } from '../controllers/users.controller.js';
import auth from '../middlewares/auth.middleware.js';
import authorize from '../middlewares/authorize.middleware.js';

const router = Router();

// GET /api/users → ruta administrativa: solo admin puede ver todos los usuarios
router.get('/', auth, authorize('admin'), getAllUsers);

export default router;

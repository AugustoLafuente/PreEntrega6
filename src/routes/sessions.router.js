import { Router } from 'express';
import { register, login, current, logout } from '../controllers/sessions.controller.js';
import { authenticateRegister, authenticateLogin, authenticateCurrent } from '../config/passport.config.js';

const router = Router();

router.post('/register', authenticateRegister, register);
router.post('/login', authenticateLogin, login);
router.get('/current', authenticateCurrent, current);
router.post('/logout', logout);

export default router;

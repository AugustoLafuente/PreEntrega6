import { Router } from 'express';
import { register, login, current, logout } from '../controllers/sessions.controller.js';
import { authenticateRegister, authenticateLogin } from '../config/passport.config.js';
import auth from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/register', authenticateRegister, register);
router.post('/login', authenticateLogin, login);
router.get('/current', auth, current);
router.post('/logout', logout);

export default router;

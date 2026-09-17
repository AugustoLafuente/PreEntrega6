/**
 * Middleware de autenticación: lee la cookie currentUser, verifica el JWT
 * y adjunta el payload decodificado a req.user.
 */
import { verifyToken } from '../utils/jwt.js';
import { COOKIE_NAME } from '../config/config.js';

export const auth = (req, res, next) => {
    const token = req.cookies?.[COOKIE_NAME];

    if (!token) {
        return res.status(401).json({
            status: 'error',
            message: 'No autenticado'
        });
    }

    try {
        req.user = verifyToken(token);
        return next();
    } catch (error) {
        return res.status(401).json({
            status: 'error',
            message: 'No autenticado'
        });
    }
};

export default auth;

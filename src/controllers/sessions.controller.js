/**
 * Controlador para la gestión de Sesiones y Autenticación.
 * La validación de datos y credenciales vive en las estrategias de Passport
 * (src/config/passport.config.js); acá solo se genera el JWT, se setea la
 * cookie y se da forma a la respuesta.
 */
import { signToken } from '../utils/jwt.js';
import { config, COOKIE_NAME, COOKIE_MAX_AGE } from '../config/config.js';

export const register = async (req, res) => {
    try {
        return res.status(201).json({
            status: 'success',
            payload: req.user
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

export const login = async (req, res) => {
    try {
        const { id, email, role } = req.user;

        const token = signToken({ id, email, role });

        res.cookie(COOKIE_NAME, token, {
            httpOnly: true,
            sameSite: 'lax',
            maxAge: COOKIE_MAX_AGE,
            secure: config.nodeEnv === 'production'
        });

        return res.status(200).json({
            status: 'success',
            message: 'Login correcto'
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

export const current = async (req, res) => {
    try {
        const { id, email, role } = req.user;
        return res.status(200).json({
            status: 'success',
            payload: { id, email, role }
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

export const logout = async (req, res) => {
    try {
        res.clearCookie(COOKIE_NAME, {
            httpOnly: true,
            sameSite: 'lax',
            secure: config.nodeEnv === 'production'
        });
        return res.status(200).json({
            status: 'success',
            message: 'Sesión cerrada'
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

export default {
    register,
    login,
    current,
    logout
};

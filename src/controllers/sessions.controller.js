/**
 * Controlador para la gestión de Sesiones y Autenticación
 */
import sessionsService from '../services/sessions.service.js';
import { config, COOKIE_NAME, COOKIE_MAX_AGE } from '../config/config.js';

export const register = async (req, res) => {
    try {
        const { first_name, last_name, email, password } = req.body;

        const payload = await sessionsService.registerUser({
            first_name,
            last_name,
            email,
            password
        });

        return res.status(201).json({
            status: 'success',
            payload
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            status: 'error',
            message: error.message
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const { token } = await sessionsService.loginUser({ email, password });

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
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            status: 'error',
            message: statusCode === 500 ? error.message : 'Credenciales inválidas'
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
        res.clearCookie(COOKIE_NAME);
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

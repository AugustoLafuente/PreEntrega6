/**
 * Middleware de autenticación reutilizable: valida el JWT recibido en la
 * cookie httpOnly (a través de la estrategia 'current' de Passport) y puebla
 * req.user. Responde 401 si no hay sesión válida.
 */
import passport from 'passport';

export const auth = (req, res, next) => {
    passport.authenticate('current', { session: false }, (err, user) => {
        if (err || !user) {
            return res.status(401).json({
                status: 'error',
                message: 'No autenticado'
            });
        }
        req.user = user;
        return next();
    })(req, res, next);
};

export default auth;

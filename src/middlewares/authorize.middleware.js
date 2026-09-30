/**
 * Middleware de autorización reutilizable: recibe los roles permitidos y
 * los compara contra req.user.role (poblado previamente por el middleware
 * de autenticación). Responde 403 si el rol no está habilitado.
 */
export const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!allowedRoles.includes(req.user?.role)) {
            return res.status(403).json({
                status: 'error',
                message: 'No tenés permisos para realizar esta acción'
            });
        }
        return next();
    };
};

export default authorize;

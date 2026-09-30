import express from 'express';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import eventsRouter from './routes/events.router.js';
import sessionsRouter from './routes/sessions.router.js';
import usersRouter from './routes/users.router.js';
import initializePassport from './config/passport.config.js';

const app = express();

// Middlewares globales
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Passport: las estrategias se definen en config/passport.config.js
initializePassport();
app.use(passport.initialize());

// Endpoint de comprobación de estado de la API
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: "ok",
        message: "Servidor activo"
    });
});

// Rutas de la API
app.use('/api/events', eventsRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/users', usersRouter);

export default app;

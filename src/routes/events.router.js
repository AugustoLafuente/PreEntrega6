import { Router } from 'express';
import { getEvents, createEvent, updateEvent, cancelEvent } from '../controllers/events.controller.js';
import auth from '../middlewares/auth.middleware.js';
import authorize from '../middlewares/authorize.middleware.js';

const router = Router();

// GET /api/events → público: cualquiera puede consultar los eventos publicados
router.get('/', getEvents);

// POST /api/events → solo organizer o admin pueden crear eventos
router.post('/', auth, authorize('organizer', 'admin'), createEvent);

// PUT /api/events/:id → organizer solo sobre sus propios eventos, admin sobre cualquiera
router.put('/:id', auth, authorize('organizer', 'admin'), updateEvent);

// DELETE /api/events/:id → cancela el evento (organizer propio, admin cualquiera)
router.delete('/:id', auth, authorize('organizer', 'admin'), cancelEvent);

export default router;

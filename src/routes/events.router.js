import { Router } from 'express';
import { getEvents, getEventById, createEvent, updateEvent, updateEventStatus } from '../controllers/events.controller.js';
import auth from '../middlewares/auth.middleware.js';
import authorize from '../middlewares/authorize.middleware.js';

const router = Router();

// GET /api/events → público, admite filtros + paginación + ordenamiento
router.get('/', getEvents);

// GET /api/events/:id → público
router.get('/:id', getEventById);

// POST /api/events → solo organizer o admin
router.post('/', auth, authorize('organizer', 'admin'), createEvent);

// PUT /api/events/:id → dueño del evento o admin
router.put('/:id', auth, authorize('organizer', 'admin'), updateEvent);

// PATCH /api/events/:id/status → dueño del evento o admin (cancelar = status 'cancelled')
router.patch('/:id/status', auth, authorize('organizer', 'admin'), updateEventStatus);

export default router;

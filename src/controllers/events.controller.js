/**
 * Controlador para la gestión de Eventos: solo maneja request/response,
 * toda la lógica de negocio vive en events.service.js.
 */
import eventsService from '../services/events.service.js';

export const getEvents = async (req, res) => {
    try {
        const result = await eventsService.listEvents(req.query);
        return res.status(200).json({
            status: 'success',
            ...result
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            status: 'error',
            message: error.message
        });
    }
};

export const getEventById = async (req, res) => {
    try {
        const event = await eventsService.getEventById(req.params.id);
        return res.status(200).json({
            status: 'success',
            payload: event
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            status: 'error',
            message: error.message
        });
    }
};

export const createEvent = async (req, res) => {
    try {
        const event = await eventsService.createEvent(req.body, req.user.id);
        return res.status(201).json({
            status: 'success',
            payload: event
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            status: 'error',
            message: error.message
        });
    }
};

export const updateEvent = async (req, res) => {
    try {
        const event = await eventsService.updateEvent(req.params.id, req.body, req.user);
        return res.status(200).json({
            status: 'success',
            payload: event
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            status: 'error',
            message: error.message
        });
    }
};

export const updateEventStatus = async (req, res) => {
    try {
        const event = await eventsService.updateEventStatus(req.params.id, req.body.status, req.user);
        return res.status(200).json({
            status: 'success',
            payload: event
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            status: 'error',
            message: error.message
        });
    }
};

export default {
    getEvents,
    getEventById,
    createEvent,
    updateEvent,
    updateEventStatus
};

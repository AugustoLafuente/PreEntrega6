/**
 * Controlador para la gestión de Eventos
 */
import eventsService from '../services/events.service.js';

export const getEvents = async (req, res) => {
    try {
        const events = await eventsService.listPublishedEvents();
        return res.status(200).json({
            status: 'success',
            payload: events
        });
    } catch (error) {
        return res.status(500).json({
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

export const cancelEvent = async (req, res) => {
    try {
        const event = await eventsService.cancelEvent(req.params.id, req.user);
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
    createEvent,
    updateEvent,
    cancelEvent
};

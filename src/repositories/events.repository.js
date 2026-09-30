/**
 * Repository: intermediario entre el service y el DAO, aísla al resto
 * de la app de los detalles de persistencia (Mongoose).
 */
import eventsDao from '../dao/events.dao.js';

export const createEvent = async (eventData) => {
    return eventsDao.create(eventData);
};

export const getPublishedEvents = async () => {
    return eventsDao.findAll({ status: 'active' });
};

export const getEventById = async (id) => {
    return eventsDao.findById(id);
};

export const updateEvent = async (id, updates) => {
    return eventsDao.updateById(id, updates);
};

export default {
    createEvent,
    getPublishedEvents,
    getEventById,
    updateEvent
};

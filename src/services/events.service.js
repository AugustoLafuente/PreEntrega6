/**
 * Lógica de negocio para la creación, modificación y cancelación de eventos.
 */
import eventsRepository from '../repositories/events.repository.js';

const REQUIRED_FIELDS = ['title', 'sport_type', 'date', 'location', 'capacity'];
const UPDATABLE_FIELDS = ['title', 'description', 'sport_type', 'category', 'date', 'location', 'capacity', 'price'];

class ServiceError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

const toEventDTO = (event) => ({
    id: event._id,
    title: event.title,
    description: event.description,
    sport_type: event.sport_type,
    category: event.category,
    date: event.date,
    location: event.location,
    capacity: event.capacity,
    price: event.price,
    status: event.status,
    organizer: event.organizer
});

// Un organizer solo puede operar sobre sus propios eventos; el admin puede sobre cualquiera.
const assertCanModify = (event, user) => {
    const isOwner = event.organizer.toString() === user.id;
    if (!isOwner && user.role !== 'admin') {
        throw new ServiceError('No tenés permisos para modificar este evento', 403);
    }
};

export const listPublishedEvents = async () => {
    const events = await eventsRepository.getPublishedEvents();
    return events.map(toEventDTO);
};

export const createEvent = async (eventData, organizerId) => {
    for (const field of REQUIRED_FIELDS) {
        if (!eventData[field]) {
            throw new ServiceError(`Falta el campo obligatorio: ${field}`, 400);
        }
    }

    const newEvent = await eventsRepository.createEvent({
        title: eventData.title,
        description: eventData.description,
        sport_type: eventData.sport_type,
        category: eventData.category,
        date: eventData.date,
        location: eventData.location,
        capacity: eventData.capacity,
        price: eventData.price ?? 0,
        organizer: organizerId
    });

    return toEventDTO(newEvent);
};

export const updateEvent = async (eventId, updates, user) => {
    const event = await eventsRepository.getEventById(eventId);
    if (!event) {
        throw new ServiceError('Evento no encontrado', 404);
    }

    assertCanModify(event, user);

    const sanitizedUpdates = {};
    for (const field of UPDATABLE_FIELDS) {
        if (updates[field] !== undefined) {
            sanitizedUpdates[field] = updates[field];
        }
    }

    const updatedEvent = await eventsRepository.updateEvent(eventId, sanitizedUpdates);
    return toEventDTO(updatedEvent);
};

export const cancelEvent = async (eventId, user) => {
    const event = await eventsRepository.getEventById(eventId);
    if (!event) {
        throw new ServiceError('Evento no encontrado', 404);
    }

    assertCanModify(event, user);

    const cancelledEvent = await eventsRepository.updateEvent(eventId, { status: 'cancelled' });
    return toEventDTO(cancelledEvent);
};

export default {
    listPublishedEvents,
    createEvent,
    updateEvent,
    cancelEvent
};

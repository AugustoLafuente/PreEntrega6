/**
 * DAO: acceso directo al modelo de Mongoose para la colección de eventos.
 */
import Event from '../models/Event.js';

export const create = async (eventData) => {
    return Event.create(eventData);
};

export const findAll = async (filter = {}) => {
    return Event.find(filter);
};

export const findById = async (id) => {
    return Event.findById(id);
};

export const updateById = async (id, updates) => {
    return Event.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
};

export default {
    create,
    findAll,
    findById,
    updateById
};

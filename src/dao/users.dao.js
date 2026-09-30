/**
 * DAO: acceso directo al modelo de Mongoose para la colección de usuarios.
 */
import User from '../models/User.js';

export const create = async (userData) => {
    return User.create(userData);
};

export const findByEmail = async (email) => {
    return User.findOne({ email });
};

export const findById = async (id) => {
    return User.findById(id);
};

export const findAll = async () => {
    return User.find().select('-password');
};

export default {
    create,
    findByEmail,
    findById,
    findAll
};

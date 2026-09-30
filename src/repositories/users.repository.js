/**
 * Repository: intermediario entre el service y el DAO, aísla al resto
 * de la app de los detalles de persistencia (Mongoose).
 */
import usersDao from '../dao/users.dao.js';

export const createUser = async (userData) => {
    return usersDao.create(userData);
};

export const getUserByEmail = async (email) => {
    return usersDao.findByEmail(email);
};

export const getUserById = async (id) => {
    return usersDao.findById(id);
};

export const getAllUsers = async () => {
    return usersDao.findAll();
};

export default {
    createUser,
    getUserByEmail,
    getUserById,
    getAllUsers
};

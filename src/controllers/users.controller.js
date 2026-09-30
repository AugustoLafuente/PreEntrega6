/**
 * Controlador para la gestión administrativa de Usuarios.
 */
import usersRepository from '../repositories/users.repository.js';

export const getAllUsers = async (req, res) => {
    try {
        const users = await usersRepository.getAllUsers();
        return res.status(200).json({
            status: 'success',
            payload: users
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

export default {
    getAllUsers
};

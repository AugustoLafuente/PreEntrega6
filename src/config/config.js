import dotenv from 'dotenv';

dotenv.config();

if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET no está definido en las variables de entorno');
}

export const config = {
    port: process.env.PORT || 8080,
    nodeEnv: process.env.NODE_ENV || 'development',
    mongoUrl: process.env.MONGO_URL || '',
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h'
};

export const COOKIE_NAME = 'currentUser';
export const COOKIE_MAX_AGE = 3600000;

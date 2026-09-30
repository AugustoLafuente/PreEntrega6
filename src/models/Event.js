/**
 * Esquema y modelo de Mongoose para la entidad Event (Evento Deportivo:
 * torneos, carreras, partidos, etc.).
 */
import mongoose from 'mongoose';

const EVENT_STATUSES = ['active', 'cancelled'];

const eventSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        sport_type: {
            type: String, // Ej: 'Fútbol', 'Running', 'Básquetbol', 'Tenis', etc.
            required: true,
            trim: true
        },
        category: {
            type: String, // Ej: 'Amateur', 'Profesional', 'Sub-20', etc.
            trim: true
        },
        date: {
            type: Date,
            required: true
        },
        location: {
            type: String,
            required: true,
            trim: true
        },
        capacity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            default: 0,
            min: 0
        },
        status: {
            type: String,
            enum: EVENT_STATUSES,
            default: 'active'
        },
        organizer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    },
    {
        timestamps: true
    }
);

export const Event = mongoose.model('Event', eventSchema);

export default Event;

const { Schema, model } = require('mongoose');
const User = require('./user-model');

const LecruterSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User', // Ссылка на модель "Пользователь"
        required: true
    },
    education: { type: String, unique: false, required: true },
    totalScore: { type: Number, unique: false, required: true },
    sumScore: { type: Number, unique: false, required: true },
    releasedStudents: { type: Number, unique: false, required: true },
    subjects: { type: String, unique: false, required: true },
})

module.exports = model('Lecruter', LecruterSchema);
const { Schema, model, Types } = require('mongoose');


const ActiviteSchema = new Schema({
    signature: Number,
    typeActivites: Number,
    subject: { type: Types.ObjectId, ref: 'subject' },
    lecturer: { type: Types.ObjectId, ref: 'lecturer' },
    title: String,
    date: Date,
    students: [{ type: Types.ObjectId, ref: 'student' }]
})

module.exports = model('Activite', ActiviteSchema);
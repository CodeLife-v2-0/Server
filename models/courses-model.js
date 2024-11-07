const {Schema, model } = require('mongoose');


const CourseSchema = new Schema({
    name: {type: String, required: true},
    description: {type: String, require: true},
    discount: { type: Number, required: true },
})

module.exports = model('Course', CourseSchema);
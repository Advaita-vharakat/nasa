const mongoose = require('mongoose');


const graphSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: [3, 'Graph title must be at least 3 characters long']
    },
    type: {
        type: String,
        required: true,
        enum: ['bar', 'line', 'pie'], // only allow these types
    },
    data: {
        type: Object,
        required: true, // stores Chart.js JSON object
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Graph = mongoose.model('Graph', graphSchema);



module.exports = Graph;
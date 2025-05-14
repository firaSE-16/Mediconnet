const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const hospitalSchema = new Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    contactNumber: { type: String, required: true },
    licenseImage: {
        type: String,
        required: true
    },
    licenseNumber: {
        type: String,
        required: true
    }
});

const Hospital = mongoose.model('Hospital', hospitalSchema);
module.exports = Hospital;
const User = require('./user');
const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
    hospitalID: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
    contactNumber: { type: String, required: true },
    address: { type: String, required: true },
    specialization: { type: String },
    assignedPatientID: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Patient'}]
});

const Doctor = User.discriminator('Doctor', doctorSchema);
module.exports = Doctor;
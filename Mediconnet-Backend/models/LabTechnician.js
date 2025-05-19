const User = require('./user');
const mongoose = require('mongoose');

const labTechnicianSchema = new mongoose.Schema({
    hospitalID: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
    contactNumber: { type: String, required: true },
    address: { type: String, required: true }
});

const LabTechnician = User.discriminator('LabTechnician', labTechnicianSchema);
module.exports = LabTechnician;
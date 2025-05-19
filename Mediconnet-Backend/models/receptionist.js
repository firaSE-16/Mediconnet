const User = require('./user');
const mongoose = require('mongoose');

const receptionistSchema = new mongoose.Schema({
    hospitalID: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
    contactNumber: { type: String, required: true },
    address: { type: String, required: true }
});

const Receptionist = User.discriminator('Receptionist', receptionistSchema);
module.exports = Receptionist;
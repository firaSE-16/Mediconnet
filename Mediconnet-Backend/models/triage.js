const User = require('./user');
const mongoose = require('mongoose');

const triageSchema = new mongoose.Schema({
    hospitalID: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
    contactNumber: { type: String, required: true },
    address: { type: String, required: true }
});

const Triage = User.discriminator('Triage', triageSchema);
module.exports = Triage;
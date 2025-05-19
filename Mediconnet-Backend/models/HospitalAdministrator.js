const User = require('./user');
const mongoose = require('mongoose');

const hospitalAdministratorSchema = new mongoose.Schema({
    hospitalID: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Hospital', 
        required: true 
    }
});

const HospitalAdministrator = User.discriminator('HospitalAdministrator', hospitalAdministratorSchema);
module.exports = HospitalAdministrator;
const mongoose = require('mongoose');
const { Schema } = mongoose;


const centralPatientHistorySchema = new mongoose.Schema({
  faydaID: { type: String, required: true, unique: true }, // unique patient ID from your central system

  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },

  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', null],
    default: null,
  },

  records: [
    {
      hospitalID: { type: String, required: false }, 

        doctorNotes: {
    diagnosis: String,
    treatmentPlan: String,
    prescriptions: [{ type: Schema.Types.ObjectId, ref: 'Prescription' }]
  },
      labResults: [
        {
          testName: { type: String },
          result: { type: String },
          date: { type: Date, default: Date.now },
        },
      ],

      prescription: [
        {
          medicationName: { type: String },
          dosage: { type: String },
          frequency: { type: String },
          duration: { type: String },
        },
      ],
    },
  ],
});


module.exports = mongoose.model('CentralPatientHistory', centralPatientHistorySchema);

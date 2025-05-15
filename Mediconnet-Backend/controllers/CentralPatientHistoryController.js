// controllers/patientHistoryController.js
const CentralPatientHistory = require('../models/CenteralPatientHistory');
const mongoose = require('mongoose');

// Register a new patient or update existing patient's records
const updatePatientHistory = async (req, res) => {
  try {
    const { faydaID, firstName, lastName, dateOfBirth, gender, bloodGroup, record } = req.body;
    
    if (!faydaID || !firstName || !lastName || !dateOfBirth || !gender) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!record || !record.doctorNotes) {
      return res.status(400).json({ error: 'Medical record data is required' });
    }

    // Add hospital ID to the record
    record.hospitalID = req.hospital._id;

    // Try to find existing patient
    let patient = await CentralPatientHistory.findOne({ faydaID });

    if (patient) {
      // Update existing patient
      patient.records.push(record);
      if (bloodGroup) patient.bloodGroup = bloodGroup;
      await patient.save();
      return res.status(200).json({ 
        message: 'Patient record updated successfully',
        patient
      });
    } else {
      // Create new patient
      patient = new CentralPatientHistory({
        faydaID,
        firstName,
        lastName,
        dateOfBirth,
        gender,
        bloodGroup,
        records: [record]
      });
      
      await patient.save();
      return res.status(201).json({ 
        message: 'New patient record created successfully',
        patient
      });
    }
  } catch (error) {
    console.error('Error updating patient history:', error);
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get complete central patient history by Fayda ID
const getPatientHistory = async (req, res) => {
  try {
    const { faydaID } = req.params;

    if (!faydaID) {
      return res.status(400).json({ 
        success: false, 
        message: 'faydaID is required' 
      });
    }

    const patient = await CentralPatientHistory.findOne({ faydaID });

    if (!patient) {
      return res.status(404).json({ 
        success: false, 
        message: 'Patient not found' 
      });
    }

    res.status(200).json({ 
      success: true,
      message: 'Patient history fetched successfully',
      patient: {
        faydaID: patient.faydaID,
        fullName: `${patient.firstName} ${patient.lastName}`,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        bloodGroup: patient.bloodGroup,
        totalRecords: patient.records.length,
        records: patient.records.reverse(), // most recent first
      }
    });
  } catch (error) {
    console.error('Error fetching patient history:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
};

module.exports = {
  updatePatientHistory,
  getPatientHistory
};
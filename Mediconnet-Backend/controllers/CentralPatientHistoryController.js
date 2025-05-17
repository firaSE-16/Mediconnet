// controllers/patientHistoryController.js
const CentralPatientHistory = require('../models/CenteralPatientHistory');
const mongoose = require('mongoose');

const updatePatientHistory = async (req, res) => {
  try {
    const {
      faydaID,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      bloodGroup,
      records: incomingRecords, // expecting records as an array
    } = req.body;

    if (!faydaID || !firstName || !lastName || !dateOfBirth || !gender) {
      return res.status(400).json({ error: 'Missing required patient fields' });
    }

    if (!Array.isArray(incomingRecords) || incomingRecords.length === 0) {
      return res.status(400).json({ error: 'Medical record(s) are required' });
    }

    // Ensure each record has required structure
    const formattedRecords = incomingRecords.map(record => ({
      hospitalID: record.hospitalID || null,
      doctorNotes: {
        diagnosis: record.doctorNotes?.diagnosis || '',
        treatmentPlan: record.doctorNotes?.treatmentPlan || '',
        prescriptions: [], // kept empty to avoid conflicting with prescription array below
      },
      labResults: Array.isArray(record.labResults)
        ? record.labResults.map(lab => ({
            testName: lab.testName || '',
            result: lab.result || '',
            date: lab.date ? new Date(lab.date) : new Date(),
          }))
        : [],
      prescription: Array.isArray(record.prescriptions)
        ? record.prescriptions.map(med => ({
            medicationName: med.medicationName || '',
            dosage: med.dosage || '',
            frequency: med.frequency || '',
            duration: med.duration || '',
          }))
        : [],
    }));

    let patient = await CentralPatientHistory.findOne({ faydaID });

    if (patient) {
      // Update existing patient
      patient.records.push(...formattedRecords);
      patient.firstName = firstName;
      patient.lastName = lastName;
      patient.dateOfBirth = dateOfBirth;
      patient.gender = gender;
      if (bloodGroup) patient.bloodGroup = bloodGroup;
      await patient.save();
      return res.status(200).json({
        message: 'Patient record updated successfully',
        patient,
      });
    } else {
      // Create new patient
      patient = new CentralPatientHistory({
        faydaID,
        firstName,
        lastName,
        dateOfBirth,
        gender,
        bloodGroup: bloodGroup || null,
        records: formattedRecords,
      });

      await patient.save();
      return res.status(201).json({
        message: 'New patient record created successfully',
        patient,
      });
    }
  } catch (error) {
    console.error('Error updating patient history:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message,
    });
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
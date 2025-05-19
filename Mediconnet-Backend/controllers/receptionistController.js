const Patient = require('../models/patient');
const MedicalRecord = require('../models/MedicalRecord');
// controllers/receptionistController.js
const Receptionist = require('../models/receptionist');

const registerOrInitiatePatient = async (req, res) => {
  try {
    const {
      faydaID,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      contactNumber,
      address,
      emergencyContact,
      medicalHistory,
      hospitalID
    } = req.body;

    if (!faydaID || !hospitalID) {
      return res.status(400).json({
        success: false,
        message: "FaydaID and hospitalID are required"
      });
    }

    const existingPatient = await Patient.findOne({ faydaID });

    if (existingPatient) {
      // Check if already registered at the hospital
      const isRegistered = existingPatient.registeredHospital.some(
        h => h.toString() === hospitalID
      );

      // Register hospital if not already
      if (!isRegistered) {
        existingPatient.registeredHospital.push(hospitalID);
      }

      // Create a new medical record
      const newRecord = await MedicalRecord.create({
        faydaID,
        patientID: existingPatient._id,
        hospitalID,
        status: "Unassigned"
      });

      await existingPatient.save();

      return res.status(200).json({
        success: true,
        message: isRegistered
          ? "Patient already registered - new record created"
          : "Existing patient registered at new hospital",
        patient: existingPatient,
        medicalRecord: newRecord
      });
    }

    // If patient doesn't exist: create new one
    const newPatient = await Patient.create({
      faydaID,
      firstName,
      lastName,
      dateOfBirth: new Date(dateOfBirth),
      gender,
      contactNumber,
      address,
      emergencyContact,
      medicalHistory: medicalHistory || "",
      registeredHospital: [hospitalID],
      status: "Active"
    });

    const newRecord = await MedicalRecord.create({
      faydaID,
      patientID: newPatient._id,
      hospitalID,
      status: "Unassigned"
    });

    return res.status(201).json({
      success: true,
      message: "New patient registered",
      patient: newPatient,
      medicalRecord: newRecord
    });

  } catch (error) {
    console.error("Registration error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Fayda ID already exists"
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors).map(e => e.message).join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


// Search patients across all hospitals
const searchPatients = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.length < 3) {
      return res.status(400).json({
        success: false,
        message: "Search query must be at least 3 characters long"
      });
    }

    const patients = await Patient.find({
      $or: [
        { faydaID: { $regex: query, $options: 'i' } },
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { contactNumber: { $regex: query, $options: 'i' } }
      ]
    }).select('faydaID firstName lastName dateOfBirth gender contactNumber')
      .limit(20);

    res.status(200).json({
      success: true,
      patients
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during search"
    });
  }
};

// Get patient details by FaydaID
const getPatientByFaydaID = async (req, res) => {
  try {
    const { faydaID } = req.params;

    const patient = await Patient.findOne({ faydaID })
      .populate('registeredHospital', 'name')
      .populate('assignedDoctor', 'firstName lastName');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found"
      });
    }

    res.status(200).json({
      success: true,
      patient
    });
  } catch (error) {
    console.error("Patient fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching patient details"
    });
  }
};

const getStaffAccount = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the doctor and populate the hospital information
    const doctor = await Doctor.findById(id)
      .populate('hospitalID', 'name location contactNumber')
      .populate('assignedPatientID', 'faydaID firstName lastName status');

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Structure the response data
    const responseData = {
      _id: doctor._id,
      email: doctor.email,
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      dateOfBirth: doctor.dateOfBirth,
      gender: doctor.gender,
      role: doctor.role,
      contactNumber: doctor.contactNumber,
      address: doctor.address,
      specialization: doctor.specialization,
      hospital: doctor.hospitalID,
      assignedPatients: doctor.assignedPatientID,
      createdAt: doctor.createdAt,
      updatedAt: doctor.updatedAt
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error in getStaffAccount:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



const getReceptionistAccount = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the receptionist and populate the hospital information
    const receptionist = await Receptionist.findById(id)
      .populate('hospitalID', 'name location contactNumber');

    if (!receptionist) {
      return res.status(404).json({ message: "Receptionist not found" });
    }

    // Structure the response data
    const responseData = {
      _id: receptionist._id,
      email: receptionist.email,
      firstName: receptionist.firstName,
      lastName: receptionist.lastName,
      dateOfBirth: receptionist.dateOfBirth,
      gender: receptionist.gender,
      role: receptionist.role,
      contactNumber: receptionist.contactNumber,
      address: receptionist.address,
      hospital: receptionist.hospitalID,
      createdAt: receptionist.createdAt,
      updatedAt: receptionist.updatedAt
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error in getReceptionistAccount:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


module.exports = { registerOrInitiatePatient,
  getReceptionistAccount,
  registerOrInitiatePatient,
  searchPatients,
  getPatientByFaydaID
 };

const MedicalRecord = require("../models/MedicalRecord");
const Patient = require("../models/Patient");
const LabRequest = require("../models/LabRequest");
const Prescription = require("../models/Prescription");
const Doctor = require("../models/Doctor");
const mongoose = require("mongoose");
// ==================== DOCTOR PROFILE ====================

/**
 * Get doctor's staff account details
 */
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

// ==================== PATIENT MANAGEMENT ====================

/**
 * Get all medical records assigned to current doctor with patient details
 */
const getAssignedPatients = async (req, res) => {
  try {
    const doctorId = req.user?._id;
    const { search } = req.query;

    // Build search query
    const searchQuery = {
      currentDoctor: doctorId,
      status: { $in: ["Assigned", "InTreatment"] }
    };

    if (search) {
      searchQuery.$or = [
        { 'patientDetails.faydaID': { $regex: search, $options: 'i' } },
        { 'patientDetails.firstName': { $regex: search, $options: 'i' } },
        { 'patientDetails.lastName': { $regex: search, $options: 'i' } }
      ];
    }

    const records = await MedicalRecord.find(searchQuery)
      .populate({
        path: 'patientID',
        select: 'faydaID firstName lastName gender dateOfBirth bloodGroup status'
      })
      .sort({ createdAt: -1 });

    // Transform data to include patient details from the populated field
    const patients = records.map(record => ({
      medicalRecordId: record._id,
      status: record.status,
      ...record.patientID.toObject()
    }));
    

    res.status(200).json({ 
      success: true, 
      count: patients.length,
      data: patients 
    });
  } catch (error) {
    console.error("Error in getAssignedPatients:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error fetching patients" 
    });
  }
};


/**
 * Get complete patient profile by patient ID
 */
const getPatientProfile = async (req, res) => {
  try {
    const { patientId } = req.params;
    const doctorId = req.user?._id;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(patientId) || !mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid ID format" 
      });
    }

    // Check if doctor has access to this patient
    const hasAccess = await MedicalRecord.exists({
      patientID: patientId,
      currentDoctor: doctorId
    });

    if (!hasAccess) {
      return res.status(403).json({ 
        success: false,
        message: "You don't have access to this patient's records" 
      });
    }

    // Get patient with all related data
    const patient = await Patient.findById(patientId)
      .select('-__v -password')
      .populate({
        path: 'assignedDoctor',
        select: 'firstName lastName specialization'
      })
      .populate({
        path: 'registeredHospital',
        select: 'name location contactNumber'
      })
      .lean();

    if (!patient) {
      return res.status(404).json({ 
        success: false,
        message: "Patient not found" 
      });
    }

    // Get all medical records for this patient
    const medicalRecords = await MedicalRecord.find({
      patientID: patientId
    })
    .sort({ createdAt: -1 })
    .populate('currentDoctor', 'firstName lastName specialization')
    .populate('triageData.staffID', 'firstName lastName role')
    .populate({
      path: 'doctorNotes.prescriptions',
      populate: {
        path: 'medicineList',
        model: 'Medicine'
      }
    })
    .populate('labRequests')
    .lean();

    // Get current active record if exists
    const currentRecord = medicalRecords.find(record => 
      ['Assigned', 'InTreatment'].includes(record.status)
    );

    // Structure response data
    const responseData = {
      success: true,
      data: {
        patient: {
          basicInfo: {
            faydaID: patient.faydaID,
            firstName: patient.firstName,
            lastName: patient.lastName,
            fullName: `${patient.firstName} ${patient.lastName}`,
            dateOfBirth: patient.dateOfBirth,
            age: calculateAge(patient.dateOfBirth),
            gender: patient.gender,
            bloodGroup: patient.bloodGroup,
            contactNumber: patient.contactNumber,
            address: patient.address,
            status: patient.status
          },
          medicalInfo: {
            medicalHistory: patient.medicalHistory,
            allergies: patient.allergies || []
          },
          emergencyContact: patient.emergencyContact,
          hospitalInfo: {
            registeredHospitals: patient.registeredHospital,
            assignedDoctor: patient.assignedDoctor
          }
        },
        currentVisit: currentRecord ? {
          recordId: currentRecord._id,
          status: currentRecord.status,
          createdAt: currentRecord.createdAt,
          updatedAt: currentRecord.updatedAt,
          doctor: currentRecord.currentDoctor,
          triageData: currentRecord.triageData,
          doctorNotes: currentRecord.doctorNotes,
          labRequests: currentRecord.labRequests || []
        } : null,
        medicalHistory: medicalRecords.map(record => ({
          recordId: record._id,
          status: record.status,
          date: record.createdAt,
          doctor: record.currentDoctor,
          triage: record.triageData ? {
            vitals: record.triageData.vitals,
            chiefComplaint: record.triageData.chiefComplaint,
            urgency: record.triageData.urgency,
            triagedBy: record.triageData.staffID
          } : null,
          diagnosis: record.doctorNotes?.diagnosis || 'Not documented',
          treatment: record.doctorNotes?.treatmentPlan || 'Not documented',
          prescriptions: record.doctorNotes?.prescriptions || [],
          labRequests: record.labRequests || []
        }))
      }
    };

    res.status(200).json(responseData);

  } catch (error) {
    console.error("Error in getPatientProfile:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error fetching patient profile",
      error: error.message 
    });
  }
};
/**
 * Change medical record status from Assigned to InTreatment
 */
const startTreatment = async (req, res) => {
  try {
    const { recordId } = req.params;
    const doctorId = req.user?._id;

    const record = await MedicalRecord.findOneAndUpdate(
      {
        _id: recordId,
        currentDoctor: doctorId,
        status: "Assigned"
      },
      {
        status: "InTreatment",
        updatedAt: new Date()
      },
      { new: true }
    );
    



    if (!record) {
      return res.status(400).json({
        success: false,
        message: "Record not found, not assigned to you, or not in 'Assigned' status"
      });
    }

    res.status(200).json({
      success: true,
      message: "Treatment started successfully",
      data: record
    });
  } catch (error) {
    console.error("Error in startTreatment:", error);
    res.status(500).json({
      success: false,
      message: "Server error starting treatment"
    });
  }
};

// ==================== MEDICAL RECORDS ====================

// ==================== PATIENT MEDICAL HISTORY ====================

/**
 * Get complete medical history for a patient
 */
const getPatientMedicalHistory = async (req, res) => {
  try {
    const { patientId } = req.params;
    const doctorId = req.user?._id;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(patientId) || !mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid ID format" 
      });
    }

    // Check if doctor has access to this patient
    const hasAccess = await MedicalRecord.exists({
      patientID: patientId,
      currentDoctor: doctorId
    });

    if (!hasAccess) {
      return res.status(403).json({ 
        success: false,
        message: "You don't have access to this patient's records" 
      });
    }

    // Get all medical records for this patient
    const records = await MedicalRecord.find({ 
      patientID: patientId
    })
    .sort({ createdAt: -1 })
    .populate('currentDoctor', 'firstName lastName specialization')
    .populate('triageData.staffID', 'firstName lastName role')
    .populate({
      path: 'doctorNotes.prescriptions',
      populate: {
        path: 'medicineList.medicine',
        model: 'Medicine'
      }
    })
    .populate('labRequests')
    .lean();

    // Get basic patient info
    const patient = await Patient.findById(patientId)
      .select('faydaID firstName lastName dateOfBirth gender bloodGroup')
      .lean();

    // Transform data for better frontend consumption
    const medicalHistory = records.map(record => ({
      recordId: record._id,
      status: record.status,
      date: record.createdAt,
      doctor: record.currentDoctor,
      triage: record.triageData ? {
        vitals: record.triageData.vitals,
        chiefComplaint: record.triageData.chiefComplaint,
        urgency: record.triageData.urgency,
        triagedBy: record.triageData.staffID
      } : null,
      diagnosis: record.doctorNotes?.diagnosis || 'Not documented',
      treatment: record.doctorNotes?.treatmentPlan || 'Not documented',
      prescriptions: record.doctorNotes?.prescriptions || [],
      labRequests: record.labRequests || []
    }));

    res.status(200).json({ 
      success: true,
      count: medicalHistory.length,
      data: {
        patient: {
          faydaID: patient.faydaID,
          name: `${patient.firstName} ${patient.lastName}`,
          age: calculateAge(patient.dateOfBirth),
          gender: patient.gender,
          bloodGroup: patient.bloodGroup
        },
        medicalHistory
      }
    });

  } catch (error) {
    console.error("Error in getPatientMedicalHistory:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error fetching medical history",
      error: error.message
    });
  }
};

// Helper function to calculate age from date of birth
function calculateAge(birthDate) {
  if (!birthDate) return null;
  const diff = Date.now() - new Date(birthDate).getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}
// Helper function to calculate age from date of birth
function calculateAge(birthDate) {
  if (!birthDate) return null;
  const diff = Date.now() - new Date(birthDate).getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}
/**
 * Get single medical record details
 */
const getMedicalRecord = async (req, res) => {
  try {
    const { recordId } = req.params;
    const doctorId = req.user?._id;

    console.log("Input - recordId:", recordId, "doctorId:", doctorId);

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(recordId) || !mongoose.Types.ObjectId.isValid(doctorId)) {
      console.log("Invalid ID format");
      return res.status(400).json({ 
        success: false,
        message: "Invalid ID format" 
      });
    }

    // Convert string IDs to ObjectId if needed
    const recordObjectId = new mongoose.Types.ObjectId(recordId);
    const doctorObjectId = new mongoose.Types.ObjectId(doctorId);

    console.log("Converted - recordId:", recordObjectId, "doctorId:", doctorObjectId);

    const record = await MedicalRecord.findOne({
      _id: recordObjectId,
      $or: [
        { currentDoctor: doctorObjectId },
        
      ]
    })
    .populate({
      path: 'patientID',
      select: 'faydaID firstName lastName gender dateOfBirth',
      model: 'Patient'
    })
    .populate({
      path: 'currentDoctor',
      select: 'firstName lastName',
      model: 'Doctor'
    })
    .populate({
      path: 'triageData.staffID',
      select: 'firstName lastName role',
      model: 'User'
    })
    .populate({
      path: 'doctorNotes.prescriptions',
      model: 'Prescription'
    });

    console.log("Raw Record:", record);

    if (!record) {
      // Additional check to see if record exists at all
      const recordExists = await MedicalRecord.exists({ _id: recordObjectId });
      
      if (!recordExists) {
        console.log("Record doesn't exist in database");
        return res.status(404).json({ 
          success: false,
          message: "Medical record not found" 
        });
      }

      // Check if doctor is assigned
      const isDoctorAssigned = await MedicalRecord.exists({
        _id: recordObjectId,
        $or: [
          { currentDoctor: doctorObjectId },
         
        ]
      });

      console.log("Is doctor assigned:", isDoctorAssigned);

      return res.status(403).json({ 
        success: false,
        message: "You are not authorized to access this record" 
      });
    }

    // Transform the data
    const responseData = {
      _id: record._id,
      status: record.status,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      patient: record.patientID,
      currentDoctor: record.currentDoctor,
      
      triageData: record.triageData ? {
        vitals: record.triageData.vitals,
        chiefComplaint: record.triageData.chiefComplaint,
        urgency: record.triageData.urgency,
        staff: record.triageData.staffID,
        completedAt: record.triageData.completedAt
      } : null,
      doctorNotes: record.doctorNotes ? {
        diagnosis: record.doctorNotes.diagnosis,
        treatmentPlan: record.doctorNotes.treatmentPlan,
        prescriptions: record.doctorNotes.prescriptions
      } : null
    };

    res.status(200).json({ 
      success: true,
      data: responseData 
    });
  } catch (error) {
    console.error("Error in getMedicalRecord:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error fetching record",
      error: error.message
    });
  }
};/**
 * Create/update medical record
 */
const updateMedicalRecord = async (req, res) => {
  try {
    const { recordId } = req.params;

    const doctorId = req.user?._id;
    const { diagnosis, treatmentPlan, vitals } = req.body;

    // Validate required fields
    if (!diagnosis || !treatmentPlan) {
      return res.status(400).json({ 
        success: false,
        message: "Diagnosis and treatment plan are required" 
      });
    }

    const record = await MedicalRecord.findOneAndUpdate(
      {
        _id: recordId,
        $or: [
          { currentDoctor: doctorId },
         
        ]
      },
      {
        $set: {
          "doctorNotes.diagnosis": diagnosis,
          "doctorNotes.treatmentPlan": treatmentPlan,
          "triageData.vitals": vitals || {},
          status: "Completed",
          updatedAt: new Date()
        }
      },
      { new: true, runValidators: true }
    )
    .populate('patientID', 'faydaID firstName lastName')
    .populate('currentDoctor', 'firstName lastName');

    if (!record) {
      return res.status(404).json({ 
        success: false,
        message: "Record not found or unauthorized" 
      });
    }

    res.status(200).json({ 
      success: true,
      message: "Record updated successfully",
      data: record 
    });
  } catch (error) {
    console.error("Error in updateMedicalRecord:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error updating record" 
    });
  }
};

// ==================== LAB REQUESTS ====================

/**
 * Create new lab request
 */
const createLabRequest = async (req, res) => {
  try {
    const { recordId } = req.params;
    const { testType, instructions, urgency } = req.body;
    const doctorId = req.user?._id;
    console.log("Input - recordId:", recordId, "doctorId:", doctorId);

    if (!recordId || !testType) {
      return res.status(400).json({ 
        success: false,
        message: "Medical record ID and test type are required" 
      });
    }

    // Verify medical record belongs to this doctor
    const record = await MedicalRecord.findOne({
      _id: recordId,
      currentDoctor: doctorId,
      status: "InTreatment"
    });
    console.log("Record found:", record);

    if (!record) {
      return res.status(403).json({ 
        success: false,
        message: "Medical record not found or not in treatment status" 
      });
    }

    const newRequest = new LabRequest({
      patientID: record.patientID,
      doctorID: doctorId,
      testType,
      instructions,
      urgency: urgency || "Normal",
      status: "Pending"
    });

    await newRequest.save();

    // Add reference to the medical record
    await MedicalRecord.findByIdAndUpdate(
      recordId,
      { $addToSet: { labRequests: newRequest._id } }
    );

    res.status(201).json({ 
      success: true,
      message: "Lab request created",
      data: newRequest 
    });
  } catch (error) {
    console.error("Error in createLabRequest:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error creating lab request" 
    });
  }
};

/**
 * Get all lab requests for a medical record
 */
const getPatientLabRequests = async (req, res) => {
  try {
    const { recordId } = req.params;
    const doctorId = req.user?._id;

    // Verify medical record belongs to this doctor
    const record = await MedicalRecord.findOne({
      _id: recordId,
      currentDoctor: doctorId
    });

    if (!record) {
      return res.status(403).json({ 
        success: false,
        message: "Medical record not found or unauthorized" 
      });
    }

    const requests = await LabRequest.find({ 
      patientID: record.patientID 
    })
    .sort({ requestDate: -1 })
    .populate('doctorID', 'firstName lastName');

    res.status(200).json({ 
      success: true,
      count: requests.length,
      data: requests 
    });
  } catch (error) {
    console.error("Error in getPatientLabRequests:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error fetching lab requests" 
    });
  }
};

// ==================== PRESCRIPTIONS ====================

/**
 * Create new prescription
 */
const createPrescription = async (req, res) => {
  try {
    const {recordId}= req.params
    const {  medicines, instructions } = req.body;
    const doctorId = req.user?._id;

    if (!recordId || !medicines || medicines.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "Medical record ID and at least one medicine are required" 
      });
    }

    // Verify medical record belongs to this doctor
    const record = await MedicalRecord.findOne({
      _id: recordId,
      currentDoctor: doctorId,
      status: "InTreatment"
    });

    if (!record) {
      return res.status(403).json({ 
        success: false,
        message: "Medical record not found or not in treatment status" 
      });
    }

    // Validate each medicine has required fields
    const validMedicines = medicines.filter(med => 
      med.name && med.dosage && med.frequency && med.duration
    );

    if (validMedicines.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "All medicines must have name, dosage, frequency and duration" 
      });
    }

    const newPrescription = new Prescription({
      patientID: record.patientID,
      doctorID: doctorId,
      medicineList: validMedicines,
      instructions,
      isFilled: false
    });

    await newPrescription.save();

    // Add reference to the medical record
    await MedicalRecord.findByIdAndUpdate(
      recordId,
      { 
        $addToSet: { "doctorNotes.prescriptions": newPrescription._id } 
      }
    );

    res.status(201).json({ 
      success: true,
      message: "Prescription created",
      data: newPrescription 
    });
  } catch (error) {
    console.error("Error in createPrescription:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error creating prescription" 
    });
  }
};

/**
 * Get all prescriptions for a medical record
 */
const getPatientPrescriptions = async (req, res) => {
  try {
    const { recordId } = req.params;
    const doctorId = req.user?._id;

    // Verify medical record belongs to this doctor
    const record = await MedicalRecord.findOne({
      _id: recordId,
      currentDoctor: doctorId
    });

    if (!record) {
      return res.status(403).json({ 
        success: false,
        message: "Medical record not found or unauthorized" 
      });
    }

    const prescriptions = await Prescription.find({ 
      patientID: record.patientID 
    })
    .sort({ datePrescribed: -1 })
    .populate('doctorID', 'firstName lastName');

    res.status(200).json({ 
      success: true,
      count: prescriptions.length,
      data: prescriptions 
    });
  } catch (error) {
    console.error("Error in getPatientPrescriptions:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error fetching prescriptions" 
    });
  }
};

module.exports = {
  // Doctor Profile
  getStaffAccount,
  
  // Patient Management
  getAssignedPatients,
  getPatientProfile,
  startTreatment,
  
  // Medical Records
  getPatientMedicalHistory,
  getMedicalRecord,
  updateMedicalRecord,
  
  // Lab Requests
  createLabRequest,
  getPatientLabRequests,
  
  // Prescriptions
  createPrescription,
  getPatientPrescriptions
};
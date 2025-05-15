// routes/patientHistoryRoutes.js
const express = require('express');
const router = express.Router();
const { authenticateHospital } = require('../middleware/centerAuthMiddleware');
const { 
  updatePatientHistory, 
  getPatientHistory 
} = require('../controllers/CentralPatientHistoryController');

// Update or create patient record
router.post('/records', authenticateHospital, updatePatientHistory);

// Get patient history
router.get('/records/:faydaID', getPatientHistory);

module.exports = router;
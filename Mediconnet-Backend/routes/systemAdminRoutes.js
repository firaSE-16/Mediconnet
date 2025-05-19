const express = require("express");
const router = express.Router();
const {
  registerHospital,
  addHospitalAdmin,
  getAllHospitals,
  getHospitalDetails,
  deleteHospitalAdmin,
  getAdminSummary,
  getStaffDetails
} = require("../controllers/systemAdminContoller");
const authMiddleware = require("../middleware/authmiddleware");

router.get("/summaryHospitals", authMiddleware,getAdminSummary);

// Hospital management routes
router.post("/hospitals", authMiddleware, registerHospital);
router.get("/hospitals", authMiddleware, getAllHospitals);
router.get("/hospitals/:id", authMiddleware, getHospitalDetails);
router.get("/hospitals/staff/:id", authMiddleware, getStaffDetails);

// Hospital admin management routes
router.post("/hospital-admins", authMiddleware, addHospitalAdmin);
router.delete("/hospital-admins/:adminId", authMiddleware, deleteHospitalAdmin);

module.exports = router;
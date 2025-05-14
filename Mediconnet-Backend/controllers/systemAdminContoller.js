const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Hospital = require("../models/Hospital");
const HospitalAdministrator = require("../models/HospitalAdministrator");
const User = require("../models/user");

// Register a new hospital
const registerHospital = async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== "Admin") {
      return res.status(403).json({ msg: "Only system admins can add hospitals" });
    }

    const { name, location, contactNumber, licenseNumber, licenseImage } = req.body;

    // Validate required fields
    if (!name || !location || !contactNumber || !licenseNumber || !licenseImage) {
      return res.status(400).json({ msg: "Please provide all required hospital information" });
    }

    // Check for existing hospital with same license
    const existingHospital = await Hospital.findOne({ licenseNumber });
    if (existingHospital) {
      return res.status(400).json({ msg: "Hospital with this license number already exists" });
    }

    // Create new hospital
    const newHospital = new Hospital({
      name,
      location,
      contactNumber,
      licenseNumber,
      licenseImage,
      status: "active" // Default status
    });

    const savedHospital = await newHospital.save();

    res.status(201).json({
      msg: "Hospital registered successfully",
      hospital: {
        id: savedHospital._id,
        name: savedHospital.name,
        licenseNumber: savedHospital.licenseNumber
      }
    });

  } catch (error) {
    console.error("Hospital registration error:", error);
    res.status(500).json({ msg: "Server error during hospital registration" });
  }
};

const addHospitalAdmin = async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== "Admin") {
      return res.status(403).json({ msg: "Only system admins can add hospital administrators" });
    }

    const { 
      email, 
      password, 
      hospitalId, 
      firstName, 
      lastName, 
      dateOfBirth, 
      gender 
    } = req.body;

    // Validate required fields
    if (!email || !password || !hospitalId || !firstName || !lastName || !dateOfBirth || !gender) {
      return res.status(400).json({ msg: "Please provide all required administrator information" });
    }

    // Validate and convert hospitalId to ObjectId
    let hospitalObjectId;
    try {
      hospitalObjectId = new mongoose.Types.ObjectId(hospitalId);
    } catch (err) {
      return res.status(400).json({ msg: "Invalid hospital ID format" });
    }

    // Check if hospital exists
    const hospital = await Hospital.findById(hospitalObjectId);
    if (!hospital) {
      return res.status(404).json({ msg: "Hospital not found" });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User with this email already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new admin with hospitalID as ObjectId
    const newAdmin = new HospitalAdministrator({
      email,
      password: hashedPassword,
      hospitalID: hospitalObjectId,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      role: "HospitalAdministrator"
    });

    await newAdmin.save();

    res.status(201).json({
      msg: "Hospital administrator added successfully",
      admin: {
        id: newAdmin._id,
        name: `${firstName} ${lastName}`,
        email,
        hospital: hospital.name
      }
    });

  } catch (error) {
    console.error("Add hospital admin error:", error);
    if (error.name === 'CastError') {
      return res.status(400).json({ msg: "Invalid ID format" });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ msg: error.message });
    }
    res.status(500).json({ msg: "Server error during administrator registration" });
  }
};

// Get all hospitals with search and pagination
const getAllHospitals = async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== "Admin") {
      return res.status(403).json({ msg: "Unauthorized access" });
    }

    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (page - 1) * limit;

    const searchQuery = {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { licenseNumber: { $regex: search, $options: 'i' } }
      ]
    };

    const [hospitals, total] = await Promise.all([
      Hospital.find(searchQuery)
        .select('_id name location contactNumber licenseNumber status createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Hospital.countDocuments(searchQuery)
    ]);

    res.status(200).json({
      hospitals,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error("Get hospitals error:", error);
    res.status(500).json({ msg: "Server error fetching hospitals" });
  }
};


const getHospitalDetails = async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== "Admin") {
      return res.status(403).json({ msg: "Unauthorized access" });
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: "Invalid hospital ID" });
    }

    const hospital = await Hospital.findById(id);
    if (!hospital) {
      return res.status(404).json({ msg: "Hospital not found" });
    }

    // Get all staff for this hospital (excluding system Admins)
    const staff = await User.aggregate([
      {
        $match: {
          hospitalID: new mongoose.Types.ObjectId(id),
          role: { $nin: ["Admin"] } // Exclude system admins
        }
      },
      {
        $project: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          email: 1,
          role: 1,
          lastLogin: 1,
          status: 1,
          createdAt: 1,
          dateOfBirth: 1,
          gender: 1,
          profilePicture: 1
        }
      },
      { $sort: { role: 1, createdAt: -1 } }
    ]);

    // Categorize staff by their roles
    const staffByRole = staff.reduce((acc, user) => {
      if (!acc[user.role]) {
        acc[user.role] = [];
      }
      acc[user.role].push(user);
      return acc;
    }, {});

    // Get counts for each role
    const roleCounts = Object.keys(staffByRole).reduce((acc, role) => {
      acc[role] = staffByRole[role].length;
      return acc;
    }, {});

    res.status(200).json({
      hospital,
      staff,
      staffByRole,
      roleCounts,
      totalStaff: staff.length
    });

  } catch (error) {
    console.error("Get hospital details error:", error);
    res.status(500).json({ msg: "Server error fetching hospital details" });
  }
};

const getStaffDetails = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: "Invalid staff ID" });
    }

    const staff = await User.findById(id).select('-password -__v');

    if (!staff) {
      return res.status(404).json({ msg: "Staff member not found" });
    }

    res.status(200).json(staff);
  } catch (error) {
    console.error("Get staff details error:", error);
    res.status(500).json({ msg: "Server error fetching staff details" });
  }
};


// Delete hospital admin
const deleteHospitalAdmin = async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== "Admin") {
      return res.status(403).json({ msg: "Unauthorized access" });
    }

    const { adminId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(adminId)) {
      return res.status(400).json({ msg: "Invalid admin ID" });
    }

    const admin = await HospitalAdministrator.findByIdAndDelete(adminId);
    if (!admin) {
      return res.status(404).json({ msg: "Administrator not found" });
    }

    res.status(200).json({ msg: "Administrator deleted successfully" });

  } catch (error) {
    console.error("Delete admin error:", error);
    res.status(500).json({ msg: "Server error deleting administrator" });
  }
};

const getAdminSummary = async (req, res) => {
  try {
    // Count total hospitals
    const totalHospitals = await Hospital.countDocuments();

    // Count users by role
    const userAggregation = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
        },
      },
    ]);

    // Create a role-count mapping
    const userCounts = {};
    userAggregation.forEach((item) => {
      userCounts[item._id] = item.count;
    });
  

    // Respond with summary
    res.status(200).json({
      success: true,
      data: {
        totalHospitals,
        userCounts,
      },
    });
  } catch (error) {
    console.error('Admin Summary Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};



module.exports = {
  getAdminSummary,
  registerHospital,
  addHospitalAdmin,
  getAllHospitals,
  getHospitalDetails,
  deleteHospitalAdmin,
  getStaffDetails
};
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const hospitalAdminRoutes = require("./routes/hospitalAdminRoutes");
const triageRoutes = require("./routes/triageRoutes");
const labRoutes = require("./routes/labReqeustRoutes");
const prescriptionRoutes = require("./routes/prescriptionRoutes");
const systemAdminRoutes = require("./routes/systemAdminRoutes");
const receptionistRoutes = require("./routes/receptionistRoute");
const doctorRoutes = require( "./routes/doctorRoutes");
const authRoute = require("./routes/authRoute");
const CentralPatientHistoryRoutes = require("./routes/CenteralPatientHistoryRoute");

const connectDB = require("./lib/db");
const Admin = require("./models/admin");

dotenv.config();
const port = process.env.PORT;

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175","http://localhost:7500","https://mediconnet-frontend.onrender.com","https://arada-front.onrender.com"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
  })
);
app.use(cookieParser());

app.use("/api/hospital-admin", hospitalAdminRoutes);
app.use("/api/system-admin", systemAdminRoutes);
app.use("/api/reception", receptionistRoutes);
app.use("/api/triage", triageRoutes);
app.use("/api/lab", labRoutes);
app.use("/api/prescription", prescriptionRoutes);
app.use("/api/auth", authRoute);
app.use("/api/doctors", doctorRoutes);
app.use('/api/central-history', CentralPatientHistoryRoutes);


app.post("/api/admin", async (req, res) => {
  try {
    const {
      email,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      password,
    } = req.body;

    const existingAdmin = await Admin.findOne({ email, role: "Admin" });
    if (existingAdmin) {
      return res.status(409).json({ msg: "Admin with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new Admin({
      email,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      password: hashedPassword,
      role: "Admin",
    });

    const savedAdmin = await newAdmin.save();
    res.status(201).json({ msg: "Admin registered successfully", admin: savedAdmin });
  } catch (error) {
    console.error("Error registering admin:", error);
    res.status(500).json({ msg: "Internal server error" });
  }
})







app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  connectDB();
});


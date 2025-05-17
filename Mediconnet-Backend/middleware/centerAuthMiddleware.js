// middleware/authMiddleware.js
const Hospital = require('../models/Hospital');

const authenticateHospital = async (req, res, next) => {
  try {
    const secretKey = req.headers['x-api-key'];
    const hospitalID = req.headers['hospitalid']; // Headers are case-insensitive but best to use lowercase

    if (!secretKey || !hospitalID) {
      return res.status(401).json({ error: 'API key and hospital ID are required' });
    }

    console.log('Hospital ID:', hospitalID);

    const hospital = await Hospital.findById(hospitalID);
    console.log('Hospital:', hospital);

    if (!hospital) {
      return res.status(404).json({ error: 'Hospital not found' });
    }
console.log('Hospital found:', hospital.secreteKey);
    if (secretKey !== hospital.secreteKey ) {
      return res.status(403).json({ error: 'Invalid API key or hospital not approved' });
    }

    req.hospital = hospital;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
};

module.exports = { authenticateHospital };

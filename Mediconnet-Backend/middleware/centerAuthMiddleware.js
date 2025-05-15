// middleware/authMiddleware.js
const Hospital = require('../models/Hospital');

const authenticateHospital = async (req, res, next) => {
  try {
    const secretKey = req.headers['x-api-key'] || req.query.apiKey;
    
    if (!secretKey) {
      return res.status(401).json({ error: 'API key is required' });
    }

    const hospital = await Hospital.findOne({ secreteKey: secretKey });
    
    if (!hospital || !hospital.isInOurSystem) {
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
const jwt = require("jsonwebtoken");

const generateToken = (userId, hospitalId, role, res) => {
  const token = jwt.sign({ userId, hospitalId, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV !== "development",
  });

  return token;
};

module.exports = generateToken;

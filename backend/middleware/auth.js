const jwt = require("jsonwebtoken");

const generateToken = (id, userType) => {
  return jwt.sign({ id, userType, role: userType }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }

  // Set user info including role (use userType as role if role not set)
  req.user = {
    id: decoded.id,
    role: decoded.role || decoded.userType,
    userType: decoded.userType,
  };
  next();
};

module.exports = {
  generateToken,
  verifyToken,
  authMiddleware,
};

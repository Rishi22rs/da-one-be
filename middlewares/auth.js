const jwt = require("jsonwebtoken");

// Middleware to generate token (usually done in a login route)
const generateToken = (user) => {
  const payload = {
    id: user.id,
    phoneNumber: user.phoneNumber,
  };

  const options = {
    expiresIn: "1h", // Token expires in 1 hour
  };

  return jwt.sign(payload, process.env.JWT_SECRET, options);
};

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access Denied: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    res.status(400).json({ message: "Invalid Token" });
  }
};

module.exports = {
  generateToken,
  verifyToken,
};

const jwt = require("jsonwebtoken");

const generateToken = (payload) => {
  const jwtSecret = process.env.JWT_SECRET;
  try {
    const token = jwt.sign(payload, jwtSecret, { expiresIn: "1d" });
    return token;
  } catch (error) {
    console.log("Error Occured In Generating Token : ", error);
    throw error;
  }
};

const jwtAuthMiddleware = (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1]; // assuming token is passed in authorization headers
  if (!token)
    return res.status(200).json({ success: false, message: "Token not Found" });

  try {
    const jwtSecret = process.env.JWT_SECRET;
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    console.log("Error In Verifying Token : ", error);
    return res.status(401).json({ message: "Unauthorized" });
    
  }
};

module.exports = { generateToken, jwtAuthMiddleware };

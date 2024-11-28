import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';

export const isLogedin = async (req, res, next) => {
  try {
    const authHeader = req.headers?.authorization;
    const token = req.cookies?.at || (authHeader && authHeader.startsWith('Bearer') ? authHeader.split(' ')[1] : authHeader);

    console.log("Cookies:", req.cookies);
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access, please login to use this service",
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    } catch (err) {
      return res.status(401).json({
        message: "Invalid or expired token, please login again",
        success: false,
      });
    }

    // Check if the user exists
    const user = await userModel.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(403).json({
        message: "User not found",
        success: false,
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error(`Login Error: ${error.message}`);
    return res.status(500).json({
      message: "Internal server error while login, try again later or contact us.",
      success: false,
    });
  }
};

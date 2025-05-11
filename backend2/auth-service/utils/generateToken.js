// auth-service/utils/generateToken.js
import jwt from 'jsonwebtoken';

const generateToken = (user) => { // Expect user object
  if (!user || !user._id || !user.userType) {
    // Handle error or throw: essential info missing for token
    console.error("Cannot generate token: user object is missing id or userType", user);
    throw new Error("Token generation failed due to missing user details.");
  }
  return jwt.sign(
    { 
      id: user._id, 
      userType: user.userType,
      email: user.email, // Optional: if needed by main-service from token
      name: user.name    // Optional: if needed by main-service from token
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
  );
};

export default generateToken;
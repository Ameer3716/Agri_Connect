// backend/auth-service/controllers/authController.js
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js'; // Path adjusted
import asyncHandler from 'express-async-handler';
import redisClient from '../config/redis.js';

// @desc    Register a new user
// @route   POST /signup
// @access  Public
const signupUser = asyncHandler(async (req, res) => {
  const { name, email, password, userType } = req.body;

  if (!name || !email || !password || !userType) {
    res.status(400);
    throw new Error('Please provide all required fields: name, email, password, userType');
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User with this email already exists');
  }
  const user = await User.create({ // user object is created here
    name,
    email,
    password,
    userType,
  });
  if (user) {
    if (redisClient && typeof redisClient.del === 'function' && redisClient.isReady) {
        try {
          await redisClient.del(`user:${email}`);
          console.log('AuthService: Any existing user cache cleared for signup');
        } catch (error) {
          console.log('AuthService: Failed to clear user cache during signup:', error.message);
        }
    } else {
        console.log('AuthService: Redis client not available or not ready for signup cache clear.');
    }
    
    // MODIFIED HERE: Pass the whole user object
    const token = generateToken(user); 

    res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000 
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      userType: user.userType,
      token: token,
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Authenticate user & get token (Login)
// @route   POST /login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }
  let userDocument; // Use a different variable name to avoid confusion with parsed cached user
  let cacheHit = false;
  let userFromCache;
  
  if (redisClient && typeof redisClient.get === 'function' && redisClient.isReady) {
      try {
        const cachedUserData = await redisClient.get(`user:${email}`);
        if (cachedUserData) {
          cacheHit = true;
          console.log('AuthService: User data retrieved from cache');
          userFromCache = JSON.parse(cachedUserData); // This is the plain object from cache
          
          // We still need the actual Mongoose document for password comparison and full user object for token
          userDocument = await User.findById(userFromCache._id).select('+password');
          
          if (!userDocument) {
            console.log('AuthService: User found in cache but not in database');
            await redisClient.del(`user:${email}`); // Clean cache
            res.status(401);
            throw new Error('Invalid email or password (user desynced)');
          }
          
          if (!(await userDocument.comparePassword(password, userDocument.password))) {
            res.status(401);
            throw new Error('Invalid email or password');
          }
        }
      } catch (error) {
        console.log('AuthService: Cache operation failed, falling back to database:', error.message);
        cacheHit = false;
      }
  } else {
      console.log('AuthService: Redis client not available or not ready for login cache get.');
  }
  
  if (!cacheHit) {
    console.log('AuthService: Retrieving user from database');
    userDocument = await User.findOne({ email }).select('+password'); // This is the Mongoose document
    
    if (!userDocument || !(await userDocument.comparePassword(password, userDocument.password))) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    if (redisClient && typeof redisClient.set === 'function' && redisClient.isReady) {
        try {
          // Cache the plain object version
          const userDataToCache = {
            _id: userDocument._id.toString(),
            name: userDocument.name, 
            email: userDocument.email,
            userType: userDocument.userType
          };
          await redisClient.set(
            `user:${email}`, 
            JSON.stringify(userDataToCache), 
            { EX: 3600 }
          );
          console.log('AuthService: User data cached successfully');
        } catch (error) {
          console.log('AuthService: Failed to cache user data:', error.message);
        }
    } else {
        console.log('AuthService: Redis client not available or not ready for login cache set.');
    }
  }

  // MODIFIED HERE: Pass the Mongoose user document (or a plain object derived from it)
  const token = generateToken(userDocument); 

  res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000
  });

  // Send the plain user data in the response
  res.json({
    _id: userDocument._id,
    name: userDocument.name,
    email: userDocument.email,
    userType: userDocument.userType,
    token: token,
  });
});

// @desc    Logout user / clear cookie
// @route   POST /logout
const logoutUser = asyncHandler(async (req, res) => {
  // req.user here would depend on if this route is protected by a middleware
  // that populates req.user from a token.
  // If logout is called with a valid token, req.user would be available.
  // For simplicity, let's assume if a JWT cookie exists, we try to get email from it for cache clearing.
  // Or, if frontend sends email in request body for logout, that could also work.

  let emailToClear;
  if (req.user && req.user.email) { // If a middleware populated req.user
    emailToClear = req.user.email;
  } else if (req.cookies.jwt) { // Fallback: try to decode JWT to get email for cache clearing
      try {
          const decoded = jwt.verify(req.cookies.jwt, process.env.JWT_SECRET);
          if(decoded.email) emailToClear = decoded.email;
      } catch (e) {
          console.log("AuthService: Could not decode JWT from cookie for logout cache clearing.", e.message);
      }
  }

  if (emailToClear && redisClient && typeof redisClient.del === 'function' && redisClient.isReady) {
    try {
      await redisClient.del(`user:${emailToClear}`);
      console.log(`AuthService: User cache cleared successfully for ${emailToClear} on logout`);
    } catch (error) {
      console.log('AuthService: Failed to clear user cache on logout:', error.message);
    }
  } else if (emailToClear) {
      console.log('AuthService: Redis client not available or not ready for logout cache clear.');
  }
  
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'strict',
  });
  res.status(200).json({ message: 'Logged out successfully from AuthService' });
});


// @desc    Verify token (new endpoint for other services)
// @route   GET /verify-token
// @access  Protected (token passed in header)
const verifyToken = asyncHandler(async (req, res) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ valid: false, message: 'No token provided for verification' });
    }

    try {
        // jwt.verify will throw error if secret is wrong or token is malformed/expired
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // decoded payload should contain id, userType, email, name as per generateToken
        if (!decoded.id || !decoded.userType) {
             return res.status(401).json({ valid: false, message: 'Token payload invalid (missing id or userType)' });
        }

        // Optionally, re-fetch user from DB to ensure they still exist and are active
        // This makes verifyToken more robust but adds a DB call.
        // For simple JWT validation without DB check, the decoded payload is enough.
        // const user = await User.findById(decoded.id).select('-password -googleId');
        // if (!user) {
        //     return res.status(401).json({ valid: false, message: 'User for this token no longer exists' });
        // }

        return res.status(200).json({
            valid: true,
            user: { // Return the decoded payload
                _id: decoded.id,
                name: decoded.name,
                email: decoded.email,
                userType: decoded.userType,
            }
        });
    } catch (error) {
      console.error('AuthService: Token verification (verifyToken endpoint) failed:', error.message);
      // Distinguish between expired token and other failures if needed
      if (error.name === 'TokenExpiredError') {
          return res.status(401).json({ valid: false, message: 'Token expired' });
      }
      return res.status(401).json({ valid: false, message: 'Token invalid or failed verification' });
    }
});

export { signupUser, loginUser, logoutUser, verifyToken };
// backend/auth-service/routes/authRoutes.js
import express from 'express';
import passport from 'passport';
import { signupUser, loginUser, logoutUser, verifyToken } from '../controllers/authController.js';
import generateToken from '../utils/generateToken.js'; // generateToken utility
// import jwt from 'jsonwebtoken'; // Import jwt if you plan to decode cookie for logout in this file

const router = express.Router();

router.post('/signup', signupUser);
router.post('/login', loginUser);

// For logout to clear cache based on email from token, this route might need a light 'protect' middleware
// or decode the token here if it exists.
router.post('/logout', logoutUser); 

// --- Google OAuth Routes ---
router.get(
    '/google',
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        prompt: 'select_account'
    })
);

router.get(
    '/google/callback',
    passport.authenticate('google', {
        failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=google_auth_failed&message=Authentication_with_Google_failed_at_service`,
        failureMessage: true,
        session: false
    }),
    (req, res) => {
        if (!req.user) {
            console.error("AuthService Google OAuth Callback: req.user is undefined after successful authentication.");
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=google_auth_error&message=User_details_not_found_after_Google_auth_at_service`);
        }

        // MODIFIED HERE: Pass the req.user object populated by Passport
        const token = generateToken(req.user); 

        const userForFrontend = {
            _id: req.user._id.toString(),
            name: req.user.name,
            email: req.user.email,
            userType: req.user.userType,
            token: token
        };

        const queryParams = new URLSearchParams(userForFrontend).toString();
        const frontendCallbackUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/google/callback`;
        
        console.log(`AuthService: Redirecting to frontend callback: ${frontendCallbackUrl} with token and user data.`);
        res.redirect(`${frontendCallbackUrl}?${queryParams}`);
    }
);

// Internal token verification endpoint
router.get('/verify', verifyToken);


export default router;
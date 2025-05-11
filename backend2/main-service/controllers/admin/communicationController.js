// import asyncHandler from 'express-async-handler';
//  import User from '../../../auth-service/models/User.js'; // To get user details
// import sendEmail from '../../utils/sendEmail.js';

// // @desc    Admin sends a message (email) to a user
// // @route   POST /api/admin/communication/send-message
// // @access  Private (Admin only)
// const sendMessageToUser = asyncHandler(async (req, res) => {
//   const { userId, subject, messageBody } = req.body;

//   if (!userId || !subject || !messageBody) {
//     res.status(400);
//     throw new Error('User ID, subject, and message body are required.');
//   }

//   const user = await User.findById(userId);
//   if (!user) {
//     res.status(404);
//     throw new Error('User not found.');
//   }
//   if (!user.email) {
//     res.status(400);
//     throw new Error('User does not have an email address on file.');
//   }

//   const emailOptions = {
//     to: user.email,
//     subject: `[AgriConnect Admin] ${subject}`, // Prepend to subject for clarity
//     text: `Dear ${user.name},\n\n${messageBody}\n\nBest regards,\nThe AgriConnect Admin Team`,
//     // Optionally, create a more sophisticated HTML template
//     html: `<p>Dear ${user.name},</p><p>${messageBody.replace(/\n/g, '<br>')}</p><p>Best regards,<br/>The AgriConnect Admin Team</p>`,
//   };

//   try {
//     await sendEmail(emailOptions);
//     res.status(200).json({ success: true, message: `Email successfully sent to ${user.name} (${user.email}).` });
//   } catch (error) {
//     console.error('Failed to send email from controller:', error);
//     // The sendEmail utility already throws an error, but we catch it here to potentially customize the response
//     res.status(500); // Internal Server Error
//     throw new Error(error.message || 'Failed to send email due to a server error.');
//   }
// });

// export { sendMessageToUser };



import asyncHandler from 'express-async-handler';
import sendEmail from '../../utils/sendEmail.js';
import axios from 'axios'; // Ensure axios is installed in main-service: npm install axios

// @desc    Admin sends a message (email) to a user
// @route   POST /admin/communication/send-message
// @access  Private (Admin only)
const sendMessageToUser = asyncHandler(async (req, res) => {
    const { userId, subject, messageBody } = req.body;
    const adminToken = req.cookies.jwt || (req.headers.authorization && req.headers.authorization.startsWith('Bearer') ? req.headers.authorization.split(' ')[1] : null);

    if (!userId || !subject || !messageBody) {
        res.status(400);
        throw new Error('User ID, subject, and message body are required.');
    }

    if (!adminToken) {
        res.status(401);
        throw new Error('Not authorized, no admin token provided for internal call.');
    }
    
    if (!process.env.AUTH_SERVICE_URL) {
        console.error("AUTH_SERVICE_URL not configured in .env for main-service");
        res.status(500);
        throw new Error("Service configuration error: Auth service URL missing.");
    }

    let userFromAuthService;
    try {
        const response = await axios.get(`${process.env.AUTH_SERVICE_URL}/internal/users/${userId}`, {
            headers: {
                'Authorization': `Bearer ${adminToken}`
                // Consider a more robust service-to-service auth key if preferred over user token propagation
            }
        });
        if (response.data && response.data.user) {
            userFromAuthService = response.data.user;
        } else {
            throw new Error('User data not found in auth service response.');
        }
    } catch (error) {
        console.error('Error fetching user details from auth-service:', error.response?.data?.message || error.message);
        if (error.response?.status === 404) {
            res.status(404);
            throw new Error('User not found via auth-service.');
        }
        res.status(error.response?.status || 500);
        throw new Error(error.response?.data?.message || 'Failed to fetch user details from auth-service.');
    }

    if (!userFromAuthService.email) {
        res.status(400);
        throw new Error('User does not have an email address on file.');
    }

    const emailOptions = {
        to: userFromAuthService.email,
        subject: `[AgriConnect Admin] ${subject}`,
        text: `Dear ${userFromAuthService.name},\n\n${messageBody}\n\nBest regards,\nThe AgriConnect Admin Team`,
        html: `<p>Dear ${userFromAuthService.name},</p><p>${messageBody.replace(/\n/g, '<br>')}</p><p>Best regards,<br/>The AgriConnect Admin Team</p>`,
    };

    try {
        await sendEmail(emailOptions);
        res.status(200).json({ success: true, message: `Email successfully sent to ${userFromAuthService.name} (${userFromAuthService.email}).` });
    } catch (error) {
        console.error('Failed to send email from controller:', error);
        res.status(500);
        throw new Error(error.message || 'Failed to send email due to a server error.');
    }
});

export { sendMessageToUser };
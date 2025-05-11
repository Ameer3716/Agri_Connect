// import asyncHandler from 'express-async-handler';
// // import User from '../../models/User.js';
// import User from '../../../auth-service/models/User.js'; 
// import CropPlan from '../../models/farmer/CropPlan.js';
// import ProductListing from '../../models/farmer/ProductListing.js'; // For listing counts

// // @desc    Get all non-admin users for admin view with aggregated data
// // @route   GET /api/admin/users/all
// // @access  Private (Admin only)
// const getAllUsersForAdmin = asyncHandler(async (req, res) => {
//     // Fetch only 'Farmer' and 'Buyer' users, exclude password
//     const users = await User.find({ userType: { $in: ['Farmer', 'Buyer'] } })
//         .select('-password') // Exclude password
//         .sort({ createdAt: -1 }) // Sort by creation date, newest first
//         .lean(); // Use .lean() for plain JS objects, good for performance if not saving back

//     // Aggregate additional data for each user
//     // For better performance on large datasets, consider MongoDB aggregation framework for these counts.
//     // For now, this approach is simpler for fewer users.
//     const usersWithAggregatedData = await Promise.all(users.map(async (user) => {
//         let cropPlansCount = 0;
//         let productListingsCount = 0; // Example: adding product listing count

//         if (user.userType === 'Farmer') {
//             try {
//                 cropPlansCount = await CropPlan.countDocuments({ farmer: user._id });
//                 productListingsCount = await ProductListing.countDocuments({ farmer: user._id, status: 'active' });
//             } catch (countError) {
//                 console.error(`Error counting data for farmer ${user.name} (${user._id}):`, countError);
//             }
//         }
//         return {
//             ...user, // Spread existing user properties
//             userId: user._id, // Ensure userId is present if frontend expects it
//             userName: user.name, // Ensure userName is present
//             cropPlansCount,
//             productListingsCount, // Add new aggregated data
//             // Add other relevant counts like activeTasksCount etc. if needed
//         };
//     }));

//     res.json(usersWithAggregatedData);
// });

// export {
//     getAllUsersForAdmin,
// };






import asyncHandler from 'express-async-handler';
import CropPlan from '../../models/farmer/CropPlan.js';
import ProductListing from '../../models/farmer/ProductListing.js';
import axios from 'axios'; // Ensure axios is installed

// @desc    Get all non-admin users (from auth-service) with aggregated data (from main-service)
// @route   GET /admin/users/all
// @access  Private (Admin only)
const getAllUsersForAdmin = asyncHandler(async (req, res) => {
    const adminToken = req.cookies.jwt || (req.headers.authorization && req.headers.authorization.startsWith('Bearer') ? req.headers.authorization.split(' ')[1] : null);

    if (!adminToken) {
        res.status(401);
        throw new Error('Not authorized, no admin token provided for internal call.');
    }
    if (!process.env.AUTH_SERVICE_URL) {
        console.error("AUTH_SERVICE_URL not configured in .env for main-service");
        res.status(500);
        throw new Error("Service configuration error: Auth service URL missing.");
    }

    let usersFromAuth;
    try {
        // Fetch 'Farmer' and 'Buyer' types. Adjust query param if auth-service expects different.
        const response = await axios.get(`${process.env.AUTH_SERVICE_URL}/internal/users?types=Farmer,Buyer`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        if (response.data && Array.isArray(response.data.users)) {
            usersFromAuth = response.data.users;
        } else {
            throw new Error("User list not found or in unexpected format from auth service response.");
        }
    } catch (error) {
        console.error('Error fetching users from auth-service:', error.response?.data?.message || error.message);
        res.status(error.response?.status || 500);
        throw new Error(error.response?.data?.message || 'Failed to fetch user list from authentication system.');
    }

    if (usersFromAuth.length === 0) {
        return res.json([]);
    }

    const usersWithAggregatedData = await Promise.all(
        usersFromAuth.map(async (user) => {
            let cropPlansCount = 0;
            let productListingsCount = 0;

            if (user.userType === 'Farmer' && user._id) { // Ensure user._id exists
                try {
                    cropPlansCount = await CropPlan.countDocuments({ farmer: user._id });
                    productListingsCount = await ProductListing.countDocuments({ farmer: user._id, status: 'active' });
                } catch (countError) {
                    console.error(`Error counting data for farmer ${user.name} (ID: ${user._id}):`, countError);
                    // Decide if you want to include the user with 0 counts or mark an error
                }
            }
            return {
                userId: user._id,
                userName: user.name,
                email: user.email,
                userType: user.userType,
                createdAt: user.createdAt, // Assuming auth-service provides this
                // Add any other fields from auth-service's user object you want to pass through
                cropPlansCount,
                productListingsCount,
            };
        })
    );

    res.json(usersWithAggregatedData);
});

export {
    getAllUsersForAdmin,
};
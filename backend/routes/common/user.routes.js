const express = require("express");
const router = express.Router();
const userController = require("../../controllers/user.controller");
const authMiddleware = require("../../middleware/authMiddleware");

/**
 * USER ROUTES
 * ----------------------------------------
 * /me        → Get logged-in user profile
 * /all       → Get all users (admin only)
 * /:id       → Get single user
 * 
 * All user routes should be protected using JWT.
 */

const upload = require("../../middleware/upload");

// Get logged-in user's profile
router.get("/me", authMiddleware, userController.getMyProfile);

// Get my team (Manager only)
router.get("/my-team", authMiddleware, userController.getMyTeam);

// Get my team (Manager only)
router.get("/my-team", authMiddleware, userController.getMyTeam);

// Get pending team requests (Manager only)
router.get("/team-requests", authMiddleware, userController.getPendingTeamRequests);
router.put("/team-requests/:userId/approve", authMiddleware, userController.approveTeamMember);
router.put("/team-requests/:userId/reject", authMiddleware, userController.rejectTeamMember);

// Get all users (admin only)
router.get("/all", authMiddleware, userController.getAllUsers);

// Get user avatar (public)
router.get("/:id/avatar", userController.getUserAvatar);

// Get user by ID (protected)
router.get("/:id", authMiddleware, userController.getUserById);

// Update user profile (protected)
// Allow 'avatar' field in multipart/form-data
// Update user profile (protected)
// Allow 'avatar' field in multipart/form-data
router.put("/me", authMiddleware, upload.single('avatar'), userController.updateProfile);

const authController = require("../../controllers/auth.controller");

// Request profile update (User)
router.post("/request-update", authMiddleware, userController.requestProfileUpdate);
router.post("/acknowledge-update", authMiddleware, userController.acknowledgeProfileUpdate);

// Join Team (Employee)
router.put("/join-team", authMiddleware, userController.joinTeam);

// Admin Routes
router.get("/", authMiddleware, userController.getAllUsers);
router.put("/:id/role", authMiddleware, userController.updateUserRole);
router.put("/:id/approve", authMiddleware, authController.approveUser);
router.put("/:id/resolve-update", authMiddleware, userController.resolveProfileUpdate);

module.exports = router;

const express = require("express");
const router = express.Router();
const authController = require("../../controllers/auth.controller");
const { validate, schemas } = require("../../middleware/validate");

/**
 * AUTH ROUTES
 * --------------------------------------
 * Handles user authentication and registration.
 * 
 * Endpoints:
 * - POST /register: Create a new user account
 * - POST /login: Authenticate user and return JWT
 */

/**
 * REGISTER ROUTE
 * --------------------------------------
 * POST /api/auth/register
 * 
 * Validates user input using Joi schema (name, email, password).
 * Calls authController.register to create user in DB.
 */
router.post("/register", validate(schemas.register), authController.register);

/**
 * LOGIN ROUTE
 * --------------------------------------
 * POST /api/auth/login
 * 
 * Validates login credentials (email, password).
 * Calls authController.login to verify user and issue token.
 */
router.post("/login", validate(schemas.login), authController.login);

/**
 * FORGOT PASSWORD ROUTE
 * POST /api/auth/forgot-password
 */
router.post("/forgot-password", validate(schemas.forgotPassword), authController.forgotPassword);

/**
 * RESET PASSWORD ROUTE
 * POST /api/auth/reset-password
 */
router.post("/reset-password", validate(schemas.resetPassword), authController.resetPassword);

/**
 * REFRESH TOKEN ROUTE
 * --------------------------------------
 * POST /api/auth/refresh
 * 
 * Allows clients to obtain a new access token using a refresh token.
 * This prevents users from having to login again every 15 minutes.
 * 
 * Request Body:
 * {
 *   "refreshToken": "jwt_refresh_token_here"
 * }
 * 
 * Response:
 * {
 *   "accessToken": "new_jwt_access_token"
 * }
 */
router.post("/refresh", authController.refresh);

/**
 * LOGOUT ROUTE
 * --------------------------------------
 * POST /api/auth/logout
 * 
 * Invalidates the user's refresh token, effectively logging them out.
 * Requires the user to send their access token in Authorization header.
 * 
 * Headers:
 * Authorization: Bearer <access_token>
 * 
 * Response:
 * {
 *   "message": "Logged out successfully"
 * }
 */
router.post("/logout", authController.logout);

module.exports = router;

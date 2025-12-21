const express = require("express");
const router = express.Router();
const dashboardController = require("../../controllers/dashboard.controller");
const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

/**
 * EMPLOYEE DASHBOARD ROUTES
 * Base URL: /api/emp-dashboard
 */

// Get upcoming deadlines
router.get(
    "/deadlines",
    authMiddleware,
    roleMiddleware("employee", "manager", "admin"),
    dashboardController.getDeadlines
);

module.exports = router;

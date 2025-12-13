const express = require("express");
const router = express.Router();
const managerController = require("../../controllers/manager/manager.controller");
const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

/**
 * MANAGER ROUTES
 * Base URL: /api/manager
 */

// Get Dashboard Stats (Team Pulse, Trends)
router.get(
    "/stats",
    authMiddleware,
    roleMiddleware("manager", "admin"),
    managerController.getDashboardStats
);

// Get Upcoming Check-ins
router.get(
    "/checkins",
    authMiddleware,
    roleMiddleware("manager", "admin"),
    managerController.getUpcomingCheckins
);

// Send Quick Kudos
router.post(
    "/kudos",
    authMiddleware,
    roleMiddleware("manager", "admin"),
    managerController.sendKudos
);

module.exports = router;

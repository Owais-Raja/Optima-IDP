const express = require("express");
const router = express.Router();
const managerController = require("../../controllers/manager.controller");
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

// Get Upcoming Check-ins (Managers see their own, Employees see their Manager's)
router.get(
    "/checkins",
    authMiddleware,
    // Removed roleMiddleware to allow employees to fetch check-ins too
    managerController.getUpcomingCheckins
);

// Create New Check-in
router.post(
    "/checkins",
    authMiddleware,
    roleMiddleware("manager", "admin"),
    managerController.createCheckin
);

// Delete Check-in
router.delete(
    "/checkins/:id",
    authMiddleware,
    roleMiddleware("manager", "admin"),
    managerController.deleteCheckin
);



// Reports
const reportController = require("../../controllers/report.controller");
router.get(
    "/reports/team-weekly",
    authMiddleware,
    roleMiddleware("manager", "admin"),
    reportController.generateTeamWeeklyReport
);

module.exports = router;

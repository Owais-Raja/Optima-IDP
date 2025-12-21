const express = require("express");
const router = express.Router();

const performanceController = require("../../controllers/performance.controller");
const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

/**
 * PERFORMANCE ROUTES
 * -------------------------------------------------
 * /add                → Manager adds a performance review
 * /employee/:id       → Manager/Admin get reports for a specific employee
 * /my-reports         → Employee gets their own performance reports
 * /all                → Admin gets all performance reports
 */

// Manager creates a performance report
router.post(
  "/add",
  authMiddleware,
  roleMiddleware("manager", "admin"),
  performanceController.createReview
);

// Employee sees their own performance reports
router.get(
  "/my-reports",
  authMiddleware,
  roleMiddleware("employee", "manager", "admin"),
  performanceController.getMyReports
);

// Manager/Admin sees performance reports for any employee
router.get(
  "/employee/:id",
  authMiddleware,
  roleMiddleware("manager", "admin"),
  performanceController.getEmployeeReviews
);

// Admin sees all performance reports
router.get(
  "/all",
  authMiddleware,
  roleMiddleware("admin"),
  performanceController.getAllReports
);

// Manager sees reviews they created
router.get(
  "/created-by-me",
  authMiddleware,
  roleMiddleware("manager"),
  performanceController.getReviews
);

// Update review
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("manager", "admin"),
  performanceController.updateReview
);

// Delete review
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("manager", "admin"),
  performanceController.deleteReview
);

module.exports = router;

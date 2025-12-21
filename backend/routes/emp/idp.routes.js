const express = require("express");
const router = express.Router();

const idpController = require("../../controllers/idp.controller");
const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

/**
 * IDP ROUTES
 * ------------------------------------------------------
 * /create                → Employee creates an IDP
 * /my-idps               → Employee sees their IDPs
 * /employee/:id          → Manager/Admin view IDPs of a user
 * /update/:id            → Employee updates their IDP
 * /approve/:id           → Manager approves IDP
 * /all                   → Admin sees all IDPs
 */

// Employee creates their IDP
router.post(
  "/create",
  authMiddleware,
  roleMiddleware("employee", "manager", "admin"),
  idpController.createIDP
);

// Employee sees their own IDPs
router.get(
  "/my-idps",
  authMiddleware,
  roleMiddleware("employee", "manager", "admin"),
  idpController.getMyIDPs
);

// Manager/Admin gets IDP of a specific employee
router.get(
  "/employee/:id",
  authMiddleware,
  roleMiddleware("manager", "admin"),
  idpController.getIDPsByEmployee
);


// Employee updates their own IDP
router.put(
  "/update/:id",
  authMiddleware,
  roleMiddleware("employee", "manager", "admin"),
  idpController.updateIDP
);

// Delete IDP
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("employee", "manager", "admin"),
  idpController.deleteIDP
);

// Toggle Resource Status
router.put(
  "/:id/resource/:resourceId",
  authMiddleware,
  roleMiddleware("employee", "manager", "admin"),
  idpController.toggleResourceStatus
);

// Manager sees all pending IDPs (Team View simulation)
router.get(
  "/pending",
  authMiddleware,
  roleMiddleware("manager", "admin"),
  idpController.getPendingIDPs
);

// Manager approves an IDP
router.put(
  "/approve/:id",
  authMiddleware,
  roleMiddleware("manager", "admin"),
  idpController.approveIDP
);

// Admin gets all IDPs in the system
router.get(
  "/all",
  authMiddleware,
  roleMiddleware("admin"),
  idpController.getAllIDPs
);

// Metrics: Employee Stats
router.get(
  "/metrics/employee",
  authMiddleware,
  roleMiddleware("employee", "manager", "admin"),
  idpController.getEmployeeMetrics
);

// Metrics: Team Stats (Manager)
router.get(
  "/metrics/team",
  authMiddleware,
  roleMiddleware("manager", "admin"),
  idpController.getTeamMetrics
);

// Metrics: System Stats (Admin)
router.get(
  "/metrics/system",
  authMiddleware,
  roleMiddleware("admin"),
  idpController.getSystemStats
);

// Get Single IDP (Must be LAST to avoid shadowing other routes)
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("employee", "manager", "admin"),
  idpController.getIDPById
);

module.exports = router;
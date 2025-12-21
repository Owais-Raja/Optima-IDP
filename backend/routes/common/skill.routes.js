// Role middleware
const roleMiddleware = require("../../middleware/roleMiddleware");
const express = require("express");
const router = express.Router();

const skillController = require("../../controllers/skill.controller");
const authMiddleware = require("../../middleware/authMiddleware");

/**
 * SKILL ROUTES
 * ----------------------------------------
 * /add        → Add new skill (admin only)
 * /all        → Get all skills
 * /:id        → Get single skill
 * /update/:id → Update skill (admin only)
 * /delete/:id → Delete skill (admin only)
 */

// Add a new skill (admin or manager)
router.post("/add", authMiddleware, roleMiddleware("admin", "manager"), skillController.addSkill);

// Get all skills
router.get("/all", authMiddleware, skillController.getAllSkills);

// Get a single skill by ID
router.get("/:id", authMiddleware, skillController.getSkillById);

// Update a skill (admin or manager)
router.put("/update/:id", authMiddleware, roleMiddleware("admin", "manager"), skillController.updateSkill);

// Delete a skill (admin or manager)
router.delete("/delete/:id", authMiddleware, roleMiddleware("admin", "manager"), skillController.deleteSkill);

// Bulk add skills (admin or manager)
router.post("/bulk-add", authMiddleware, roleMiddleware("admin", "manager"), skillController.bulkAddSkills);


module.exports = router;

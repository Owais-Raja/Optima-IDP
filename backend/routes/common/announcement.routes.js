const express = require("express");
const router = express.Router();
const announcementController = require("../../controllers/common/announcement.controller");
const authMiddleware = require("../../middleware/authMiddleware");

const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

// All announcement routes require authentication
router.use(authMiddleware);

// Get announcements (all users - filtered by role in controller)
router.get("/", announcementController.getAnnouncements);

// Create announcement (Admin/Manager)
router.post("/", upload.single('attachment'), announcementController.createAnnouncement);

// Mark announcement as viewed (all users)
router.post("/:id/view", announcementController.markAsViewed);

// Delete announcement (Admin/Manager - logic in controller)
router.delete("/:id", announcementController.deleteAnnouncement);

module.exports = router;

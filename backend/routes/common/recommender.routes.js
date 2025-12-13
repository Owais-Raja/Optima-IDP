const express = require("express");
const router = express.Router();
const controller = require("../../controllers/common/recommender.controller");
const authMiddleware = require("../../middleware/authMiddleware");

// POST /api/recommender/suggestions
// Protected route to get AI recommendations
router.post("/suggestions", authMiddleware, controller.getSuggestions);


module.exports = router;

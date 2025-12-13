const express = require("express");
const router = express.Router();
const recommendController = require("../../controllers/common/recommend.controller");
const recommenderController = require("../../controllers/common/recommender.controller");
const authMiddleware = require("../../middleware/authMiddleware");

/**
 * RECOMMENDATION ROUTES
 * ----------------------------------------------------
 * Base URL: /api/recommend
 */

// Recommended resources
/**
 * @swagger
 * tags:
 *   name: Recommendations
 *   description: AI-powered recommendation endpoints
 */

/**
 * @swagger
 * /api/recommend/resources:
 *   post:
 *     summary: Get personalized resource recommendations
 *     tags: [Recommendations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_skills:
 *                 type: array
 *                 items:
 *                   type: object
 *               resources:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: List of recommended resources
 *       500:
 *         description: Server error
 */
// Use the robust recommender controller that fetches system data
router.post("/resources", authMiddleware, recommenderController.getSuggestions);

/**
 * @swagger
 * /api/recommend/similar-skills:
 *   post:
 *     summary: Find similar skills
 *     tags: [Recommendations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               skill_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: List of similar skills
 */
router.post("/similar-skills", authMiddleware, recommendController.recommendSimilarSkills);

module.exports = router;

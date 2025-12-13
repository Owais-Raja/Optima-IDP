const Resource = require("../../models/resource");
const cacheService = require("../../services/cache.service");

/**
 * RESOURCE CONTROLLER
 * ----------------------------------------------------
 * Manages all operations related to learning resources.
 * 
 * Capabilities:
 * - Add new resources (Admin)
 * - Bulk import resources (Admin)
 * - Retrieve all resources (with Caching)
 * - Filter resources by skill
 * - Update/Delete resources (Admin)
 */


/**
 * ADD SINGLE RESOURCE (Admin only)
 * ----------------------------------------------------
 * POST /api/resource/add
 * 
 * Creates a new learning resource in the database.
 * Invalidates the "all_resources" cache to ensure freshness.
 */
exports.addResource = async (req, res) => {
  try {
    // Check admin permission
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied: Admin only" });
    }

    const { title, type, url, skill, provider, difficulty, description, duration } = req.body;

    const resource = await Resource.create({
      title,
      type,
      url,
      skill,
      provider,
      difficulty,
      description,
      duration
    });

    // Invalidate cache since data changed
    await cacheService.del("all_resources");

    res.status(201).json({ message: "Resource added successfully", resource });

  } catch (error) {
    console.error("Add Resource Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


/**
 * BULK ADD RESOURCES (Admin only)
 * ----------------------------------------------------
 * POST /api/resource/bulk-add
 * 
 * Efficiently inserts multiple resources at once.
 * Invalidates the "all_resources" cache.
 */
exports.bulkAddResources = async (req, res) => {
  try {
    // Admin check
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied: Admin only" });
    }

    const resources = req.body; // expecting an array

    if (!Array.isArray(resources)) {
      return res.status(400).json({ message: "Expected an array of resources" });
    }

    // Insert all resources at once
    const inserted = await Resource.insertMany(resources);

    // Invalidate cache
    await cacheService.del("all_resources");

    res.status(201).json({
      message: "Resources added successfully",
      addedCount: inserted.length,
      resources: inserted
    });

  } catch (error) {
    console.error("Bulk Add Resources Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


/**
 * GET ALL RESOURCES
 * ----------------------------------------------------
 * GET /api/resource/all
 * 
 * Retrieves all resources from the database.
 * Implements Redis caching:
 * 1. Checks cache for "all_resources" key.
 * 2. If found, returns cached data (fast).
 * 3. If not found, queries DB, saves to cache (1 hour), and returns data.
 */
exports.getAllResources = async (req, res) => {
  try {
    const cacheKey = "all_resources";

    // 1. Check Redis Cache
    const cachedResources = await cacheService.get(cacheKey);
    if (cachedResources) {
      return res.json({ resources: cachedResources, source: "cache" });
    }

    // 2. Fetch from Database (if not in cache)
    const resources = await Resource.find().populate("skill"); // include full skill data

    // 3. Save to Redis Cache
    await cacheService.set(cacheKey, resources);

    res.json({ resources, source: "database" });

  } catch (error) {
    console.error("Get All Resources Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


/**
 * GET RESOURCES BY SKILL ID
 * /api/resource/skill/:skillId
 */
exports.getResourcesBySkill = async (req, res) => {
  try {
    const { skillId } = req.params;

    const resources = await Resource.find({ skill: skillId });

    res.json({ resources });

  } catch (error) {
    console.error("Get Resources By Skill Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


/**
 * UPDATE RESOURCE (Admin only)
 * /api/resource/update/:id
 */
exports.updateResource = async (req, res) => {
  try {
    // Admin check
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied: Admin only" });
    }

    const updates = req.body;

    const resource = await Resource.findByIdAndUpdate(req.params.id, updates, { new: true });

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    res.json({ message: "Resource updated successfully", resource });

  } catch (error) {
    console.error("Update Resource Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


/**
 * DELETE RESOURCE (Admin only)
 * /api/resource/delete/:id
 */
exports.deleteResource = async (req, res) => {
  try {
    // Admin check
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied: Admin only" });
    }

    const resource = await Resource.findByIdAndDelete(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    res.json({ message: "Resource deleted successfully" });

  } catch (error) {
    console.error("Delete Resource Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

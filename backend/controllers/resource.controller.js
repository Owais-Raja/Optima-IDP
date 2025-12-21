const Resource = require("../models/resource");
const User = require("../models/user");
const cacheService = require("../services/cache.service");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

// Helper to manually stream file to GridFS
const uploadToGridFS = (filePath, originalName, mimetype) => {
  return new Promise((resolve, reject) => {
    const conn = mongoose.connection;
    const gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
      bucketName: "uploads"
    });

    const uniqueFilename = `${Date.now()}-${originalName}`;
    const readStream = fs.createReadStream(filePath);
    const writeStream = gridfsBucket.openUploadStream(uniqueFilename, {
      metadata: { originalname: originalName, mimetype: mimetype },
      contentType: mimetype
    });

    readStream.pipe(writeStream)
      .on("error", (error) => {
        reject(error);
      })
      .on("finish", () => {
        resolve(uniqueFilename);
      });
  });
};


/**
 * RESOURCE CONTROLLER
 * ----------------------------------------------------
 * Manages all operations related to learning resources.
 * 
 * Capabilities:
 * - Add new resources (Admin & Manager)
 * - Bulk import resources (Admin)
 * - Retrieve resources (Filtered by role/visibility)
 * - Filter resources by skill
 * - Update/Delete resources (Admin & Manager for their own)
 */


/**
 * ADD SINGLE RESOURCE
 * ----------------------------------------------------
 * POST /api/resource/add
 * 
 * Creates a new learning resource.
 * - Admin: Created locally, default visibility 'public' (can be overridden if we add that field later, assuming public for now)
 * - Manager: Created locally, default visibility 'team'
 */
exports.addResource = async (req, res) => {
  let uploadedFilePath = null;
  try {
    // Permission check: Admin or Manager
    if (!["admin", "manager"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied: Admin or Manager only" });
    }

    const { title, type, skill, provider, difficulty, description, duration, targetLevel } = req.body;

    console.log("Add Resource Headers:", req.headers['content-type']);
    // console.log("Add Resource Body:", req.body); // can be verbose with binary
    console.log("Add Resource File:", req.file);

    let url = req.body.url;

    // Handle File Upload (Manual Streaming to GridFS)
    if (req.file) {
      uploadedFilePath = req.file.path;
      const filename = await uploadToGridFS(req.file.path, req.file.originalname, req.file.mimetype);
      url = `${req.protocol}://${req.get('host')}/api/files/${filename}`;
    }

    if (!url) {
      return res.status(400).json({ message: "Resource URL or File is required" });
    }

    // Determine details based on role
    const createdBy = req.user.id;
    const visibility = req.user.role === "admin" ? "public" : "team";

    const resource = await Resource.create({
      title,
      type,
      url,
      skill,
      provider,
      difficulty,
      description,
      duration,
      targetLevel: targetLevel || 1, // Default to 1 if not provided
      createdBy,
      visibility
    });

    // Invalidate cache (simple approach: clear all for now, or we could leave it if we remove caching from get)
    await cacheService.del("all_resources");

    res.status(201).json({ message: "Resource added successfully", resource });

  } catch (error) {
    console.error("Add Resource Error:", error);
    res.status(500).json({ message: error.message, stack: error.stack });
  } finally {
    // Cleanup temp file
    if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
      fs.unlinkSync(uploadedFilePath);
    }
  }
};


/**
 * BULK ADD RESOURCES (Admin only)
 * ----------------------------------------------------
 * POST /api/resource/bulk-add
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

    // Prepare resources with default fields
    const resourcesWithMeta = resources.map(r => ({
      ...r,
      createdBy: req.user.id,
      visibility: "public"
    }));

    // Insert all resources at once
    const inserted = await Resource.insertMany(resourcesWithMeta);

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
 * Retrieves resources based on user role and visibility.
 * - Admin: See ALL
 * - Manager: See Public + Own Created
 * - Employee: See Public + Created by their Manager
 */
exports.getAllResources = async (req, res) => {
  try {
    const userId = req.user.id;
    // Fetch full user to get role and manager info
    const currentUser = await User.findById(userId);

    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    let query = {};

    if (currentUser.role === "admin") {
      // Admin sees everything
      query = {};
    } else if (currentUser.role === "manager") {
      // Manager sees Public + Own Team resources
      query = {
        $or: [
          { visibility: "public" },
          { createdBy: userId }
        ]
      };
    } else {
      // Employee sees Public + Their Manager's resources
      // Check if employee has a manager
      if (currentUser.manager) {
        query = {
          $or: [
            { visibility: "public" },
            { createdBy: currentUser.manager }
          ]
        };
      } else {
        // No manager assigned? access public only
        query = { visibility: "public" };
      }
    }

    // NOTE: Caching is removed here because the result is now highly personalized.
    // In a production app, we would cache "public" resources separately and merge.

    const resources = await Resource.find(query).populate("skill").sort({ createdAt: -1 });

    res.json({ resources, source: "database" });

  } catch (error) {
    console.error("Get All Resources Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


/**
 * GET RESOURCES BY SKILL ID
 * /api/resource/skill/:skillId
 * NOTE: This also needs to apply visibility filters similar to getAllResources
 */
exports.getResourcesBySkill = async (req, res) => {
  try {
    const { skillId } = req.params;
    const userId = req.user.id;
    const currentUser = await User.findById(userId);

    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    let query = { skill: skillId };

    // Apply visibility filter logic
    if (currentUser.role === "admin") {
      // No extra filter
    } else if (currentUser.role === "manager") {
      query.$or = [
        { visibility: "public" },
        { createdBy: userId }
      ];
    } else {
      if (currentUser.manager) {
        query.$or = [
          { visibility: "public" },
          { createdBy: currentUser.manager }
        ];
      } else {
        query.visibility = "public";
      }
    }

    const resources = await Resource.find(query);

    res.json({ resources });

  } catch (error) {
    console.error("Get Resources By Skill Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


/**
 * UPDATE RESOURCE (Admin & Manager)
 * /api/resource/update/:id
 */
exports.updateResource = async (req, res) => {
  try {
    const resourceId = req.params.id;
    const updates = req.body;

    // Find resource first to check ownership
    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    // Permission Check
    // Admin can update anything.
    // Manager can update ONLY their own resources.
    let canUpdate = false;
    if (req.user.role === "admin") {
      canUpdate = true;
    } else if (req.user.role === "manager") {
      // Check if manager owns this resource
      if (resource.createdBy.toString() === req.user.id) {
        canUpdate = true;
      }
    }

    if (!canUpdate) {
      return res.status(403).json({ message: "Access denied: You can only edit resources you created." });
    }

    // Handle File Upload during update
    if (req.file) {
      updates.url = `${req.protocol}://${req.get('host')}/api/files/${req.file.filename}`;
    }

    const updatedResource = await Resource.findByIdAndUpdate(resourceId, updates, { new: true });

    // Invalidate cache if public
    await cacheService.del("all_resources");

    res.json({ message: "Resource updated successfully", resource: updatedResource });

  } catch (error) {
    console.error("Update Resource Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


/**
 * DELETE RESOURCE (Admin & Manager)
 * /api/resource/delete/:id
 */
exports.deleteResource = async (req, res) => {
  try {
    const resourceId = req.params.id;

    // Find resource first
    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    // Permission Check
    let canDelete = false;
    if (req.user.role === "admin") {
      canDelete = true;
    } else if (req.user.role === "manager") {
      if (resource.createdBy.toString() === req.user.id) {
        canDelete = true;
      }
    }

    if (!canDelete) {
      return res.status(403).json({ message: "Access denied: You can only delete resources you created." });
    }

    await Resource.findByIdAndDelete(resourceId);

    // Invalidate cache
    await cacheService.del("all_resources");

    res.json({ message: "Resource deleted successfully" });

  } catch (error) {
    console.error("Delete Resource Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

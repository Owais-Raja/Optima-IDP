const Skill = require("../models/skill");
const cacheService = require("../services/cache.service");

/**
 * SKILL CONTROLLER
 * ----------------------------------------------------
 * Manages all operations related to skills.
 * 
 * Capabilities:
 * - Add new skills (Admin/Manager - Scoped to Company)
 * - Retrieve all skills (Scoped to Company)
 * - Retrieve skill by ID
 * - Update/Delete skills (Admin/Manager - Scoped to Company)
 */


/**
 * ADD A NEW SKILL (Admin or Manager)
 * ----------------------------------------------------
 * POST /api/skill/add
 * 
 * Creates a new skill in the database scoped to the user's company.
 * Invalidates "all_skills_{company}" cache.
 */
exports.addSkill = async (req, res) => {
  try {
    // Role check is handled by middleware, but we double check scope if needed
    // Assuming middleware ensures req.user is populated

    const { name, category, description } = req.body;
    const company = req.user.company;

    if (!company) {
      return res.status(400).json({ message: "User does not belong to a company" });
    }

    // Check if skill already exists IN THIS COMPANY
    const existing = await Skill.findOne({ name, company });
    if (existing) {
      return res.status(400).json({ message: "Skill already exists in your company" });
    }

    const skill = await Skill.create({
      name,
      category,
      description,
      company,
      createdBy: req.user.id
    });

    // Invalidate company-specific cache
    await cacheService.del(`all_skills_${company}`);

    res.status(201).json({ message: "Skill added successfully", skill });

  } catch (error) {
    console.error("Add Skill Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


/**
 * GET ALL SKILLS (Scoped to Company)
 * ----------------------------------------------------
 * GET /api/skill/all
 * 
 * Retrieves all skills for the user's company.
 */
exports.getAllSkills = async (req, res) => {
  try {
    const company = req.user.company;
    if (!company) {
      return res.status(400).json({ message: "User company not found" });
    }

    const cacheKey = `all_skills_${company}`;

    // 1. Check Redis Cache
    const cachedSkills = await cacheService.get(cacheKey);
    if (cachedSkills) {
      return res.json({ skills: cachedSkills, source: "cache" });
    }

    // 2. Fetch from Database (Filter by Company)
    const skills = await Skill.find({ company }).sort({ name: 1 });

    // 3. Save to Redis Cache
    await cacheService.set(cacheKey, skills);

    res.json({ skills, source: "database" });

  } catch (error) {
    console.error("Get All Skills Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


/**
 * GET SKILL BY ID
 * /api/skill/:id
 */
exports.getSkillById = async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({ message: "Skill not found" });
    }

    // Verify company scope access
    if (skill.company && skill.company !== req.user.company) {
      return res.status(403).json({ message: "Access denied: Skill belongs to another organization" });
    }

    res.json({ skill });

  } catch (error) {
    console.error("Get Skill Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


/**
 * UPDATE SKILL (Admin or Manager)
 * /api/skill/update/:id
 */
exports.updateSkill = async (req, res) => {
  try {
    const { name, category, description } = req.body;
    const skillId = req.params.id;

    // First find the skill to check ownership/company
    const existingSkill = await Skill.findById(skillId);
    if (!existingSkill) {
      return res.status(404).json({ message: "Skill not found" });
    }

    // Check company scope
    if (existingSkill.company !== req.user.company) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Permission Scope: Admin matches all. Manager matches own.
    if (req.user.role === 'manager' && existingSkill.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied: You can only edit skills you created." });
    }

    // Update
    const skill = await Skill.findByIdAndUpdate(
      skillId,
      { name, category, description },
      { new: true }
    );

    // Invalidate cache
    await cacheService.del(`all_skills_${req.user.company}`);

    res.json({ message: "Skill updated successfully", skill });

  } catch (error) {
    console.error("Update Skill Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


/**
 * BULK ADD SKILLS (Admin or Manager)
 * /api/skill/bulk-add
 */
exports.bulkAddSkills = async (req, res) => {
  try {
    const skills = req.body; // expecting an array
    const company = req.user.company;

    if (!Array.isArray(skills)) {
      return res.status(400).json({ message: "Expected an array of skills" });
    }

    // Prepare skills with company and createdBy
    const skillsToInsert = skills.map(s => ({
      ...s,
      company: company,
      createdBy: req.user.id
    }));

    // Optional: prevent duplicates by checking existing names IN THIS COMPANY
    const names = skills.map((s) => s.name);
    const existing = await Skill.find({
      name: { $in: names },
      company: company
    });

    if (existing.length > 0) {
      return res.status(400).json({
        message: "Some skills already exist in your company",
        existingSkills: existing.map((s) => s.name)
      });
    }

    // Insert all skills at once
    const inserted = await Skill.insertMany(skillsToInsert);

    // Invalidate cache
    await cacheService.del(`all_skills_${company}`);

    res.status(201).json({
      message: "Skills added successfully",
      addedCount: inserted.length,
      skills: inserted
    });

  } catch (error) {
    console.error("Bulk Add Skills Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


/**
 * DELETE SKILL (Admin or Manager)
 * /api/skill/delete/:id
 */
exports.deleteSkill = async (req, res) => {
  try {
    const skillId = req.params.id;

    // First find to check company
    const skill = await Skill.findById(skillId);
    if (!skill) {
      return res.status(404).json({ message: "Skill not found" });
    }

    if (skill.company !== req.user.company) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Permission Scope: Admin matches all. Manager matches own.
    if (req.user.role === 'manager' && skill.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied: You can only delete skills you created." });
    }

    await Skill.findByIdAndDelete(skillId);

    // Invalidate cache
    await cacheService.del(`all_skills_${req.user.company}`);

    res.json({ message: "Skill deleted successfully" });

  } catch (error) {
    console.error("Delete Skill Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

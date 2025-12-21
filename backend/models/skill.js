const mongoose = require("mongoose");

/**
 * Skill Schema
 * ----------------------------------------
 * Stores individual skills such as:
 * - "JavaScript"
 * - "React"
 * - "Communication"
 * - "Leadership"
 * 
 * Each skill has:
 * - name: Unique name of the skill
 * - category: "Technical", "Soft Skill", "Management", etc.
 * - description: Optional info about the skill
 * - company: The company this skill belongs to (for multi-tenancy)
 * - createdBy: The user who created the skill
 */

const SkillSchema = new mongoose.Schema(
  {
    // Unique skill name (e.g., “JavaScript”, “Time Management”)
    name: {
      type: String,
      required: true,
      trim: true
    },

    // Category of skill (Technical / Soft Skill / Leadership etc.)
    category: {
      type: String,
      required: true
    },

    // Short description of the skill (optional)
    description: {
      type: String,
      default: ""
    },

    // Company scope - required for multi-tenancy
    company: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },

    // Creator tracking
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },

  // Adds createdAt and updatedAt timestamps automatically
  { timestamps: true }
);

// Compound index to ensure skill names are unique PER COMPANY
SkillSchema.index({ name: 1, company: 1 }, { unique: true });

module.exports = mongoose.models.Skill || mongoose.model("Skill", SkillSchema);

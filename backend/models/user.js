const mongoose = require("mongoose");

/**
 * User Schema
 * ----------------------------------------
 * Core entity for the application. Stores all user types:
 * - Employee: Standard user with IDP and Performance plans.
 * - Manager: Manages a team of employees.
 * - Admin: System administrator with full access.
 * 
 * Capability Highlights:
 * - Role-based access control (RBAC) via 'role' field.
 * - Multi-tenancy support via 'company' field.
 * - Security features: hashed passwords, refresh tokens, MFA support, login history.
 * - Skill Matrix: embedded 'skills' array with level tracking (1-10).
 */

const UserSchema = new mongoose.Schema(
  {
    // Full Name (Display Name)
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Email Address (Login Credentials)
    email: {
      type: String,
      required: true,
      unique: true,   // Ensures global uniqueness
      lowercase: true,
      trim: true
    },

    // Organization / Tenant Identifier
    company: {
      type: String,
      required: true,
      trim: true
    },

    // Encrypted Password (bcrypt hash)
    password: {
      type: String,
      required: true,
    },

    // Role-Based Access Control
    role: {
      type: String,
      enum: ["employee", "manager", "admin"],
      default: "employee",
    },

    // Profile Image (Stored as Buffer/Binary or URL in future)
    avatar: {
      data: Buffer,
      contentType: String
    },

    // User Customization & Preferences
    preferences: {
      emailNotifications: { type: Boolean, default: true },
      darkMode: { type: Boolean, default: true },
      twoFactorEnabled: { type: Boolean, default: false },
      weeklyReports: { type: Boolean, default: true },
      systemBranding: { type: Boolean, default: true }
    },

    /**
     * Skills Matrix
     * Tracks the user's proficiency in various technical and soft skills.
     * Used for:
     * - Gap analysis (Current vs Required Level)
     * - AI Recommendations
     * - Manager reporting
     */
    skills: [
      {
        skillId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Skill", // References the centralized Skill catalog
        },
        level: {
          type: Number,
          min: 1,
          max: 10,
          default: 1, // 1 = Novice, 10 = Expert
        }
      }
    ],

    // Session Management: JWT Refresh Token
    refreshToken: {
      type: String,
      default: null,
    },

    // Password Reset Token & Expiry
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },

    // Account Verification Status
    isVerified: {
      type: Boolean,
      default: true // Default true for internal tools; can be false for public registration
    },

    // Audit: Last Successful Login
    lastLogin: {
      type: Date,
      default: null
    },

    /**
     * Company-Wide Settings (Active only on Admin users)
     * Stores configuration for the entire tenant/company.
     */
    companySettings: {
      inactiveLockoutDays: { type: Number, default: 90 },
      enforcePasswordPolicy: { type: Boolean, default: true },
      // AI Recommendation Weights
      aiWeights: {
        skill_gap: { type: Number, default: 0.35 },
        skill_relevance: { type: Number, default: 0.25 },
        difficulty_match: { type: Number, default: 0.20 },
        collaborative: { type: Number, default: 0.20 },
        resource_type: { type: Number, default: 0.00 },
        skill_similarity: { type: Number, default: 0.00 }
      },
      weeklyManagerReports: { type: Boolean, default: true },
      notifyManagerOnNewIDP: { type: Boolean, default: true },
      defaultTargetLevel: { type: Number, default: 5, min: 1, max: 10 },
      timezone: { type: String, default: 'UTC' }
    },

    // Profile Update Request (Approval Workflow for limited fields)
    profileUpdateRequest: {
      field: { type: String, enum: ['name'], default: null },
      value: { type: String, default: null },
      status: { type: String, enum: ['pending', 'approved', 'rejected'], default: null },
      requestedAt: { type: Date, default: null }
    },

    // API Keys (For Admin programmatic access)
    apiKeys: [
      {
        keyHash: { type: String, required: true },
        label: { type: String, required: true, maxlength: 50 },
        lastUsed: { type: Date, default: null },
        createdAt: { type: Date, default: Date.now }
      }
    ],

    // Active User Sessions
    sessions: [
      {
        token: { type: String, required: true },
        ip: { type: String, default: null },
        userAgent: { type: String, default: null },
        createdAt: { type: Date, default: Date.now },
        expiresAt: { type: Date, required: true },
        isRevoked: { type: Boolean, default: false }
      }
    ],

    // Login History Log
    loginHistory: [
      {
        ip: { type: String, default: null },
        userAgent: { type: String, default: null },
        timestamp: { type: Date, default: Date.now },
        success: { type: Boolean, required: true },
        failureReason: { type: String, default: null }
      }
    ],

    // Multi-Factor Authentication
    mfaEnabled: { type: Boolean, default: false },
    mfaSecret: { type: String, default: null },

    // Hierarchy: Manager Assignment
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    }
  },

  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
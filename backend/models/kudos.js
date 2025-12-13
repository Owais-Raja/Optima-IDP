const mongoose = require("mongoose");

/**
 * Kudos Schema
 * ----------------------------------------
 * Stores recognition/praise sent between users.
 * Used for "Quick Kudos" feature in Manager Dashboard.
 */
const KudosSchema = new mongoose.Schema(
    {
        from: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        to: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        type: {
            type: String,
            enum: ["High Impact", "Fast Learner", "Team Player", "Innovation", "Leadership"],
            required: true
        },
        message: {
            type: String,
            default: ""
        },
        date: {
            type: Date,
            default: Date.now
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Kudos", KudosSchema);

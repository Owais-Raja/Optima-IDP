const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    resource: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Resource",
        required: true
    },
    action: {
        type: String,
        enum: ["view", "click", "dismiss", "like", "dislike"],
        required: true
    },
    // Optional: Capture the specific algorithm logic or session ID if dealing with A/B testing later
    meta: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, { timestamps: true });

// Compound index to quickly find user's interaction with a specific resource
FeedbackSchema.index({ user: 1, resource: 1 });

module.exports = mongoose.model("Feedback", FeedbackSchema);

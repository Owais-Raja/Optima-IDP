const mongoose = require('mongoose');

/**
 * CheckIn Schema
 * ----------------------------------------
 * Represents scheduled meetings, reviews, or sync-ups between Managers and their teams.
 * 
 * Key Features:
 * - Event Scheduling: Tracks date, time, and type of interaction.
 * - Team Visibility: Check-ins created by a manager are visible to their direct reports.
 * - Auditing: Tracks creation time for historical records.
 */

const checkInSchema = new mongoose.Schema({
    // Event Title (e.g., "Sprint Planning", "Q2 Review")
    title: {
        type: String,
        required: true,
        trim: true
    },

    // Event Category / Type
    // Used for filtering and UI icons/badges
    type: {
        type: String,
        enum: ['Weekly Sync', 'Performance Review', 'Project Kickoff', 'One-on-One', 'General'],
        default: 'General'
    },

    // Scheduled Date & Time
    date: {
        type: Date,
        required: true
    },

    // Manager / Organizer
    // The user who created this check-in. Usually a Manager or Admin.
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Attendee (Team Member)
    // If set, this event is specific to this user (e.g. 1:1, Performance Review)
    // If null, it is visible to the entire team.
    attendee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },

    // Optional Details / Agenda
    description: {
        type: String,
        trim: true
    },

    // Metadata: Record Creation Timestamp
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('CheckIn', checkInSchema);

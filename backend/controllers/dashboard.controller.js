const IDP = require("../models/idp");
const PerformanceReport = require("../models/PerformanceReport");
const Assignment = require("../models/Assignment");

/**
 * Get Employee Deadlines
 * Aggregates deadlines from:
 * - IDP Target Dates
 * - (Future) Performance Review Due Dates
 */
exports.getDeadlines = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Get Active IDP Deadlines
        const idps = await IDP.find({
            employee: userId,
            status: { $in: ["approved", "processing", "pending"] },
            targetCompletionDate: { $ne: null }
        }).select("goals targetCompletionDate status");

        const idpDeadlines = idps.map(idp => ({
            id: idp._id,
            title: idp.goals || "Development Plan Goal",
            date: idp.targetCompletionDate,
            type: "normal", // could calculate urgency based on date proximity
            source: "IDP"
        }));

        // 2. Mock Performance Deadlines (since we don't have a specific due date field yet)
        // In a real scenario, we might query a "ReviewCycle" model.
        const performanceDeadlines = [];
        // Example: Check if it's end of quarter and user hasn't completed self-review (if that feature existed)

        // 3. Get Assignments (Mandatory Training)
        const assignments = await Assignment.find({
            assignedTo: userId,
            status: 'pending'
        }).select("title dueDate priority");

        const assignmentDeadlines = assignments.map(a => ({
            id: a._id,
            title: a.title,
            date: a.dueDate,
            type: a.priority === 'urgent' ? 'urgent' : 'normal',
            source: 'Assignment'
        }));

        const allDeadlines = [...idpDeadlines, ...performanceDeadlines, ...assignmentDeadlines].sort((a, b) => new Date(a.date) - new Date(b.date));

        res.json({ deadlines: allDeadlines });

    } catch (error) {
        console.error("Get Deadlines Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

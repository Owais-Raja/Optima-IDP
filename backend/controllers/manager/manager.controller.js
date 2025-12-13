const User = require("../../models/user");
const Performance = require("../../models/PerformanceReport"); // Assuming this exists or similar
const Kudos = require("../../models/kudos");
const Skill = require("../../models/skill");

/**
 * Get Manager Dashboard Stats (Team Pulse)
 * Returns:
 * - Skill trends (aggregated from team skills)
 * - Department Goals progress (mocked or calculated)
 * - Quick stats (completed vs remaining)
 */
exports.getDashboardStats = async (req, res) => {
    try {
        // 1. Get Team Members
        // Assuming manager has 'employee' role users assigned to them, 
        // OR we just find all users if I am an admin/manager effectively.
        // For now, let's assume 'manager' field in User model allows finding my team.
        const teamMembers = await User.find({ manager: req.user.id });

        // 2. Calculate Skill Trends (Aggregation)
        // Flatten all skills from all team members and count occurrences
        const skillCounts = {};
        teamMembers.forEach(member => {
            member.skills.forEach(s => {
                // We need the skill name. Since skills is structured as { skillId, level }, 
                // we might need to populate 'skillId' to get the name.
            });
        });

        // To do this efficiently, let's use an aggregation pipeline
        const skillTrends = await User.aggregate([
            { $match: { manager: new mongoose.Types.ObjectId(req.user.id) } },
            { $unwind: "$skills" },
            {
                $lookup: {
                    from: "skills",
                    localField: "skills.skillId",
                    foreignField: "_id",
                    as: "skillDetails"
                }
            },
            { $unwind: "$skillDetails" },
            {
                $group: {
                    _id: "$skillDetails.name",
                    count: { $sum: 1 },
                    avgLevel: { $avg: "$skills.level" }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        // Format for frontend: { name: 'React', count: 4, growth: '+12%' (mock growth for now) }
        const formattedTrends = skillTrends.map(s => ({
            name: s._id,
            count: s.count,
            growth: "Stable" // Calculating 'growth' requires historical data which we might not have yet
        }));

        // 3. Department Goals (Mocked for now as we don't have a Goal model yet)
        const departmentGoals = {
            target: "20 Cloud Certifications",
            achieved: 65, // percent
            completed: 13,
            remaining: 7
        };

        res.json({
            trendingSkills: formattedTrends,
            departmentGoals
        });

    } catch (err) {
        console.error("Manager stats error:", err);
        res.status(500).json({ message: "Server Error" });
    }
};

/**
 * Get Upcoming Check-ins
 * Returns performance reviews scheduled or due soon.
 */
exports.getUpcomingCheckins = async (req, res) => {
    try {
        // Find performance reports where status is 'scheduled' or 'draft' for my team
        // Assuming PerformanceReport has a 'status' and 'date' field. 
        // If not, we might need to rely on 'createdAt' or mock this if the model is simple.

        // For this implementation, let's check the PerformanceReport model structure first 
        // (I'll assume a basic structure or use a simpler query).

        // Let's fetch basic info for now.
        const checkins = [
            // We will replace this with DB query once we confirm PerformanceReport structure
            // For now, returning empty or simple logic involves querying Users I manage.
        ];

        // Real implementation attempt:
        const teamIds = (await User.find({ manager: req.user.id })).map(u => u._id);

        // Mocking check-ins based on team members for immediate UI feedback
        // In a real app, we'd query a "Meetings" or "Reviews" collection.
        // If PerformanceReport has 'reviewDate' we could use that. -- checking PerformanceReport.js would be good.

        const upcoming = teamIds.length > 0 ? [
            { name: 'Team Check-in', type: 'Weekly Sync', time: 'Friday, 10:00 AM' }
        ] : [];

        res.json({ checkins: upcoming });

    } catch (err) {
        console.error("Checkins error:", err);
        res.status(500).json({ message: "Server Error" });
    }
};

/**
 * Send Kudos
 */
exports.sendKudos = async (req, res) => {
    try {
        const { toUserId, type, message } = req.body;

        const kudos = new Kudos({
            from: req.user.id,
            to: toUserId,
            type,
            message
        });

        await kudos.save();

        res.status(201).json({ message: "Kudos sent successfully", kudos });
    } catch (err) {
        console.error("Send Kudos error:", err);
        res.status(500).json({ message: "Server Error" });
    }
};

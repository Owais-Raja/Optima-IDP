const mongoose = require("mongoose");
const User = require("../models/user");
const Performance = require("../models/PerformanceReport"); // Assuming this exists or similar
const Skill = require("../models/skill");

const IDP = require("../models/idp"); // Added IDP model import

/**
 * Get Manager Dashboard Stats (Team Pulse)
 * Returns:
 * - Skill trends (aggregated from team skills)
 * - Department Goals progress (real data from IDPs)
 * - Quick stats (completed vs remaining)
 */
exports.getDashboardStats = async (req, res) => {
    try {
        // 1. Get Team Members
        // Assuming manager has 'employee' role users assigned to them, 
        // OR we just find all users if I am an admin/manager effectively.
        // For now, let's assume 'manager' field in User model allows finding my team.
        const teamMembers = await User.find({ manager: req.user.id });
        const teamMemberIds = teamMembers.map(user => user._id);

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

        // 3. Department Goals (Real Data)
        // Fetch all IDPs for my team
        const totalIDPs = await IDP.find({
            employee: { $in: teamMemberIds },
            status: { $in: ['approved', 'processing', 'completed', 'pending_completion'] }
        });

        const completedIDPs = totalIDPs.filter(idp => idp.status === 'completed');

        const totalCount = totalIDPs.length;
        const completedCount = completedIDPs.length;
        const remainingCount = totalCount - completedCount;
        const successRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

        const departmentGoals = {
            target: "Completion of Active IDPs", // Dynamic label
            achieved: successRate,
            completed: completedCount,
            remaining: remainingCount
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

const CheckIn = require("../models/CheckIn");

/**
 * Get Upcoming Check-ins
 * Returns check-ins scheduled for the logged-in user's team.
 */
exports.getUpcomingCheckins = async (req, res) => {
    try {
        let query = {};

        if (req.user.role === 'manager' || req.user.role === 'admin') {
            // Managers see check-ins they created
            query = { manager: req.user.id };
        } else {
            // Employees see check-ins created by their manager
            // We need to find who the user's manager is. 
            // Assuming the User model has a 'manager' field which is an ObjectId.
            const user = await User.findById(req.user.id);
            if (user && user.manager) {
                query = { manager: user.manager };
            } else {
                return res.json({ checkins: [] }); // No manager assigned
            }
        }

        // Get check-ins from now onwards, sorted by date
        const checkins = await CheckIn.find({
            ...query,
            date: { $gte: new Date() },
            $or: [
                { attendee: null }, // Team-wide events
                { attendee: req.user.id } // Targeted events for this user
            ]
        })
            .sort({ date: 1 })
            .limit(5);

        // Map to frontend format
        const formattedCheckins = checkins.map(c => ({
            id: c._id,
            name: c.title,
            type: c.type,
            time: new Date(c.date).toLocaleString('en-US', { weekday: 'long', hour: 'numeric', minute: '2-digit' }),
            fullDate: c.date
        }));

        res.json({ checkins: formattedCheckins });

    } catch (err) {
        console.error("Checkins error:", err);
        res.status(500).json({ message: "Server Error" });
    }
};

/**
 * Create a new Check-in
 */
exports.createCheckin = async (req, res) => {
    try {
        const { title, type, date, description, attendee } = req.body;

        const newCheckIn = new CheckIn({
            title,
            type,
            date,
            description,
            manager: req.user.id,
            attendee: attendee || null
        });

        await newCheckIn.save();

        res.status(201).json({ message: "Check-in scheduled successfully", checkIn: newCheckIn });
    } catch (err) {
        console.error("Create Check-in error:", err);
        res.status(500).json({ message: "Server Error" });
    }
};



/**
 * Delete a Check-in
 */
exports.deleteCheckin = async (req, res) => {
    try {
        const { id } = req.params;
        const checkIn = await CheckIn.findById(id);

        if (!checkIn) {
            return res.status(404).json({ message: "Check-in not found" });
        }

        // Verify ownership
        if (checkIn.manager.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Not authorized to delete this check-in" });
        }

        await CheckIn.findByIdAndDelete(id);
        res.json({ message: "Check-in deleted successfully" });
    } catch (err) {
        console.error("Delete check-in error:", err);
        res.status(500).json({ message: "Server Error" });
    }
};

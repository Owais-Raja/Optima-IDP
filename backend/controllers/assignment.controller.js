const Assignment = require('../models/Assignment');
const User = require('../models/user');

// Create a new assignment
exports.createAssignment = async (req, res) => {
    try {
        const { title, description, assignedTo, dueDate, priority } = req.body;

        // assignedTo should be an array of user IDs
        // If it's a single ID, wrap it
        const targetUsers = Array.isArray(assignedTo) ? assignedTo : [assignedTo];

        const newAssignment = new Assignment({
            title,
            description,
            assignedBy: req.user.id,
            assignedTo: targetUsers,
            dueDate,
            priority: priority || 'normal'
        });

        await newAssignment.save();

        res.status(201).json({ message: 'Assignment created successfully', assignment: newAssignment });
    } catch (error) {
        console.error('Create Assignment Error:', error);
        res.status(500).json({ message: 'Server error creating assignment' });
    }
};

// Get assignments for the logged-in user
exports.getMyAssignments = async (req, res) => {
    try {
        const assignments = await Assignment.find({
            assignedTo: req.user.id,
            status: 'pending' // Only fetch pending ones for the main list usually
        }).sort({ dueDate: 1 });

        res.json(assignments);
    } catch (error) {
        console.error('Get My Assignments Error:', error);
        res.status(500).json({ message: 'Server error fetching assignments' });
    }
};

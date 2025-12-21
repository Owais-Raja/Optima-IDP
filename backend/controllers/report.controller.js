const User = require('../models/user');
const IDP = require('../models/idp');
const stream = require('stream');

/**
 * Generate Weekly Team Report (CSV Stream)
 */
exports.generateTeamWeeklyReport = async (req, res) => {
    try {
        const managerId = req.user._id;

        // 1. Fetch all employees reporting to this manager
        const teamMembers = await User.find({ manager: managerId }).select('name email');

        if (!teamMembers.length) {
            return res.status(404).json({ message: "No team members found" });
        }

        // 2. Setup CSV Headers
        const filename = `Weekly_Report_${new Date().toISOString().split('T')[0]}.csv`;
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        // 3. Create a read stream to push data
        const readStream = new stream.PassThrough();
        readStream.pipe(res);

        // Write Header
        readStream.write('Name,Email,Weekly Assigned IDPs,Weekly Completed Goals\n');

        // 4. Fetch metrics and write rows (simulating "weekly" logic for now based on recent activity)
        // Note: For a real production app, you might aggregate this via a complex query. 
        // We'll iterate for simplicity as we aren't dealing with millions of records yet.

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        for (const member of teamMembers) {
            // Count IDPs created in last 7 days
            const assignedIdps = await IDP.countDocuments({
                employee: member._id,
                createdAt: { $gte: oneWeekAgo }
            });

            // Count Goals completed in last 7 days (Logic assumes IDP has 'status' or similar tracking)
            // Ideally IDP has a 'completedAt' field or status change log. 
            // We'll approximate using 'status' = 'completed' AND 'updatedAt' > oneWeekAgo
            const completedGoals = await IDP.countDocuments({
                employee: member._id,
                status: 'completed',
                updatedAt: { $gte: oneWeekAgo }
            });

            const row = `"${member.name}","${member.email}",${assignedIdps},${completedGoals}\n`;
            readStream.write(row);
        }

        readStream.end();

    } catch (error) {
        console.error("Report Generation Error:", error);
        // If headers aren't sent yet, send error json
        if (!res.headersSent) {
            res.status(500).json({ message: "Error generating report" });
        } else {
            // Stream already started, just end it
            res.end();
        }
    }
};

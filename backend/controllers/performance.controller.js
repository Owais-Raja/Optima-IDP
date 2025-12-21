const PerformanceReport = require("../models/PerformanceReport");
const User = require("../models/user");
const Skill = require("../models/skill");

/**
 * MANAGER: GET ALL REVIEWS CREATED BY THEM
 * GET /api/performance/
 */
exports.getReviews = async (req, res) => {
  try {
    const managerId = req.user.id;
    // Find reviews where this user is the manager
    const reviews = await PerformanceReport.find({ manager: managerId })
      .populate("employee", "name email avatar")
      .populate("relatedSkills", "name")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    console.error("Get Reviews Error:", err);
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
};

/**
 * MANAGER: CREATE REVIEW
 * POST /api/performance/add (or /)
 */
exports.createReview = async (req, res) => {
  try {
    const managerId = req.user.id;
    const { employeeId, reviewPeriod, rating, strengths, weaknesses, managerComments, relatedSkills } = req.body;

    // Validate employee reports to this manager
    const employee = await User.findOne({ _id: employeeId, manager: managerId });
    if (!employee && req.user.role !== 'admin') {
      const targetUser = await User.findById(employeeId);
      if (!targetUser) return res.status(404).json({ message: "Employee not found" });

      if (targetUser.manager?.toString() !== managerId && req.user.role !== 'admin') {
        return res.status(403).json({ message: "You can only review your own team members" });
      }
    }

    const newReview = await PerformanceReport.create({
      employee: employeeId,
      manager: managerId,
      reviewPeriod,
      rating,
      strengths,
      weaknesses,
      managerComments,
      relatedSkills
    });

    const populatedReview = await PerformanceReport.findById(newReview._id)
      .populate("employee", "name email avatar")
      .populate("relatedSkills", "name");

    res.status(201).json(populatedReview);

  } catch (err) {
    console.error("Create Review Error:", err);
    res.status(500).json({ message: "Failed to create review" });
  }
};

/**
 * MANAGER: UPDATE REVIEW
 * PUT /api/performance/:id
 */
exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewPeriod, rating, strengths, weaknesses, managerComments, relatedSkills } = req.body;

    const review = await PerformanceReport.findById(id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    // Only author (manager) or admin can update
    if (review.manager.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. You can only edit reviews you created." });
    }

    // Update fields
    if (reviewPeriod) review.reviewPeriod = reviewPeriod;
    if (rating) review.rating = rating;
    if (strengths) review.strengths = strengths;
    if (weaknesses) review.weaknesses = weaknesses;
    if (managerComments) review.managerComments = managerComments;
    // Handle skills update carefully - assuming full replacement of array
    if (relatedSkills) review.relatedSkills = relatedSkills;

    await review.save();

    const updatedReview = await PerformanceReport.findById(id)
      .populate("employee", "name email avatar")
      .populate("relatedSkills", "name");

    res.json(updatedReview);
  } catch (err) {
    console.error("Update Review Error:", err);
    res.status(500).json({ message: "Failed to update review" });
  }
};

/**
 * DELETE REVIEW
 * DELETE /api/performance/:id
 */
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await PerformanceReport.findById(id);

    if (!review) return res.status(404).json({ message: "Review not found" });

    // Only author (manager) or admin can delete
    if (review.manager.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied" });
    }

    await PerformanceReport.findByIdAndDelete(id);
    res.json({ message: "Review deleted successfully" });
  } catch (err) {
    console.error("Delete Review Error:", err);
    res.status(500).json({ message: "Failed to delete review" });
  }
};

/**
 * GET REVIEWS FOR EMPLOYEE (Used by Employee or Manager)
 * GET /api/performance/employee/:id
 */
exports.getEmployeeReviews = async (req, res) => {
  try {
    const { id } = req.params;
    const reviews = await PerformanceReport.find({ employee: id })
      .populate("manager", "name")
      .populate("relatedSkills", "name")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    console.error("Get Employee Reviews Error:", err);
    res.status(500).json({ message: "Failed to fetch employee reviews" });
  }
};

/**
 * GET REVIEWS FOR LOGGED-IN EMPLOYEE
 * GET /api/performance/my-reports
 */
exports.getMyReports = async (req, res) => {
  try {
    const userId = req.user.id;
    const reviews = await PerformanceReport.find({ employee: userId })
      .populate("manager", "name")
      .populate("relatedSkills", "name")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    console.error("Get My Reports Error:", err);
    res.status(500).json({ message: "Failed to fetch your reports" });
  }
};

/**
 * GET ALL REVIEWS (Admin)
 * GET /api/performance/all
 */
exports.getAllReports = async (req, res) => {
  try {
    const reviews = await PerformanceReport.find()
      .populate("employee", "name email")
      .populate("manager", "name email")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    console.error("Get All Reports Error:", err);
    res.status(500).json({ message: "Failed to fetch all reports" });
  }
};

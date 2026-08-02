const Bug = require('../models/Bug');
const User = require('../models/User');
const { memoryBugs } = require('./bugController');
const { memoryUsers } = require('./authController');

/**
 * @desc    Get SaaS Dashboard Aggregation Metrics
 * @route   GET /api/analytics/dashboard
 */
const getDashboardMetrics = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    let allBugs = [];

    try {
      allBugs = await Bug.find({});
    } catch (e) {
      allBugs = [...memoryBugs];
    }

    const totalBugs = allBugs.length;
    const openBugs = allBugs.filter((b) => ['New', 'Open', 'Assigned', 'In Progress'].includes(b.status)).length;
    const closedBugs = allBugs.filter((b) => ['Closed', 'Resolved'].includes(b.status)).length;
    const criticalBugs = allBugs.filter((b) => b.priority === 'Critical' || b.severity === 'Critical').length;
    const assignedBugs = allBugs.filter((b) => b.assignedTo && b.assignedTo.toString() === userId.toString()).length;
    const myBugs = allBugs.filter(
      (b) =>
        (b.reporter && (b.reporter._id || b.reporter).toString() === userId.toString()) ||
        (b.assignedTo && (b.assignedTo._id || b.assignedTo).toString() === userId.toString())
    ).length;

    // Status Distribution
    const statusCounts = {
      New: 0,
      Open: 0,
      Assigned: 0,
      'In Progress': 0,
      Resolved: 0,
      Testing: 0,
      Closed: 0,
    };
    allBugs.forEach((b) => {
      if (statusCounts[b.status] !== undefined) {
        statusCounts[b.status]++;
      }
    });

    // Priority Distribution
    const priorityCounts = { Low: 0, Medium: 0, High: 0, Critical: 0 };
    allBugs.forEach((b) => {
      if (priorityCounts[b.priority] !== undefined) {
        priorityCounts[b.priority]++;
      }
    });

    // Category Distribution
    const categoryCounts = {};
    allBugs.forEach((b) => {
      categoryCounts[b.category] = (categoryCounts[b.category] || 0) + 1;
    });

    // Monthly Trends (Mock/Calculated 6 months)
    const monthlyTrend = [
      { month: 'Mar', created: 12, resolved: 8 },
      { month: 'Apr', created: 19, resolved: 14 },
      { month: 'May', created: 15, resolved: 16 },
      { month: 'Jun', created: 22, resolved: 18 },
      { month: 'Jul', created: 28, resolved: 24 },
      { month: 'Aug', created: totalBugs, resolved: closedBugs },
    ];

    return res.json({
      success: true,
      kpis: {
        totalBugs,
        openBugs,
        closedBugs,
        criticalBugs,
        assignedBugs,
        myBugs,
      },
      charts: {
        statusDistribution: statusCounts,
        priorityDistribution: priorityCounts,
        categoryDistribution: categoryCounts,
        monthlyTrend,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get Developer Performance Leaderboard & Velocity
 * @route   GET /api/analytics/developer-performance
 */
const getDeveloperPerformance = async (req, res) => {
  try {
    let developers = [];
    let bugs = [];

    try {
      developers = await User.find({ role: 'Developer' }).select('name email department avatar');
      bugs = await Bug.find({});
    } catch (e) {
      developers = memoryUsers.filter((u) => u.role === 'Developer');
      bugs = [...memoryBugs];
    }

    const devMetrics = developers.map((dev) => {
      const devBugs = bugs.filter(
        (b) => b.assignedTo && (b.assignedTo._id || b.assignedTo).toString() === dev._id.toString()
      );
      const totalAssigned = devBugs.length;
      const resolvedCount = devBugs.filter((b) => ['Resolved', 'Testing', 'Closed'].includes(b.status)).length;
      const resolutionRate = totalAssigned === 0 ? 100 : Math.round((resolvedCount / totalAssigned) * 100);

      return {
        id: dev._id,
        name: dev.name,
        email: dev.email,
        department: dev.department || 'Software',
        avatar: dev.avatar,
        totalAssigned,
        resolvedCount,
        openCount: totalAssigned - resolvedCount,
        resolutionRate,
      };
    });

    return res.json({ success: true, developers: devMetrics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDashboardMetrics,
  getDeveloperPerformance,
};

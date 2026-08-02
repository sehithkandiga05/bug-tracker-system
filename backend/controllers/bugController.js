const Bug = require('../models/Bug');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');
const { getAutoAssignedDeveloper } = require('../services/autoAssignService');
const { generateAISummary, predictAIPriority, generateAISuggestedFix, detectDuplicateBugs } = require('../services/aiService');
const { getIO } = require('../services/socketService');
const { sendBugAssignedEmail, sendStatusUpdateEmail } = require('../services/emailService');
const { exportToCSV, exportToExcel, exportToPDF } = require('../services/exportService');

// In-Memory store fallback
const memoryBugs = [];

/**
 * @desc    Create new bug report
 * @route   POST /api/bugs
 */
const createBug = async (req, res) => {
  try {
    const {
      title,
      description,
      stepsToReproduce,
      expectedResult,
      actualResult,
      environment,
      operatingSystem,
      browser,
      version,
      category,
      priority: reqPriority,
      severity: reqSeverity,
      assignedTo: customAssigned,
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Please provide title and description' });
    }

    const reporterId = req.user.id || req.user._id;

    // AI Automated Enhancement: Summary & Priority evaluation
    const summary = await generateAISummary(title, description);
    const aiPrediction = await predictAIPriority(title, description);
    
    const finalPriority = reqPriority || aiPrediction.priority;
    const finalSeverity = reqSeverity || aiPrediction.severity;
    const finalCategory = category || 'Frontend';

    // AI Suggested Fix initial baseline
    const suggestedFix = await generateAISuggestedFix(title, description, finalCategory);

    // Auto Assign Developer
    let assignedDevId = customAssigned || null;
    if (!assignedDevId) {
      assignedDevId = await getAutoAssignedDeveloper(finalCategory);
    }

    // Attachments processing from multer files
    const attachments = [];
    if (req.files && Array.isArray(req.files)) {
      req.files.forEach((file) => {
        attachments.push({
          name: file.originalname,
          url: `/uploads/${file.filename}`,
          fileType: file.mimetype,
          size: file.size,
        });
      });
    }

    let bug;
    try {
      bug = await Bug.create({
        title,
        description,
        summary,
        stepsToReproduce,
        expectedResult,
        actualResult,
        environment: environment || 'Production',
        operatingSystem: operatingSystem || 'Windows',
        browser: browser || 'Chrome',
        version: version || 'v1.0.0',
        priority: finalPriority,
        severity: finalSeverity,
        category: finalCategory,
        status: assignedDevId ? 'Assigned' : 'New',
        reporter: reporterId,
        assignedTo: assignedDevId,
        attachments,
        suggestedFix,
      });

      // Populate reporter and assigned developer details
      bug = await bug.populate([
        { path: 'reporter', select: 'name email role avatar' },
        { path: 'assignedTo', select: 'name email role department avatar' },
      ]);
    } catch (dbErr) {
      // In-Memory Fallback
      bug = {
        _id: `mem_bug_${Date.now()}`,
        title,
        description,
        summary,
        stepsToReproduce,
        expectedResult,
        actualResult,
        environment: environment || 'Production',
        operatingSystem: operatingSystem || 'Windows',
        browser: browser || 'Chrome',
        version: version || 'v1.0.0',
        priority: finalPriority,
        severity: finalSeverity,
        category: finalCategory,
        status: assignedDevId ? 'Assigned' : 'New',
        reporter: { _id: reporterId, name: req.user.name || 'User', email: 'user@example.com' },
        assignedTo: assignedDevId ? { _id: assignedDevId, name: 'Developer', email: 'dev@example.com' } : null,
        attachments,
        suggestedFix,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryBugs.unshift(bug);
    }

    // Real-Time Socket Broadcast
    const io = getIO();
    io.emit('bug:created', bug);

    if (assignedDevId) {
      io.to(`user_${assignedDevId}`).emit('notification:new', {
        title: 'New Bug Assigned',
        message: `You have been assigned bug: "${bug.title}"`,
        bugId: bug._id,
      });

      // Dispatch Email Notification in background
      if (bug.assignedTo && bug.assignedTo.email) {
        sendBugAssignedEmail(bug.assignedTo.email, bug.assignedTo.name, bug.title, bug._id);
      }
    }

    return res.status(201).json({ success: true, bug });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get all bugs with filtering, search, pagination, and sorting
 * @route   GET /api/bugs
 */
const getBugs = async (req, res) => {
  try {
    const {
      search,
      status,
      priority,
      severity,
      category,
      assignedTo,
      reporter,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (severity) query.severity = severity;
    if (category) query.category = category;
    if (assignedTo) query.assignedTo = assignedTo;
    if (reporter) query.reporter = reporter;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } },
      ];
    }

    let bugs = [];
    let total = 0;

    try {
      total = await Bug.countDocuments(query);
      bugs = await Bug.find(query)
        .populate('reporter', 'name email role avatar')
        .populate('assignedTo', 'name email role department avatar')
        .sort({ [sortBy]: order === 'asc' ? 1 : -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));
    } catch (dbErr) {
      // In-Memory Filter Fallback
      let list = [...memoryBugs];
      if (status) list = list.filter((b) => b.status === status);
      if (priority) list = list.filter((b) => b.priority === priority);
      if (category) list = list.filter((b) => b.category === category);
      if (search) {
        list = list.filter(
          (b) =>
            b.title.toLowerCase().includes(search.toLowerCase()) ||
            b.description.toLowerCase().includes(search.toLowerCase())
        );
      }
      total = list.length;
      bugs = list.slice((page - 1) * limit, page * limit);
    }

    return res.json({
      success: true,
      count: bugs.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit) || 1,
      bugs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get Bug by ID
 * @route   GET /api/bugs/:id
 */
const getBugById = async (req, res) => {
  try {
    const { id } = req.params;
    let bug;

    try {
      bug = await Bug.findById(id)
        .populate('reporter', 'name email role avatar department')
        .populate('assignedTo', 'name email role department avatar');
    } catch (e) {
      bug = memoryBugs.find((b) => b._id.toString() === id.toString());
    }

    if (!bug) {
      return res.status(404).json({ success: false, message: 'Bug report not found' });
    }

    return res.json({ success: true, bug });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update Bug status or details (Supports Kanban Drag & Drop)
 * @route   PUT /api/bugs/:id
 */
const updateBug = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    let bug;
    try {
      bug = await Bug.findById(id);
    } catch (e) {
      bug = memoryBugs.find((b) => b._id.toString() === id.toString());
    }

    if (!bug) {
      return res.status(404).json({ success: false, message: 'Bug report not found' });
    }

    const oldStatus = bug.status;

    // Apply updates
    Object.keys(updates).forEach((key) => {
      bug[key] = updates[key];
    });

    try {
      await bug.save();
      bug = await bug.populate([
        { path: 'reporter', select: 'name email role avatar' },
        { path: 'assignedTo', select: 'name email role avatar' },
      ]);
    } catch (e) {
      bug.updatedAt = new Date();
    }

    // Real-Time Socket Broadcast
    const io = getIO();
    io.emit('bug:updated', bug);

    if (updates.status && updates.status !== oldStatus) {
      if (bug.assignedTo && bug.assignedTo.email) {
        sendStatusUpdateEmail(bug.assignedTo.email, bug.assignedTo.name, bug.title, oldStatus, updates.status);
      }
    }

    return res.json({ success: true, bug });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delete Bug (Admin only)
 * @route   DELETE /api/bugs/:id
 */
const deleteBug = async (req, res) => {
  try {
    const { id } = req.params;
    try {
      await Bug.findByIdAndDelete(id);
    } catch (e) {
      const idx = memoryBugs.findIndex((b) => b._id.toString() === id.toString());
      if (idx !== -1) memoryBugs.splice(idx, 1);
    }

    const io = getIO();
    io.emit('bug:deleted', id);

    return res.json({ success: true, message: 'Bug deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Export bugs to CSV, Excel, or PDF
 * @route   GET /api/bugs/export/:format
 */
const exportBugs = async (req, res) => {
  try {
    const { format } = req.params;
    let bugs = [];

    try {
      bugs = await Bug.find().populate('reporter', 'name').populate('assignedTo', 'name');
    } catch (e) {
      bugs = [...memoryBugs];
    }

    if (format === 'csv') {
      const csvData = exportToCSV(bugs);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="bugs_export.csv"');
      return res.status(200).send(csvData);
    }

    if (format === 'excel') {
      const buffer = await exportToExcel(bugs);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="bugs_export.xlsx"');
      return res.status(200).send(buffer);
    }

    if (format === 'pdf') {
      return exportToPDF(bugs, res);
    }

    return res.status(400).json({ success: false, message: 'Invalid export format. Choose csv, excel, or pdf.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createBug,
  getBugs,
  getBugById,
  updateBug,
  deleteBug,
  exportBugs,
  memoryBugs,
};

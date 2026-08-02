const Bug = require('../models/Bug');
const { memoryBugs } = require('./bugController');
const {
  generateAISummary,
  predictAIPriority,
  detectDuplicateBugs,
  generateAISuggestedFix,
} = require('../services/aiService');

/**
 * @desc    Generate AI Summary
 * @route   POST /api/ai/summarize
 */
const summarizeBug = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description required' });
    }

    const summary = await generateAISummary(title, description);
    return res.json({ success: true, summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Predict Priority & Severity using AI
 * @route   POST /api/ai/predict-priority
 */
const predictPriority = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description required' });
    }

    const prediction = await predictAIPriority(title, description);
    return res.json({ success: true, ...prediction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Scan for duplicate bugs
 * @route   POST /api/ai/detect-duplicates
 */
const checkDuplicates = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description required' });
    }

    let existingBugs = [];
    try {
      existingBugs = await Bug.find({}).select('title description status');
    } catch (e) {
      existingBugs = [...memoryBugs];
    }

    const duplicates = detectDuplicateBugs(title, description, existingBugs);
    return res.json({
      success: true,
      hasDuplicates: duplicates.length > 0,
      duplicates,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Generate AI Suggested Fix & Root Cause
 * @route   POST /api/ai/suggested-fix
 */
const getSuggestedFix = async (req, res) => {
  try {
    const { title, description, category, errorLog } = req.body;
    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description required' });
    }

    const fix = await generateAISuggestedFix(title, description, category || 'Frontend', errorLog || '');
    return res.json({ success: true, suggestedFix: fix });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  summarizeBug,
  predictPriority,
  checkDuplicates,
  getSuggestedFix,
};

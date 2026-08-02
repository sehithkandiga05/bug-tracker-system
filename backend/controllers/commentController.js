const Comment = require('../models/Comment');
const User = require('../models/User');
const { getIO } = require('../services/socketService');

// In-Memory Fallback
const memoryComments = [];

/**
 * @desc    Get comments for a specific bug
 * @route   GET /api/comments/bug/:bugId
 */
const getCommentsByBug = async (req, res) => {
  try {
    const { bugId } = req.params;
    let comments = [];

    try {
      comments = await Comment.find({ bug: bugId })
        .populate('author', 'name email role avatar')
        .populate('mentions', 'name email')
        .sort({ createdAt: 1 });
    } catch (e) {
      comments = memoryComments.filter((c) => c.bug.toString() === bugId.toString());
    }

    return res.json({ success: true, comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Add comment to a bug
 * @route   POST /api/comments
 */
const addComment = async (req, res) => {
  try {
    const { bugId, content, parentCommentId } = req.body;
    const authorId = req.user.id || req.user._id;

    if (!bugId || !content) {
      return res.status(400).json({ success: false, message: 'Bug ID and content are required' });
    }

    // Extract @mentions from content
    const mentionRegex = /@(\w+)/g;
    const mentionedNames = [];
    let match;
    while ((match = mentionRegex.exec(content)) !== null) {
      mentionedNames.push(match[1]);
    }

    let mentionUserIds = [];
    if (mentionedNames.length > 0) {
      try {
        const users = await User.find({ name: { $in: mentionedNames.map((n) => new RegExp(n, 'i')) } });
        mentionUserIds = users.map((u) => u._id);
      } catch (e) {}
    }

    let comment;
    try {
      comment = await Comment.create({
        bug: bugId,
        author: authorId,
        content,
        mentions: mentionUserIds,
        parentComment: parentCommentId || null,
      });

      comment = await comment.populate([
        { path: 'author', select: 'name email role avatar' },
        { path: 'mentions', select: 'name email' },
      ]);
    } catch (e) {
      comment = {
        _id: `mem_comm_${Date.now()}`,
        bug: bugId,
        author: { _id: authorId, name: req.user.name || 'User', avatar: req.user.avatar || '' },
        content,
        mentions: [],
        parentComment: parentCommentId || null,
        createdAt: new Date(),
      };
      memoryComments.push(comment);
    }

    // Broadcast Real-Time Comment Event
    const io = getIO();
    io.emit(`comment:added:${bugId}`, comment);

    return res.status(201).json({ success: true, comment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getCommentsByBug, addComment, memoryComments };

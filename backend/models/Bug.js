const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  name: String,
  url: String,
  fileType: String,
  size: Number,
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

const bugSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a bug title'],
      trim: true,
      maxlength: [200, 'Title cannot be longer than 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please add a detailed bug description'],
    },
    summary: {
      type: String,
      default: '',
    },
    stepsToReproduce: {
      type: String,
      default: '',
    },
    expectedResult: {
      type: String,
      default: '',
    },
    actualResult: {
      type: String,
      default: '',
    },
    environment: {
      type: String,
      default: 'Production',
    },
    operatingSystem: {
      type: String,
      enum: ['Windows', 'macOS', 'Linux', 'iOS', 'Android', 'Other'],
      default: 'Windows',
    },
    browser: {
      type: String,
      enum: ['Chrome', 'Firefox', 'Safari', 'Edge', 'Brave', 'Other'],
      default: 'Chrome',
    },
    version: {
      type: String,
      default: 'v1.0.0',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    severity: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    category: {
      type: String,
      enum: ['Frontend', 'Backend', 'Database', 'DevOps', 'Mobile', 'QA', 'UI/UX', 'Security', 'Other'],
      default: 'Frontend',
    },
    status: {
      type: String,
      enum: ['New', 'Open', 'Assigned', 'In Progress', 'Resolved', 'Testing', 'Closed'],
      default: 'New',
    },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    attachments: [attachmentSchema],
    suggestedFix: {
      type: String,
      default: '',
    },
    isDuplicate: {
      type: Boolean,
      default: false,
    },
    duplicateOf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bug',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Text Index for Fast Search & Duplicate Detection
bugSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Bug', bugSchema);

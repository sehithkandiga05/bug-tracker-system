import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axiosInstance';
import {
  Bug,
  Sparkles,
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Monitor,
  Globe,
  Tag,
  Wand2,
  AlertOctagon,
  ArrowRight,
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function BugReport() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    summary: '',
    stepsToReproduce: '',
    expectedResult: '',
    actualResult: '',
    environment: 'Production',
    operatingSystem: 'Windows',
    browser: 'Chrome',
    version: 'v1.0.0',
    category: 'Frontend',
    priority: 'Medium',
    severity: 'Medium',
  });

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiNotice, setAiNotice] = useState('');
  const [duplicateMatches, setDuplicateMatches] = useState([]);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);

  // Form Field Change Handler
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // File selection handler
  const handleFileChange = (e) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  // AI Feature 1: Summarize
  const handleAISummarize = async () => {
    if (!formData.title || !formData.description) {
      alert('Please fill in Title and Description first.');
      return;
    }
    setAiLoading(true);
    try {
      const res = await API.post('/ai/summarize', {
        title: formData.title,
        description: formData.description,
      });
      if (res.data.success) {
        setFormData((prev) => ({ ...prev, summary: res.data.summary }));
        setAiNotice('✨ AI Summary generated successfully!');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  // AI Feature 2: Priority Predictor
  const handleAIPredictPriority = async () => {
    if (!formData.title || !formData.description) {
      alert('Please fill in Title and Description first.');
      return;
    }
    setAiLoading(true);
    try {
      const res = await API.post('/ai/predict-priority', {
        title: formData.title,
        description: formData.description,
      });
      if (res.data.success) {
        setFormData((prev) => ({
          ...prev,
          priority: res.data.priority,
          severity: res.data.severity,
        }));
        setAiNotice(`🔮 AI Predicted Priority: ${res.data.priority} (${res.data.reason})`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  // AI Feature 3: Duplicate Bug Scanner
  const handleAIDetectDuplicates = async () => {
    if (!formData.title || !formData.description) {
      alert('Please fill in Title and Description first.');
      return;
    }
    setAiLoading(true);
    try {
      const res = await API.post('/ai/detect-duplicates', {
        title: formData.title,
        description: formData.description,
      });
      if (res.data.success) {
        if (res.data.hasDuplicates) {
          setDuplicateMatches(res.data.duplicates);
          setShowDuplicateModal(true);
        } else {
          setAiNotice('✅ AI Duplicate Scan Complete: No similar existing bugs found!');
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  // Form Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const body = new FormData();
      Object.keys(formData).forEach((key) => {
        body.append(key, formData[key]);
      });

      files.forEach((file) => {
        body.append('attachments', file);
      });

      const res = await API.post('/bugs', body, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        navigate(`/bugs/${res.data.bug._id}`);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit bug report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="glass-card bg-slate-900/80 border border-slate-800 p-6 rounded-xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div>
            <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
              Report Bug Issue <Bug className="w-5 h-5 text-blue-400" />
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Log issue details. AI will automatically evaluate severity and route to domain developers.
            </p>
          </div>

          {/* AI Quick Assistant Tools Toolbar */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAISummarize}
              disabled={aiLoading}
              className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all"
            >
              <Wand2 className="w-3.5 h-3.5" /> AI Summarize
            </button>
            <button
              type="button"
              onClick={handleAIPredictPriority}
              disabled={aiLoading}
              className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border border-purple-500/30 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> AI Priority
            </button>
            <button
              type="button"
              onClick={handleAIDetectDuplicates}
              disabled={aiLoading}
              className="px-3 py-1.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-500/30 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all"
            >
              <AlertOctagon className="w-3.5 h-3.5" /> Scan Duplicates
            </button>
          </div>
        </div>

        {aiNotice && (
          <div className="mb-6 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>{aiNotice}</span>
          </div>
        )}

        {/* Bug Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Bug Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., OAuth Token Refresh Infinite Loop on Session Timeout"
              className="w-full bg-slate-800/90 border border-slate-700 text-slate-100 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Detailed Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Detailed Description & Logs <span className="text-rose-400">*</span>
            </label>
            <textarea
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the issue symptoms, error trace, or failure conditions..."
              className="w-full bg-slate-800/90 border border-slate-700 text-slate-100 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          {/* AI Generated Summary (Editable) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
              AI Summary <Sparkles className="w-3 h-3 text-amber-400" />
            </label>
            <input
              type="text"
              name="summary"
              value={formData.summary}
              onChange={handleChange}
              placeholder="Auto-generated concise summary..."
              className="w-full bg-slate-800/90 border border-slate-700 text-slate-300 text-xs rounded-lg px-3 py-2 focus:outline-none"
            />
          </div>

          {/* Steps to Reproduce */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Steps to Reproduce</label>
              <textarea
                name="stepsToReproduce"
                rows={3}
                value={formData.stepsToReproduce}
                onChange={handleChange}
                placeholder="1. Navigate to portal&#10;2. Trigger parallel calls..."
                className="w-full bg-slate-800/90 border border-slate-700 text-slate-100 text-xs rounded-lg p-2.5 focus:outline-none"
              ></textarea>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Expected Result</label>
              <textarea
                name="expectedResult"
                rows={3}
                value={formData.expectedResult}
                onChange={handleChange}
                placeholder="Expected behavior..."
                className="w-full bg-slate-800/90 border border-slate-700 text-slate-100 text-xs rounded-lg p-2.5 focus:outline-none"
              ></textarea>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Actual Result</label>
              <textarea
                name="actualResult"
                rows={3}
                value={formData.actualResult}
                onChange={handleChange}
                placeholder="Actual failure observed..."
                className="w-full bg-slate-800/90 border border-slate-700 text-slate-100 text-xs rounded-lg p-2.5 focus:outline-none"
              ></textarea>
            </div>
          </div>

          {/* Classification Options */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full bg-slate-800/90 border border-slate-700 text-slate-100 text-xs rounded-lg p-2.5 focus:outline-none"
              >
                {['Frontend', 'Backend', 'Database', 'DevOps', 'Mobile', 'QA', 'UI/UX', 'Security', 'Other'].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full bg-slate-800/90 border border-slate-700 text-slate-100 text-xs rounded-lg p-2.5 focus:outline-none"
              >
                {['Low', 'Medium', 'High', 'Critical'].map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Severity</label>
              <select
                name="severity"
                value={formData.severity}
                onChange={handleChange}
                className="w-full bg-slate-800/90 border border-slate-700 text-slate-100 text-xs rounded-lg p-2.5 focus:outline-none"
              >
                {['Low', 'Medium', 'High', 'Critical'].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Environment</label>
              <select
                name="environment"
                value={formData.environment}
                onChange={handleChange}
                className="w-full bg-slate-800/90 border border-slate-700 text-slate-100 text-xs rounded-lg p-2.5 focus:outline-none"
              >
                {['Production', 'Staging', 'Development', 'QA-Sandbox'].map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* System Specs */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">OS</label>
              <select
                name="operatingSystem"
                value={formData.operatingSystem}
                onChange={handleChange}
                className="w-full bg-slate-800/90 border border-slate-700 text-slate-100 text-xs rounded-lg p-2 focus:outline-none"
              >
                {['Windows', 'macOS', 'Linux', 'iOS', 'Android', 'Other'].map((os) => (
                  <option key={os} value={os}>
                    {os}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Browser</label>
              <select
                name="browser"
                value={formData.browser}
                onChange={handleChange}
                className="w-full bg-slate-800/90 border border-slate-700 text-slate-100 text-xs rounded-lg p-2 focus:outline-none"
              >
                {['Chrome', 'Firefox', 'Safari', 'Edge', 'Brave', 'Other'].map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">App Version</label>
              <input
                type="text"
                name="version"
                value={formData.version}
                onChange={handleChange}
                className="w-full bg-slate-800/90 border border-slate-700 text-slate-100 text-xs rounded-lg p-2 focus:outline-none"
              />
            </div>
          </div>

          {/* File Attachments Dropzone */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Upload Attachments (Screenshots, Videos, Log files)
            </label>
            <div className="border-2 border-dashed border-slate-700/80 rounded-xl p-4 text-center bg-slate-800/40 hover:bg-slate-800/60 transition-colors">
              <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
              <input type="file" multiple onChange={handleFileChange} className="hidden" id="file-upload" />
              <label htmlFor="file-upload" className="cursor-pointer text-xs text-blue-400 font-semibold hover:underline">
                Click to browse files
              </label>
              <p className="text-[10px] text-slate-400 mt-1">Supports PNG, JPG, MP4, LOG, TXT up to 25MB</p>
              {files.length > 0 && (
                <div className="mt-2 text-xs text-emerald-400 font-semibold">
                  {files.length} file(s) selected: {files.map((f) => f.name).join(', ')}
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Submitting & Routing Bug...' : 'Submit & Auto-Assign Bug'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>
      </div>

      {/* Duplicate Warning Modal */}
      {showDuplicateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card bg-slate-900 border border-slate-700 max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <AlertOctagon className="w-5 h-5" /> AI Duplicate Scanner Warning
            </div>
            <p className="text-xs text-slate-300">
              The AI engine detected potential duplicate bugs already registered in the system:
            </p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {duplicateMatches.map((d, i) => (
                <div key={i} className="p-3 bg-slate-800/80 rounded-lg border border-slate-700 text-xs">
                  <p className="font-semibold text-slate-200">{d.title}</p>
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>Status: {d.status}</span>
                    <span className="text-amber-400 font-bold">Similarity: {d.similarityScore}%</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDuplicateModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg font-semibold"
              >
                Proceed Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import {
  Bug,
  Sparkles,
  User,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  Paperclip,
  Tag,
  Monitor,
  Globe,
  FileText,
  Wand2,
  ArrowLeft,
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function BugDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();

  const [bug, setBug] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [aiFixLoading, setAiFixLoading] = useState(false);

  const fetchBugDetails = async () => {
    try {
      const bugRes = await API.get(`/bugs/${id}`);
      if (bugRes.data.success) {
        setBug(bugRes.data.bug);
      }
      const commentRes = await API.get(`/comments/bug/${id}`);
      if (commentRes.data.success) {
        setComments(commentRes.data.comments);
      }
    } catch (e) {
      console.error('Failed to load bug details', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBugDetails();
  }, [id]);

  // Listen to live WebSocket comments
  useEffect(() => {
    if (!socket || !id) return;
    socket.on(`comment:added:${id}`, (newComment) => {
      setComments((prev) => [...prev, newComment]);
    });

    return () => {
      socket.off(`comment:added:${id}`);
    };
  }, [socket, id]);

  const handleStatusChange = async (newStatus) => {
    try {
      const res = await API.put(`/bugs/${id}`, { status: newStatus });
      if (res.data.success) {
        setBug(res.data.bug);
      }
    } catch (e) {
      alert('Failed to update status');
    }
  };

  const handleGenerateAIFix = async () => {
    setAiFixLoading(true);
    try {
      const res = await API.post('/ai/suggested-fix', {
        title: bug.title,
        description: bug.description,
        category: bug.category,
      });
      if (res.data.success) {
        setBug((prev) => ({ ...prev, suggestedFix: res.data.suggestedFix }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAiFixLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const res = await API.post('/comments', {
        bugId: id,
        content: commentText,
      });
      if (res.data.success) {
        setCommentText('');
      }
    } catch (e) {
      alert('Failed to post comment');
    }
  };

  if (loading || !bug) {
    return (
      <div className="p-6 flex items-center justify-center text-slate-400 text-sm min-h-[60vh]">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading Bug Metadata & Threaded Discussions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Navigation & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link to="/bugs" className="text-xs text-blue-400 hover:underline flex items-center gap-1 mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to All Bugs Log
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-extrabold text-white tracking-tight">{bug.title}</h1>
            <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300">
              #{bug._id.toString().substring(0, 8)}
            </span>
          </div>
        </div>

        {/* Quick Status Workflow Actions */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-xl">
          <span className="text-xs font-semibold text-slate-400 px-2">Status Workflow:</span>
          {['New', 'Open', 'Assigned', 'In Progress', 'Resolved', 'Testing', 'Closed'].map((s) => (
            <button
              key={s}
              onClick={() => handleStatusChange(s)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                bug.status === s
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Details, AI Fix, Attachments, Comments) */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Summary Banner */}
          {bug.summary && (
            <div className="glass-card bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-amber-400 fill-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">AI Generated Issue Summary</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{bug.summary}</p>
              </div>
            </div>
          )}

          {/* Description & Reproduction Steps */}
          <div className="glass-card bg-slate-900/60 border border-slate-800 p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2">Description & Context</h2>
            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{bug.description}</p>

            {bug.stepsToReproduce && (
              <div className="pt-3 border-t border-slate-800/80">
                <h3 className="text-xs font-bold text-slate-300 mb-1">Steps to Reproduce:</h3>
                <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-wrap">{bug.stepsToReproduce}</p>
              </div>
            )}
          </div>

          {/* AI Suggested Fix Box */}
          <div className="glass-card bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-indigo-400 flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-indigo-400" /> AI Root Cause & Suggested Fix
              </h2>
              <button
                onClick={handleGenerateAIFix}
                disabled={aiFixLoading}
                className="px-3 py-1 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 text-xs font-semibold rounded-lg transition-all"
              >
                {aiFixLoading ? 'Analyzing...' : 'Re-Generate AI Fix'}
              </button>
            </div>
            <div className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800 font-mono whitespace-pre-wrap">
              {bug.suggestedFix || 'Click Re-Generate AI Fix to trigger Gemini API analysis.'}
            </div>
          </div>

          {/* Attachments Gallery */}
          {bug.attachments && bug.attachments.length > 0 && (
            <div className="glass-card bg-slate-900/60 border border-slate-800 p-6 space-y-3">
              <h2 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2 flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-blue-400" /> Uploaded Attachments ({bug.attachments.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {bug.attachments.map((att, i) => (
                  <a
                    key={i}
                    href={att.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-lg text-xs font-medium text-blue-400 flex items-center gap-2 truncate transition-colors"
                  >
                    <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{att.name}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Threaded Discussion Comments */}
          <div className="glass-card bg-slate-900/60 border border-slate-800 p-6 space-y-6">
            <h2 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-400" /> Threaded Discussion ({comments.length})
            </h2>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="flex gap-3">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'}
                alt="Me"
                className="w-8 h-8 rounded-full border border-blue-500 object-cover flex-shrink-0"
              />
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment... (use @mention to notify teammates)"
                  className="flex-1 bg-slate-800/90 border border-slate-700 text-slate-100 text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Post
                </button>
              </div>
            </form>

            {/* Comment List */}
            <div className="space-y-4">
              {comments.map((comm) => (
                <div key={comm._id} className="flex gap-3 bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/50">
                  <img
                    src={comm.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'}
                    alt="Author"
                    className="w-8 h-8 rounded-full border border-slate-600 object-cover flex-shrink-0"
                  />
                  <div className="space-y-1 flex-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">{comm.author?.name || 'User'}</span>
                      <span className="text-[10px] text-slate-500">
                        {comm.createdAt ? new Date(comm.createdAt).toLocaleString() : 'Just now'}
                      </span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{comm.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar Metadata */}
        <div className="space-y-6">
          {/* Metadata Card */}
          <div className="glass-card bg-slate-900/60 border border-slate-800 p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">
              Bug Classification
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Category:</span>
                <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20">
                  {bug.category}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Priority:</span>
                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20">
                  {bug.priority}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Severity:</span>
                <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 font-bold border border-rose-500/20">
                  {bug.severity}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Environment:</span>
                <span className="text-slate-200 font-semibold">{bug.environment}</span>
              </div>
            </div>
          </div>

          {/* Reporter & Assigned Developer */}
          <div className="glass-card bg-slate-900/60 border border-slate-800 p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">
              Assignments & Ownership
            </h3>

            {/* Reporter */}
            <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/40">
              <img
                src={bug.reporter?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'}
                alt="Reporter"
                className="w-9 h-9 rounded-full border border-slate-600 object-cover"
              />
              <div className="text-xs">
                <p className="text-[10px] text-slate-500">Reported By</p>
                <p className="font-bold text-slate-200">{bug.reporter?.name || 'Reporter'}</p>
                <p className="text-[10px] text-blue-400">{bug.reporter?.role || 'Reporter'}</p>
              </div>
            </div>

            {/* Assigned Developer */}
            <div className="flex items-center gap-3 p-2 rounded-lg bg-blue-950/30 border border-blue-500/20">
              <img
                src={bug.assignedTo?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80'}
                alt="Assigned"
                className="w-9 h-9 rounded-full border border-blue-500 object-cover"
              />
              <div className="text-xs">
                <p className="text-[10px] text-blue-400 font-semibold">Assigned Developer</p>
                <p className="font-bold text-slate-200">{bug.assignedTo?.name || 'Unassigned'}</p>
                <p className="text-[10px] text-slate-400">{bug.assignedTo?.department || 'Software'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axiosInstance';
import { useSocket } from '../context/SocketContext';
import { Kanban, Sparkles, User, AlertCircle, Clock, CheckCircle, Tag } from 'lucide-react';
import { motion } from 'framer-motion';

const KANBAN_COLUMNS = [
  { id: 'New', label: 'New Reported', color: 'border-blue-500', bg: 'bg-blue-500/10', text: 'text-blue-400' },
  { id: 'Open', label: 'Open', color: 'border-indigo-500', bg: 'bg-indigo-500/10', text: 'text-indigo-400' },
  { id: 'Assigned', label: 'Assigned', color: 'border-purple-500', bg: 'bg-purple-500/10', text: 'text-purple-400' },
  { id: 'In Progress', label: 'In Progress', color: 'border-amber-500', bg: 'bg-amber-500/10', text: 'text-amber-400' },
  { id: 'Resolved', label: 'Resolved', color: 'border-emerald-500', bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
  { id: 'Testing', label: 'Testing QA', color: 'border-teal-500', bg: 'bg-teal-500/10', text: 'text-teal-400' },
  { id: 'Closed', label: 'Closed', color: 'border-slate-600', bg: 'bg-slate-800/40', text: 'text-slate-400' },
];

export default function KanbanView() {
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draggedBugId, setDraggedBugId] = useState(null);
  const { socket } = useSocket();

  const fetchBugs = async () => {
    try {
      const res = await API.get('/bugs?limit=100');
      if (res.data.success) {
        setBugs(res.data.bugs);
      }
    } catch (e) {
      console.error('Failed to fetch bugs for Kanban board', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBugs();
  }, []);

  // Listen to live WebSocket bug updates
  useEffect(() => {
    if (!socket) return;

    socket.on('bug:created', (newBug) => {
      setBugs((prev) => [newBug, ...prev]);
    });

    socket.on('bug:updated', (updatedBug) => {
      setBugs((prev) => prev.map((b) => (b._id === updatedBug._id ? updatedBug : b)));
    });

    return () => {
      socket.off('bug:created');
      socket.off('bug:updated');
    };
  }, [socket]);

  // Drag and Drop Event Handlers
  const handleDragStart = (e, bugId) => {
    setDraggedBugId(bugId);
    e.dataTransfer.setData('text/plain', bugId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    const bugId = e.dataTransfer.getData('text/plain') || draggedBugId;
    if (!bugId) return;

    // Optimistic UI Update
    setBugs((prev) =>
      prev.map((b) => (b._id === bugId ? { ...b, status: targetStatus } : b))
    );

    try {
      await API.put(`/bugs/${bugId}`, { status: targetStatus });
    } catch (err) {
      console.error('Failed to update status on drop', err);
      fetchBugs(); // Revert on failure
    } finally {
      setDraggedBugId(null);
    }
  };

  const getPriorityBadge = (priority) => {
    const map = {
      Critical: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
      High: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      Medium: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      Low: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    };
    return map[priority] || map.Medium;
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center text-slate-400 text-sm min-h-[60vh]">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading Kanban Board Workflows...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1700px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            Kanban Status Workflow Board <Kanban className="w-5 h-5 text-blue-400" />
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Drag and drop bug cards across columns to trigger automatic status transitions & real-time alerts.
          </p>
        </div>
      </div>

      {/* Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 items-start overflow-x-auto pb-4">
        {KANBAN_COLUMNS.map((col) => {
          const colBugs = bugs.filter((b) => b.status === col.id);
          return (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
              className="glass-card bg-slate-900/50 border border-slate-800 p-3 rounded-xl min-h-[500px] flex flex-col"
            >
              {/* Column Header */}
              <div className={`flex items-center justify-between pb-2.5 mb-3 border-b-2 ${col.color}`}>
                <span className={`text-xs font-bold ${col.text} flex items-center gap-1.5`}>
                  {col.label}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-extrabold text-slate-300">
                  {colBugs.length}
                </span>
              </div>

              {/* Cards Container */}
              <div className="space-y-3 flex-1">
                {colBugs.map((bug) => (
                  <motion.div
                    key={bug._id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, bug._id)}
                    whileHover={{ scale: 1.02 }}
                    className="glass-card bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 p-3.5 shadow-md cursor-grab active:cursor-grabbing transition-all group"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getPriorityBadge(bug.priority)}`}>
                        {bug.priority}
                      </span>
                      <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                        <Tag className="w-3 h-3 text-blue-400" /> {bug.category}
                      </span>
                    </div>

                    <Link to={`/bugs/${bug._id}`} className="font-semibold text-xs text-slate-100 group-hover:text-blue-400 transition-colors line-clamp-2">
                      {bug.title}
                    </Link>

                    {bug.summary && (
                      <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-2">
                        {bug.summary}
                      </p>
                    )}

                    <div className="mt-3 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[10px] text-slate-400">
                      <div className="flex items-center gap-1">
                        <img
                          src={bug.reporter?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'}
                          alt="Reporter"
                          className="w-4 h-4 rounded-full border border-slate-600 object-cover"
                        />
                        <span className="truncate max-w-[70px]">{bug.reporter?.name || 'Reporter'}</span>
                      </div>

                      {bug.assignedTo && (
                        <div className="flex items-center gap-1 text-blue-400">
                          <span>&rarr;</span>
                          <img
                            src={bug.assignedTo?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80'}
                            alt="Assigned"
                            className="w-4 h-4 rounded-full border border-blue-500 object-cover"
                          />
                          <span className="truncate max-w-[70px]">{bug.assignedTo?.name}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}

                {colBugs.length === 0 && (
                  <div className="h-32 border-2 border-dashed border-slate-800 rounded-lg flex items-center justify-center text-[11px] text-slate-600">
                    Drop cards here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axiosInstance';
import { TableSkeleton } from '../components/common/LoadingSkeleton';
import {
  Bug,
  Search,
  Filter,
  FileSpreadsheet,
  FileText,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Tag,
  Eye,
} from 'lucide-react';

export default function BugList() {
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchBugs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: 10,
        ...(search && { search }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(category && { category }),
      });

      const res = await API.get(`/bugs?${params.toString()}`);
      if (res.data.success) {
        setBugs(res.data.bugs);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (e) {
      console.error('Failed to load bugs table', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBugs();
  }, [page, status, priority, category]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchBugs();
  };

  const handleExport = (format) => {
    window.open(`/api/bugs/export/${format}`, '_blank');
  };

  const getPriorityBadge = (p) => {
    const map = {
      Critical: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
      High: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      Medium: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      Low: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    };
    return map[p] || map.Medium;
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            System Bugs Directory <Bug className="w-5 h-5 text-blue-400" />
          </h1>
          <p className="text-xs text-slate-400 mt-1">Search, filter, and export logged application issues.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('csv')}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" /> CSV
          </button>
          <button
            onClick={() => handleExport('excel')}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400" /> Excel
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-rose-400" /> PDF
          </button>
          <Link
            to="/report"
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-md shadow-blue-600/20"
          >
            <PlusCircle className="w-4 h-4" /> Log New Bug
          </Link>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="glass-card bg-slate-900/60 p-4 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <form onSubmit={handleSearchSubmit} className="lg:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or summary..."
            className="w-full bg-slate-800/90 border border-slate-700 text-slate-100 text-xs rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </form>

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="bg-slate-800/90 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="New">New</option>
          <option value="Open">Open</option>
          <option value="Assigned">Assigned</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Testing">Testing</option>
          <option value="Closed">Closed</option>
        </select>

        <select
          value={priority}
          onChange={(e) => {
            setPriority(e.target.value);
            setPage(1);
          }}
          className="bg-slate-800/90 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none"
        >
          <option value="">All Priorities</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
          className="bg-slate-800/90 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none"
        >
          <option value="">All Categories</option>
          <option value="Frontend">Frontend</option>
          <option value="Backend">Backend</option>
          <option value="Database">Database</option>
          <option value="DevOps">DevOps</option>
          <option value="Mobile">Mobile</option>
          <option value="QA">QA</option>
        </select>
      </div>

      {/* Bugs Table */}
      {loading ? (
        <TableSkeleton />
      ) : (
        <div className="glass-card bg-slate-900/60 border border-slate-800 overflow-hidden rounded-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-700/80">
                <tr>
                  <th className="p-3.5">ID / Title</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Priority</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Assigned Developer</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {bugs.map((bug) => (
                  <tr key={bug._id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-3.5">
                      <Link to={`/bugs/${bug._id}`} className="font-semibold text-slate-100 hover:text-blue-400 line-clamp-1">
                        {bug.title}
                      </Link>
                      <span className="text-[10px] text-slate-500">#{bug._id.toString().substring(0, 8)}</span>
                    </td>
                    <td className="p-3.5 font-medium text-slate-300">
                      <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px]">
                        {bug.category}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getPriorityBadge(bug.priority)}`}>
                        {bug.priority}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="font-bold text-blue-400">{bug.status}</span>
                    </td>
                    <td className="p-3.5">
                      {bug.assignedTo ? (
                        <div className="flex items-center gap-1.5">
                          <img
                            src={bug.assignedTo?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80'}
                            alt="Dev"
                            className="w-5 h-5 rounded-full border border-blue-500 object-cover"
                          />
                          <span className="font-medium text-slate-200">{bug.assignedTo?.name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="p-3.5 text-slate-400 text-[11px]">
                      {bug.createdAt ? new Date(bug.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-3.5 text-right">
                      <Link
                        to={`/bugs/${bug._id}`}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-blue-400 font-semibold rounded text-[11px] inline-flex items-center gap-1 border border-slate-700"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </Link>
                    </td>
                  </tr>
                ))}

                {bugs.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500 text-xs">
                      No bugs match your active filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="p-3 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded text-slate-200 font-semibold flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded text-slate-200 font-semibold flex items-center gap-1"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

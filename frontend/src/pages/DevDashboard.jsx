import React, { useEffect, useState } from 'react';
import API from '../api/axiosInstance';
import { Code2, Award, CheckCircle2, Clock, Zap, TrendingUp } from 'lucide-react';

export default function DevDashboard() {
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDevData = async () => {
      try {
        const res = await API.get('/analytics/developer-performance');
        if (res.data.success) {
          setDevelopers(res.data.developers);
        }
      } catch (e) {
        console.error('Failed to load developer performance', e);
      } finally {
        setLoading(false);
      }
    };
    fetchDevData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center text-slate-400 text-sm min-h-[60vh]">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading Developer Productivity Metrics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
          Developer Performance Leaderboard <Code2 className="w-5 h-5 text-blue-400" />
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Track resolution velocity, assigned backlog, and team productivity rates.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {developers.map((dev, i) => (
          <div key={dev.id} className="glass-card bg-slate-900/60 border border-slate-800 p-5 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={dev.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80'}
                alt="Dev"
                className="w-12 h-12 rounded-full border-2 border-blue-500 object-cover"
              />
              <div>
                <h3 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                  {dev.name} {i === 0 && <Award className="w-4 h-4 text-amber-400 fill-amber-400" />}
                </h3>
                <p className="text-xs text-blue-400 font-medium">{dev.department} Department</p>
              </div>
            </div>

            {/* Resolution Rate Progress */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-400">Resolution Velocity Rate</span>
                <span className="text-emerald-400">{dev.resolutionRate}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${dev.resolutionRate}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center">
              <div className="p-2 rounded bg-slate-800/40">
                <p className="text-[10px] text-slate-400">Assigned</p>
                <p className="font-extrabold text-sm text-slate-200">{dev.totalAssigned}</p>
              </div>
              <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-[10px] text-emerald-400">Resolved</p>
                <p className="font-extrabold text-sm text-emerald-400">{dev.resolvedCount}</p>
              </div>
              <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20">
                <p className="text-[10px] text-amber-400">Open</p>
                <p className="font-extrabold text-sm text-amber-400">{dev.openCount}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

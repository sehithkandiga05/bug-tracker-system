import React, { useEffect, useState } from 'react';
import API from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { KPISkeleton, ChartSkeleton } from '../components/common/LoadingSkeleton';
import {
  Bug,
  AlertTriangle,
  CheckCircle2,
  Clock,
  UserCheck,
  User,
  Sparkles,
  TrendingUp,
  FileSpreadsheet,
  FileText,
  Download,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { motion } from 'framer-motion';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await API.get('/analytics/dashboard');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <KPISkeleton />
        <ChartSkeleton />
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const charts = data?.charts || {};

  // Status Pie Chart Configuration
  const statusPieData = {
    labels: Object.keys(charts.statusDistribution || {}),
    datasets: [
      {
        data: Object.values(charts.statusDistribution || {}),
        backgroundColor: [
          '#3b82f6', // New
          '#6366f1', // Open
          '#8b5cf6', // Assigned
          '#eab308', // In Progress
          '#10b981', // Resolved
          '#06b6d4', // Testing
          '#64748b', // Closed
        ],
        borderWidth: 0,
      },
    ],
  };

  // Priority Bar Chart Configuration
  const priorityBarData = {
    labels: ['Low', 'Medium', 'High', 'Critical'],
    datasets: [
      {
        label: 'Bugs Count',
        data: [
          charts.priorityDistribution?.Low || 0,
          charts.priorityDistribution?.Medium || 0,
          charts.priorityDistribution?.High || 0,
          charts.priorityDistribution?.Critical || 0,
        ],
        backgroundColor: ['#10b981', '#3b82f6', '#f97316', '#ef4444'],
        borderRadius: 6,
      },
    ],
  };

  // Monthly Trend Line Chart Configuration
  const trendLineData = {
    labels: (charts.monthlyTrend || []).map((t) => t.month),
    datasets: [
      {
        label: 'Bugs Reported',
        data: (charts.monthlyTrend || []).map((t) => t.created),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Bugs Resolved',
        data: (charts.monthlyTrend || []).map((t) => t.resolved),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const handleExport = (format) => {
    window.open(`/api/bugs/export/${format}`, '_blank');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950/60 border border-slate-700/60">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            Welcome back, {user?.name} <Sparkles className="w-5 h-5 text-amber-400 fill-amber-400" />
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            System Status: <span className="text-emerald-400 font-semibold">Operational</span> • Real-time AI Automation Active
          </p>
        </div>

        {/* Quick Data Export Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('csv')}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" /> CSV
          </button>
          <button
            onClick={() => handleExport('excel')}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400" /> Excel
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-rose-400" /> PDF Summary
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { label: 'Total Bugs', value: kpis.totalBugs, icon: Bug, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Open Bugs', value: kpis.openBugs, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Closed / Fixed', value: kpis.closedBugs, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Critical Bugs', value: kpis.criticalBugs, icon: AlertTriangle, color: 'text-rose-400', bg: 'bg-rose-500/10' },
          { label: 'Assigned to Me', value: kpis.assignedBugs, icon: UserCheck, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
          { label: 'My Reported', value: kpis.myBugs, icon: User, color: 'text-purple-400', bg: 'bg-purple-500/10' },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card bg-slate-900/60 p-4 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">{card.label}</span>
                <div className={`p-2 rounded-lg ${card.bg}`}>
                  <Icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-extrabold text-white tracking-tight">{card.value || 0}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Breakdown Pie Chart */}
        <div className="glass-card bg-slate-900/60 p-5 border border-slate-800">
          <h2 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Bug className="w-4 h-4 text-blue-400" /> Status Distribution
          </h2>
          <div className="h-64 flex items-center justify-center">
            <Pie
              data={statusPieData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 11 } } },
                },
              }}
            />
          </div>
        </div>

        {/* Priority Bar Chart */}
        <div className="glass-card bg-slate-900/60 p-5 border border-slate-800">
          <h2 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" /> Priority Severity Breakdown
          </h2>
          <div className="h-64 flex items-center justify-center">
            <Bar
              data={priorityBarData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                },
                scales: {
                  x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
                  y: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } },
                },
              }}
            />
          </div>
        </div>

        {/* Monthly Resolution Trend Line Chart */}
        <div className="glass-card bg-slate-900/60 p-5 border border-slate-800">
          <h2 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" /> Monthly Resolution Velocity
          </h2>
          <div className="h-64 flex items-center justify-center">
            <Line
              data={trendLineData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 11 } } },
                },
                scales: {
                  x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
                  y: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

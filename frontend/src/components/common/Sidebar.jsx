import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Kanban,
  Bug,
  PlusCircle,
  Users,
  Code2,
  Sparkles,
  BarChart3,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export default function Sidebar() {
  const { user } = useAuth();
  const role = user?.role || 'Reporter';

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['Admin', 'Developer', 'Tester', 'Reporter'] },
    { label: 'Kanban Board', path: '/kanban', icon: Kanban, roles: ['Admin', 'Developer', 'Tester', 'Reporter'] },
    { label: 'All Bugs Log', path: '/bugs', icon: Bug, roles: ['Admin', 'Developer', 'Tester', 'Reporter'] },
    { label: 'Report New Bug', path: '/report', icon: PlusCircle, roles: ['Admin', 'Developer', 'Tester', 'Reporter'], highlight: true },
    { label: 'Dev Analytics', path: '/dev-dashboard', icon: Code2, roles: ['Admin', 'Developer'] },
    { label: 'Admin Control', path: '/admin', icon: ShieldCheck, roles: ['Admin'] },
  ];

  return (
    <aside className="w-64 bg-slate-900/95 dark:bg-slate-900 border-r border-slate-800 flex flex-col h-[calc(100vh-57px)] sticky top-[57px] text-slate-300 select-none">
      {/* SaaS Brand Branding */}
      <div className="p-4 border-b border-slate-800/80 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Bug className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-sm text-white tracking-wide flex items-center gap-1">
            BugTracker <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400" />
          </h1>
          <p className="text-[10px] text-blue-400 font-medium">Auto-Assign & AI Engine</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Main Workspace
        </div>

        {navItems
          .filter((item) => item.roles.includes(role))
          .map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    item.highlight
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/20 font-semibold'
                      : isActive
                      ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
      </nav>

      {/* Footer Role Badge */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-xs">
          <Zap className="w-4 h-4 text-amber-400" />
          <div className="truncate">
            <p className="font-semibold text-slate-200">{role} Mode</p>
            <p className="text-[10px] text-slate-400 truncate">Permissions Active</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

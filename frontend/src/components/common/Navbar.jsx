import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useSocket } from '../../context/SocketContext';
import {
  Bell,
  Sun,
  Moon,
  LogOut,
  User as UserIcon,
  Shield,
  Search,
  CheckCircle2,
  Bug,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const { user, logout, demoLogin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadCount, clearNotifications } = useSocket();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  return (
    <header className="glass-navbar border-b border-slate-700/50 dark:border-slate-800 bg-slate-900/80 dark:bg-slate-900/90 text-slate-100 px-4 lg:px-6 py-3 flex items-center justify-between z-30">
      {/* Search Input Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search bugs by ID, title, developer, priority..."
            className="w-full bg-slate-800/80 dark:bg-slate-800/90 border border-slate-700/60 text-slate-200 placeholder-slate-400 text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Instant Role Selector Pill for Demo */}
        <div className="hidden md:flex items-center bg-slate-800/90 border border-slate-700 rounded-lg p-1 text-xs">
          <span className="px-2 text-slate-400 font-medium">Demo Role:</span>
          {['Admin', 'Developer', 'Tester', 'Reporter'].map((r) => (
            <button
              key={r}
              onClick={() => demoLogin(r)}
              className={`px-2 py-1 rounded-md transition-all font-semibold ${
                user?.role === r
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Dark/Light Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 transition-colors border border-slate-700/50"
          title="Toggle Dark / Light Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
        </button>

        {/* Real-time Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 transition-colors border border-slate-700/50 relative"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 glass-card bg-slate-800 border border-slate-700 p-3 shadow-2xl z-50">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-700">
                <span className="font-semibold text-xs uppercase tracking-wider text-slate-300 flex items-center gap-1">
                  <Bell className="w-3.5 h-3.5 text-blue-400" /> Real-time Alerts
                </span>
                {notifications.length > 0 && (
                  <button onClick={clearNotifications} className="text-xs text-blue-400 hover:underline">
                    Clear all
                  </button>
                )}
              </div>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No unread notifications</p>
                ) : (
                  notifications.map((n, i) => (
                    <div key={i} className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/50 text-xs">
                      <p className="font-semibold text-slate-200">{n.title}</p>
                      <p className="text-slate-400 mt-0.5">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-700"
          >
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'}
              alt="Avatar"
              className="w-8 h-8 rounded-full border border-blue-500 object-cover"
            />
            <div className="hidden sm:block text-left text-xs">
              <p className="font-semibold text-slate-200 leading-none">{user?.name || 'Guest User'}</p>
              <span className="text-[10px] font-medium text-blue-400">{user?.role || 'Reporter'}</span>
            </div>
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-48 glass-card bg-slate-800 border border-slate-700 p-2 shadow-2xl z-50">
              <div className="px-3 py-2 border-b border-slate-700 mb-1">
                <p className="text-xs font-semibold text-slate-200">{user?.name}</p>
                <p className="text-[10px] text-slate-400">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

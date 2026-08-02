import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bug, Lock, Mail, ArrowRight, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = async (role) => {
    setLoading(true);
    try {
      await demoLogin(role);
      navigate('/');
    } catch (err) {
      setError('Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Animated Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md glass-card bg-slate-900/80 border border-slate-800 p-8 shadow-2xl z-10"
      >
        {/* Logo Branding Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 mx-auto flex items-center justify-center shadow-lg shadow-blue-500/30 mb-3">
            <Bug className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center justify-center gap-1.5">
            Bug Tracker SaaS <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Detect • Log • Assign • Track • Resolve Bugs Automatically
          </p>
        </div>

        {/* Demo Fast Login Buttons */}
        <div className="mb-6 p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
          <span className="text-[11px] font-semibold text-slate-300 block mb-2 text-center uppercase tracking-wider">
            ⚡ One-Click Demo Role Access
          </span>
          <div className="grid grid-cols-2 gap-2">
            {[
              { role: 'Admin', color: 'from-amber-600 to-orange-600' },
              { role: 'Developer', color: 'from-blue-600 to-indigo-600' },
              { role: 'Tester', color: 'from-emerald-600 to-teal-600' },
              { role: 'Reporter', color: 'from-purple-600 to-pink-600' },
            ].map(({ role, color }) => (
              <button
                key={role}
                type="button"
                onClick={() => handleDemoClick(role)}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold text-white bg-gradient-to-r ${color} hover:brightness-110 shadow-sm transition-all text-center`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@bugtracker.system"
                className="w-full bg-slate-800/90 border border-slate-700 text-slate-100 text-xs rounded-lg pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-medium text-slate-300">Password</label>
              <Link to="/forgot-password" className="text-[11px] text-blue-400 hover:underline">
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-800/90 border border-slate-700 text-slate-100 text-xs rounded-lg pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-lg transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In to Workspace'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-400 font-medium hover:underline">
            Register here
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

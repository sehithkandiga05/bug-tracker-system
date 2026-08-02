import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Bug, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass-card bg-slate-900/80 border border-slate-800 p-8 shadow-2xl"
      >
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 mx-auto flex items-center justify-center shadow-lg shadow-blue-500/30 mb-3">
            <Bug className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-extrabold text-white">Reset Password</h1>
          <p className="text-xs text-slate-400 mt-1">We will send instructions to your email</p>
        </div>

        {submitted ? (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 mx-auto" />
            <p className="font-semibold text-slate-200">Reset Link Dispatched</p>
            <p className="text-slate-400">Check {email} for instructions to reset your account password.</p>
            <Link to="/login" className="inline-block mt-3 text-blue-400 font-medium hover:underline">
              Back to Login
            </Link>
          </div>
        ) : (
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

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-xs rounded-lg shadow-lg shadow-blue-600/30"
            >
              Send Reset Instructions
            </button>

            <div className="text-center">
              <Link to="/login" className="text-xs text-slate-400 hover:text-slate-200 flex items-center justify-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Return to Sign In
              </Link>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}

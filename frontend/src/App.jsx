import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import ProtectedRoute from './components/common/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

import Dashboard from './pages/Dashboard';
import KanbanView from './pages/KanbanView';
import BugList from './pages/BugList';
import BugDetail from './pages/BugDetail';
import BugReport from './pages/BugReport';
import DevDashboard from './pages/DevDashboard';
import AdminPanel from './pages/AdminPanel';

function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden min-h-[calc(100vh-57px)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Public Authentication Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Protected Workspace Layout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="kanban" element={<KanbanView />} />
        <Route path="bugs" element={<BugList />} />
        <Route path="bugs/:id" element={<BugDetail />} />
        <Route path="report" element={<BugReport />} />
        <Route
          path="dev-dashboard"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'Developer']}>
              <DevDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminPanel />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Fallback Catch-all Route */}
      <Route path="*" element={<Login />} />
    </Routes>
  );
}

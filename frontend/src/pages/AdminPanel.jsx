import React, { useEffect, useState } from 'react';
import API from '../api/axiosInstance';
import { ShieldCheck, Users, Trash2, Edit3, Save, AlertCircle } from 'lucide-react';

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await API.get('/users');
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (e) {
      console.error('Failed to load users', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole, newDept) => {
    try {
      const res = await API.put(`/users/${userId}/role`, {
        role: newRole,
        department: newDept,
      });
      if (res.data.success) {
        setUsers((prev) => prev.map((u) => (u._id === userId ? res.data.user : u)));
      }
    } catch (e) {
      alert('Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await API.delete(`/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (e) {
      alert('Failed to delete user');
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center text-slate-400 text-sm min-h-[60vh]">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading Administrative User Registry...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
          System Administration Panel <ShieldCheck className="w-5 h-5 text-amber-400" />
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage user accounts, assign developer roles, set department permissions, and audit access.
        </p>
      </div>

      <div className="glass-card bg-slate-900/60 border border-slate-800 overflow-hidden rounded-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" /> Registered System Users ({users.length})
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-700/80">
              <tr>
                <th className="p-3.5">User</th>
                <th className="p-3.5">Email</th>
                <th className="p-3.5">Role Permission</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-3.5 flex items-center gap-3">
                    <img
                      src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'}
                      alt="Avatar"
                      className="w-8 h-8 rounded-full border border-slate-600 object-cover"
                    />
                    <div>
                      <p className="font-semibold text-slate-100">{u.name}</p>
                      <p className="text-[10px] text-slate-500">ID: {u._id.toString().substring(0, 8)}</p>
                    </div>
                  </td>
                  <td className="p-3.5 text-slate-400">{u.email}</td>
                  <td className="p-3.5">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id, e.target.value, u.department)}
                      className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1 focus:outline-none"
                    >
                      <option value="Admin">Admin</option>
                      <option value="Developer">Developer</option>
                      <option value="Tester">Tester</option>
                      <option value="Reporter">Reporter</option>
                    </select>
                  </td>
                  <td className="p-3.5">
                    <select
                      value={u.department || 'General'}
                      onChange={(e) => handleRoleChange(u._id, u.role, e.target.value)}
                      className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1 focus:outline-none"
                    >
                      <option value="Frontend">Frontend</option>
                      <option value="Backend">Backend</option>
                      <option value="Database">Database</option>
                      <option value="DevOps">DevOps</option>
                      <option value="Mobile">Mobile</option>
                      <option value="QA">QA</option>
                      <option value="General">General</option>
                    </select>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => handleDeleteUser(u._id)}
                      className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded border border-rose-500/30 transition-colors"
                      title="Delete User"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, ArrowLeft, Search } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import api from '../../api/axios';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterRole !== 'all') params.set('role', filterRole);
      if (filterStatus !== 'all') params.set('status', filterStatus);
      const res = await api.get(`/admin/users?${params.toString()}`);
      setUsers(res.data.data.users || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filterRole, filterStatus]);

  const toggleUserStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await api.patch(`/admin/users/${userId}/status`, { status: newStatus });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Status update failed');
    }
  };

  const filteredUsers = users.filter((u) => {
    const query = searchQuery.toLowerCase();
    return (
      u.name?.toLowerCase().includes(query) ||
      u.email?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-yellow-50/40 flex flex-col justify-between text-slate-800">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="mb-6">
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800 transition mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                User Directory
              </h1>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Manage accounts, roles, and status
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-white border border-yellow-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-yellow-400 shadow-xs font-medium"
                />
              </div>

              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="bg-white border border-yellow-200 text-xs font-bold text-slate-700 rounded-xl px-3 py-1.5 focus:outline-none focus:border-yellow-400 shadow-xs cursor-pointer"
              >
                <option value="all">All Roles</option>
                <option value="customer">Customers</option>
                <option value="vendor">Vendors</option>
                <option value="admin">Admins</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-white border border-yellow-200 text-xs font-bold text-slate-700 rounded-xl px-3 py-1.5 focus:outline-none focus:border-yellow-400 shadow-xs cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="h-64 bg-white rounded-2xl border border-yellow-100 animate-pulse"></div>
        ) : filteredUsers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-yellow-200/90 p-10 text-center max-w-md mx-auto shadow-xs">
            <div className="w-12 h-12 rounded-full bg-yellow-100 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">No Users Found</h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-yellow-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-yellow-50/50 text-slate-600 uppercase font-bold text-[10px] border-b border-yellow-100">
                  <tr>
                    <th className="px-6 py-3.5">User</th>
                    <th className="px-6 py-3.5">Role</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Joined</th>
                    <th className="px-6 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-yellow-100/60">
                  {filteredUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-yellow-50/20 transition">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-yellow-100 text-amber-900 font-black flex items-center justify-center text-xs border border-yellow-200 flex-shrink-0">
                            {u.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-xs">{u.name}</h4>
                            <p className="text-[11px] text-slate-400 font-medium">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            u.role === 'admin'
                              ? 'bg-yellow-400 text-slate-950 border-yellow-500'
                              : u.role === 'vendor'
                              ? 'bg-yellow-100 text-amber-900 border-yellow-200'
                              : 'bg-white text-slate-700 border-yellow-200'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      <td className="px-6 py-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            u.status === 'active'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-rose-50 text-rose-800 border-rose-200'
                          }`}
                        >
                          {u.status || 'active'}
                        </span>
                      </td>

                      <td className="px-6 py-3.5 text-slate-500 font-medium">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-3.5 text-right">
                        {u.role !== 'admin' ? (
                          <button
                            onClick={() => toggleUserStatus(u._id, u.status || 'active')}
                            className={`px-3 py-1 rounded-xl text-xs font-bold transition shadow-xs ${
                              u.status === 'suspended'
                                ? 'bg-yellow-400 hover:bg-yellow-500 text-slate-950'
                                : 'bg-white hover:bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {u.status === 'suspended' ? 'Activate' : 'Suspend'}
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium italic">Admin</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

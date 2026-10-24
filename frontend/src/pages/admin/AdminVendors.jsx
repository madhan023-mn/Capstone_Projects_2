import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Store, ShieldCheck, ArrowLeft, CheckCircle, XCircle, AlertTriangle, Edit } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import api from '../../api/axios';

export default function AdminVendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const url = filterStatus !== 'all' ? `/admin/vendors?status=${filterStatus}` : '/admin/vendors';
      const res = await api.get(url);
      setVendors(res.data.data.vendors || []);
    } catch (err) {
      console.error('Failed to load vendors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, [filterStatus]);

  const handleStatusUpdate = async (vendorId, status, commissionRate) => {
    try {
      await api.patch(`/admin/vendors/${vendorId}/status`, { status, commissionRate });
      fetchVendors();
    } catch (err) {
      alert(err.response?.data?.message || 'Vendor update failed');
    }
  };

  return (
    <div className="min-h-screen bg-amber-50/30 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-semibold">
          <Link to="/admin/dashboard" className="hover:text-amber-600 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Admin Console
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-7 bg-amber-400 rounded-full"></div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Vendor Store Approvals & Governance
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1 ml-5">Review seller applications, adjust commission rates, and suspend stores</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 font-bold">Filter by:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white border-2 border-amber-300 text-xs font-black text-slate-900 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-400 cursor-pointer shadow-xs"
            >
              <option value="all">All Vendors</option>
              <option value="pending">Pending Approval</option>
              <option value="approved">Approved & Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="h-64 bg-white rounded-3xl border-2 border-amber-200/60 animate-pulse"></div>
        ) : vendors.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-amber-200/80 p-12 text-center max-w-md mx-auto shadow-md">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-300">
              <Store className="w-8 h-8" />
            </div>
            <h3 className="text-base font-black text-slate-900">No Vendors Found</h3>
            <p className="text-xs text-slate-500 mt-1">No vendors match the current filter selection.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border-2 border-amber-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 text-slate-800 uppercase font-black text-[10px] border-b border-amber-200">
                  <tr>
                    <th className="px-6 py-4">Store / Brand</th>
                    <th className="px-6 py-4">Contact</th>
                    <th className="px-6 py-4">Commission Rate</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Total Sales</th>
                    <th className="px-6 py-4 text-right">Administrative Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100/60">
                  {vendors.map((v) => (
                    <tr key={v._id} className="hover:bg-amber-50/30 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={v.logo || 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=150&q=80'}
                            alt=""
                            className="w-10 h-10 object-cover rounded-xl border border-amber-200 flex-shrink-0"
                          />
                          <div>
                            <h4 className="font-black text-slate-900 text-sm">{v.storeName}</h4>
                            <p className="text-[11px] text-slate-400">Owner: {v.user?.name}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-800">{v.storeEmail || v.user?.email}</p>
                        <p className="text-[11px] text-slate-500">{v.storePhone || v.user?.phone}</p>
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-black text-amber-950 bg-amber-100/80 border border-amber-200 px-2.5 py-1 rounded-lg">
                          {v.commissionRate || 10}%
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                            v.status === 'approved'
                              ? 'bg-amber-100 text-amber-950 border-amber-300'
                              : v.status === 'pending'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-red-100 text-red-800 border-red-200'
                          }`}
                        >
                          {v.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 font-black text-slate-900">
                        ${v.totalSales?.toFixed(2) || '0.00'}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {v.status !== 'approved' && (
                            <button
                              onClick={() => handleStatusUpdate(v._id, 'approved')}
                              className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black rounded-xl transition shadow-xs"
                            >
                              Approve
                            </button>
                          )}

                          {v.status === 'approved' && (
                            <button
                              onClick={() => handleStatusUpdate(v._id, 'suspended')}
                              className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition shadow-xs"
                            >
                              Suspend
                            </button>
                          )}

                          {v.status === 'suspended' && (
                            <button
                              onClick={() => handleStatusUpdate(v._id, 'approved')}
                              className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black rounded-xl transition shadow-xs"
                            >
                              Re-activate
                            </button>
                          )}
                        </div>
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

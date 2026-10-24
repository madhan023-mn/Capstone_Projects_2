import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  Package,
  ShoppingBag,
  TrendingUp,
  Plus,
  ArrowRight,
  Wallet
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import api from '../../api/axios';

export default function VendorDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/vendors/dashboard/stats');
      setData(res.data.data);
    } catch (err) {
      console.error('Failed to load vendor dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.patch(`/vendors/orders/${orderId}/status`, { status: newStatus });
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not update status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-yellow-50/40 flex flex-col justify-between">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center flex-1">
          <div className="inline-block w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 mt-3 font-semibold">Loading metrics...</p>
        </div>
        <Footer />
      </div>
    );
  }

  const vendor = data?.vendor;
  const stats = data?.stats || {};
  const recentOrders = data?.recentOrders || [];

  return (
    <div className="min-h-screen bg-yellow-50/40 flex flex-col justify-between text-slate-800">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Vendor Header (Light Yellow & White Theme) */}
        <div className="bg-white rounded-2xl border border-yellow-200/90 shadow-xs p-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={vendor?.logo || 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=300&q=80'}
              alt=""
              className="w-14 h-14 rounded-2xl object-cover border border-yellow-200"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900">{vendor?.storeName}</h1>
                <span className="bg-yellow-100 text-yellow-900 border border-yellow-300 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                  Verified
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">{vendor?.description}</p>
              <div className="mt-1 flex items-center gap-2 text-xs text-slate-600 font-semibold">
                <span className="text-amber-700">★ {vendor?.rating} Rating</span>
                <span className="text-slate-300">•</span>
                <span>Commission: {vendor?.commissionRate || 10}%</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Link
              to="/vendor/products/new"
              className="px-4 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-black text-xs transition shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" /> Add Product
            </Link>
            <Link
              to="/vendor/products"
              className="px-4 py-2 rounded-xl bg-white hover:bg-yellow-50 text-slate-900 border border-yellow-300 font-bold text-xs transition shadow-xs flex items-center gap-1.5"
            >
              <Package className="w-4 h-4 text-amber-700" /> Manage Catalog
            </Link>
            <Link
              to="/vendor/earnings"
              className="px-4 py-2 rounded-xl bg-yellow-50 hover:bg-yellow-100 text-slate-900 border border-yellow-200 font-bold text-xs transition shadow-xs flex items-center gap-1.5"
            >
              <Wallet className="w-4 h-4 text-amber-700" /> Payouts & Ledger
            </Link>
          </div>
        </div>

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-yellow-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gross Sales</span>
              <div className="w-8 h-8 rounded-xl bg-yellow-100 text-amber-800 flex items-center justify-center font-bold">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900">
              ${stats.totalGrossSales?.toFixed(2) || '0.00'}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-yellow-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Net Earnings</span>
              <div className="w-8 h-8 rounded-xl bg-yellow-100 text-amber-800 flex items-center justify-center font-bold">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900">
              ${stats.totalNetEarnings?.toFixed(2) || '0.00'}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-yellow-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Orders</span>
              <div className="w-8 h-8 rounded-xl bg-yellow-100 text-amber-800 flex items-center justify-center font-bold">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900">
              {stats.totalOrders || 0}
            </p>
            <p className="text-[11px] text-amber-700 font-bold mt-1">
              {stats.pendingOrdersCount || 0} pending fulfillment
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-yellow-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Products</span>
              <div className="w-8 h-8 rounded-xl bg-yellow-100 text-amber-800 flex items-center justify-center font-bold">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900">
              {stats.totalProducts || 0}
            </p>
          </div>
        </div>

        {/* Recent Suborders Fulfillment Table */}
        <div className="bg-white rounded-2xl border border-yellow-200/90 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-yellow-100 bg-yellow-50/50 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Customer Orders</h2>
              <p className="text-xs text-slate-500 mt-0.5">Manage fulfillment statuses</p>
            </div>
            <Link to="/vendor/orders" className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="p-10 text-center text-xs text-slate-500 font-medium">
              No orders received yet. Items purchased from your store will appear here.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white text-slate-500 uppercase font-bold text-[10px] border-b border-yellow-100">
                  <tr>
                    <th className="px-6 py-3.5">Date</th>
                    <th className="px-6 py-3.5">Items</th>
                    <th className="px-6 py-3.5">Subtotal</th>
                    <th className="px-6 py-3.5">Net Payout</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Update Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-yellow-100/60">
                  {recentOrders.map((ord) => (
                    <tr key={ord._id} className="hover:bg-yellow-50/20 transition">
                      <td className="px-6 py-4 font-medium text-slate-500">
                        {new Date(ord.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {ord.items?.map((it, idx) => (
                            <p key={idx} className="font-bold text-slate-900 truncate max-w-xs">
                              {it.quantity}× {it.title}
                            </p>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        ${ord.subtotal?.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 font-black text-slate-950">
                        ${ord.vendorNetTotal?.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-yellow-100 text-yellow-900 border border-yellow-200">
                          {ord.fulfillmentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <select
                          value={ord.fulfillmentStatus}
                          onChange={(e) => handleUpdateStatus(ord._id, e.target.value)}
                          className="bg-white border border-yellow-300 rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none cursor-pointer"
                        >
                          <option value="placed">Placed</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="packed">Packed</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowLeft, Truck, CheckCircle, Clock } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import api from '../../api/axios';

export default function VendorOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/vendors/orders');
      setOrders(res.data.data.orders || []);
    } catch (err) {
      console.error('Failed to load vendor orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.patch(`/vendors/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Status update failed');
    }
  };

  return (
    <div className="min-h-screen bg-amber-50/30 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-4 font-semibold">
          <Link to="/vendor/dashboard" className="hover:text-amber-600 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-2 h-7 bg-amber-400 rounded-full"></div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Fulfillment & Merchant Suborders
          </h1>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-44 bg-white rounded-3xl border-2 border-amber-200/60 animate-pulse"></div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-amber-200/80 p-12 text-center max-w-md mx-auto shadow-md">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-300">
              <Package className="w-8 h-8" />
            </div>
            <h3 className="text-base font-black text-slate-900">No Suborders Assigned Yet</h3>
            <p className="text-xs text-slate-500 mt-1">When customers buy products from your store, fulfillment tickets will appear here.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((suborder) => (
              <div
                key={suborder._id}
                className="bg-white rounded-3xl border-2 border-amber-200/80 shadow-sm overflow-hidden"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 px-6 py-4 border-b border-amber-200 flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div className="flex flex-wrap gap-6">
                    <div>
                      <span className="text-slate-400 block uppercase font-black text-[10px]">Master Order</span>
                      <span className="font-bold text-slate-900 font-mono">
                        #{suborder.masterOrder?.orderNumber || suborder._id.slice(-8)}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block uppercase font-black text-[10px]">Gross Sale</span>
                      <span className="font-black text-slate-900">${suborder.subtotal?.toFixed(2)}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block uppercase font-black text-[10px]">Platform Fee</span>
                      <span className="font-bold text-red-600">-${suborder.commissionTotal?.toFixed(2)}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block uppercase font-black text-[10px]">Your Net Payout</span>
                      <span className="font-black text-emerald-600">${suborder.vendorNetTotal?.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Status Dropdown */}
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-800">Fulfillment Status:</span>
                    <select
                      value={suborder.fulfillmentStatus}
                      onChange={(e) => handleStatusChange(suborder._id, e.target.value)}
                      className="bg-white border-2 border-amber-300 text-slate-950 font-black rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-amber-400 cursor-pointer shadow-xs"
                    >
                      <option value="placed">Placed</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="packed">Packed</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Suborder Items */}
                <div className="p-6 divide-y divide-amber-100/60">
                  {suborder.items?.map((it, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-4">
                        <img
                          src={it.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=150&q=80'}
                          alt=""
                          className="w-12 h-12 object-cover rounded-xl border border-amber-200"
                        />
                        <div>
                          <h4 className="text-xs font-black text-slate-900">{it.title}</h4>
                          <p className="text-[11px] text-slate-500">
                            Quantity: {it.quantity} × ${it.price.toFixed(2)} (Fee: {it.commissionPercent}%)
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-black text-slate-900">
                          ${(it.price * it.quantity).toFixed(2)}
                        </span>
                        <p className="text-[10px] text-emerald-600 font-bold">
                          Net: ${it.vendorPayout?.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

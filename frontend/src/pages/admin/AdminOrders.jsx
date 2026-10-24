import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowLeft, Store, Search } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import api from '../../api/axios';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/orders');
      setOrders(res.data.data.orders || []);
    } catch (err) {
      console.error('Failed to load admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((o) => {
    const term = searchQuery.toLowerCase();
    return (
      o.orderNumber?.toLowerCase().includes(term) ||
      o.customer?.name?.toLowerCase().includes(term) ||
      o.customer?.email?.toLowerCase().includes(term)
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
                Order Management
              </h1>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Track marketplace transactions and vendor fulfillments
              </p>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-4 py-1.5 bg-white border border-yellow-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-yellow-400 shadow-xs font-medium"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="h-64 bg-white rounded-2xl border border-yellow-100 animate-pulse"></div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-yellow-200/90 p-10 text-center max-w-md mx-auto shadow-xs">
            <div className="w-12 h-12 rounded-full bg-yellow-100 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">No Orders Found</h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">New orders will show up here automatically.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredOrders.map((ord) => (
              <div
                key={ord._id}
                className="bg-white rounded-2xl border border-yellow-200/90 shadow-xs overflow-hidden"
              >
                {/* Master Header */}
                <div className="bg-yellow-50/50 px-6 py-3.5 border-b border-yellow-100 flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div className="flex flex-wrap gap-5 items-center">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Order</span>
                      <span className="font-mono font-bold text-slate-900">#{ord.orderNumber}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Customer</span>
                      <span className="font-bold text-slate-900">
                        {ord.customer?.name || ord.shippingAddress?.fullName || 'Buyer'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Total</span>
                      <span className="font-black text-slate-950">${ord.grandTotal?.toFixed(2)}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Payment</span>
                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-bold text-[10px]">
                        {ord.paymentStatus?.toUpperCase() || 'PAID'}
                      </span>
                    </div>
                  </div>

                  <Link
                    to={`/orders/${ord._id}`}
                    className="px-3.5 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-slate-950 rounded-xl font-bold text-xs transition shadow-xs"
                  >
                    View Details
                  </Link>
                </div>

                {/* Suborders breakdown for this master order */}
                <div className="p-5 space-y-3">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Vendor Suborders ({ord.vendorOrders?.length || 0})
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {ord.vendorOrders?.map((vo, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-yellow-50/20 border border-yellow-200/70 space-y-1.5 text-xs"
                      >
                        <div className="flex items-center justify-between pb-1.5 border-b border-yellow-100 font-bold">
                          <span className="flex items-center gap-1.5 text-slate-900">
                            <Store className="w-3.5 h-3.5 text-amber-600" />
                            {vo.vendor?.storeName || 'Merchant'}
                          </span>
                          <span className="text-[10px] font-bold uppercase text-yellow-900 bg-yellow-100 px-2 py-0.5 rounded-full">
                            {vo.fulfillmentStatus || 'placed'}
                          </span>
                        </div>

                        <div className="flex justify-between text-slate-600">
                          <span>Subtotal:</span>
                          <span className="font-bold text-slate-900">${vo.subtotal?.toFixed(2)}</span>
                        </div>

                        <div className="flex justify-between text-slate-600">
                          <span>Commission:</span>
                          <span className="font-bold text-amber-700">+${vo.commissionTotal?.toFixed(2)}</span>
                        </div>

                        <div className="flex justify-between text-slate-600 pt-1 border-t border-yellow-100 font-bold">
                          <span>Vendor Net:</span>
                          <span className="font-bold text-slate-950">${vo.vendorNetTotal?.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
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

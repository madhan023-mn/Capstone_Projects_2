import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowRight, Calendar, CheckCircle, Clock } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import api from '../../api/axios';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await api.get('/orders/my-orders');
        setOrders(res.data.data.orders || []);
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen bg-amber-50/30 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-2 h-7 bg-amber-400 rounded-full"></div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Your Orders & Invoices
          </h1>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 bg-white rounded-3xl border-2 border-amber-200/60 animate-pulse"></div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-amber-200/80 p-12 text-center max-w-md mx-auto shadow-md">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-300">
              <Package className="w-8 h-8" />
            </div>
            <h3 className="text-base font-black text-slate-900">No Orders Yet</h3>
            <p className="text-xs text-slate-500 mt-1">When you place orders across our independent stores, they will appear here.</p>
            <Link
              to="/products"
              className="mt-5 inline-block px-8 py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-md shadow-amber-400/20 transition"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((ord) => (
              <div
                key={ord._id}
                className="bg-white rounded-3xl border-2 border-amber-200/80 shadow-sm overflow-hidden"
              >
                {/* Header Strip */}
                <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 px-6 py-4 border-b border-amber-200 flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div className="flex flex-wrap gap-6">
                    <div>
                      <span className="text-slate-400 block uppercase font-black text-[10px]">Order Placed</span>
                      <span className="font-bold text-slate-900">
                        {new Date(ord.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block uppercase font-black text-[10px]">Total Amount</span>
                      <span className="font-black text-slate-950">${ord.grandTotal?.toFixed(2)}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block uppercase font-black text-[10px]">Ship To</span>
                      <span className="font-bold text-slate-900">{ord.shippingAddress?.fullName}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-600 text-xs font-bold bg-white px-2.5 py-1 rounded-lg border border-amber-200">#{ord.orderNumber}</span>
                    <Link
                      to={`/orders/${ord._id}`}
                      className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-xl font-black text-xs transition flex items-center gap-1.5 shadow-xs"
                    >
                      Track & Invoice <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Items preview */}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-amber-100/80 text-amber-900 border border-amber-200 text-[11px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      Status: {ord.orderStatus?.toUpperCase()}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      • {ord.vendorOrders?.length || 1} Merchant Suborders
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {ord.itemsSummary?.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-amber-50/30 rounded-2xl border border-amber-200/70">
                        <img
                          src={item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=150&q=80'}
                          alt=""
                          className="w-12 h-12 object-cover rounded-xl border border-amber-200 flex-shrink-0"
                        />
                        <div className="overflow-hidden">
                          <h4 className="text-xs font-black text-slate-900 truncate">{item.title}</h4>
                          <p className="text-[10px] text-slate-500">Qty: {item.quantity} • Sold by <strong className="text-slate-700">{item.vendorName}</strong></p>
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

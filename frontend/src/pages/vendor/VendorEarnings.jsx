import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, ArrowLeft, TrendingUp, CheckCircle, Download } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import api from '../../api/axios';

export default function VendorEarnings() {
  const [vendorData, setVendorData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [dashRes, ordersRes] = await Promise.all([
          api.get('/vendors/dashboard'),
          api.get('/vendors/orders'),
        ]);
        setVendorData(dashRes.data.data.vendor);
        setOrders(ordersRes.data.data.orders || []);
      } catch (err) {
        console.error('Failed to load earnings data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const grossSales = orders.reduce((sum, o) => sum + (o.subtotal || 0), 0);
  const totalCommission = orders.reduce((sum, o) => sum + (o.commissionTotal || 0), 0);
  const netEarnings = orders.reduce((sum, o) => sum + (o.vendorNetTotal || 0), 0);

  const handleExportCSV = () => {
    if (!orders.length) {
      alert('No orders available to export.');
      return;
    }
    const headers = ['Order ID', 'Date', 'Gross Subtotal', 'Platform Fee', 'Net Amount', 'Status'];
    const rows = orders.map((o) => [
      o.masterOrder?.orderNumber || o._id,
      new Date(o.createdAt).toLocaleDateString(),
      (o.subtotal || 0).toFixed(2),
      (o.commissionTotal || 0).toFixed(2),
      (o.vendorNetTotal || 0).toFixed(2),
      o.fulfillmentStatus || 'Pending'
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `vendor_earnings_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-yellow-50/40 flex flex-col justify-between text-slate-800">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Navigation & Header */}
        <div className="mb-6">
          <Link
            to="/vendor/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800 transition mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Vendor Dashboard
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Earnings & Payouts
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                Review your net earnings and sales breakdown
              </p>
            </div>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-black rounded-xl text-xs shadow-xs transition"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* 3 Clean Financial KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <div className="bg-white rounded-2xl border border-yellow-200/90 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gross Sales</span>
              <div className="w-8 h-8 rounded-xl bg-yellow-100 text-amber-800 flex items-center justify-center font-bold">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900">${grossSales.toFixed(2)}</p>
          </div>

          <div className="bg-white rounded-2xl border border-yellow-200/90 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Platform Fees</span>
              <div className="w-8 h-8 rounded-xl bg-yellow-100 text-amber-800 flex items-center justify-center font-bold">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-amber-800">-${totalCommission.toFixed(2)}</p>
          </div>

          <div className="bg-white rounded-2xl border border-yellow-300 p-5 shadow-xs bg-gradient-to-br from-white to-yellow-50/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-amber-900 uppercase tracking-wider">Net Earnings</span>
              <div className="w-8 h-8 rounded-xl bg-yellow-400 text-slate-950 flex items-center justify-center font-bold">
                <CheckCircle className="w-4 h-4 stroke-[2.5]" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-950">${netEarnings.toFixed(2)}</p>
          </div>
        </div>

        {/* Clean Settlement Ledger */}
        <div className="bg-white rounded-2xl border border-yellow-200/90 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-yellow-100 bg-yellow-50/50 flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900">Order Settlements</h3>
            <span className="text-xs text-slate-500 font-medium">{orders.length} orders recorded</span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400 font-medium">
              Loading earnings ledger...
            </div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 font-medium">
              No orders fulfilled yet. Once customers purchase your items, earnings will appear here.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white text-slate-500 uppercase font-bold text-[10px] border-b border-yellow-100">
                  <tr>
                    <th className="px-6 py-3.5">Order</th>
                    <th className="px-6 py-3.5">Date</th>
                    <th className="px-6 py-3.5">Gross</th>
                    <th className="px-6 py-3.5">Platform Fee</th>
                    <th className="px-6 py-3.5">Net Payout</th>
                    <th className="px-6 py-3.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-yellow-100/60">
                  {orders.map((ord) => (
                    <tr key={ord._id} className="hover:bg-yellow-50/30 transition">
                      <td className="px-6 py-4 font-mono font-bold text-slate-900">
                        #{ord.masterOrder?.orderNumber || ord._id.slice(-8)}
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        {new Date(ord.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        ${ord.subtotal?.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 font-bold text-amber-800">
                        -${ord.commissionTotal?.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 font-black text-slate-950">
                        ${ord.vendorNetTotal?.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-yellow-100 text-yellow-900 border border-yellow-300">
                          {ord.fulfillmentStatus}
                        </span>
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

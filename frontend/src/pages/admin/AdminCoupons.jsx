import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Tag, Plus, Trash2, ArrowLeft, X } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import api from '../../api/axios';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    discountPercentage: 15,
    minOrderAmount: 50,
    maxDiscountAmount: 100,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await api.get('/coupons');
      setCoupons(res.data.data.coupons || []);
    } catch (err) {
      console.error('Failed to load coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await api.delete(`/coupons/${id}`);
      fetchCoupons();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete coupon failed');
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/coupons', {
        code: formData.code.toUpperCase().trim(),
        discountPercentage: Number(formData.discountPercentage),
        minOrderAmount: Number(formData.minOrderAmount),
        maxDiscountAmount: Number(formData.maxDiscountAmount),
        expiresAt: new Date(formData.expiresAt),
      });
      setShowCreateModal(false);
      setFormData({
        code: '',
        discountPercentage: 15,
        minOrderAmount: 50,
        maxDiscountAmount: 100,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
      fetchCoupons();
    } catch (err) {
      alert(err.response?.data?.message || 'Coupon creation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

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
                Discount Coupons
              </h1>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Create and manage customer promo codes
              </p>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-black text-xs transition shadow-xs"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" /> Create Coupon
            </button>
          </div>
        </div>

        {loading ? (
          <div className="h-64 bg-white rounded-2xl border border-yellow-100 animate-pulse"></div>
        ) : coupons.length === 0 ? (
          <div className="bg-white rounded-2xl border border-yellow-200/90 p-10 text-center max-w-md mx-auto shadow-xs">
            <div className="w-12 h-12 rounded-full bg-yellow-100 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <Tag className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">No Coupons Available</h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">Create your first marketplace promo coupon.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 px-5 py-2 bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition"
            >
              Add Coupon
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {coupons.map((c) => (
              <div
                key={c._id}
                className="bg-white rounded-2xl border border-yellow-200/90 p-5 shadow-xs hover:border-yellow-400 hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-yellow-100 mb-3">
                    <span className="font-mono text-sm font-black text-amber-900 bg-yellow-100 px-2.5 py-1 rounded-lg border border-yellow-200">
                      {c.code}
                    </span>
                    <button
                      onClick={() => handleDelete(c._id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Discount:</span>
                      <span className="text-base font-black text-slate-900">{c.discountPercentage}% OFF</span>
                    </div>

                    <div className="flex justify-between items-center text-slate-600">
                      <span>Min Order:</span>
                      <span className="font-bold text-slate-900">${c.minOrderAmount || 0}</span>
                    </div>

                    <div className="flex justify-between items-center text-slate-600">
                      <span>Expires:</span>
                      <span className="font-medium text-slate-700">
                        {new Date(c.expiresAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-yellow-100 flex items-center justify-between text-[11px]">
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Active
                  </span>
                  <span className="text-slate-400 font-mono">Used: {c.usageCount || 0}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Coupon Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl border border-yellow-300 max-w-md w-full p-5 sm:p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-2 border-b border-yellow-100">
                <h3 className="text-sm font-bold text-slate-900">Create New Coupon</h3>
                <button onClick={() => setShowCreateModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-yellow-50" title="Close"><X className="w-4 h-4" /></button>
              </div>

              <form onSubmit={handleCreateCoupon} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Coupon Code
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. SAVE20"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full bg-white border border-yellow-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-yellow-400 uppercase"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Discount %
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="90"
                      required
                      value={formData.discountPercentage}
                      onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })}
                      className="w-full bg-white border border-yellow-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-yellow-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Min Order ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={formData.minOrderAmount}
                      onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                      className="w-full bg-white border border-yellow-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-yellow-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                    className="w-full bg-white border border-yellow-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-yellow-400"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-xl border border-yellow-200 bg-white hover:bg-yellow-50 text-slate-700 font-bold text-xs transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-black text-xs transition shadow-xs disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Coupon'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layers, Plus, Trash2, ArrowLeft, Percent, Save, X } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import api from '../../api/axios';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Category Modal Form state
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [commissionPercentage, setCommissionPercentage] = useState(10);
  const [iconUrl, setIconUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/categories');
      setCategories(res.data.data.categories || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/categories', {
        name,
        description,
        commissionPercentage: Number(commissionPercentage),
        iconUrl: iconUrl || undefined,
      });
      setShowModal(false);
      setName('');
      setDescription('');
      setIconUrl('');
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not create category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateCommission = async (id, newPercent) => {
    try {
      await api.put(`/categories/${id}`, {
        commissionPercentage: Number(newPercent),
      });
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to remove this category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-medium">
          <Link to="/admin/dashboard" className="hover:text-amber-600 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Admin Console
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Categories & Commission Rates
            </h1>
            <p className="text-xs text-slate-500 mt-1">Configure marketplace departments and baseline transaction fees</p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs transition shadow-xs flex items-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" /> Add New Category
          </button>
        </div>

        {loading ? (
          <div className="h-64 bg-white rounded-2xl border border-slate-200 animate-pulse"></div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3.5">Department</th>
                    <th className="px-6 py-3.5">URL Slug</th>
                    <th className="px-6 py-3.5">Description</th>
                    <th className="px-6 py-3.5">Platform Commission Fee</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {categories.map((c) => (
                    <tr key={c._id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={c.iconUrl || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=150&q=80'}
                            alt=""
                            className="w-10 h-10 object-cover rounded-xl border border-slate-100 flex-shrink-0"
                          />
                          <span className="font-bold text-slate-900 text-sm">{c.name}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4 font-mono text-slate-500 text-[11px]">
                        {c.slug}
                      </td>

                      <td className="px-6 py-4 text-slate-600 max-w-xs truncate">
                        {c.description || 'General department category'}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            defaultValue={c.commissionPercentage}
                            onBlur={(e) => {
                              if (e.target.value !== String(c.commissionPercentage)) {
                                handleUpdateCommission(c._id, e.target.value);
                              }
                            }}
                            className="w-16 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-900 focus:outline-none"
                          />
                          <span className="font-bold text-slate-600">%</span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteCategory(c._id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 transition"
                          title="Delete Category"
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
        )}

        {/* Modal: Add Category */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <h3 className="text-base font-bold text-slate-900">Add Marketplace Department</h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateCategory} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="E.g. Video Games & Consoles"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Short description of items in this department"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-900 focus:outline-none"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Commission Rate (%)</label>
                  <input
                    type="number"
                    value={commissionPercentage}
                    onChange={(e) => setCommissionPercentage(e.target.value)}
                    required
                    min="0"
                    max="100"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Icon / Banner Image URL</label>
                  <input
                    type="url"
                    value={iconUrl}
                    onChange={(e) => setIconUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-xl text-xs font-black transition shadow-xs"
                  >
                    {submitting ? 'Creating...' : 'Create Category'}
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

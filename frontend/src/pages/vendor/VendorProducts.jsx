import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Package, ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import api from '../../api/axios';

export default function VendorProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products/vendor/my-products');
      setProducts(res.data.data.products || []);
    } catch (err) {
      console.error('Failed to load vendor products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this product from the catalog?')) return;
    try {
      await api.delete(`/products/${id}`);
      fetchMyProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const toggleActive = async (id, currentVal) => {
    try {
      await api.put(`/products/${id}`, { isActive: !currentVal });
      fetchMyProducts();
    } catch (err) {
      alert('Could not update status');
    }
  };

  return (
    <div className="min-h-screen bg-amber-50/30 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-semibold">
              <Link to="/vendor/dashboard" className="hover:text-amber-600 flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-7 bg-amber-400 rounded-full"></div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Manage Store Products
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1 ml-5">
              Add, update prices, manage stock, and toggle active status
            </p>
          </div>

          <Link
            to="/vendor/products/new"
            className="px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-500 active:scale-95 text-slate-950 font-black text-xs transition shadow-md shadow-amber-400/25 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add New Product
          </Link>
        </div>

        {loading ? (
          <div className="h-64 bg-white rounded-3xl border-2 border-amber-200/60 animate-pulse"></div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-amber-200/80 p-12 text-center max-w-md mx-auto shadow-md">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-300">
              <Package className="w-8 h-8" />
            </div>
            <h3 className="text-base font-black text-slate-900">No products listed</h3>
            <p className="text-xs text-slate-500 mt-1">Add your first product to start selling on MarketVerse.</p>
            <Link
              to="/vendor/products/new"
              className="mt-5 inline-block px-8 py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-md shadow-amber-400/20 transition"
            >
              Add Product
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border-2 border-amber-200/80 shadow-sm overflow-hidden">
            {/* Mobile Card List (< md) */}
            <div className="md:hidden divide-y divide-amber-100/60">
              {products.map((prod) => (
                <div key={prod._id} className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <img
                      src={prod.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=150&q=80'}
                      alt=""
                      className="w-14 h-14 object-cover rounded-xl border border-amber-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <Link to={`/products/${prod._id}`} className="font-bold text-xs text-slate-900 hover:text-amber-600 line-clamp-2">
                        {prod.title}
                      </Link>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                        <span className="font-mono">SKU: {prod.sku}</span>
                        <span>•</span>
                        <span className="font-semibold text-slate-700">{prod.category?.name || 'Category'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-amber-100/60">
                    <div>
                      <span className="font-black text-slate-900 text-sm">${(prod.salePrice || prod.price).toFixed(2)}</span>
                      {prod.salePrice && (
                        <span className="ml-1 text-[10px] text-slate-400 line-through">${prod.price.toFixed(2)}</span>
                      )}
                    </div>

                    <span className={`text-[11px] font-bold ${prod.stock < 5 ? 'text-red-600' : 'text-slate-700'}`}>
                      {prod.stock} in stock
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => toggleActive(prod._id, prod.isActive)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase transition border ${
                        prod.isActive
                          ? 'bg-amber-100 text-amber-950 border-amber-300'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {prod.isActive ? 'Active' : 'Hidden'}
                    </button>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/vendor/products/${prod._id}/edit`}
                        className="p-1.5 rounded-lg border border-amber-200 text-slate-700 hover:text-amber-600 hover:bg-amber-50"
                        title="Edit"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(prod._id)}
                        className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View (>= md) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 text-slate-800 uppercase font-black text-[10px] border-b border-amber-200">
                  <tr>
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Stock</th>
                    <th className="px-6 py-4">Active</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100/60">
                  {products.map((prod) => (
                    <tr key={prod._id} className="hover:bg-amber-50/30 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=150&q=80'}
                            alt=""
                            className="w-12 h-12 object-cover rounded-xl border border-amber-200 flex-shrink-0"
                          />
                          <div>
                            <Link to={`/products/${prod._id}`} className="font-bold text-slate-900 hover:text-amber-600 block line-clamp-1 max-w-xs">
                              {prod.title}
                            </Link>
                            <span className="text-[10px] text-slate-400 font-mono">SKU: {prod.sku}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 font-bold text-slate-700">
                        {prod.category?.name || 'Department'}
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-black text-slate-900">${(prod.salePrice || prod.price).toFixed(2)}</span>
                        {prod.salePrice && (
                          <span className="block text-[10px] text-slate-400 line-through">${prod.price.toFixed(2)}</span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span className={`font-black ${prod.stock < 5 ? 'text-red-600' : 'text-slate-900'}`}>
                          {prod.stock} units
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleActive(prod._id, prod.isActive)}
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase transition border ${
                            prod.isActive
                              ? 'bg-amber-100 text-amber-950 border-amber-300'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {prod.isActive ? 'Active' : 'Hidden'}
                        </button>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/vendor/products/${prod._id}/edit`}
                            className="p-2 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(prod._id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

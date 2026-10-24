import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Package, ArrowLeft, Upload, Save, Sparkles, Image as ImageIcon } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import api from '../../api/axios';

export default function VendorProductForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    brand: '',
    category: '',
    price: '',
    salePrice: '',
    stock: 25,
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80',
    featured: false,
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        const catRes = await api.get('/categories');
        const cats = catRes.data.data.categories || [];
        setCategories(cats);

        if (cats.length > 0 && !formData.category) {
          setFormData((prev) => ({ ...prev, category: cats[0]._id }));
        }

        if (isEditing) {
          const prodRes = await api.get(`/products/${id}`);
          const p = prodRes.data.data.product;
          setFormData({
            title: p.title || '',
            brand: p.brand || '',
            category: p.category?._id || p.category || '',
            price: p.price || '',
            salePrice: p.salePrice || '',
            stock: p.stock || 0,
            description: p.description || '',
            imageUrl: p.images?.[0] || '',
            featured: p.featured || false,
          });
        }
      } catch (err) {
        console.error('Initialization error:', err);
      }
    };

    init();
  }, [id, isEditing]);

  const handleChange = (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: val });
  };

  const handleDemoFill = () => {
    setFormData({
      title: 'Ultra-HD Smart Fitness Watch with Heart & SpO2 Sensor',
      brand: 'PulseTech',
      category: categories[0]?._id || '',
      price: '199.99',
      salePrice: '149.99',
      stock: 30,
      description: 'Comprehensive fitness tracking smartwatch with vibrant AMOLED always-on display, waterproof rating 5ATM, and 14-day continuous battery life.',
      imageUrl: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=800&q=80',
      featured: true,
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append('image', file);

    setUploadingImage(true);
    try {
      const res = await api.post('/upload/image', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFormData((prev) => ({ ...prev, imageUrl: res.data.data.url }));
    } catch (err) {
      alert(err.response?.data?.message || 'Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      const payload = {
        title: formData.title,
        brand: formData.brand,
        category: formData.category,
        price: Number(formData.price),
        salePrice: formData.salePrice ? Number(formData.salePrice) : undefined,
        stock: Number(formData.stock),
        description: formData.description,
        images: formData.imageUrl ? [formData.imageUrl] : undefined,
        featured: formData.featured,
      };

      if (isEditing) {
        await api.put(`/products/${id}`, payload);
      } else {
        await api.post('/products', payload);
      }

      navigate('/vendor/products');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Could not save product');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-amber-50/30 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-6 font-semibold">
          <Link to="/vendor/products" className="hover:text-amber-600 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Products
          </Link>
          <span>/</span>
          <span className="text-slate-950 font-black">
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </span>
        </div>

        <div className="bg-white rounded-3xl border-2 border-amber-200/80 shadow-md p-6 sm:p-10">
          <div className="flex items-center justify-between pb-6 border-b border-amber-100 mb-8">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-7 bg-amber-400 rounded-full"></div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  {isEditing ? 'Edit Product Listing' : 'Create Product Listing'}
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1 ml-5">Provide clear specifications and pricing for customers</p>
            </div>
            {!isEditing && (
              <button
                type="button"
                onClick={handleDemoFill}
                className="px-4 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 font-black text-xs flex items-center gap-1.5 transition shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                1-Click Demo Fill
              </button>
            )}
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border-2 border-red-200 text-red-700 text-xs font-bold">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1">
                Product Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="E.g. Apple MacBook Air 15-inch M3 Chip"
                className="w-full bg-amber-50/20 border-2 border-amber-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1">
                  Brand Name
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  required
                  placeholder="E.g. Sony, Apple, Nike"
                  className="w-full bg-amber-50/20 border-2 border-amber-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1">
                  Category Department
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full bg-amber-50/20 border-2 border-amber-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.commissionPercentage}% fee)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1">
                  Regular Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  placeholder="399.99"
                  className="w-full bg-amber-50/20 border-2 border-amber-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1">
                  Sale Price ($ Optional)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="salePrice"
                  value={formData.salePrice}
                  onChange={handleChange}
                  placeholder="349.99"
                  className="w-full bg-amber-50/20 border-2 border-amber-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1">
                  Inventory Stock Units
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full bg-amber-50/20 border-2 border-amber-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Image Upload & Preview */}
            <div className="space-y-3">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-800">
                Product Image (Upload or Direct URL)
              </label>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-24 h-24 rounded-2xl border-2 border-amber-200 bg-amber-50/30 overflow-hidden flex items-center justify-center flex-shrink-0">
                  {formData.imageUrl ? (
                    <img src={formData.imageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-amber-300" />
                  )}
                </div>

                <div className="flex-1 w-full space-y-2">
                  <input
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-amber-50/20 border-2 border-amber-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-amber-400"
                  />
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer px-4 py-2 bg-white hover:bg-amber-50 text-slate-900 text-xs font-black rounded-xl border-2 border-amber-300 flex items-center gap-1.5 transition shadow-xs">
                      <Upload className="w-3.5 h-3.5 text-amber-600" />
                      {uploadingImage ? 'Uploading Image...' : 'Choose File to Upload'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    <span className="text-[11px] text-slate-500 font-medium">PNG, JPG, or WEBP up to 5MB</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1">
                Detailed Product Description
              </label>
              <textarea
                rows={5}
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="Describe key features, box contents, and specifications..."
                className="w-full bg-amber-50/20 border-2 border-amber-200 rounded-xl p-3 text-xs text-slate-900 font-medium focus:outline-none focus:border-amber-400 leading-relaxed"
              ></textarea>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="featured"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
                className="w-4 h-4 rounded border-amber-300 text-amber-500 focus:ring-amber-400"
              />
              <label htmlFor="featured" className="text-xs font-bold text-slate-800 cursor-pointer">
                Feature on Marketplace Homepage Showcase
              </label>
            </div>

            <div className="pt-4 border-t-2 border-amber-100 flex items-center justify-end gap-3">
              <Link
                to="/vendor/products"
                className="px-6 py-2.5 rounded-2xl border-2 border-amber-300 bg-white hover:bg-amber-50 text-slate-950 font-black text-xs transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="px-7 py-3 rounded-2xl bg-amber-400 hover:bg-amber-500 active:scale-95 text-slate-950 font-black text-xs transition shadow-md shadow-amber-400/25 flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {submitting ? 'Saving Product...' : isEditing ? 'Update Listing' : 'Publish to Catalog'}
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}

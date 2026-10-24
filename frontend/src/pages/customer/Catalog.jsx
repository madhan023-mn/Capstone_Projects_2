import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Filter, Star, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ProductCard from '../../components/ProductCard';
import api from '../../api/axios';

export default function Catalog() {
  const location = useLocation();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Filter States
  const searchParams = new URLSearchParams(location.search);
  const currentQuery = searchParams.get('q') || '';
  const currentCategory = searchParams.get('category') || 'all';
  const currentSort = searchParams.get('sort') || 'newest';
  const currentRating = searchParams.get('rating') || '';
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Fetch Categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data.data.categories || []);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch Products whenever query parameters change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (currentQuery) params.set('q', currentQuery);
        if (currentCategory && currentCategory !== 'all') params.set('category', currentCategory);
        if (currentSort) params.set('sort', currentSort);
        if (currentRating) params.set('rating', currentRating);
        if (currentMinPrice) params.set('minPrice', currentMinPrice);
        if (currentMaxPrice) params.set('maxPrice', currentMaxPrice);

        const res = await api.get(`/products?${params.toString()}`);
        setProducts(res.data.data.products || []);
        setTotalCount(res.data.totalCount || 0);
      } catch (err) {
        console.error('Failed to query products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [location.search]);

  const updateParam = (key, value) => {
    const params = new URLSearchParams(location.search);
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    navigate(`/products?${params.toString()}`);
  };

  const clearAllFilters = () => {
    navigate('/products');
  };

  return (
    <div className="min-h-screen bg-amber-50/30 flex flex-col justify-between">
      <Navbar categories={categories} />

      {/* Main Catalog View Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        
        {/* Breadcrumb & Results Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-amber-200">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-7 bg-amber-400 rounded-full"></div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {currentQuery ? `Results for "${currentQuery}"` : 'Marketplace Catalog'}
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium ml-5">
              Showing <strong className="text-slate-900">{products.length}</strong> of <strong className="text-slate-900">{totalCount}</strong> items
            </p>
          </div>

          {/* Sort selector & Mobile filter trigger */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="md:hidden flex items-center gap-1.5 px-3 py-2 bg-white border-2 border-amber-200 rounded-xl text-xs font-black text-slate-900 shadow-xs"
            >
              <SlidersHorizontal className="w-4 h-4 text-amber-500" />
              Filters
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600 font-bold hidden sm:inline">Sort by:</span>
              <select
                value={currentSort}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="bg-white border-2 border-amber-200 text-xs font-black text-slate-900 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-400 cursor-pointer shadow-xs"
              >
                <option value="newest">Featured & Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Avg. Customer Review</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Layout: Sidebar + Product Grid */}
        <div className="mt-8 flex gap-8">
          
          {/* Desktop Filter Sidebar */}
          <aside className="w-64 flex-shrink-0 hidden md:block space-y-6 bg-white p-6 rounded-3xl border-2 border-amber-200/80 shadow-sm h-fit">
            
            <div className="flex items-center justify-between pb-3 border-b border-amber-100">
              <span className="font-black text-sm text-slate-900">Filters</span>
              {(currentCategory !== 'all' || currentRating || currentMinPrice || currentMaxPrice || currentQuery) && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-amber-700 hover:text-amber-600 font-black"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Department / Category Filter */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-800 mb-3">
                Department
              </h3>
              <div className="space-y-1.5">
                <button
                  onClick={() => updateParam('category', 'all')}
                  className={`w-full text-left text-xs px-3 py-2 rounded-xl transition font-bold ${
                    currentCategory === 'all'
                      ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                      : 'text-slate-700 hover:bg-amber-50'
                  }`}
                >
                  All Departments
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => updateParam('category', cat.slug)}
                    className={`w-full text-left text-xs px-3 py-2 rounded-xl transition font-bold ${
                      currentCategory === cat.slug
                        ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                        : 'text-slate-700 hover:bg-amber-50'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Customer Rating Filter */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-800 mb-3">
                Customer Reviews
              </h3>
              <div className="space-y-2">
                {[4, 3].map((star) => (
                  <button
                    key={star}
                    onClick={() => updateParam('rating', currentRating === String(star) ? '' : String(star))}
                    className={`w-full text-left flex items-center gap-2 text-xs px-3 py-2 rounded-xl transition ${
                      currentRating === String(star)
                        ? 'bg-amber-100 text-amber-950 font-black border border-amber-300'
                        : 'text-slate-700 hover:bg-amber-50'
                    }`}
                  >
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < star ? 'fill-amber-400 text-amber-400' : 'text-slate-200 fill-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-bold">& Up</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-800 mb-3">
                Price Range
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min $"
                  value={currentMinPrice}
                  onChange={(e) => updateParam('minPrice', e.target.value)}
                  className="w-full bg-amber-50/20 border-2 border-amber-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-amber-400"
                />
                <input
                  type="number"
                  placeholder="Max $"
                  value={currentMaxPrice}
                  onChange={(e) => updateParam('maxPrice', e.target.value)}
                  className="w-full bg-amber-50/20 border-2 border-amber-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

          </aside>

          {/* Products Grid */}
          <main className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-3xl h-80 animate-pulse border-2 border-amber-200/60"></div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white border-2 border-amber-200/80 rounded-3xl p-12 text-center shadow-md">
                <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-300">
                  <Filter className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-slate-900">No matching products found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Try adjusting your search query, selecting another category, or clearing filters.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="mt-5 px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs transition shadow-md shadow-amber-400/20"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </main>

        </div>
      </div>

      <Footer />
    </div>
  );
}

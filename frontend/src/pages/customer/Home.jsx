import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Store, Sparkles, Tag, ChevronRight } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ProductCard from '../../components/ProductCard';
import api from '../../api/axios';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [latestProducts, setLatestProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [catRes, prodRes] = await Promise.all([
          api.get('/categories'),
          api.get('/products?limit=8'),
        ]);
        setCategories(catRes.data.data.categories || []);
        const prods = prodRes.data.data.products || [];
        setLatestProducts(prods);
        setFeaturedProducts(prods.filter((p) => p.featured || p.ratingsAverage >= 4.7));
      } catch (err) {
        console.error('Error fetching homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-yellow-50/30 flex flex-col justify-between text-slate-800">
      <Navbar categories={categories} />

      {/* Hero Banner Section (Light Yellow and White Theme) */}
      <section className="bg-gradient-to-b from-yellow-50 via-white to-yellow-50/40 text-slate-900 py-8 sm:py-14 px-4 sm:px-6 lg:px-8 border-b border-yellow-200/80">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 md:gap-10">
          <div className="max-w-2xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-100 text-amber-900 border border-yellow-300 text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-3 sm:mb-4">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Multi-Vendor Marketplace</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-tight">
              One Marketplace.<br />
              <span className="text-amber-500">Thousands of Sellers.</span>
            </h1>
            <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm md:text-base text-slate-600 font-medium leading-relaxed max-w-xl mx-auto md:mx-0">
              Explore curated electronics, apparel, and lifestyle goods shipped directly from certified vendors.
            </p>

            <div className="mt-5 sm:mt-7 flex flex-col sm:flex-row gap-2.5 sm:gap-3.5 justify-center md:justify-start">
              <Link
                to="/products"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-black transition shadow-xs flex items-center justify-center gap-2 text-xs sm:text-sm"
              >
                <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
                Browse Catalog
              </Link>
              <Link
                to="/vendor/apply"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-yellow-50 text-slate-900 border border-yellow-300 font-bold transition flex items-center justify-center gap-2 text-xs sm:text-sm shadow-xs"
              >
                <Store className="w-4 h-4 text-amber-600" />
                Become a Seller
              </Link>
            </div>
          </div>

          {/* Promotional Coupon Card */}
          <div className="bg-white border border-yellow-300/80 p-4 sm:p-5 rounded-2xl max-w-sm w-full text-slate-900 shadow-xs">
            <div className="flex items-center gap-1.5 text-amber-700 text-xs font-bold uppercase mb-2">
              <Tag className="w-3.5 h-3.5" />
              <span>Special Voucher</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900">Coupon: WELCOME10</h3>
            <p className="text-xs text-slate-500 mb-3 font-medium">
              Save 10% on your first order over $50 at checkout.
            </p>
            <div className="p-2 sm:p-2.5 bg-yellow-50/70 rounded-xl border border-yellow-200 flex items-center justify-between text-xs">
              <span className="font-mono text-amber-900 font-black">WELCOME10</span>
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-bold text-[10px] border border-emerald-200">
                Active Code
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Department Strip */}
      <section className="bg-white border-b border-yellow-100 py-5 sm:py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-xs sm:text-sm font-bold text-slate-900">Shop by Category</h2>
            <Link to="/products" className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1">
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
            {categories.map((cat) => (
              <Link
                key={cat._id}
                to={`/products?category=${cat.slug}`}
                className="group flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl border border-yellow-200/70 hover:border-yellow-400 hover:bg-yellow-50/40 transition bg-white shadow-xs"
              >
                <img
                  src={cat.iconUrl}
                  alt={cat.name}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg object-cover group-hover:scale-105 transition shrink-0"
                />
                <div className="overflow-hidden min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-amber-700 transition">
                    {cat.name}
                  </h4>
                  <p className="text-[10px] text-slate-500 truncate hidden xs:block">{cat.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex-1 w-full">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
              Featured Products
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1 font-medium">
              Top selections from verified vendors
            </p>
          </div>
          <Link
            to="/products"
            className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
          >
            Explore all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-64 sm:h-80 animate-pulse border border-yellow-100 p-4"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {featuredProducts.slice(0, 4).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        {/* Trending Products Grid */}
        <div className="mt-10 sm:mt-14">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
              Trending Catalog
            </h2>
            <Link
              to="/products"
              className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
            >
              See all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {latestProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

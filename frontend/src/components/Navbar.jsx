import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  ShoppingCart,
  User as UserIcon,
  Store,
  Shield,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Heart
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar({ onSearchSubmit, categories = [] }) {
  const { user, logout, isAuthenticated, isVendor, isAdmin } = useAuth();
  const { totalItemsCount } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearchSubmit) {
      onSearchSubmit(searchTerm, selectedCategory);
    } else {
      const query = searchTerm ? `?q=${encodeURIComponent(searchTerm)}` : '';
      const catParam = selectedCategory !== 'all' ? `${query ? '&' : '?'}category=${selectedCategory}` : '';
      navigate(`/search${query}${catParam}`);
    }
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md text-slate-800 border-b border-yellow-200/90 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-9 h-9 rounded-xl bg-yellow-400 flex items-center justify-center text-slate-950 font-black shadow-xs group-hover:scale-105 transition">
              <ShoppingBag className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-slate-900 leading-none">
                Market<span className="text-amber-500">Verse</span>
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Multi-Vendor
              </span>
            </div>
          </Link>

          {/* Search Bar with Category Dropdown */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl hidden md:flex items-center">
            <div className="relative flex w-full rounded-xl overflow-hidden border border-yellow-300 focus-within:border-yellow-500 focus-within:ring-2 focus-within:ring-yellow-400/20 bg-white transition shadow-xs">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-yellow-50 hover:bg-yellow-100/70 text-slate-800 text-xs font-bold px-3 py-2 border-r border-yellow-200 focus:outline-none cursor-pointer"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat._id || cat.slug} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Search products, brands, or categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white text-slate-900 px-4 py-2 text-sm focus:outline-none font-medium placeholder-slate-400"
              />
              <button
                type="submit"
                className="bg-yellow-400 hover:bg-yellow-500 text-slate-950 px-4 flex items-center justify-center transition font-black"
                aria-label="Search"
              >
                <Search className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </form>

          {/* User Actions & Links */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            
            {/* Vendor / Admin Quick Links */}
            {isVendor ? (
              <Link
                to="/vendor/dashboard"
                className="hidden sm:flex items-center gap-1.5 text-xs bg-yellow-50 hover:bg-yellow-100 text-slate-900 font-bold px-3 py-1.5 rounded-xl border border-yellow-200 transition shadow-xs"
              >
                <Store className="w-3.5 h-3.5 text-amber-700" />
                <span>Seller Portal</span>
              </Link>
            ) : isAdmin ? (
              <Link
                to="/admin/dashboard"
                className="hidden sm:flex items-center gap-1.5 text-xs bg-yellow-50 hover:bg-yellow-100 text-slate-900 font-bold px-3 py-1.5 rounded-xl border border-yellow-200 transition shadow-xs"
              >
                <Shield className="w-3.5 h-3.5 text-amber-700" />
                <span>Admin Console</span>
              </Link>
            ) : (
              <Link
                to="/vendor/apply"
                className="hidden sm:flex items-center gap-1.5 text-xs bg-yellow-50 hover:bg-yellow-100 text-slate-900 font-bold px-3 py-1.5 rounded-xl border border-yellow-200 transition shadow-xs"
              >
                <Store className="w-3.5 h-3.5 text-amber-700" />
                <span>Become a Seller</span>
              </Link>
            )}

            {/* Account Dropdown */}
            <div className="relative">
              {isAuthenticated ? (
                <div>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 text-left px-2.5 py-1.5 rounded-xl bg-yellow-50/60 hover:bg-yellow-100/70 border border-yellow-200 transition"
                  >
                    <div className="w-6 h-6 rounded-full bg-yellow-400 text-slate-950 font-black flex items-center justify-center text-xs">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="hidden sm:inline text-xs font-bold text-slate-800">
                      {user?.name?.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3 h-3 text-slate-500" />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl py-1.5 border border-yellow-200 text-slate-800 z-50 text-xs">
                      <div className="px-3.5 py-2 border-b border-yellow-100 bg-yellow-50/40">
                        <p className="text-[11px] text-slate-500">Signed in as</p>
                        <p className="font-bold text-slate-900 truncate">{user?.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 text-[9px] uppercase font-bold rounded bg-yellow-100 text-amber-900">
                          {user?.role}
                        </span>
                      </div>

                      <div className="py-1 font-semibold">
                        <Link
                          to="/profile"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3.5 py-2 hover:bg-yellow-50 text-slate-800"
                        >
                          <UserIcon className="w-3.5 h-3.5 text-amber-600" />
                          Account Overview
                        </Link>
                        <Link
                          to="/orders"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="block px-3.5 py-2 hover:bg-yellow-50 text-slate-800"
                        >
                          My Orders & Invoices
                        </Link>
                        <Link
                          to="/wishlist"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3.5 py-2 hover:bg-yellow-50 text-slate-800"
                        >
                          <Heart className="w-3.5 h-3.5 text-amber-600" />
                          Saved Wishlist
                        </Link>

                        {isVendor && (
                          <Link
                            to="/vendor/dashboard"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="block px-3.5 py-2 hover:bg-yellow-50 text-amber-900 font-bold"
                          >
                            Seller Dashboard
                          </Link>
                        )}

                        {isAdmin && (
                          <Link
                            to="/admin/dashboard"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="block px-3.5 py-2 hover:bg-yellow-50 text-amber-900 font-bold"
                          >
                            Admin Dashboard
                          </Link>
                        )}
                      </div>

                      <div className="border-t border-yellow-100 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-3.5 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-bold"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="text-xs px-3.5 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-black rounded-xl shadow-xs transition"
                >
                  Sign In
                </Link>
              )}
            </div>

            {/* Wishlist Button */}
            <Link
              to="/wishlist"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-yellow-50/60 hover:bg-yellow-100 text-slate-800 border border-yellow-200 transition"
              title="My Wishlist"
            >
              <Heart className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold">Wishlist</span>
            </Link>

            {/* Shopping Cart Button */}
            <Link
              to="/cart"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-black transition relative shadow-xs"
            >
              <div className="relative">
                <ShoppingCart className="w-4 h-4 stroke-[2.5]" />
                <span className="absolute -top-2.5 -right-2.5 bg-slate-950 text-yellow-300 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {totalItemsCount}
                </span>
              </div>
              <span className="hidden sm:inline text-xs">Cart</span>
            </Link>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-1.5 rounded-xl bg-yellow-50 text-slate-800 hover:bg-yellow-100 border border-yellow-200"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Input */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-yellow-100">
            <form onSubmit={handleSearch} className="flex w-full rounded-xl overflow-hidden border border-yellow-300 bg-white">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white text-slate-900 px-3 py-2 text-xs focus:outline-none font-medium"
              />
              <button
                type="submit"
                className="bg-yellow-400 text-slate-950 px-3.5 font-black text-xs"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </header>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, RefreshCw, Headphones, ArrowUp } from 'lucide-react';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-white text-slate-700 mt-16 border-t border-yellow-200/90 shadow-xs">
      
      {/* Back to top button */}
      <button
        onClick={scrollToTop}
        className="w-full bg-yellow-50/60 hover:bg-yellow-100/70 text-slate-800 text-xs font-bold py-3 transition text-center border-b border-yellow-100 flex items-center justify-center gap-1.5"
      >
        <span>Back to top</span>
        <ArrowUp className="w-3.5 h-3.5" />
      </button>

      {/* Feature Value Props */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-b border-yellow-100 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        <div className="flex flex-col items-center p-2 rounded-xl">
          <div className="w-10 h-10 rounded-xl bg-yellow-100 text-amber-800 flex items-center justify-center mb-2.5">
            <Truck className="w-5 h-5 stroke-[2.2]" />
          </div>
          <h4 className="text-xs font-bold text-slate-900">Direct Shipping</h4>
          <p className="text-[11px] text-slate-500 mt-0.5">Shipped from verified merchants</p>
        </div>
        <div className="flex flex-col items-center p-2 rounded-xl">
          <div className="w-10 h-10 rounded-xl bg-yellow-100 text-amber-800 flex items-center justify-center mb-2.5">
            <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
          </div>
          <h4 className="text-xs font-bold text-slate-900">Secure Checkout</h4>
          <p className="text-[11px] text-slate-500 mt-0.5">Encrypted payment processing</p>
        </div>
        <div className="flex flex-col items-center p-2 rounded-xl">
          <div className="w-10 h-10 rounded-xl bg-yellow-100 text-amber-800 flex items-center justify-center mb-2.5">
            <RefreshCw className="w-5 h-5 stroke-[2.2]" />
          </div>
          <h4 className="text-xs font-bold text-slate-900">Easy Returns</h4>
          <p className="text-[11px] text-slate-500 mt-0.5">Hassle-free replacement policies</p>
        </div>
        <div className="flex flex-col items-center p-2 rounded-xl">
          <div className="w-10 h-10 rounded-xl bg-yellow-100 text-amber-800 flex items-center justify-center mb-2.5">
            <Headphones className="w-5 h-5 stroke-[2.2]" />
          </div>
          <h4 className="text-xs font-bold text-slate-900">Dedicated Support</h4>
          <p className="text-[11px] text-slate-500 mt-0.5">Assistance with every order</p>
        </div>
      </div>

      {/* Navigation Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-xs">
        <div>
          <h5 className="font-bold text-slate-900 uppercase tracking-wider mb-3 text-xs">
            Categories
          </h5>
          <ul className="space-y-2 font-medium">
            <li><Link to="/products?category=electronics-gadgets" className="text-slate-600 hover:text-amber-700 transition">Electronics & Gadgets</Link></li>
            <li><Link to="/products?category=fashion-apparel" className="text-slate-600 hover:text-amber-700 transition">Fashion & Apparel</Link></li>
            <li><Link to="/products?category=home-kitchen" className="text-slate-600 hover:text-amber-700 transition">Home & Living</Link></li>
            <li><Link to="/products?category=sports-outdoors" className="text-slate-600 hover:text-amber-700 transition">Sports & Outdoors</Link></li>
          </ul>
        </div>

        <div>
          <h5 className="font-bold text-slate-900 uppercase tracking-wider mb-3 text-xs">
            Sell with Us
          </h5>
          <ul className="space-y-2 font-medium">
            <li><Link to="/vendor/apply" className="text-slate-600 hover:text-amber-700 transition">Become a Seller</Link></li>
            <li><Link to="/vendor/dashboard" className="text-slate-600 hover:text-amber-700 transition">Vendor Dashboard</Link></li>
            <li><Link to="/login" className="text-slate-600 hover:text-amber-700 transition">Seller Login</Link></li>
          </ul>
        </div>

        <div>
          <h5 className="font-bold text-slate-900 uppercase tracking-wider mb-3 text-xs">
            Customer Area
          </h5>
          <ul className="space-y-2 font-medium">
            <li><Link to="/orders" className="text-slate-600 hover:text-amber-700 transition">My Orders</Link></li>
            <li><Link to="/wishlist" className="text-slate-600 hover:text-amber-700 transition">Saved Wishlist</Link></li>
            <li><Link to="/cart" className="text-slate-600 hover:text-amber-700 transition">Shopping Cart</Link></li>
            <li><Link to="/profile" className="text-slate-600 hover:text-amber-700 transition">Account Profile</Link></li>
          </ul>
        </div>

        <div>
          <h5 className="font-bold text-slate-900 uppercase tracking-wider mb-3 text-xs">
            MarketVerse
          </h5>
          <p className="text-slate-500 leading-relaxed mb-3 font-medium">
            Multi-vendor e-commerce platform connecting buyers with verified independent merchants.
          </p>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-yellow-400 text-slate-950 font-black flex items-center justify-center text-xs">
              M
            </div>
            <span className="font-bold text-slate-900 text-xs">MarketVerse</span>
          </div>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="bg-yellow-50/50 py-4 text-center text-xs text-slate-500 border-t border-yellow-100">
        <p>&copy; {new Date().getFullYear()} MarketVerse Multi-Vendor Marketplace.</p>
      </div>
    </footer>
  );
}

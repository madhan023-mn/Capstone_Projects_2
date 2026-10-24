import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Store, Tag, ArrowRight, ShieldCheck } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, applyCoupon, loading } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode) return;
    setCouponLoading(true);
    await applyCoupon(couponCode);
    setCouponLoading(false);
  };

  const handleQuickCoupon = async (code) => {
    setCouponCode(code);
    setCouponLoading(true);
    await applyCoupon(code);
    setCouponLoading(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-amber-50/30 flex flex-col justify-between">
        <Navbar />
        <div className="max-w-md mx-auto my-24 p-8 bg-white rounded-3xl border-2 border-amber-200/80 text-center shadow-md">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-300">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900">Your basket is waiting</h2>
          <p className="text-xs text-slate-500 mt-2">Sign in to view your multi-vendor cart and saved items.</p>
          <Link
            to="/login"
            className="mt-6 inline-block w-full py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-xl transition shadow-md shadow-amber-400/20"
          >
            Sign In to Your Account
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const items = cart?.items || [];
  const isEmpty = items.length === 0;

  // Group line items by Vendor Store
  const groupedByVendor = items.reduce((acc, item) => {
    const vendorId = item.vendor?._id || 'unknown';
    const storeName = item.vendor?.storeName || item.product?.vendor?.storeName || 'Marketplace Seller';
    if (!acc[vendorId]) {
      acc[vendorId] = {
        storeName,
        items: [],
      };
    }
    acc[vendorId].items.push(item);
    return acc;
  }, {});

  const subtotal = cart?.subtotal || 0;
  const discountTotal = cart?.discountTotal || 0;
  const estimatedTax = Math.round(subtotal * 0.05 * 100) / 100;
  const grandTotal = Math.max(0, subtotal - discountTotal + estimatedTax);

  return (
    <div className="min-h-screen bg-amber-50/30 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-2 h-7 bg-amber-400 rounded-full"></div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Shopping Basket
          </h1>
        </div>

        {isEmpty ? (
          <div className="bg-white rounded-3xl border-2 border-amber-200/80 p-12 text-center shadow-md max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-300">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-black text-slate-900">Your Basket is Empty</h2>
            <p className="text-xs text-slate-500 mt-1">Explore our independent merchants and add products to get started.</p>
            <Link
              to="/products"
              className="mt-6 inline-block px-8 py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-xl transition shadow-md shadow-amber-400/20"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left: Multi-Vendor Item Groups */}
            <div className="lg:col-span-8 space-y-6">
              
              {Object.entries(groupedByVendor).map(([vendorId, group]) => (
                <div
                  key={vendorId}
                  className="bg-white rounded-3xl border-2 border-amber-200/80 shadow-sm overflow-hidden"
                >
                  {/* Vendor Store Header */}
                  <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 px-6 py-3.5 border-b border-amber-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-amber-600" />
                      <span className="text-xs font-black text-slate-800">
                        Dispatched by: <strong className="text-slate-950 font-black">{group.storeName}</strong>
                      </span>
                    </div>
                    <span className="text-[11px] text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full font-bold border border-amber-200">Independent Merchant</span>
                  </div>

                  {/* Items for this vendor */}
                  <div className="divide-y divide-amber-100/60 px-6">
                    {group.items.map((item) => (
                      <div key={item.product?._id} className="py-5 flex gap-4 sm:gap-6 items-center">
                        <Link to={`/products/${item.product?._id}`} className="flex-shrink-0">
                          <img
                            src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80'}
                            alt={item.product?.title}
                            className="w-20 h-20 object-cover rounded-2xl border-2 border-amber-100"
                          />
                        </Link>

                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/products/${item.product?._id}`}
                            className="text-sm font-bold text-slate-900 hover:text-amber-600 transition truncate block"
                          >
                            {item.product?.title}
                          </Link>
                          <p className="text-xs text-slate-500 mt-0.5">Unit Price: <span className="font-bold text-slate-800">${item.price.toFixed(2)}</span></p>

                          <div className="mt-3 flex items-center gap-4">
                            {/* Quantity Controls */}
                            <div className="flex items-center border-2 border-amber-200 rounded-xl overflow-hidden bg-amber-50/50 text-xs font-bold">
                              <button
                                onClick={() => updateQuantity(item.product?._id, item.quantity - 1)}
                                className="px-2.5 py-1 hover:bg-amber-100 text-slate-800"
                              >
                                -
                              </button>
                              <span className="px-3 py-1 bg-white text-slate-950 font-black">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.product?._id, item.quantity + 1)}
                                className="px-2.5 py-1 hover:bg-amber-100 text-slate-800"
                              >
                                +
                              </button>
                            </div>

                            <button
                              onClick={() => removeFromCart(item.product?._id)}
                              className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 font-bold"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Remove
                            </button>
                          </div>
                        </div>

                        {/* Item Total */}
                        <div className="text-right">
                          <span className="text-base font-black text-slate-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

            </div>

            {/* Right: Order Summary & Coupon Card */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Coupon Box */}
              <div className="bg-white rounded-3xl border-2 border-amber-200/80 shadow-sm p-6">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-900 mb-3">
                  <Tag className="w-4 h-4 text-amber-500" />
                  Have a Promotional Code?
                </div>

                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="E.g. WELCOME10"
                    className="flex-1 bg-amber-50/30 border-2 border-amber-200 rounded-xl px-3 py-2 text-xs font-mono uppercase focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="submit"
                    disabled={couponLoading}
                    className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-xl text-xs font-black transition disabled:opacity-50 shadow-xs"
                  >
                    Apply
                  </button>
                </form>

                {/* Quick test coupon suggestions */}
                <div className="mt-4 pt-3 border-t border-amber-100">
                  <p className="text-[11px] text-slate-500 font-bold mb-2">Available Coupons for Demo:</p>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleQuickCoupon('WELCOME10')}
                      className="px-2.5 py-1 bg-amber-100/70 hover:bg-amber-200 text-amber-950 border border-amber-300 rounded-lg text-[11px] font-mono font-black"
                    >
                      WELCOME10 (10% off)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickCoupon('MARKET20')}
                      className="px-2.5 py-1 bg-amber-100/70 hover:bg-amber-200 text-amber-950 border border-amber-300 rounded-lg text-[11px] font-mono font-black"
                    >
                      MARKET20 (20% off)
                    </button>
                  </div>
                </div>
              </div>

              {/* Order Summary Card */}
              <div className="bg-white rounded-3xl border-2 border-amber-300 shadow-md p-6 space-y-4">
                <h3 className="text-base font-black text-slate-900 pb-3 border-b border-amber-100">
                  Order Summary
                </h3>

                <div className="space-y-2.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Items Subtotal</span>
                    <span className="font-bold text-slate-900">${subtotal.toFixed(2)}</span>
                  </div>

                  {discountTotal > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Coupon Discount ({cart.appliedCoupon?.code})</span>
                      <span>-${discountTotal.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Estimated Tax (5%)</span>
                    <span>${estimatedTax.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Shipping & Delivery</span>
                    <span className="text-emerald-600 font-black">FREE</span>
                  </div>
                </div>

                <div className="pt-4 border-t-2 border-amber-100 flex justify-between items-baseline">
                  <div>
                    <span className="text-sm font-black text-slate-900">Total Due</span>
                    <p className="text-[10px] text-slate-400">Includes all taxes & merchant settlements</p>
                  </div>
                  <span className="text-2xl font-black text-slate-900">
                    ${grandTotal.toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-500 active:scale-95 text-slate-950 font-black text-sm transition shadow-md shadow-amber-400/25 flex items-center justify-center gap-2"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-slate-500 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Atomic Inventory & Secure Test Settlement</span>
                </div>
              </div>

            </div>

          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

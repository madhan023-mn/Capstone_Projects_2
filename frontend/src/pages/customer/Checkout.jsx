import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, CreditCard, MapPin, CheckCircle, ArrowLeft, Lock } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useCart } from '../../context/CartContext';
import api from '../../api/axios';

export default function Checkout() {
  const { cart, refreshCart } = useCart();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    fullName: 'John Doe',
    phone: '+91 9876543213',
    street: '221B Baker Street, Flat 4',
    city: 'Bangalore',
    state: 'Karnataka',
    postalCode: '560001',
    country: 'India',
  });

  const [paymentProvider, setPaymentProvider] = useState('stripe_test');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const items = cart?.items || [];
  const subtotal = cart?.subtotal || 0;
  const discountTotal = cart?.discountTotal || 0;
  const estimatedTax = Math.round(subtotal * 0.05 * 100) / 100;
  const grandTotal = Math.max(0, subtotal - discountTotal + estimatedTax);

  const handleAddressChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleQuickFill = () => {
    setAddress({
      fullName: 'Alice Walker',
      phone: '+91 9988776655',
      street: '42 Silicon Avenue, Tech Park',
      city: 'Hyderabad',
      state: 'Telangana',
      postalCode: '500081',
      country: 'India',
    });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsProcessing(true);

    try {
      const res = await api.post('/orders/checkout', {
        shippingAddress: address,
        paymentMethod: paymentProvider,
      });

      await refreshCart();
      const orderId = res.data.data.order._id;
      navigate(`/orders/${orderId}?success=true`);
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || 'Payment processing failed. Please check stock or try again.'
      );
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-amber-50/30 flex flex-col justify-between">
        <Navbar />
        <div className="max-w-md mx-auto my-24 p-8 bg-white rounded-3xl border-2 border-amber-200/80 text-center shadow-md">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-300">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900">Your basket is empty</h2>
          <p className="text-xs text-slate-500 mt-2">Add items to your cart before proceeding to checkout.</p>
          <Link
            to="/products"
            className="mt-6 inline-block px-8 py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-md shadow-amber-400/20 transition"
          >
            Browse Products
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50/30 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-6 font-semibold">
          <Link to="/cart" className="hover:text-amber-600 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Basket
          </Link>
          <span>/</span>
          <span className="text-slate-950 font-black">Secure Checkout</span>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-2 h-7 bg-amber-400 rounded-full"></div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Review & Place Order
          </h1>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border-2 border-red-200 text-red-700 text-xs font-bold">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Delivery Address & Payment Method */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Delivery Address */}
            <div className="bg-white rounded-3xl border-2 border-amber-200/80 shadow-sm p-6 sm:p-8">
              <div className="flex items-center justify-between pb-4 border-b border-amber-100 mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 font-black flex items-center justify-center text-xs shadow-xs">
                    1
                  </div>
                  <h2 className="text-base font-black text-slate-900">Delivery Address</h2>
                </div>
                <button
                  type="button"
                  onClick={handleQuickFill}
                  className="text-xs text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-3 py-1.5 rounded-lg font-black transition"
                >
                  Quick Fill Demo Address
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={address.fullName}
                    onChange={handleAddressChange}
                    required
                    className="w-full bg-amber-50/20 border-2 border-amber-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={address.phone}
                    onChange={handleAddressChange}
                    required
                    className="w-full bg-amber-50/20 border-2 border-amber-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Street Address</label>
                  <input
                    type="text"
                    name="street"
                    value={address.street}
                    onChange={handleAddressChange}
                    required
                    className="w-full bg-amber-50/20 border-2 border-amber-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    value={address.city}
                    onChange={handleAddressChange}
                    required
                    className="w-full bg-amber-50/20 border-2 border-amber-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">State / Province</label>
                  <input
                    type="text"
                    name="state"
                    value={address.state}
                    onChange={handleAddressChange}
                    required
                    className="w-full bg-amber-50/20 border-2 border-amber-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Postal Code</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={address.postalCode}
                    onChange={handleAddressChange}
                    required
                    className="w-full bg-amber-50/20 border-2 border-amber-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Country</label>
                  <input
                    type="text"
                    name="country"
                    value={address.country}
                    onChange={handleAddressChange}
                    required
                    className="w-full bg-amber-50/20 border-2 border-amber-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-3xl border-2 border-amber-200/80 shadow-sm p-6 sm:p-8">
              <div className="flex items-center gap-2.5 pb-4 border-b border-amber-100 mb-6">
                <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 font-black flex items-center justify-center text-xs shadow-xs">
                  2
                </div>
                <h2 className="text-base font-black text-slate-900">Payment Gateway (Test Mode)</h2>
              </div>

              <div className="space-y-3">
                <label
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition ${
                    paymentProvider === 'stripe_test'
                      ? 'border-amber-400 bg-amber-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-amber-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentProvider"
                      value="stripe_test"
                      checked={paymentProvider === 'stripe_test'}
                      onChange={() => setPaymentProvider('stripe_test')}
                      className="text-amber-500 focus:ring-amber-400 w-4 h-4"
                    />
                    <div>
                      <span className="text-xs font-black text-slate-900 block">
                        Stripe Marketplace Test Sandbox
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Automatic verification & suborder split simulation
                      </span>
                    </div>
                  </div>
                  <CreditCard className="w-5 h-5 text-amber-500" />
                </label>

                <label
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition ${
                    paymentProvider === 'razorpay_test'
                      ? 'border-amber-400 bg-amber-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-amber-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentProvider"
                      value="razorpay_test"
                      checked={paymentProvider === 'razorpay_test'}
                      onChange={() => setPaymentProvider('razorpay_test')}
                      className="text-amber-500 focus:ring-amber-400 w-4 h-4"
                    />
                    <div>
                      <span className="text-xs font-black text-slate-900 block">
                        Razorpay Test Payment
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Simulated net banking & UPI test transfer
                      </span>
                    </div>
                  </div>
                  <ShieldCheck className="w-5 h-5 text-amber-600" />
                </label>
              </div>

              <div className="mt-4 p-3 bg-amber-50/50 rounded-xl border border-amber-200 text-[11px] text-amber-900 font-medium flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Test Mode Active. Real card charges will not be incurred.</span>
              </div>
            </div>

          </div>

          {/* Right Column: Order Items Summary & Checkout Button */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl border-2 border-amber-300 shadow-md p-6 space-y-4">
              <h3 className="text-base font-black text-slate-900 pb-3 border-b border-amber-100">
                Order Review ({items.length} items)
              </h3>

              <div className="max-h-60 overflow-y-auto space-y-3 divide-y divide-amber-100/60 pr-1">
                {items.map((it) => (
                  <div key={it.product?._id} className="pt-2 flex items-center gap-3 text-xs">
                    <img
                      src={it.product?.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=150&q=80'}
                      alt=""
                      className="w-12 h-12 object-cover rounded-xl border-2 border-amber-100 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 truncate">{it.product?.title}</p>
                      <p className="text-[11px] text-slate-500">Qty: {it.quantity} × ${it.price.toFixed(2)}</p>
                    </div>
                    <span className="font-black text-slate-900">
                      ${(it.price * it.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t-2 border-amber-100 space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900">${subtotal.toFixed(2)}</span>
                </div>
                {discountTotal > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Discount</span>
                    <span>-${discountTotal.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Taxes (5%)</span>
                  <span>${estimatedTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-emerald-600 font-black">FREE</span>
                </div>
              </div>

              <div className="pt-4 border-t-2 border-amber-100 flex justify-between items-baseline">
                <span className="text-sm font-black text-slate-900">Grand Total</span>
                <span className="text-2xl font-black text-slate-900">
                  ${grandTotal.toFixed(2)}
                </span>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 rounded-2xl bg-amber-400 hover:bg-amber-500 active:scale-95 text-slate-950 font-black text-sm transition shadow-lg shadow-amber-400/25 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? 'Verifying & Splitting Suborders...' : `Pay $${grandTotal.toFixed(2)} & Place Order`}
              </button>
            </div>
          </div>

        </form>
      </main>

      <Footer />
    </div>
  );
}

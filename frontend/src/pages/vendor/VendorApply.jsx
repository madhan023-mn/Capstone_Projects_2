import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Store, Building, Phone, DollarSign, ArrowRight, ShieldCheck, CheckCircle } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

export default function VendorApply() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    storeName: '',
    description: '',
    storeEmail: user?.email || '',
    storePhone: user?.phone || '',
    storeAddress: '100 Commerce Hub, Industrial Way, Bangalore',
    bankHolder: user?.name || '',
    accountNumber: '98765432101234',
    bankName: 'HDFC Bank',
    routingOrIFSC: 'HDFC0001234',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleQuickFill = () => {
    setFormData({
      storeName: 'Velocity Sports Gear',
      description: 'Authorized retailer for pro-tier athletic shoes, weights, and endurance training gear.',
      storeEmail: user?.email || 'vendor@velocity.com',
      storePhone: '+91 9123456789',
      storeAddress: '77 Athlete Boulevard, Sector 4, Bangalore',
      bankHolder: user?.name || 'Velocity Sports LLC',
      accountNumber: '11223344556677',
      bankName: 'State Bank of India',
      routingOrIFSC: 'SBIN0004567',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);

    try {
      await api.post('/vendors/apply', {
        storeName: formData.storeName,
        description: formData.description,
        storeEmail: formData.storeEmail,
        storePhone: formData.storePhone,
        storeAddress: formData.storeAddress,
        bankDetails: {
          accountHolderName: formData.bankHolder,
          accountNumber: formData.accountNumber,
          bankName: formData.bankName,
          routingOrIFSC: formData.routingOrIFSC,
        },
      });

      // Update local storage user role to vendor
      const updatedUser = { ...user, role: 'vendor' };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      navigate('/vendor/dashboard?onboarded=true');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Vendor onboarding failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-amber-50/30 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-3xl bg-amber-400 text-slate-950 flex items-center justify-center mx-auto mb-4 shadow-md shadow-amber-400/30 border-2 border-amber-500">
            <Store className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Register as a Verified Merchant
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-lg mx-auto font-medium">
            Sell to millions of customers. Enjoy automated suborder routing, transparent commission deductions, and express settlements.
          </p>
        </div>

        <div className="bg-white rounded-3xl border-2 border-amber-200/80 shadow-md p-6 sm:p-10">
          
          <div className="flex items-center justify-between pb-4 border-b border-amber-100 mb-6">
            <h2 className="text-xs font-black uppercase tracking-wider text-amber-800">
              Merchant Application Details
            </h2>
            <button
              type="button"
              onClick={handleQuickFill}
              className="text-xs text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-3 py-1.5 rounded-lg font-black transition"
            >
              1-Click Demo Fill
            </button>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border-2 border-red-200 text-red-700 text-xs font-bold">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1">
                Store / Brand Name
              </label>
              <input
                type="text"
                name="storeName"
                value={formData.storeName}
                onChange={handleChange}
                required
                placeholder="E.g. Apex Electronics, Urban Threads"
                className="w-full bg-amber-50/20 border-2 border-amber-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1">
                Store Description & Specialty
              </label>
              <textarea
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="What kinds of products does your store specialize in?"
                className="w-full bg-amber-50/20 border-2 border-amber-200 rounded-xl p-3 text-xs text-slate-900 font-medium focus:outline-none focus:border-amber-400"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1">
                  Support Email
                </label>
                <input
                  type="email"
                  name="storeEmail"
                  value={formData.storeEmail}
                  onChange={handleChange}
                  required
                  className="w-full bg-amber-50/20 border-2 border-amber-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1">
                  Business Phone
                </label>
                <input
                  type="tel"
                  name="storePhone"
                  value={formData.storePhone}
                  onChange={handleChange}
                  required
                  className="w-full bg-amber-50/20 border-2 border-amber-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1">
                Warehouse / Dispatch Address
              </label>
              <input
                type="text"
                name="storeAddress"
                value={formData.storeAddress}
                onChange={handleChange}
                required
                className="w-full bg-amber-50/20 border-2 border-amber-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Bank details for payouts */}
            <div className="pt-4 border-t-2 border-amber-100">
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-800 mb-3 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                Settlement & Payout Account (Test Sandbox)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">Account Holder</label>
                  <input
                    type="text"
                    name="bankHolder"
                    value={formData.bankHolder}
                    onChange={handleChange}
                    required
                    className="w-full bg-amber-50/20 border-2 border-amber-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">Account Number</label>
                  <input
                    type="text"
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleChange}
                    required
                    className="w-full bg-amber-50/20 border-2 border-amber-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">Bank Name</label>
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                    required
                    className="w-full bg-amber-50/20 border-2 border-amber-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">IFSC / Routing Code</label>
                  <input
                    type="text"
                    name="routingOrIFSC"
                    value={formData.routingOrIFSC}
                    onChange={handleChange}
                    required
                    className="w-full bg-amber-50/20 border-2 border-amber-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-4 py-4 rounded-2xl bg-amber-400 hover:bg-amber-500 active:scale-95 text-slate-950 font-black text-sm transition shadow-lg shadow-amber-400/25 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting Application...' : 'Submit & Open Vendor Store'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

        </div>
      </main>

      <Footer />
    </div>
  );
}

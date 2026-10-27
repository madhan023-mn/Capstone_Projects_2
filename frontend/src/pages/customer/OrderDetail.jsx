import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle,
  Clock,
  Package,
  Truck,
  Store,
  FileText,
  ArrowLeft,
  MapPin,
  Calendar,
  CreditCard
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useCurrency } from '../../context/CurrencyContext';
import api from '../../api/axios';

const STATUS_STEPS = ['placed', 'confirmed', 'packed', 'shipped', 'delivered'];

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { formatPrice, formatSecondaryPrice } = useCurrency();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/orders/${id}`);
        setOrder(res.data.data.order);
      } catch (err) {
        console.error('Failed to load order:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleDownloadInvoice = () => {
    window.open(`/api/v1/orders/${id}/invoice`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center flex-1">
          <div className="inline-block w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 mt-3 font-semibold">Loading order breakdown...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Navbar />
        <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-2xl border border-slate-200 text-center">
          <h2 className="text-lg font-bold text-slate-900">Order Not Found</h2>
          <Link to="/orders" className="mt-4 inline-block px-5 py-2.5 bg-amber-400 text-slate-950 font-bold text-xs rounded-lg">
            View My Orders
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
          <Link to="/orders" className="hover:text-amber-600 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to My Orders
          </Link>
          <span>/</span>
          <span className="text-slate-950 font-black">Order Details</span>
        </div>

        {/* Master Order Banner */}
        <div className="bg-white rounded-3xl border-2 border-amber-300 shadow-md p-6 sm:p-8 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
                Master Order
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                <CheckCircle className="w-3 h-3 text-emerald-600" />
                Payment Confirmed
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
              #{order.orderNumber}
            </h1>

            <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-600 font-medium">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                Placed on {new Date(order.createdAt).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-amber-500" />
                {order.paymentDetails?.provider || 'Test Sandbox'} (TXN: {order.paymentDetails?.transactionId?.slice(0, 14)}...)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleDownloadInvoice}
              className="px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-500 active:scale-95 text-slate-950 font-black text-xs transition shadow-md shadow-amber-400/20 flex items-center gap-2"
            >
              <FileText className="w-4 h-4 text-slate-950" />
              Download PDF Invoice
            </button>
          </div>
        </div>

        {/* Suborders Section: Segregated Fulfillment per Vendor */}
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-2 h-7 bg-amber-400 rounded-full"></div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Vendor Fulfillment Suborders ({order.vendorOrders?.length || 0})
            </h2>
          </div>

          {order.vendorOrders?.map((suborder, index) => {
            const currentStepIdx = STATUS_STEPS.indexOf(suborder.fulfillmentStatus);

            return (
              <div
                key={suborder._id}
                className="bg-white rounded-3xl border-2 border-amber-200/80 shadow-sm overflow-hidden"
              >
                {/* Vendor Suborder Header */}
                <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 px-6 py-4 border-b border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 font-black flex items-center justify-center text-xs shadow-xs">
                      <Store className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-black text-slate-400 block">Fulfillment Suborder #{index + 1}</span>
                      <h3 className="text-sm font-black text-slate-900">
                        Sold by {suborder.vendor?.storeName || 'Merchant'}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-600">Status:</span>
                    <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-950 border border-amber-300">
                      {suborder.fulfillmentStatus}
                    </span>
                  </div>
                </div>

                <div className="p-6 sm:p-8">
                  {/* Fulfillment Status Stepper */}
                  <div className="mb-8">
                    <div className="grid grid-cols-5 gap-2 text-center">
                      {STATUS_STEPS.map((step, idx) => {
                        const isDone = idx <= currentStepIdx;
                        const isCurrent = idx === currentStepIdx;

                        return (
                          <div key={step} className="flex flex-col items-center">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black mb-1.5 transition ${
                                isDone
                                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30'
                                  : 'bg-amber-50 text-slate-400 border border-amber-200'
                              }`}
                            >
                              {idx + 1}
                            </div>
                            <span
                              className={`text-[11px] capitalize font-black ${
                                isCurrent ? 'text-amber-700' : isDone ? 'text-slate-900' : 'text-slate-400'
                              }`}
                            >
                              {step}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Tracking info if present */}
                  {suborder.trackingNumber && (
                    <div className="mb-6 p-4 rounded-2xl bg-amber-50/50 border border-amber-200 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-slate-800">
                        <Truck className="w-4 h-4 text-amber-600" />
                        <span>Carrier: <strong>{suborder.trackingCarrier || 'Express Post'}</strong></span>
                        <span>•</span>
                        <span>Tracking Number: <strong className="font-mono">{suborder.trackingNumber}</strong></span>
                      </div>
                    </div>
                  )}

                  {/* Items in this suborder */}
                  <div className="divide-y divide-amber-100/60">
                    {suborder.items?.map((it) => (
                      <div key={it.product} className="py-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={it.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=150&q=80'}
                            alt=""
                            className="w-14 h-14 object-cover rounded-2xl border-2 border-amber-100"
                          />
                          <div>
                            <h4 className="text-xs font-black text-slate-900">{it.title}</h4>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Quantity: {it.quantity} × {formatPrice(it.price)} <span className="text-[10px] text-slate-400">({formatSecondaryPrice(it.price)})</span>
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-sm font-black text-slate-900 block">
                            {formatPrice(it.price * it.quantity)}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold">
                            {formatSecondaryPrice(it.price * it.quantity)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Suborder Total */}
                  <div className="mt-4 pt-4 border-t-2 border-amber-100 flex justify-between items-baseline text-xs font-black text-slate-800">
                    <span>Suborder Subtotal:</span>
                    <div className="text-right">
                      <span className="text-slate-950 block">{formatPrice(suborder.subtotal)}</span>
                      <span className="text-[10px] text-slate-400 font-normal">({formatSecondaryPrice(suborder.subtotal)})</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Delivery Address & Financial Totals Footer Card */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl border-2 border-amber-200/80 shadow-sm p-6">
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-700 mb-3 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-500" />
              Delivery Destination
            </h3>
            <p className="text-sm font-black text-slate-900">{order.shippingAddress?.fullName}</p>
            <p className="text-xs text-slate-600 mt-1">{order.shippingAddress?.street}</p>
            <p className="text-xs text-slate-600">
              {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}
            </p>
            <p className="text-xs text-slate-600 font-bold mt-1">Phone: {order.shippingAddress?.phone}</p>
          </div>

          <div className="bg-white rounded-3xl border-2 border-amber-300 shadow-sm p-6 space-y-2.5 text-xs text-slate-600">
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-700 mb-3">
              Payment Breakdown
            </h3>
            <div className="flex justify-between items-center">
              <span>Items Total:</span>
              <span className="font-bold text-slate-900">{formatPrice(order.subtotal)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between items-center text-emerald-600 font-bold">
                <span>Discount Saved:</span>
                <span>-{formatPrice(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span>Taxes (5%):</span>
              <span>{formatPrice(order.taxAmount)}</span>
            </div>
            <div className="pt-3 border-t-2 border-amber-100 flex justify-between items-baseline text-base font-black text-slate-900">
              <div>
                <span>Grand Total Settled:</span>
                <span className="text-xs text-slate-500 font-normal block">Equivalent: {formatSecondaryPrice(order.grandTotal)}</span>
              </div>
              <span>{formatPrice(order.grandTotal)}</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

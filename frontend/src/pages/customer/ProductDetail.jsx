import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  ShoppingCart,
  Store,
  ShieldCheck,
  Truck,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  MessageSquare
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import api from '../../api/axios';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { formatPrice, formatSecondaryPrice } = useCurrency();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Review Form state
  const [rating, setRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMsg, setReviewMsg] = useState(null);

  useEffect(() => {
    const fetchProductAndReviews = async () => {
      try {
        setLoading(true);
        const [prodRes, revRes] = await Promise.all([
          api.get(`/products/${id}`),
          api.get(`/reviews/product/${id}`),
        ]);
        setProduct(prodRes.data.data.product);
        setReviews(revRes.data.data.reviews || []);
      } catch (err) {
        console.error('Failed to load product details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndReviews();
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setSubmittingReview(true);
    setReviewMsg(null);
    try {
      const res = await api.post(`/reviews/product/${id}`, {
        rating,
        title: reviewTitle,
        comment: reviewComment,
      });
      setReviews([res.data.data.review, ...reviews]);
      setReviewTitle('');
      setReviewComment('');
      setReviewMsg({ type: 'success', text: 'Thank you! Your verified review has been published.' });
    } catch (err) {
      setReviewMsg({
        type: 'error',
        text: err.response?.data?.message || 'Could not post review. (You may have already reviewed this item).',
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center flex-1">
          <div className="inline-block w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 mt-3 font-semibold">Loading product specifications...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Navbar />
        <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-2xl border border-slate-200 text-center">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900">Product Not Found</h2>
          <p className="text-xs text-slate-500 mt-1">This product is no longer available or was removed.</p>
          <Link to="/products" className="mt-5 inline-block px-5 py-2.5 bg-amber-400 text-slate-950 font-bold text-xs rounded-lg">
            Back to Catalog
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const displayPrice = product.salePrice || product.price;
  const discountPercent =
    product.salePrice && product.price > product.salePrice
      ? Math.round(((product.price - product.salePrice) / product.price) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-yellow-50/40 flex flex-col justify-between text-slate-800">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full">
        {/* Breadcrumb navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-4 sm:mb-6 font-medium overflow-x-auto pb-1 no-scrollbar">
          <Link to="/" className="hover:text-amber-600 shrink-0">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-amber-600 shrink-0">Catalog</Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold truncate max-w-xs">{product.title}</span>
        </div>

        {/* Product Showcase Grid */}
        <div className="bg-white rounded-2xl border border-yellow-200/90 shadow-xs p-4 sm:p-6 lg:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10">
          
          {/* Left: Product Images Gallery */}
          <div className="md:col-span-1 lg:col-span-5 flex flex-col gap-4">
            <div className="aspect-square rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center p-4">
              <img
                src={product.images?.[selectedImage] || product.images?.[0]}
                alt={product.title}
                className="max-h-full max-w-full object-contain"
              />
            </div>

            {/* Thumbnail list */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-16 h-16 rounded-lg border-2 overflow-hidden flex-shrink-0 transition ${
                      selectedImage === idx ? 'border-amber-400 shadow-sm' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Middle: Details & Description */}
          <div className="md:col-span-1 lg:col-span-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">
                <span>Brand: <strong className="text-slate-800">{product.brand}</strong></span>
                <span>•</span>
                <span>SKU: {product.sku}</span>
              </div>

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                {product.title}
              </h1>

              {/* Rating */}
              <div className="mt-3 flex items-center gap-2">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round(product.ratingsAverage || 5)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-200 fill-slate-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-700">
                  {product.ratingsAverage || 5.0} out of 5
                </span>
                <span className="text-xs text-slate-400">
                  ({reviews.length} customer ratings)
                </span>
              </div>

              {/* Price block */}
              <div className="mt-5 sm:mt-6 p-4 rounded-xl bg-yellow-50/60 border border-yellow-200">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900">
                    {formatPrice(displayPrice)}
                  </span>
                  <span className="text-sm sm:text-base font-bold text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded-lg border border-amber-300">
                    {formatSecondaryPrice(displayPrice)}
                  </span>
                  {discountPercent > 0 && (
                    <>
                      <span className="text-xs sm:text-sm text-slate-400 line-through">
                        {formatPrice(product.price)}
                      </span>
                      <span className="bg-rose-100 text-rose-700 text-xs font-black px-2 py-0.5 rounded">
                        Save {discountPercent}%
                      </span>
                    </>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Multi-currency prices displayed in both INR (₹) and USD ($)</p>
              </div>

              {/* Description */}
              <div className="mt-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  About this item
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            </div>

            {/* Value features */}
            <div className="mt-6 pt-5 border-t border-yellow-100 grid grid-cols-2 gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-500" />
                <span>Dispatched by Vendor</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Buyer Protection</span>
              </div>
            </div>
          </div>

          {/* Right: Buy Box & Vendor Card (Yellow and White Theme) */}
          <div className="md:col-span-2 lg:col-span-3 flex flex-col justify-between">
            <div className="bg-white border border-yellow-300 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 sm:space-y-5">
              
              <div className="flex items-baseline justify-between flex-wrap gap-2">
                <div>
                  <span className="text-2xl font-black text-slate-900 block">
                    {formatPrice(displayPrice * quantity)}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    Approx. {formatSecondaryPrice(displayPrice * quantity)}
                  </span>
                </div>
                <span className="text-xs text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Free Delivery
                </span>
              </div>

              {/* Stock status */}
              <div>
                {product.stock > 0 ? (
                  <div className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 font-black flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" />
                    <span>In Stock ({product.stock} available)</span>
                  </div>
                ) : (
                  <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl p-2.5 font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Currently Sold Out</span>
                  </div>
                )}
              </div>

              {/* Quantity select */}
              {product.stock > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Quantity</label>
                  <select
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full bg-amber-50/50 border border-amber-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-900 focus:outline-none cursor-pointer"
                  >
                    {[...Array(Math.min(10, product.stock))].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Action Buttons (Yellow and White Theme) */}
              <div className="space-y-2.5 pt-2">
                <button
                  onClick={() => addToCart(product._id, quantity)}
                  disabled={product.stock <= 0}
                  className="w-full py-3.5 rounded-xl bg-amber-400 hover:bg-amber-500 active:scale-95 text-slate-950 font-black text-xs transition shadow-xs flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  <ShoppingCart className="w-4 h-4 stroke-[2.5]" />
                  Add to Basket
                </button>

                <button
                  onClick={async () => {
                    const ok = await addToCart(product._id, quantity);
                    if (ok) navigate('/checkout');
                  }}
                  disabled={product.stock <= 0}
                  className="w-full py-3.5 rounded-xl bg-white hover:bg-amber-50 text-slate-950 border-2 border-amber-400 font-black text-xs transition shadow-xs flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  Buy Now
                </button>
              </div>

              {/* Vendor Seller Card */}
              {product.vendor && (
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 font-black flex items-center justify-center text-sm">
                      <Store className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400">Sold & Dispatched by</p>
                      <h4 className="text-xs font-bold text-slate-900">{product.vendor.storeName}</h4>
                      <p className="text-[10px] text-amber-600 font-semibold">★ {product.vendor.rating} Seller Rating</p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>

        {/* Customer Reviews & Feedback Section */}
        <section className="mt-12 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="flex items-center justify-between pb-6 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-amber-500" />
                Customer Reviews & Ratings
              </h2>
              <p className="text-xs text-slate-500 mt-1">Verified buyer opinions and feedback</p>
            </div>
            <span className="text-xs font-bold bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
              {reviews.length} Total Reviews
            </span>
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Reviews List */}
            <div className="lg:col-span-7 space-y-6">
              {reviews.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-500">
                  No customer reviews yet. Be the first to review this product!
                </div>
              ) : (
                reviews.map((rev) => (
                  <div key={rev._id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">
                          {rev.user?.name?.charAt(0) || 'U'}
                        </div>
                        <span className="text-xs font-bold text-slate-900">{rev.user?.name || 'Customer'}</span>
                      </div>
                      {rev.isVerifiedPurchase && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Verified Purchase
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 fill-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">{rev.title}</h4>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                    <p className="text-[10px] text-slate-400">Reviewed on {new Date(rev.createdAt).toLocaleDateString()}</p>
                  </div>
                ))
              )}
            </div>

            {/* Write a Review Form */}
            <div className="lg:col-span-5 bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 mb-1">Write a Customer Review</h3>
              <p className="text-xs text-slate-500 mb-4">Share your experience with other shoppers</p>

              {reviewMsg && (
                <div
                  className={`p-3 rounded-lg text-xs font-semibold mb-4 ${
                    reviewMsg.type === 'error'
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  {reviewMsg.text}
                </div>
              )}

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Your Overall Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        className="p-1 hover:scale-110 transition"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Headline</label>
                  <input
                    type="text"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    required
                    placeholder="What's most important to know?"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Written Review</label>
                  <textarea
                    rows={4}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    required
                    placeholder="What did you like or dislike? How did this product perform?"
                    className="w-full bg-white border border-slate-200 rounded-lg p-3 text-xs text-slate-900 focus:outline-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition disabled:opacity-50"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Verified Review'}
                </button>
              </form>
            </div>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

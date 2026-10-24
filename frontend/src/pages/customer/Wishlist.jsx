import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, Store } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useCart } from '../../context/CartContext';
import api from '../../api/axios';

export default function Wishlist() {
  const { addToCart } = useCart();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSampleProducts = async () => {
      try {
        setLoading(true);
        const stored = localStorage.getItem('marketverse_wishlist');
        if (stored) {
          setWishlistItems(JSON.parse(stored));
        } else {
          const res = await api.get('/products?sort=rating');
          const sample = (res.data.data.products || []).slice(0, 3);
          setWishlistItems(sample);
          localStorage.setItem('marketverse_wishlist', JSON.stringify(sample));
        }
      } catch (err) {
        console.error('Wishlist load error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSampleProducts();
  }, []);

  const handleRemove = (productId) => {
    const updated = wishlistItems.filter((it) => it._id !== productId);
    setWishlistItems(updated);
    localStorage.setItem('marketverse_wishlist', JSON.stringify(updated));
  };

  const handleMoveToCart = (product) => {
    addToCart(product._id, 1);
    handleRemove(product._id);
  };

  return (
    <div className="min-h-screen bg-yellow-50/40 flex flex-col justify-between text-slate-800">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Saved Wishlist
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Products you have saved for later
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-72 bg-white rounded-2xl border border-yellow-200/60 animate-pulse"></div>
            ))}
          </div>
        ) : wishlistItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-yellow-200/90 p-10 text-center max-w-md mx-auto shadow-xs">
            <div className="w-14 h-14 rounded-full bg-yellow-100 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <Heart className="w-7 h-7" />
            </div>
            <h2 className="text-base font-black text-slate-900">Your Wishlist is Empty</h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">Explore the marketplace and save your favorites here.</p>
            <Link
              to="/products"
              className="mt-5 inline-block px-6 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-black text-xs rounded-xl shadow-xs transition"
            >
              Browse Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((prod) => (
              <div
                key={prod._id}
                className="bg-white rounded-2xl border border-yellow-200/90 hover:border-yellow-400 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-yellow-50/20 mb-3 border border-yellow-100">
                    <img
                      src={prod.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80'}
                      alt={prod.title}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => handleRemove(prod._id)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/90 hover:bg-white text-rose-600 shadow-xs transition"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-1">
                    <Store className="w-3.5 h-3.5 text-amber-600" />
                    <span>{prod.vendor?.storeName || 'Verified Seller'}</span>
                  </div>

                  <Link
                    to={`/products/${prod._id}`}
                    className="font-bold text-slate-900 hover:text-amber-700 text-sm line-clamp-1 block transition"
                  >
                    {prod.title}
                  </Link>

                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-base font-black text-slate-900">
                      ${(prod.salePrice || prod.price).toFixed(2)}
                    </span>
                    {prod.salePrice && (
                      <span className="text-xs text-slate-400 line-through">
                        ${prod.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-yellow-100">
                  <button
                    onClick={() => handleMoveToCart(prod)}
                    className="w-full py-2.5 bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-black text-xs rounded-xl transition shadow-xs flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4 stroke-[2.2]" /> Move to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Store, CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { formatPrice, formatSecondaryPrice } = useCurrency();

  const discountPercentage =
    product.salePrice && product.price > product.salePrice
      ? Math.round(((product.price - product.salePrice) / product.price) * 100)
      : 0;

  const displayPrice = product.salePrice || product.price;

  return (
    <div className="bg-white rounded-2xl border border-yellow-200/90 hover:border-yellow-400 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden group">
      
      {/* Product Image & Badges */}
      <div className="relative aspect-square overflow-hidden bg-yellow-50/20">
        <Link to={`/products/${product._id}`}>
          <img
            src={product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80'}
            alt={product.title}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </Link>

        {discountPercentage > 0 && (
          <span className="absolute top-2 left-2 bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs">
            {discountPercentage}% OFF
          </span>
        )}

        {product.featured && (
          <span className="absolute top-2 right-2 bg-yellow-400 text-slate-950 text-[10px] font-bold uppercase px-2 py-0.5 rounded-md shadow-xs">
            Featured
          </span>
        )}
      </div>

      {/* Product Details */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Category */}
          <div className="flex items-center justify-between text-[10px] sm:text-xs text-slate-400 font-medium mb-1">
            <span className="uppercase tracking-wider font-semibold text-slate-500 truncate max-w-[80px] sm:max-w-[120px]">
              {product.brand}
            </span>
            <span className="truncate max-w-[80px] sm:max-w-[120px]">
              {product.category?.name}
            </span>
          </div>

          {/* Product Title */}
          <Link
            to={`/products/${product._id}`}
            className="text-xs sm:text-sm font-bold text-slate-900 hover:text-amber-600 transition line-clamp-2 leading-snug"
          >
            {product.title}
          </Link>

          {/* Seller / Vendor Info */}
          {product.vendor && (
            <div className="mt-1 flex items-center gap-1 text-[10px] sm:text-[11px] text-slate-500">
              <Store className="w-3 h-3 text-amber-500 flex-shrink-0" />
              <span className="truncate">By <strong className="text-slate-700">{product.vendor.storeName}</strong></span>
            </div>
          )}

          {/* Star Rating */}
          <div className="mt-1.5 sm:mt-2 flex items-center gap-1 sm:gap-1.5">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 sm:w-3.5 h-3 sm:h-3.5 ${
                    i < Math.round(product.ratingsAverage || 5)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-200 fill-slate-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-slate-700">
              {product.ratingsAverage || 5.0}
            </span>
            <span className="text-[9px] sm:text-[11px] text-slate-400 hidden xs:inline">
              ({product.ratingsQuantity || 0})
            </span>
          </div>
        </div>

        {/* Pricing and Action */}
        <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-sm sm:text-base font-black text-slate-900 truncate">
                {formatPrice(displayPrice)}
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/80">
                {formatSecondaryPrice(displayPrice)}
              </span>
              {discountPercentage > 0 && (
                <span className="text-[10px] text-slate-400 line-through">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
            <p className="text-[9px] sm:text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5 sm:gap-1 truncate">
              <CheckCircle className="w-2.5 sm:w-3 h-2.5 sm:h-3 shrink-0" />
              <span>{product.stock > 5 ? 'In Stock' : `Only ${product.stock} left`}</span>
            </p>
          </div>

          <button
            onClick={() => addToCart(product._id, 1)}
            disabled={product.stock <= 0}
            className="p-2 sm:p-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-500 active:scale-95 text-slate-950 font-bold transition shadow-xs disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            title="Add to Basket"
            aria-label="Add to Basket"
          >
            <ShoppingCart className="w-3.5 sm:w-4 h-3.5 sm:h-4 stroke-[2.2]" />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Star, ShieldCheck, Tag, Sparkles, TrendingUp, HelpCircle } from 'lucide-react';
import { Product } from '../types';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (p: Product) => void;
  onRedirectClick: (p: Product, buttonType: 'buy_now' | 'view_deal') => void;
  activeTheme?: any;
  key?: string | number;
  isDarkMode?: boolean;
}

export default function ProductCard({ product, onSelectProduct, onRedirectClick, activeTheme, isDarkMode = false }: ProductCardProps) {
  
  const calculateDiscount = (price: number, original?: number) => {
    if (!original || original <= price) return null;
    const pct = Math.round(((original - price) / original) * 100);
    return pct;
  };

  const discount = calculateDiscount(product.price, product.originalPrice);

  const handleDetailsClick = () => {
    if (product.directRedirect) {
      onRedirectClick(product, 'buy_now');
    } else {
      onSelectProduct(product);
    }
  };

  return (
    <motion.div
      id={`prod-card-${product.id}`}
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3 }}
      className={`border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col h-full relative ${
        isDarkMode 
          ? 'bg-slate-900 border-slate-805 hover:border-slate-700' 
          : 'bg-white border-slate-200 hover:border-slate-300'
      }`}
    >
      
      {/* Category & Badge Overlay */}
      <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10 flex flex-wrap gap-1 sm:gap-1.5 max-w-[calc(100%-1rem)]">
        <span className="bg-slate-900/85 backdrop-blur-xs text-white px-1.5 py-0.5 sm:px-2.5 sm:py-1 text-[8px] sm:text-[10px] font-bold uppercase tracking-wider rounded border border-white/10 flex items-center gap-0.5 sm:gap-1">
          <Tag size={8} className="sm:w-2.5 sm:h-2.5" />
          {product.category}
        </span>
        
        {product.isTrending && (
          <span className="bg-amber-500 text-slate-950 px-1.5 py-0.5 text-[8px] sm:text-[10px] font-extrabold uppercase tracking-wide rounded shadow-xs flex items-center gap-0.5">
            <TrendingUp size={8} className="sm:w-2.5 sm:h-2.5" />
            <span className="hidden xs:inline">Trending</span>
          </span>
        )}
      </div>

      {/* Top and Image */}
      <div 
        onClick={handleDetailsClick}
        className={`aspect-video w-full overflow-hidden relative cursor-pointer group ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}
      >
        <img
          src={product.imageUrl}
          referrerPolicy="no-referrer"
          alt={product.title}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        {/* Hover inspect overlay effect */}
        <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-md sm:rounded-lg text-[9px] sm:text-xs font-bold shadow-md text-center max-w-[85%] ${isDarkMode ? 'bg-slate-800/95 text-slate-100' : 'bg-white/95 text-slate-900'}`}>
            {(product.directRedirect && !product.hideBuyNow) ? 'Direct Link' : 'Inspect Specs'}
          </span>
        </div>
      </div>

      {/* Product Information Body */}
      <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating visual block */}
          {product.rating && (
            <div className="flex items-center gap-1 mb-1 sm:mb-1.5">
              <div className="flex text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={9}
                    className={`${i < Math.floor(product.rating || 0) ? "fill-amber-400 text-amber-400" : isDarkMode ? "text-slate-700" : "text-slate-200"} sm:w-3 sm:h-3`}
                  />
                ))}
              </div>
              <span className={`text-[9px] sm:text-[11px] font-bold font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>({product.rating.toFixed(1)})</span>
            </div>
          )}

          <h3 
            onClick={handleDetailsClick}
            className={`text-xs sm:text-base font-display font-extrabold cursor-pointer line-clamp-1 py-0.5 transition-colors ${isDarkMode ? 'text-slate-100' : 'text-slate-950'} ${activeTheme?.textHover || 'hover:text-blue-600'}`}
            title={product.title}
          >
            {product.title}
          </h3>

          <p className={`text-[10px] sm:text-xs line-clamp-1 sm:line-clamp-2 leading-relaxed mt-0.5 sm:mt-1 mb-2 sm:mb-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {product.shortDescription}
          </p>
        </div>

        {/* Pricing Layout */}
        <div className={`mt-auto pt-2 sm:pt-3 border-t flex items-center justify-between flex-wrap gap-1 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
          <div className="flex items-baseline gap-1 sm:gap-2">
            <span className={`text-xs sm:text-lg font-display font-black ${isDarkMode ? 'text-slate-100' : 'text-slate-950'}`}>
              ${product.price ? product.price.toLocaleString() : 'N/A'}
            </span>
            {product.originalPrice && (
              <span className={`text-[9px] sm:text-xs line-through ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                ${product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
          
          {discount && (
            <span className={`text-[8px] sm:text-[10px] font-extrabold px-1.5 sm:px-2.5 py-0.5 rounded border ${isDarkMode ? 'text-emerald-455 bg-emerald-950/40 border-emerald-900/40' : 'text-emerald-700 bg-emerald-50 border-emerald-100'}`}>
              {discount}% Off
            </span>
          )}
        </div>
      </div>

      {/* Card Action Buttons */}
      <div className={`p-2.5 pt-0 sm:p-4 sm:pt-0 grid ${product.hideBuyNow ? 'grid-cols-1' : 'grid-cols-2'} gap-1.5 sm:gap-2`}>
        <button
          id={`view-btn-${product.id}`}
          onClick={handleDetailsClick}
          className={`py-1 px-1.5 sm:py-2 sm:px-3 border text-[10px] sm:text-xs font-bold rounded-md sm:rounded-lg transition-all text-center flex items-center justify-center gap-1 cursor-pointer select-none outline-none ${
            isDarkMode 
              ? 'border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-300' 
              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-850'
          }`}
        >
          {product.hideBuyNow ? 'Details' : (product.directRedirect ? 'Buy Now' : 'Details')}
        </button>
        {!product.hideBuyNow && (
          <button
            id={`buy-btn-${product.id}`}
            onClick={() => onRedirectClick(product, 'buy_now')}
            className={`py-1 px-1.5 sm:py-2 sm:px-3 ${activeTheme?.bg || 'bg-blue-600'} ${activeTheme?.bgHover || 'hover:bg-blue-500'} text-white text-[10px] sm:text-xs font-bold rounded-md sm:rounded-lg hover:shadow-xs active:scale-[0.98] transition-all text-center flex items-center justify-center gap-1 cursor-pointer select-none outline-none`}
          >
            Buy Now
          </button>
        )}
      </div>

    </motion.div>
  );
}

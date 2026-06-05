/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, ExternalLink, ShieldCheck, CheckCircle2, Award, Sparkles, Star, Tag, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../types';
import { motion } from 'motion/react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onRedirectClick: (p: Product, buttonType: 'buy_now' | 'view_deal') => void;
  activeTheme?: any;
  isDarkMode?: boolean;
}

export default function ProductDetailModal({ product, onClose, onRedirectClick, activeTheme, isDarkMode = false }: ProductDetailModalProps) {
  if (!product) return null;

  const [activeImage, setActiveImage] = React.useState(product.imageUrl);

  React.useEffect(() => {
    if (product) {
      setActiveImage(product.imageUrl);
    }
  }, [product]);

  const allImages = React.useMemo(() => {
    return [product.imageUrl, ...(product.images || [])].filter((url): url is string => typeof url === 'string' && url.trim().length > 0);
  }, [product.imageUrl, product.images]);

  const calculateDiscount = (price: number, original?: number) => {
    if (!original || original <= price) return null;
    return Math.round(((original - price) / original) * 100);
  };

  const discount = calculateDiscount(product.price, product.originalPrice);

  return (
    <div id="product-detail-backdrop" className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      
      <motion.div
        id="product-detail-window"
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.3 }}
        className={`rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative border transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-805 text-slate-100' : 'bg-white border-slate-200 text-slate-900'}`}
      >
        
        {/* Close Button Pin */}
        <button
          id="close-detail-btn"
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-full border transition-colors z-20 cursor-pointer ${isDarkMode ? 'bg-slate-805 hover:bg-slate-700 border-slate-700 text-slate-400 hover:text-slate-200' : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-800'}`}
        >
          <X size={18} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 p-4 sm:p-8 md:p-10 gap-5 sm:gap-8">
          
          {/* Large Image Showcase panel */}
          <div className="md:col-span-5 flex flex-col gap-3.5 sm:gap-4">
            <div className={`aspect-square w-full rounded-2xl overflow-hidden shadow-md relative border group ${isDarkMode ? 'bg-slate-955 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
              
              {/* Main Image with motion zoom */}
              <motion.img
                key={activeImage}
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25 }}
                src={activeImage}
                referrerPolicy="no-referrer"
                alt={product.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Left/Right Overlaid Arrow Buttons for fast flipping */}
              {allImages.length > 1 && (
                <>
                  <button
                    id="prev-slide-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      const curIdx = allImages.indexOf(activeImage);
                      const nextIdx = curIdx === 0 ? allImages.length - 1 : curIdx - 1;
                      setActiveImage(allImages[nextIdx]);
                    }}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-slate-900/45 hover:bg-slate-900/75 text-white backdrop-blur-xs transition-colors cursor-pointer z-10"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    id="next-slide-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      const curIdx = allImages.indexOf(activeImage);
                      const nextIdx = curIdx === allImages.length - 1 ? 0 : curIdx + 1;
                      setActiveImage(allImages[nextIdx]);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-slate-900/45 hover:bg-slate-900/75 text-white backdrop-blur-xs transition-colors cursor-pointer z-10"
                  >
                    <ChevronRight size={16} />
                  </button>
                </>
              )}

              <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white px-2.5 py-0.5 text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded border border-white/10 flex items-center gap-1.5 z-10">
                <Tag size={10} />
                {product.category}
              </span>
            </div>

            {/* Thumbnail Carousel Slider Row */}
            {allImages.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
                {allImages.map((imgUrl, i) => {
                  const isActive = imgUrl === activeImage;
                  return (
                    <button
                      key={i}
                      onClick={() => setActiveImage(imgUrl)}
                      className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all cursor-pointer ${
                        isActive 
                          ? `${activeTheme?.borderActive || 'border-blue-600'} scale-95 shadow-sm` 
                          : 'border-transparent hover:scale-95 hover:opacity-90'
                      } ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}
                    >
                      <img
                        src={imgUrl}
                        referrerPolicy="no-referrer"
                        alt={`${product.title} Thumbnail ${i + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=Error';
                        }}
                      />
                    </button>
                  );
                })}
              </div>
            )}
            
            {/* Security Guarantee Badge panel */}
            <div className={`rounded-xl p-3 border flex items-start gap-2 ${isDarkMode ? 'bg-slate-850 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <ShieldCheck className={`${activeTheme?.text || 'text-blue-600'} flex-shrink-0 mt-0.5`} size={16} />
              <div>
                <p className={`text-[11px] sm:text-xs font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>Verified Direct Store Deals</p>
                <p className={`text-[9.5px] sm:text-[10px] leading-snug ${isDarkMode ? 'text-slate-400' : 'text-slate-505'}`}>All redirect checkout pipelines are processed directly through authorized external e-commerce gateways safely.</p>
              </div>
            </div>
          </div>

          {/* Details & Specs descriptive panel */}
          <div className="md:col-span-7 flex flex-col justify-between">
            <div>
              {/* Product Rating badge */}
              {product.rating && (
                <div className="flex items-center gap-1 sm:gap-1.5 mb-1.5 sm:mb-2">
                  <div className="flex text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={11}
                        className={`${i < Math.floor(product.rating || 0) ? "fill-amber-400 text-amber-400" : isDarkMode ? "text-slate-705" : "text-slate-200"} sm:w-3.5 sm:h-3.5`}
                      />
                    ))}
                  </div>
                  <span className={`text-[10px] sm:text-xs font-bold font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    {product.rating.toFixed(1)} Out Of 5 Stars
                  </span>
                </div>
              )}

              <h2 className={`text-base sm:text-2xl font-display font-extrabold tracking-tight leading-tight mb-2 ${isDarkMode ? 'text-slate-50' : 'text-slate-950'}`}>
                {product.title}
              </h2>

              {/* Pricing section */}
              <div className={`flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5 p-2.5 sm:p-3 border rounded-xl w-fit flex-wrap ${isDarkMode ? 'bg-slate-850 border-slate-800' : 'bg-slate-50 border-slate-150'}`}>
                <span className={`text-[9px] sm:text-xs font-mono font-medium ${isDarkMode ? 'text-slate-450' : 'text-slate-400'}`}>LATEST SALE:</span>
                <span className={`text-base sm:text-2xl font-display font-black ${activeTheme?.text || 'text-blue-600'}`}>
                  ${product.price ? product.price.toLocaleString() : 'N/A'}
                </span>
                {product.originalPrice && (
                  <span className={`text-xs sm:text-sm line-through ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                    ${product.originalPrice.toLocaleString()}
                  </span>
                )}
                {discount && (
                  <span className={`text-[8px] sm:text-[10px] font-extrabold px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded border uppercase ${isDarkMode ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/60' : 'bg-emerald-100 text-emerald-800 border-emerald-200'}`}>
                    SAVE {discount}% NOW
                  </span>
                )}
              </div>

              {/* Product description paragraph */}
              <div className="mb-4 sm:mb-6">
                <h4 className="text-[10px] sm:text-xs font-bold text-slate-450 uppercase font-mono tracking-wider mb-1.5">Detailed Overview</h4>
                <p className={`text-xs sm:text-sm leading-relaxed p-3 sm:p-4 rounded-xl border ${isDarkMode ? 'text-slate-300 bg-slate-850 border-slate-800' : 'text-slate-700 bg-slate-50/50 border-slate-200/50'}`}>
                  {product.description}
                </p>
              </div>

              {/* Bulleted Benefits checklist */}
              {product.benefits && product.benefits.length > 0 && (
                <div className="mb-4 sm:mb-6">
                  <h4 className="text-[10px] sm:text-xs font-bold text-slate-450 uppercase font-mono tracking-wider mb-1.5">Highlight Advantaged Value</h4>
                  <ul className="space-y-2">
                    {product.benefits.map((benefit, idx) => (
                      <li key={idx} className={`flex items-start gap-2.5 text-xs font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        <CheckCircle2 className="text-emerald-500 flex-shrink-0 mt-0.5" size={14} />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* CTA action strip */}
            <div className={`border-t pt-3 sm:pt-5 mt-3 sm:mt-4 flex flex-col sm:flex-row gap-2 sm:gap-3 ${isDarkMode ? 'border-slate-800' : 'border-slate-150'}`}>
              <button
                id="modal-view-deal"
                onClick={() => onRedirectClick(product, 'view_deal')}
                className={`flex-1 py-2 sm:py-3 border text-[11px] sm:text-xs font-bold rounded-lg sm:rounded-xl transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer outline-none select-none ${isDarkMode ? 'border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-300 bg-slate-850' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800 bg-white'}`}
              >
                <Award size={14} className="text-amber-500" />
                View Direct Deal
              </button>
              
              {!product.hideBuyNow && (
                <button
                  id="modal-buy-now"
                  onClick={() => onRedirectClick(product, 'buy_now')}
                  className={`flex-1 py-2 sm:py-3 ${activeTheme?.bg || 'bg-blue-600'} ${activeTheme?.bgHover || 'hover:bg-blue-500'} hover:scale-[1.01] text-white text-[11px] sm:text-xs font-bold rounded-lg sm:rounded-xl shadow-md ${activeTheme?.glow || 'shadow-blue-500/10'} transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer outline-none select-none`}
                >
                  <ShoppingCart size={14} />
                  Buy Product Now
                  <ExternalLink size={12} />
                </button>
              )}
            </div>

          </div>
        </div>

      </motion.div>
    </div>
  );
}

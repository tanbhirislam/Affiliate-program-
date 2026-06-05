/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, Star, ShoppingCart, Percent } from 'lucide-react';
import { Product } from '../types';

interface FeaturedHeroProps {
  products: Product[];
  onSelectProduct: (p: Product) => void;
  onRedirectClick: (p: Product, buttonType: 'buy_now' | 'view_deal') => void;
  themeConfig?: any;
  activeTheme?: any;
}

export default function FeaturedHero({ products, onSelectProduct, onRedirectClick, themeConfig, activeTheme }: FeaturedHeroProps) {
  const featured = products.filter(p => p.isFeatured);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (featured.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featured.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [featured.length]);

  if (featured.length === 0) return null;

  const activeDoc = featured[currentIndex];

  const calculateDiscount = (price: number, original?: number) => {
    if (!original || original <= price) return null;
    const pct = Math.round(((original - price) / original) * 100);
    return pct;
  };

  const discount = calculateDiscount(activeDoc.price, activeDoc.originalPrice);

  const heroBgGradient = activeTheme?.gradientBg || 'from-slate-900 via-slate-800 to-blue-950';
  const heroBadgeBg = activeTheme?.bgAccentLight || 'bg-blue-500/20';
  const heroBadgeBorder = activeTheme?.borderAccentLight || 'border-blue-400/30';
  const heroBadgeText = activeTheme?.textAccent || 'text-blue-300';
  const heroBtnBg = activeTheme?.bg || 'bg-blue-600';
  const heroBtnHoverBg = activeTheme?.bgHover || 'hover:bg-blue-500';
  const heroBtnGlow = activeTheme?.glow || 'shadow-blue-500/20';
  const heroImgGlow = activeTheme?.glow || 'shadow-blue-500/20';
  const heroIndicatorBg = activeTheme?.bg || 'bg-blue-500';

  return (
    <div id="featured-hero-section" className={`bg-gradient-to-br ${heroBgGradient} text-white rounded-xl sm:rounded-2xl overflow-hidden relative shadow-md sm:shadow-xl shadow-slate-100/50 mb-4 sm:mb-8 border border-white/5`}>
      {/* Background radial highlight */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(59,130,246,0.12),transparent_60%)] pointer-events-none"></div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeDoc.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="grid grid-cols-1 lg:grid-cols-12 p-4 sm:p-10 md:p-12 gap-4 lg:gap-8 items-center"
        >
          {/* Hero editorial messaging */}
          <div className="lg:col-span-7 flex flex-col items-start gap-2.5 sm:gap-4">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 sm:px-3 sm:py-1 ${heroBadgeBg} ${heroBadgeText} font-mono text-[9px] sm:text-xs font-bold uppercase tracking-wider rounded-full border ${heroBadgeBorder}`}>
              <Sparkles size={10} className="animate-pulse sm:w-3 sm:h-3" />
              {themeConfig?.heroBadgeText || 'HOT DEALS SPOTLIGHT'}
            </span>

            <h2 className="text-lg xs:text-xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-black tracking-tight leading-tight">
              {activeDoc.title}
            </h2>

            <p className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed max-w-xl line-clamp-2 xs:line-clamp-3 sm:line-clamp-none">
              {activeDoc.shortDescription}
            </p>

            <div className="flex items-center gap-3 sm:gap-6 my-1 sm:my-2 bg-slate-900/40 p-2 sm:p-3 rounded-lg sm:rounded-xl border border-white/5 w-full xs:w-auto">
              <div className="flex flex-col">
                <span className="text-[9px] sm:text-xs text-slate-400 uppercase font-mono tracking-wider font-semibold">Deal Price</span>
                <span className="text-base sm:text-2xl font-display font-black text-amber-300">
                  ${activeDoc.price.toLocaleString()}
                </span>
              </div>
              {activeDoc.originalPrice && (
                <div className="flex flex-col border-l border-white/10 pl-3 sm:pl-6">
                  <span className="text-[9px] sm:text-xs text-slate-400 uppercase font-mono tracking-wider font-semibold">List price</span>
                  <span className="text-xs sm:text-sm text-slate-400 line-through">
                    ${activeDoc.originalPrice.toLocaleString()}
                  </span>
                </div>
              )}
              {discount && (
                <div className="bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded sm:rounded-lg text-[9px] sm:text-xs font-extrabold flex items-center border border-emerald-500/30">
                  <Percent size={10} className="mr-0.5 sm:w-3 sm:h-3" />
                  SAVE {discount}%
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:flex sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3.5 w-full sm:w-auto mt-1 sm:mt-2">
              <button
                id={`hero-buy-${activeDoc.id}`}
                onClick={() => onRedirectClick(activeDoc, 'buy_now')}
                className={`px-3 py-2 sm:px-6 sm:py-3.5 ${heroBtnBg} ${heroBtnHoverBg} active:scale-[0.98] text-[10px] sm:text-xs font-bold rounded-lg sm:rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md ${heroBtnGlow} border-t border-white/10 cursor-pointer`}
              >
                <ShoppingCart size={12} className="sm:w-3.5 sm:h-3.5" />
                Buy Product
              </button>
              <button
                id={`hero-view-${activeDoc.id}`}
                onClick={() => onSelectProduct(activeDoc)}
                className="px-3 py-2 sm:px-5 sm:py-3.5 bg-slate-800 hover:bg-slate-750 active:scale-[0.98] hover:border-slate-500 border border-slate-700 text-[10px] sm:text-xs font-bold rounded-lg sm:rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Inspect Specs
                <ArrowRight size={12} className="sm:w-3.5 sm:h-3.5" />
              </button>
            </div>
          </div>

          {/* Hero product image */}
          <div className="lg:col-span-5 flex justify-center relative">
            <div className="relative group max-w-sm w-full">
              {/* Image Frame Shadow */}
              <div className={`absolute -inset-0.5 bg-gradient-to-tr ${activeTheme?.gradientFrom || 'from-blue-500'} ${activeTheme?.gradientTo || 'to-indigo-500'} rounded-lg sm:rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition duration-1000`}></div>
              
              <div className="relative overflow-hidden rounded-lg sm:rounded-2xl border border-white/10 shadow-lg bg-slate-900">
                <img
                  src={activeDoc.imageUrl}
                  referrerPolicy="no-referrer"
                  alt={activeDoc.title}
                  className="w-full h-28 xs:h-36 sm:h-64 md:h-80 object-cover transform hover:scale-[1.03] transition-transform duration-700"
                />
                
                {/* Micro satisfaction stars UI */}
                {activeDoc.rating && (
                  <div className="absolute bottom-2.5 left-2.5 sm:bottom-4 sm:left-4 bg-slate-950/80 backdrop-blur-md px-2 py-1 sm:px-3 sm:py-1.5 rounded-full flex items-center gap-1 border border-white/10 shadow-md">
                    <Star size={10} className="text-amber-400 fill-amber-400 sm:w-3 sm:h-3" />
                    <span className="text-[9px] sm:text-xs font-bold text-white tracking-tight">{activeDoc.rating} Rating</span>
                  </div>
                )}
              </div>
            </div>
          </div>

        </motion.div>
      </AnimatePresence>

      {/* Slider dots indicator */}
      {featured.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {featured.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                currentIndex === i ? `${heroIndicatorBg} w-6` : 'bg-white/30 hover:bg-white/50'
              }`}
              aria-label={`Slide target ${i}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
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
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Auto-slide to the next product in the featured collection
  useEffect(() => {
    if (featured.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featured.length);
    }, 15000); // 15 seconds per product to allow time to slide through multiple images
    return () => clearInterval(interval);
  }, [featured.length]);

  if (featured.length === 0) return null;

  const activeDoc = featured[currentIndex];

  // Resolve all valid image assets for the current featured product
  const allImages = useMemo(() => {
    return [activeDoc.imageUrl, ...(activeDoc.images || [])].filter(
      (url): url is string => typeof url === 'string' && url.trim().length > 0
    );
  }, [activeDoc.imageUrl, activeDoc.images]);

  // Reset image index when current product index changes
  useEffect(() => {
    setActiveImageIndex(0);
  }, [currentIndex]);

  // Slideshow cycle for product's individual images
  useEffect(() => {
    if (allImages.length <= 1) return;
    const imgInterval = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % allImages.length);
    }, 4500); // auto slide product images every 4.5 seconds
    return () => clearInterval(imgInterval);
  }, [allImages]);

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
  const heroIndicatorBg = activeTheme?.bg || 'bg-blue-500';

  return (
    <div id="featured-hero-section" className={`bg-gradient-to-br ${heroBgGradient} text-white rounded-xl sm:rounded-2xl overflow-hidden relative shadow-2xl shadow-slate-950/45 mb-4 sm:mb-6 border border-white/10`}>
      {/* Background radial highlight & soft floating mesh ambient lights */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(59,130,246,0.14),transparent_60%)] pointer-events-none"></div>
      <div className="absolute top-6 left-6 w-36 h-36 rounded-full bg-blue-500/10 blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '4s' }}></div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeDoc.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="grid grid-cols-1 lg:grid-cols-12 p-3 sm:p-5 md:p-6 pb-6 sm:pb-8 lg:pb-8 gap-3 lg:gap-6 items-center relative z-10"
        >
          {/* Hero editorial messaging */}
          <div className="lg:col-span-7 flex flex-col items-start gap-1 sm:gap-2.5">
            <div className="flex flex-wrap gap-1 items-center">
              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 ${heroBadgeBg} ${heroBadgeText} font-sans text-[7px] sm:text-[10px] font-semibold tracking-wide rounded-full border ${heroBadgeBorder} shadow-sm`}>
                <Sparkles size={8} className="animate-spin text-amber-300" style={{ animationDuration: '3s' }} />
                {themeConfig?.heroBadgeText || 'Curated Prime Pick'}
              </span>
              
              {activeDoc.isTrending && (
                <span className="bg-amber-400 text-slate-950 px-1 py-0.5 text-[7px] sm:text-[9px] font-bold font-sans tracking-wide rounded-full flex items-center gap-0.5">
                  🔥 HOT DEAL
                </span>
              )}
            </div>

            <h2 className="text-[13px] xs:text-base sm:text-xl lg:text-2xl font-sans font-bold tracking-tight leading-snug text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-250">
              {activeDoc.title}
            </h2>

            <p className="text-slate-300 text-[10px] sm:text-xs leading-relaxed max-w-xl line-clamp-1 sm:line-clamp-2 opacity-85 font-normal">
              {activeDoc.shortDescription}
            </p>

            {/* High Conversion Trust Badges underneath spec */}
            <div className="hidden sm:flex items-center gap-2.5 text-[9px] text-slate-400 font-sans tracking-wide font-medium">
              <span className="flex items-center gap-0.5 text-emerald-400">
                ✓ Price Tracked
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-700"></span>
              <span className="flex items-center gap-0.5 text-blue-400">
                🌟 Curator Checked
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-700"></span>
              <span className="flex items-center gap-0.5 text-amber-400">
                🛡️ Verified URL
              </span>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-4.5 my-0.5 bg-slate-950/40 backdrop-blur-md p-1.5 sm:p-2.5 rounded-lg border border-white/5 w-full xs:w-auto">
              <div className="flex flex-col">
                <span className="text-[7.5px] sm:text-[9px] text-slate-400 uppercase tracking-wider font-semibold leading-none">Deal Price</span>
                <span className="text-xs sm:text-lg font-bold text-amber-300 mt-1 leading-none">
                  ${activeDoc.price.toLocaleString()}
                </span>
              </div>
              {activeDoc.originalPrice && (
                <div className="flex flex-col border-l border-white/10 pl-2.5 sm:pl-4.5">
                  <span className="text-[7.5px] sm:text-[9px] text-slate-455 uppercase tracking-wider font-semibold leading-none">Baseline List</span>
                  <span className="text-[10px] sm:text-sm text-slate-500 line-through mt-1 leading-none">
                    ${activeDoc.originalPrice.toLocaleString()}
                  </span>
                </div>
              )}
              {discount && (
                <div className="bg-emerald-500/20 text-emerald-300 px-1 py-0.2 sm:px-2 sm:py-0.5 rounded text-[7.5px] sm:text-[9px] font-bold tracking-wide flex items-center border border-emerald-500/25">
                  <Percent size={7.5} className="mr-0.5" />
                  SAVE {discount}%
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:flex sm:flex-row items-stretch sm:items-center gap-1.5 w-full sm:w-auto mt-0.5">
              <button
                id={`hero-buy-${activeDoc.id}`}
                onClick={() => onRedirectClick(activeDoc, 'buy_now')}
                className={`px-2 py-1.5 sm:px-4 sm:py-2 ${heroBtnBg} ${heroBtnHoverBg} text-[9px] sm:text-xs font-bold tracking-wide rounded transition-all flex items-center justify-center gap-1 cursor-pointer`}
              >
                <ShoppingCart size={10} />
                Promo Direct
              </button>
              <button
                id={`hero-view-${activeDoc.id}`}
                onClick={() => onSelectProduct(activeDoc)}
                className="px-2 py-1.5 sm:px-4 sm:py-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-705 text-[9px] sm:text-xs font-bold tracking-wide rounded transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                Specs & Proof
                <ArrowRight size={10} className="text-slate-400" />
              </button>
            </div>
          </div>

          {/* Hero product image aspect-preserving gallery viewport */}
          <div className="lg:col-span-5 flex justify-center relative w-full lg:mt-0 mt-1">
            <div className="relative group max-w-xs w-full">
              {/* Image Frame Shadow */}
              <div className={`absolute -inset-0.5 bg-gradient-to-tr ${activeTheme?.gradientFrom || 'from-blue-500'} ${activeTheme?.gradientTo || 'to-indigo-500'} rounded-xl blur-lg opacity-20 group-hover:opacity-30 transition duration-500`}></div>
              
              <div className="relative overflow-hidden rounded-xl border border-white/10 shadow-lg bg-slate-900/40 backdrop-blur-sm w-full h-[90px] xs:h-[110px] sm:h-[170px] md:h-[200px] flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={`${activeDoc.id}-${activeImageIndex}`}
                    src={allImages[activeImageIndex]}
                    referrerPolicy="no-referrer"
                    alt={`${activeDoc.title} - Image ${activeImageIndex + 1}`}
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="absolute inset-0 w-full h-full object-cover cursor-pointer hover:scale-[1.03] transition-transform duration-300"
                    onClick={() => onSelectProduct(activeDoc)}
                  />
                </AnimatePresence>
                
                {/* Micro satisfaction stars UI */}
                {activeDoc.rating && (
                  <div className="absolute bottom-1 z-10 bg-slate-950/85 backdrop-blur-md px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-white/10 shadow-sm pointer-events-none">
                    <Star size={8} className="text-amber-400 fill-amber-400" />
                    <span className="text-[7.5px] sm:text-[9px] font-semibold text-white tracking-wide uppercase">{activeDoc.rating.toFixed(1)}</span>
                  </div>
                )}

                {/* Dots indicator for current active product's slides */}
                {allImages.length > 1 && (
                  <div className="absolute bottom-1 right-1 z-10 flex gap-0.5 bg-slate-950/70 backdrop-blur-md p-0.5 rounded-full border border-white/10">
                    {allImages.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveImageIndex(idx);
                        }}
                        className={`w-1 h-1 rounded-full transition-all ${
                          activeImageIndex === idx ? 'bg-amber-400 scale-110' : 'bg-white/40 hover:bg-white/70'
                        }`}
                        title={`View product gallery image ${idx + 1}`}
                      />
                    ))}
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

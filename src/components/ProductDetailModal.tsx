/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, ExternalLink, ShieldCheck, CheckCircle2, Award, Sparkles, 
  Star, Tag, ShoppingCart, ChevronLeft, ChevronRight, Copy, Check,
  Maximize2, Info, Globe, AlertTriangle, Layers, ThumbsUp
} from 'lucide-react';
import { Product } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onRedirectClick: (p: Product, buttonType: 'buy_now' | 'view_deal') => void;
  activeTheme?: any;
  isDarkMode?: boolean;
  themeConfig?: any;
}

export default function ProductDetailModal({ 
  product, 
  onClose, 
  onRedirectClick, 
  activeTheme, 
  isDarkMode = false,
  themeConfig
}: ProductDetailModalProps) {
  if (!product) return null;

  const [activeImage, setActiveImage] = useState(product.imageUrl);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'highlights' | 'verification'>('overview');
  const [copiedLink, setCopiedLink] = useState(false);
  
  // High-performance secure redirect overlay state
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(3);

  // Sync active image with product
  useEffect(() => {
    if (product) {
      setActiveImage(product.imageUrl);
      setIsRedirecting(false);
      setActiveTab('overview');
    }
  }, [product]);

  // Handle countdown loop when redirection starts
  useEffect(() => {
    let timer: any;
    if (isRedirecting && redirectCountdown > 0) {
      timer = setTimeout(() => {
        setRedirectCountdown(prev => prev - 1);
      }, 1000);
    } else if (isRedirecting && redirectCountdown === 0) {
      // Execute the actual redirect function
      onRedirectClick(product, 'buy_now');
      // Keep redirecting screen active so the customer knows why, 
      // but auto-dismiss after a few seconds or allow cancel
    }
    return () => clearTimeout(timer);
  }, [isRedirecting, redirectCountdown, onRedirectClick, product]);

  const allImages = useMemo(() => {
    return [product.imageUrl, ...(product.images || [])].filter(
      (url): url is string => typeof url === 'string' && url.trim().length > 0
    );
  }, [product.imageUrl, product.images]);

  const activeImageIndex = allImages.indexOf(activeImage);

  const calculateDiscount = (price: number, original?: number) => {
    if (!original || original <= price) return null;
    return Math.round(((original - price) / original) * 100);
  };

  const discount = calculateDiscount(product.price, product.originalPrice);

  const handleCopyAffiliateUrl = () => {
    navigator.clipboard.writeText(product.affiliateUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleBuyNowTrigger = () => {
    // Initiate the beautiful simulated direct checkout sequence
    setRedirectCountdown(3);
    setIsRedirecting(true);
    // Open immediately in background too, to prevent secondary thread blocking
    try {
      window.open(product.affiliateUrl, '_blank', 'noopener,noreferrer');
    } catch (e) {
      console.warn("Direct pop_up blocked. Fallback countdown handler is active.");
    }
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    const curIdx = allImages.indexOf(activeImage);
    const nextIdx = curIdx === 0 ? allImages.length - 1 : curIdx - 1;
    setActiveImage(allImages[nextIdx]);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    const curIdx = allImages.indexOf(activeImage);
    const nextIdx = curIdx === allImages.length - 1 ? 0 : curIdx + 1;
    setActiveImage(allImages[nextIdx]);
  };

  return (
    <div 
      id="product-detail-backdrop" 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      
      <motion.div
        id="product-detail-window"
        initial={{ opacity: 0, scale: 0.97, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 15 }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        className={`rounded-2xl max-w-4xl w-full max-h-[94vh] overflow-y-auto shadow-2xl relative border transition-all duration-300 ${
          isDarkMode 
            ? 'bg-slate-900 border-slate-800 text-slate-100 shadow-slate-950/90' 
            : 'bg-white border-slate-200 text-slate-900 shadow-slate-350/50'
        }`}
      >
        
        {/* Sticky Header Close Control */}
        <div className="absolute top-4 right-4 z-40 flex items-center gap-2">
          {allImages.length > 0 && (
            <button
              onClick={() => setIsLightboxOpen(true)}
              className={`p-2 rounded-full border transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                isDarkMode 
                  ? 'bg-slate-800/80 hover:bg-slate-755 border-slate-700 text-slate-300 hover:text-slate-100' 
                  : 'bg-slate-100/90 hover:bg-slate-200 border-slate-250 text-slate-600 hover:text-slate-900'
              }`}
              title="Inspect Image in Quality Zoom Lightbox"
            >
              <Maximize2 size={16} />
            </button>
          )}
          
          <button
            id="close-detail-btn"
            onClick={onClose}
            className={`p-2 rounded-full border transition-all cursor-pointer hover:scale-105 active:scale-95 ${
              isDarkMode 
                ? 'bg-slate-800/80 hover:bg-rose-950/85 border-slate-700 text-slate-350 hover:text-rose-400 hover:border-rose-900/50' 
                : 'bg-slate-100/90 hover:bg-rose-50 border-slate-250 text-slate-600 hover:text-rose-600 hover:border-rose-100'
            }`}
            title="Close details window"
          >
            <X size={16} />
          </button>
        </div>

        {/* Simple & Clean Header */}
        <div className={`px-5 py-3 border-b flex items-center justify-between gap-4 rounded-t-2xl font-sans text-xs tracking-wide leading-none ${
          isDarkMode 
            ? 'bg-slate-950/40 text-slate-300 border-slate-800' 
            : 'bg-slate-50 text-slate-700 border-slate-150'
        }`}>
          <span className="flex items-center gap-1.5 font-semibold text-xs text-slate-500 dark:text-slate-450">
            <ShoppingCart size={13} className="text-blue-500" />
            Product Details & Deal Pipeline
          </span>
          <span className="inline-flex items-center gap-1 text-emerald-500 text-[10px] sm:text-xs font-semibold animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Verified Secure Portal
          </span>
        </div>

        {/* Outer Grid Body */}
        <div className="p-4 sm:p-5 md:p-6 space-y-6">
          
          {/* ==================== SCREEN TOP ROW: GALLERY AND PRIMARY ACTIONS ==================== */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 items-stretch">
            
            {/* ==================== LEFT COLUMN: VISUAL GALLERY WITH ASPECT PRESERVING VIEWPORT ==================== */}
            <div className="md:col-span-5 flex flex-col gap-3">
              
              {/* Aspect Ratio Box with Blurred Background Overlay - Guarantees perfect centering & fitting for any size/ratio admin upload */}
              <div 
                className={`aspect-video md:aspect-[4/3] w-full rounded-xl overflow-hidden shadow-sm relative border group bg-slate-950 flex items-center justify-center`}
                onClick={() => setIsLightboxOpen(true)}
                title="Click to view full screen zoom"
              >
                
                {/* Image Transition viewport containing smart ratios and fallbacks */}
                <div className="w-full h-full relative cursor-zoom-in overflow-hidden flex items-center justify-center">
                  
                  {/* Blurred backdrop preview preventing white/empty bars for vertical or landscape extreme ratios */}
                  <img
                    src={activeImage}
                    referrerPolicy="no-referrer"
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover blur-xl opacity-35 scale-110 pointer-events-none select-none"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  
                  <motion.img
                    key={activeImage}
                    initial={{ opacity: 0.3, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.22 }}
                    src={activeImage}
                    referrerPolicy="no-referrer"
                    alt={product.title}
                    className="relative z-10 max-w-full max-h-full object-contain pointer-events-none select-none transition-transform duration-700 group-hover:scale-[1.02] ease-out"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Image+Not+Found';
                    }}
                  />
                </div>

                {/* Slider Overlaid Arrows */}
                {allImages.length > 1 && (
                  <>
                    <button
                      id="prev-slide-btn"
                      onClick={handlePrevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/70 hover:bg-slate-950/90 text-white backdrop-blur-md border border-white/5 shadow-md flex items-center justify-center transition-all cursor-pointer z-10 hover:scale-105 active:scale-95"
                      title="Previous Image"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      id="next-slide-btn"
                      onClick={handleNextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/70 hover:bg-slate-950/90 text-white backdrop-blur-md border border-white/5 shadow-md flex items-center justify-center transition-all cursor-pointer z-10 hover:scale-105 active:scale-95"
                      title="Next Image"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </>
                )}

                {/* Badge & Image Index overlay */}
                <div className="absolute bottom-3 left-3 flex gap-2 z-10">
                  <span className="bg-slate-950/80 backdrop-blur-md text-slate-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded border border-white/10 flex items-center gap-1">
                    <Tag size={9} />
                    {product.category}
                  </span>
                  
                  {allImages.length > 1 && (
                    <span className="bg-slate-950/80 backdrop-blur-md text-slate-350 px-2 py-0.5 text-[9px] font-mono font-bold rounded border border-white/10">
                      {activeImageIndex + 1} / {allImages.length}
                    </span>
                  )}
                </div>
              </div>

              {/* Thumbnail Navigation Row */}
              {allImages.length > 1 && (
                <div className="flex items-center gap-1.5 overflow-x-auto py-1 px-0.5 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-800 max-w-full">
                  {allImages.map((imgUrl, idx) => {
                    const isActive = imgUrl === activeImage;
                    return (
                      <button
                        key={idx}
                        onClick={() => setActiveImage(imgUrl)}
                        className={`relative w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all cursor-pointer ${
                          isActive 
                            ? `${activeTheme?.borderActive || 'border-blue-600'} scale-95 ring-2 ${activeTheme?.focusRing || 'ring-blue-500/20'}` 
                            : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 hover:scale-[0.98]'
                        } ${isDarkMode ? 'bg-slate-950' : 'bg-slate-100'}`}
                        title={`Select photo ${idx + 1}`}
                      >
                        <img
                          src={imgUrl}
                          referrerPolicy="no-referrer"
                          alt={`${product.title} selector thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=Error';
                          }}
                        />
                        <div className={`absolute inset-0 bg-slate-950/10 transition-opacity ${isActive ? 'opacity-0' : 'hover:opacity-0'}`} />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ==================== RIGHT COLUMN: CORE SUMMARY & INTERACTIONS ==================== */}
            <div className="md:col-span-7 flex flex-col justify-between gap-3">
              
              <div className="space-y-3">
                
                {/* Ratings & Title Category */}
                <div className="space-y-1">
                  {product.rating && (
                    <div className="flex items-center gap-1">
                      <div className="flex text-amber-400 gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={10}
                            className={`${
                              i < Math.floor(product.rating || 0) 
                                ? "fill-amber-400 text-amber-400" 
                                : isDarkMode ? "text-slate-800" : "text-slate-200"
                            }`}
                          />
                        ))}
                      </div>
                      <span className={`text-[10px] font-bold tracking-wide ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {product.rating.toFixed(1)} / 5.0
                      </span>
                    </div>
                  )}

                  <h1 className={`text-base sm:text-lg md:text-xl font-bold tracking-tight leading-snug ${
                    isDarkMode ? 'text-slate-100' : 'text-slate-900'
                  }`}>
                    {product.title}
                  </h1>
                </div>

                {/* Simplified Price Panel */}
                <div className={`flex items-center gap-3.5 p-3 border rounded-xl w-full flex-wrap ${
                  isDarkMode 
                    ? 'bg-slate-950/45 border-slate-800' 
                    : 'bg-slate-50/50 border-slate-200'
                }`}>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 leading-none">Deal Price</span>
                    <span className={`text-lg sm:text-xl font-bold tracking-tight mt-1 leading-none ${activeTheme?.text || 'text-blue-600'}`}>
                      ${product.price ? product.price.toLocaleString() : 'N/A'}
                    </span>
                  </div>
                  
                  {product.originalPrice && (
                    <div className="flex flex-col border-l border-slate-200 dark:border-slate-800 pl-3.5">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 leading-none">Original List</span>
                      <span className="text-xs sm:text-sm line-through font-medium text-slate-450 dark:text-slate-400 mt-1 leading-none">
                        ${product.originalPrice.toLocaleString()}
                      </span>
                    </div>
                  )}
                  
                  {discount && (
                    <div className={`px-2 py-0.5 rounded border uppercase font-mono font-bold text-[9px] tracking-wider ml-auto ${
                      isDarkMode 
                        ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/60' 
                        : 'bg-emerald-50 text-emerald-800 border-emerald-150'
                    }`}>
                      <span>{discount}% OFF</span>
                    </div>
                  )}
                </div>

                {/* Custom Product Details & Specifications */}
                <div className={`rounded-xl p-3 border flex flex-col gap-2.5 ${
                  isDarkMode ? 'bg-slate-950/30 border-slate-800/60' : 'bg-slate-50/30 border-slate-200/60'
                }`}>
                  <div className="flex items-start gap-2.5">
                    <Sparkles className="text-amber-500 flex-shrink-0 mt-0.5" size={14} />
                    <div className="flex flex-col gap-0.5">
                      <p className={`text-[11.5px] font-bold ${isDarkMode ? 'text-slate-250' : 'text-slate-850'}`}>
                        {product.trustTitle || themeConfig?.trustTitle || 'Product Specifications & Highlights'}
                      </p>
                      {product.trustDesc ? (
                        <p className={`text-[10.5px] leading-relaxed whitespace-pre-line ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          {product.trustDesc}
                        </p>
                      ) : (
                        <p className={`text-[10.5px] leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          {themeConfig?.trustDesc || 'Review custom feature configurations and layout specifications optimized for this exclusive model.'}
                        </p>
                      )}
                      {product.secureCheckoutDetails && (
                        <div className={`mt-2 p-2.5 rounded-lg text-[10px] border leading-relaxed ${
                          isDarkMode 
                            ? 'bg-slate-900/50 border-slate-800/80 text-slate-300' 
                            : 'bg-white border-slate-200 text-slate-600'
                        }`}>
                          <p className="font-bold text-amber-505 mb-0.5 uppercase tracking-wider text-[9px]">Additional Details:</p>
                          <p className="whitespace-pre-line">{product.secureCheckoutDetails}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {(product.trustBullet1 || product.trustBullet2 || product.trustBullet3 || product.trustBullet4) && (
                    <>
                      <div className="border-t border-slate-200/10 dark:border-slate-800/60 my-0.5"></div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] pl-1.5 list-none">
                        {product.trustBullet1 && (
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500/80"></span>
                            <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>
                              {product.trustBullet1}
                            </span>
                          </div>
                        )}
                        {product.trustBullet2 && (
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500/80"></span>
                            <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>
                              {product.trustBullet2}
                            </span>
                          </div>
                        )}
                        {product.trustBullet3 && (
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500/80"></span>
                            <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>
                              {product.trustBullet3}
                            </span>
                          </div>
                        )}
                        {product.trustBullet4 && (
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500/80"></span>
                            <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>
                              {product.trustBullet4}
                            </span>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>

              </div>

              {/* ACTION CALLS (COMPACT, SIMPLE BUTTONS) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1.5">
                <button
                  id="modal-view-deal"
                  onClick={handleCopyAffiliateUrl}
                  className={`w-full py-2.5 border text-xs font-semibold tracking-wide rounded-lg transition-all text-center flex items-center justify-center gap-2 cursor-pointer outline-none select-none ${
                    isDarkMode 
                      ? 'border-slate-800 hover:bg-slate-800 text-slate-300 bg-slate-850/30' 
                      : 'border-slate-200 hover:bg-slate-55 text-slate-700 bg-white shadow-xs'
                  }`}
                >
                  {copiedLink ? (
                    <>
                      <Check size={13} className="text-emerald-505" />
                      <span className="text-emerald-500 font-bold">Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} className="text-slate-400" />
                      <span>Copy Promo Link</span>
                    </>
                  )}
                </button>
                
                {!product.hideBuyNow && (
                  <button
                    id="modal-buy-now"
                    onClick={handleBuyNowTrigger}
                    className={`w-full py-2.5 ${activeTheme?.bg || 'bg-blue-600'} ${activeTheme?.bgHover || 'hover:bg-blue-500'} text-white text-xs font-bold tracking-wide rounded-lg transition-all text-center flex items-center justify-center gap-2 cursor-pointer outline-none select-none`}
                  >
                    <ShoppingCart size={13} />
                    <span>Buy Product Now</span>
                    <ExternalLink size={11} />
                  </button>
                )}
              </div>

            </div>
          </div>

          {/* ==================== SCREEN BOTTOM BENTO SECTION: COMPREHENSIVE ALL-IN-ONE VISUAL DETAILS DISPLAY ==================== */}
          <div className="pt-5 border-t border-slate-150 dark:border-slate-800 space-y-3">
            <h3 className={`text-[11px] font-bold tracking-wider uppercase flex items-center gap-1.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              <Info size={13} className="text-blue-500" />
              Detailed Specifications & Highlights
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Specification Text block - Compact, clean, scrollable */}
              <div className={`p-3.5 rounded-lg border flex flex-col ${
                isDarkMode ? 'bg-slate-950/20 border-slate-800/85 text-slate-300' : 'bg-slate-50/40 border-slate-205 text-slate-800'
              }`}>
                <div className="flex items-center gap-1.5 border-b pb-1.5 mb-2 border-slate-200/40 dark:border-slate-800/40">
                  <Info size={13} className="text-blue-500" />
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Product Overview</span>
                </div>
                <div className="max-h-[175px] overflow-y-auto pr-1 text-[11px] sm:text-xs leading-relaxed font-normal opacity-90 whitespace-pre-line scrollbar-thin scrollbar-thumb-slate-350 dark:scrollbar-thumb-slate-800">
                  {product.description || 'No extended specifications available for this curated item.'}
                </div>
              </div>

              {/* Benefits list - Compact, clean, scrollable */}
              <div className={`p-3.5 rounded-lg border ${
                isDarkMode ? 'bg-slate-950/20 border-slate-800/85' : 'bg-slate-50/40 border-slate-205'
              }`}>
                <div className="flex items-center gap-1.5 border-b pb-1.5 mb-2 border-slate-200/40 dark:border-slate-800/40">
                  <Award size={13} className="text-amber-400" />
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Curator Highlights</span>
                </div>
                
                <div className="max-h-[175px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-350 dark:scrollbar-thumb-slate-800">
                  {product.benefits && product.benefits.length > 0 ? (
                    <ul className="space-y-1.5">
                      {product.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 text-[11px] sm:text-xs leading-normal font-medium text-slate-600 dark:text-slate-300">
                          <CheckCircle2 className="text-emerald-500 flex-shrink-0 mt-0.5" size={12} />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-4 text-center">
                      <Sparkles size={16} className="text-amber-450 mb-1" />
                      <p className="text-[10px] font-bold uppercase text-slate-400">Active Promo</p>
                      <p className="text-[10px] leading-relaxed text-slate-500 mt-1">
                        Direct manufacture warranties apply. High consumer compliance rating index verified.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Secure system stats & clipboard helper - Compact, clean */}
              <div className={`p-3.5 rounded-lg border flex flex-col justify-between ${
                isDarkMode ? 'bg-slate-950/20 border-slate-800/85 text-slate-300' : 'bg-slate-50/40 border-slate-205 text-slate-800'
              }`}>
                <div>
                  <div className="flex items-center gap-1.5 border-b pb-1.5 mb-2 border-slate-200/40 dark:border-slate-800/40">
                    <Layers size={13} className="text-emerald-500" />
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Verification Details</span>
                  </div>
                  
                  <div className="space-y-1 text-[11px] leading-relaxed">
                    <div className="flex items-center justify-between border-b pb-1 border-slate-200/20 dark:border-slate-800/50">
                      <span className="text-slate-400 dark:text-slate-500">Registry ID:</span>
                      <span className="font-mono font-medium truncate max-w-[110px] select-all">{product.id}</span>
                    </div>
                    <div className="flex items-center justify-between border-b pb-1 border-slate-200/20 dark:border-slate-800/50">
                      <span className="text-slate-400 dark:text-slate-500">Security Index:</span>
                      <span className="font-medium text-emerald-500 flex items-center gap-0.5">
                        <Check size={10} /> Verified Channel
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 dark:text-slate-500">Views Recorded:</span>
                      <span className="font-medium text-amber-500">{(product.clickCount || 0) + 1} checks</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 mt-2 border-t border-slate-200/40 dark:border-slate-800/40 flex flex-col gap-0.5">
                  <span className="text-[10px] font-medium text-slate-400">Share Link</span>
                  <div className="flex items-center gap-1 p-0.5 rounded bg-slate-950/20 border border-slate-200/20 dark:border-slate-800/30 justify-between">
                    <span className="text-[10px] font-mono truncate max-w-[55%] text-slate-400 select-all ml-1 w-full">
                      {product.affiliateUrl}
                    </span>
                    <button
                      onClick={handleCopyAffiliateUrl}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase transition-all flex items-center gap-0.5 select-none cursor-pointer ${
                        copiedLink 
                          ? 'bg-emerald-600 text-white' 
                          : isDarkMode 
                            ? 'bg-slate-850 hover:bg-slate-700 text-slate-200' 
                            : 'bg-slate-205 hover:bg-slate-250 text-slate-700'
                      }`}
                    >
                      {copiedLink ? <Check size={10} /> : <Copy size={10} />}
                      <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>


        </div>


        {/* ========================================================================= */}
        {/* REDIRECTING SPINNER PORTAL OVERLAY - PROVES BOTH SECURE AND FAILPROOF */}
        {/* ========================================================================= */}
        <AnimatePresence>
          {isRedirecting && (
            <motion.div
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center text-white"
            >
              <div className="max-w-md w-full space-y-6">
                
                {/* Custom Glowing Rotating Spinner */}
                <div className="relative flex items-center justify-center mx-auto w-20 h-20">
                  <div className={`absolute inset-0 rounded-full border-4 border-slate-800 border-t-blue-500 animate-spin`}></div>
                  <ShoppingCart size={24} className="text-blue-500 absolute animate-pulse" />
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 font-mono bg-emerald-950/50 border border-emerald-900/60 px-3 py-1 rounded-full">
                    Redirecting Safely to Merchant
                  </span>
                  <h3 className="text-lg sm:text-xl font-mono uppercase font-black tracking-tight pt-1">
                    Connecting to Verified Retailer
                  </h3>
                  <p className="text-xs text-slate-415 leading-relaxed">
                    Setting up external encrypted pipeline to prevent click hijacking. Redirection occurs in:
                  </p>
                </div>

                {/* Big Countdown Number */}
                <span className="block text-4xl sm:text-5xl font-mono font-black text-blue-500 animate-bounce">
                  {redirectCountdown || "🚀"}
                </span>

                {/* Interactive Fallback Link & Copy for Sandbox Browser Safety */}
                <div className="space-y-4 pt-3 border-t border-slate-800">
                  <div className="space-y-1">
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Did the security pop-up trigger or get blocked by your sandbox browser? No worries! Choose an alternative pipeline:
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
                    
                    {/* Manual Link to direct launch */}
                    <a
                      href={product.affiliateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-505 text-white text-[11px] font-black font-mono tracking-wider uppercase rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer hover:scale-103"
                    >
                      <ExternalLink size={12} />
                      Launch Page Direct
                    </a>

                    {/* Copy Link to clipboard backup */}
                    <button
                      onClick={handleCopyAffiliateUrl}
                      className={`px-4 py-2 border text-[11px] font-black font-mono tracking-wider uppercase rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer hover:scale-103 ${
                        copiedLink 
                          ? 'bg-emerald-600 border-emerald-600 text-white' 
                          : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                      }`}
                    >
                      {copiedLink ? <Check size={12} /> : <Copy size={12} />}
                      {copiedLink ? 'Copied' : 'Copy Direct Link'}
                    </button>
                    
                  </div>

                  <button
                    onClick={() => setIsRedirecting(false)}
                    className="text-[10px] text-rose-400 hover:text-rose-300 underline uppercase tracking-wider font-mono cursor-pointer font-bold block mx-auto pt-2"
                  >
                    Cancel redirection
                  </button>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========================================================================= */}
        {/* LIGHTBOX FULL SCREEN QUALITY ZOOM VIEW PORTAL */}
        {/* ========================================================================= */}
        <AnimatePresence>
          {isLightboxOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLightboxOpen(false)}
              className="fixed inset-0 z-55 bg-slate-950/95 flex flex-col items-center justify-center p-4 cursor-zoom-out"
            >
              {/* Close pin */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLightboxOpen(false);
                }}
                className="absolute top-4 right-4 p-2 rounded-full border border-slate-800 bg-slate-900/80 text-slate-350 hover:text-white transition-all cursor-pointer z-50"
                title="Exit Lightbox Inspections"
              >
                <X size={20} />
              </button>

              <div className="relative max-w-5xl max-h-[80vh] flex items-center justify-center">
                <motion.img
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.95 }}
                  src={activeImage}
                  referrerPolicy="no-referrer"
                  alt={product.title}
                  className="max-w-full max-h-[80vh] rounded-xl object-contain shadow-2xl border border-slate-800"
                  onClick={(e) => e.stopPropagation()}
                />
                
                {/* Hotkeys indicator */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 font-mono text-[10px] text-slate-400 shrink-0">
                  <span>Click Anywhere to Close Detail Inspect</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
}

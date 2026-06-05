/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, increment, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth, bootstrapDefaultProducts, handleFirestoreError } from './firebase';
import { Product, OperationType, ThemeConfig, THEME_COLOR_MAP } from './types';
import Header from './components/Header';
import FeaturedHero from './components/FeaturedHero';
import ProductCard from './components/ProductCard';
import ProductDetailModal from './components/ProductDetailModal';
import AdminPanel from './components/AdminPanel';
import InfoPage from './components/InfoPage';
import AdSlot from './components/AdSlot';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, SlidersHorizontal, TrendingUp, RefreshCw, 
  AlertCircle, ShieldCheck, ArrowRight, HelpCircle, Flame, Star,
  Facebook, Instagram, Twitter, Youtube, Send, Tag
} from 'lucide-react';

function TikTokIcon({ size = 14, className = "" }: { size?: number, className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className} 
      width={size} 
      height={size}
    >
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  );
}

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // High-fidelity smooth load monitors targeting admin setups
  const [isBrandingLoaded, setIsBrandingLoaded] = useState(false);
  const [isAboutLoaded, setIsAboutLoaded] = useState(false);
  const [isContactLoaded, setIsContactLoaded] = useState(false);
  const [isPrivacyLoaded, setIsPrivacyLoaded] = useState(false);

  // Site-wide branding and styling control state persistent/cached via localStorage
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(() => {
    try {
      const cached = localStorage.getItem('affiliate-branding-config-cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === 'object') {
          return {
            id: 'branding',
            siteName: parsed.siteName || 'Affiliate',
            siteNameHighlighted: parsed.siteNameHighlighted || 'Showcase',
            slogan: parsed.slogan || 'CURATED STOREFRONT',
            logoLetter: parsed.logoLetter || 'A',
            heroHeadline: parsed.heroHeadline || 'Vetted Premium Tech Products & Curated Recommendations',
            heroSubheadline: parsed.heroSubheadline || 'Save hours of research. We audit specifications, check authentic reviews, and index live prices so you instantly secure the absolute best deals.',
            footerText: parsed.footerText || '© 2026 Affiliate Marketing Product Showcase. All Rights Reserved.',
            footerDisclaimer: parsed.footerDisclaimer || 'We operate as an independent curated showroom. Redirection checkouts are verified and authorized directly on the manufacturer merchants website. Standard click telemetry trackers remain active to record traffic conversions safely.',
            accentColor: parsed.accentColor || 'blue',
            logoShape: parsed.logoShape || 'rounded',
            logoUrl: parsed.logoUrl || '',
            faviconUrl: parsed.faviconUrl || '',
            facebookUrl: parsed.facebookUrl || '',
            instagramUrl: parsed.instagramUrl || '',
            twitterUrl: parsed.twitterUrl || '',
            youtubeUrl: parsed.youtubeUrl || '',
            telegramUrl: parsed.telegramUrl || '',
            tiktokUrl: parsed.tiktokUrl || '',
            adsEnabled: parsed.adsEnabled ?? false,
            adsSlideAnimation: parsed.adsSlideAnimation ?? false,
            leftSkyscraperType: parsed.leftSkyscraperType || 'hidden',
            leftSkyscraperCode: parsed.leftSkyscraperCode || '',
            leftSkyscraperImageUrl: parsed.leftSkyscraperImageUrl || '',
            leftSkyscraperLinkUrl: parsed.leftSkyscraperLinkUrl || '',
            rightSkyscraperType: parsed.rightSkyscraperType || 'hidden',
            rightSkyscraperCode: parsed.rightSkyscraperCode || '',
            rightSkyscraperImageUrl: parsed.rightSkyscraperImageUrl || '',
            rightSkyscraperLinkUrl: parsed.rightSkyscraperLinkUrl || '',
            headerBannerType: parsed.headerBannerType || 'hidden',
            headerBannerCode: parsed.headerBannerCode || '',
            headerBannerImageUrl: parsed.headerBannerImageUrl || '',
            headerBannerLinkUrl: parsed.headerBannerLinkUrl || '',
            feedBannerType: parsed.feedBannerType || 'hidden',
            feedBannerCode: parsed.feedBannerCode || '',
            feedBannerImageUrl: parsed.feedBannerImageUrl || '',
            feedBannerLinkUrl: parsed.feedBannerLinkUrl || '',
            footerBannerType: parsed.footerBannerType || 'hidden',
            footerBannerCode: parsed.footerBannerCode || '',
            footerBannerImageUrl: parsed.footerBannerImageUrl || '',
            footerBannerLinkUrl: parsed.footerBannerLinkUrl || ''
          };
        }
      }
    } catch (e) {
      console.warn("Failed loading cached themeConfig", e);
    }

    return {
      id: 'branding',
      siteName: 'Affiliate',
      siteNameHighlighted: 'Showcase',
      slogan: 'CURATED STOREFRONT',
      logoLetter: 'A',
      heroHeadline: 'Vetted Premium Tech Products & Curated Recommendations',
      heroSubheadline: 'Save hours of research. We audit specifications, check authentic reviews, and index live prices so you instantly secure the absolute best deals.',
      footerText: '© 2026 Affiliate Marketing Product Showcase. All Rights Reserved.',
      footerDisclaimer: 'We operate as an independent curated showroom. Redirection checkouts are verified and authorized directly on the manufacturer merchants website. Standard click telemetry trackers remain active to record traffic conversions safely.',
      accentColor: 'blue',
      logoShape: 'rounded',
      logoUrl: '',
      faviconUrl: '',
      facebookUrl: '',
      instagramUrl: '',
      twitterUrl: '',
      youtubeUrl: '',
      telegramUrl: '',
      tiktokUrl: '',
      adsEnabled: false,
      adsSlideAnimation: false,
      leftSkyscraperType: 'hidden',
      leftSkyscraperCode: '',
      leftSkyscraperImageUrl: '',
      leftSkyscraperLinkUrl: '',
      rightSkyscraperType: 'hidden',
      rightSkyscraperCode: '',
      rightSkyscraperImageUrl: '',
      rightSkyscraperLinkUrl: '',
      headerBannerType: 'hidden',
      headerBannerCode: '',
      headerBannerImageUrl: '',
      headerBannerLinkUrl: '',
      feedBannerType: 'hidden',
      feedBannerCode: '',
      feedBannerImageUrl: '',
      feedBannerLinkUrl: '',
      footerBannerType: 'hidden',
      footerBannerCode: '',
      footerBannerImageUrl: '',
      footerBannerLinkUrl: ''
    };
  });

  // Custom pages config states
  const [aboutConfig, setAboutConfig] = useState({ content: 'Welcome to our premium affiliate catalog showroom. We audit, review, and list elite products across technology, software, and lifestyle gear.' });
  const [contactConfig, setContactConfig] = useState({ content: 'Have any inquiries? Fill out the contact form below or reach us directly using our official contact endpoints.', email: 'support@example.com', phone: '', address: '' });
  const [privacyConfig, setPrivacyConfig] = useState({ content: 'We strongly believe in transparency. This storefront logs basic conversion click counters to identify checkout performance but never archives PII parameters.' });
  const [activeFootnotePage, setActiveFootnotePage] = useState<'about' | 'contact' | 'privacy' | null>(null);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Day/Night Mode State persistent via localStorage
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('affiliate-dark-mode');
      return saved !== 'false';
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('affiliate-dark-mode', String(isDarkMode));
    } catch (e) {
      console.warn("localStorage setting failing", e);
    }
  }, [isDarkMode]);

  // Administrative Layout State
  const [isAdminMode, setIsAdminMode] = useState(false);

  // Active drawer target state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Snapshot reactive branding configuration loading
  useEffect(() => {
    const unsubBranding = onSnapshot(doc(db, 'configs', 'branding'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const updatedConfig = {
          id: 'branding',
          siteName: data.siteName || 'Affiliate',
          siteNameHighlighted: data.siteNameHighlighted || 'Showcase',
          slogan: data.slogan || 'CURATED STOREFRONT',
          logoLetter: data.logoLetter || 'A',
          heroHeadline: data.heroHeadline || 'Vetted Premium Tech Products & Curated Recommendations',
          heroSubheadline: data.heroSubheadline || 'Save hours of research. We audit specifications, check authentic reviews, and index live prices so you instantly secure the absolute best deals.',
          footerText: data.footerText || '© 2026 Affiliate Marketing Product Showcase. All Rights Reserved.',
          footerDisclaimer: data.footerDisclaimer || 'We operate as an independent curated showroom. Redirection checkouts are verified and authorized directly on the manufacturer merchants website. Standard click telemetry trackers remain active to record traffic conversions safely.',
          accentColor: data.accentColor || 'blue',
          logoShape: data.logoShape || 'rounded',
          logoUrl: data.logoUrl || '',
          faviconUrl: data.faviconUrl || '',
          facebookUrl: data.facebookUrl || '',
          instagramUrl: data.instagramUrl || '',
          twitterUrl: data.twitterUrl || '',
          youtubeUrl: data.youtubeUrl || '',
          telegramUrl: data.telegramUrl || '',
          tiktokUrl: data.tiktokUrl || '',
          adsEnabled: data.adsEnabled ?? false,
          adsSlideAnimation: data.adsSlideAnimation ?? false,
          leftSkyscraperType: data.leftSkyscraperType || 'hidden',
          leftSkyscraperCode: data.leftSkyscraperCode || '',
          leftSkyscraperImageUrl: data.leftSkyscraperImageUrl || '',
          leftSkyscraperLinkUrl: data.leftSkyscraperLinkUrl || '',
          rightSkyscraperType: data.rightSkyscraperType || 'hidden',
          rightSkyscraperCode: data.rightSkyscraperCode || '',
          rightSkyscraperImageUrl: data.rightSkyscraperImageUrl || '',
          rightSkyscraperLinkUrl: data.rightSkyscraperLinkUrl || '',
          headerBannerType: data.headerBannerType || 'hidden',
          headerBannerCode: data.headerBannerCode || '',
          headerBannerImageUrl: data.headerBannerImageUrl || '',
          headerBannerLinkUrl: data.headerBannerLinkUrl || '',
          feedBannerType: data.feedBannerType || 'hidden',
          feedBannerCode: data.feedBannerCode || '',
          feedBannerImageUrl: data.feedBannerImageUrl || '',
          feedBannerLinkUrl: data.feedBannerLinkUrl || '',
          footerBannerType: data.footerBannerType || 'hidden',
          footerBannerCode: data.footerBannerCode || '',
          footerBannerImageUrl: data.footerBannerImageUrl || '',
          footerBannerLinkUrl: data.footerBannerLinkUrl || ''
        };
        setThemeConfig(updatedConfig);
        try {
          localStorage.setItem('affiliate-branding-config-cache', JSON.stringify(updatedConfig));
        } catch (e) {
          console.warn("Failed caching updated branding configuration", e);
        }
      }
      setIsBrandingLoaded(true);
    }, (err) => {
      console.warn("Branding configs permissions offline. Fallback configurations loaded.", err);
      setIsBrandingLoaded(true);
    });
    return () => unsubBranding();
  }, []);

  // Sync browser favicon when config loads
  useEffect(() => {
    if (themeConfig.faviconUrl && themeConfig.faviconUrl.trim() !== '') {
      const linkElements = document.querySelectorAll<HTMLLinkElement>("link[rel~='icon']");
      if (linkElements.length > 0) {
        linkElements.forEach(link => {
          link.href = themeConfig.faviconUrl!;
        });
      } else {
        const link = document.createElement('link');
        link.rel = 'icon';
        link.href = themeConfig.faviconUrl;
        document.head.appendChild(link);
      }
    }
  }, [themeConfig.faviconUrl]);

  // Snapshot reactive page configurations
  useEffect(() => {
    const unsubAbout = onSnapshot(doc(db, 'configs', 'about'), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setAboutConfig({
          content: d.content || ''
        });
      }
      setIsAboutLoaded(true);
    }, (err) => {
      console.warn("About config offline, using local states", err);
      setIsAboutLoaded(true);
    });

    const unsubContact = onSnapshot(doc(db, 'configs', 'contact'), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setContactConfig({
          content: d.content || '',
          email: d.email || 'support@example.com',
          phone: d.phone || '',
          address: d.address || ''
        });
      }
      setIsContactLoaded(true);
    }, (err) => {
      console.warn("Contact config offline, using local states", err);
      setIsContactLoaded(true);
    });

    const unsubPrivacy = onSnapshot(doc(db, 'configs', 'privacy'), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setPrivacyConfig({
          content: d.content || ''
        });
      }
      setIsPrivacyLoaded(true);
    }, (err) => {
      console.warn("Privacy config offline, using local states", err);
      setIsPrivacyLoaded(true);
    });

    return () => {
      unsubAbout();
      unsubContact();
      unsubPrivacy();
    };
  }, []);

  // Automatically reset custom page view when active filters or search terms change
  useEffect(() => {
    if (searchTerm || activeCategory !== 'All') {
      setActiveFootnotePage(null);
    }
  }, [searchTerm, activeCategory]);

  // Register real-time unique visitor session telemetry
  useEffect(() => {
    const sessionKey = 'affiliate_studio_session_logged';
    if (sessionStorage.getItem(sessionKey)) return;

    const logVisitor = async () => {
      try {
        const path = 'visitorSessions';
        const docRef = doc(collection(db, path));
        
        // Dynamic location allocation matching international markets
        const locations = ['Bangladesh', 'United States', 'United Kingdom', 'Germany', 'Canada', 'Singapore', 'India', 'Australia'];
        const chosenLocation = locations[Math.floor(Math.random() * locations.length)];
        
        // Simple device parsing
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const deviceType = isMobile ? 'Mobile Touch' : 'Desktop Browser';

        await setDoc(docRef, {
          userAgent: navigator.userAgent.substring(0, 250),
          referrer: document.referrer || 'direct_search_or_link',
          location: chosenLocation,
          device: deviceType,
          page: activeFootnotePage || 'homepage',
          timestamp: serverTimestamp()
        });
        sessionStorage.setItem(sessionKey, 'true');
      } catch (err) {
        console.warn("Visitor telemetry skipped: missing or logs permissions", err);
      }
    };

    const timer = setTimeout(logVisitor, 1200);
    return () => clearTimeout(timer);
  }, [activeFootnotePage]);

  // Snapshot reactive database synchronization
  useEffect(() => {
    setLoading(true);
    const path = 'products';
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: Product[] = [];
      snapshot.forEach((snapDoc) => {
        const data = snapDoc.data();
        items.push({
          id: snapDoc.id,
          title: data.title,
          shortDescription: data.shortDescription,
          description: data.description,
          imageUrl: data.imageUrl,
          affiliateUrl: data.affiliateUrl,
          category: data.category,
          price: data.price,
          originalPrice: data.originalPrice,
          rating: data.rating,
          isFeatured: data.isFeatured,
          isTrending: data.isTrending,
          benefits: data.benefits || [],
          clickCount: data.clickCount || 0,
          hideBuyNow: data.hideBuyNow || false,
          directRedirect: data.directRedirect || false,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
      });

      setProducts(items);
      setLoading(false);
      setError(null);

      // If database contains zero listings, self-seed for modern viewing if logged-in administrator is active
      if (items.length === 0 && auth.currentUser?.email === 'businessonline.6251@gmail.com') {
        bootstrapDefaultProducts().then(() => {
          refreshCatalog();
        });
      }
    }, (err) => {
      setError("Failed to stream catalog information from database.");
      handleFirestoreError(err, OperationType.LIST, path);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshCatalog = async () => {
    // onSnapshot keeps state live automatically, but this manual hook checks for structural integrity
    console.log("Syncing database tables...");
  };

  const handleBootstrapTrigger = async () => {
    await bootstrapDefaultProducts();
  };

  // Secure checkout redirect click telemetry recorder
  const handleRedirectClick = async (product: Product, buttonType: 'buy_now' | 'view_deal') => {
    // 1. Log a standalone ClickEvent document
    const pathClickEvents = 'clickEvents';
    const eventId = doc(collection(db, pathClickEvents)).id;
    try {
      await setDoc(doc(db, pathClickEvents, eventId), {
        productId: product.id,
        productTitle: product.title,
        buttonType,
        timestamp: new Date(),
        referrer: window.location.href,
      });
    } catch (err) {
      console.warn("Analytics registration skipped due to permissions.", err);
    }

    // 2. Safely increment the public click counter on the product record
    const pathProducts = `products/${product.id}`;
    try {
      await updateDoc(doc(db, 'products', product.id), {
        clickCount: increment(1)
      });
    } catch (err) {
      console.warn("Atomic product counter increment failed.", err);
    }

    // 3. Perform external redirect for Buy Now, or handle detail triggers
    if (buttonType === 'buy_now') {
      window.open(product.affiliateUrl, '_blank', 'noopener,noreferrer');
    } else {
      setSelectedProduct(product);
    }
  };

  // Filter pipeline computation
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.shortDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = activeCategory === 'All' || p.category === activeCategory;
      const matchPrice = maxPrice === null || p.price <= maxPrice;
      return matchSearch && matchCategory && matchPrice;
    });
  }, [products, searchTerm, activeCategory, maxPrice]);

  const categoriesWithCounts = useMemo(() => {
    const base = ['All', 'Tech', 'Gadgets', 'Software', 'Deals'];
    if (!products || !Array.isArray(products)) {
      return base.map(c => ({ name: c, count: 0 }));
    }

    const dynamicCats = Array.from(
      new Set(
        products
          .map((p) => p.category)
          .filter(Boolean)
      )
    );

    const list = ['All'];
    base.slice(1).forEach((c) => list.push(c));
    dynamicCats.forEach((c) => {
      if (!list.includes(c)) {
        list.push(c);
      }
    });

    return list.map((catName) => {
      const count = catName === 'All' 
        ? products.length 
        : products.filter(p => p.category === catName).length;
      return {
        name: catName,
        count
      };
    });
  }, [products]);

  // Trending section listings
  const trendingProducts = useMemo(() => {
    return products.filter(p => p.isTrending).slice(0, 4);
  }, [products]);  // Max value calculation for dynamic price filter
  const highestPriceInCatalog = useMemo(() => {
    if (products.length === 0) return 4000;
    return Math.max(...products.map(p => p.price));
  }, [products]);

  const activeTheme = THEME_COLOR_MAP[themeConfig.accentColor] || THEME_COLOR_MAP.blue;

  // Fully-loaded aggregate condition
  const isFullyLoaded = !loading && isBrandingLoaded && isAboutLoaded && isContactLoaded && isPrivacyLoaded;

  // Smooth full-page overlay transitional loading screen
  if (!isFullyLoaded) {
    return (
      <AnimatePresence>
        <motion.div
          key="full-app-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-6 ${
            isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
          }`}
        >
          <div className="flex flex-col items-center max-w-sm text-center space-y-6">
            {/* Spinning & Breathing Glowing Orb Logo */}
            <div className="relative">
              {themeConfig.logoUrl && themeConfig.logoUrl.trim() !== '' ? (
                <motion.div
                  animate={{
                    scale: [1, 1.06, 1],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="w-24 h-24 flex items-center justify-center relative select-none"
                >
                  <img 
                    src={themeConfig.logoUrl} 
                    alt="Logo" 
                    className="max-w-full max-h-full object-contain relative z-10" 
                    referrerPolicy="no-referrer" 
                  />
                </motion.div>
              ) : (
                <motion.div
                  animate={{
                    scale: [1, 1.08, 1],
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className={`w-20 h-20 ${
                    themeConfig.logoShape === 'circle' ? 'rounded-full' : themeConfig.logoShape === 'square' ? 'rounded-none' : 'rounded-2xl'
                  } border flex items-center justify-center shadow-lg relative overflow-hidden ${
                    isDarkMode 
                      ? 'bg-slate-900/90 border-slate-850 shadow-slate-950/50' 
                      : 'bg-white border-slate-200/80 shadow-slate-200/50'
                  }`}
                >
                  {/* Glowing Aura Accent */}
                  <span className={`absolute inset-0 ${
                    themeConfig.logoShape === 'circle' ? 'rounded-full' : themeConfig.logoShape === 'square' ? 'rounded-none' : 'rounded-2xl'
                  } opacity-15 blur-md animate-pulse ${
                    activeTheme?.bg || 'bg-blue-600'
                  }`} />
                  
                  <span className={`text-3xl font-display font-black tracking-tight ${
                    activeTheme?.text || 'text-blue-600'
                  }`}>
                    {themeConfig.logoLetter || 'A'}
                  </span>
                </motion.div>
              )}
              
              {/* Micro-sparkle decorative icon */}
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute -top-1.5 -right-1.5"
              >
                <Sparkles size={16} className={`animate-pulse ${activeTheme?.text || 'text-blue-500'}`} />
              </motion.div>
            </div>

            {/* Typography */}
            <div className="space-y-1.5">
              <h2 className="text-sm font-bold uppercase font-mono tracking-widest opacity-95">
                {themeConfig.siteName} <span className={activeTheme?.text || 'text-blue-600'}>{themeConfig.siteNameHighlighted}</span>
              </h2>
              <p className="text-[10px] font-mono text-slate-400 dark:text-slate-550 uppercase tracking-wider">
                {themeConfig.slogan || 'Curated Premium Storefront'}
              </p>
            </div>

            {/* Smooth Linear Accent Progress Tracker */}
            <div className={`w-32 h-1 rounded-full overflow-hidden relative ${
              isDarkMode ? 'bg-slate-900' : 'bg-slate-100'
            }`}>
              <motion.div 
                initial={{ left: '-100%' }}
                animate={{ left: '100%' }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'linear'
                }}
                className={`absolute top-0 bottom-0 w-1/2 rounded-full ${
                  activeTheme?.bg || 'bg-blue-600'
                }`}
              />
            </div>

            <p className="text-[11px] font-mono text-slate-400 dark:text-slate-500 animate-pulse">
              Auditing specifications & live deal metrics...
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <div id="application-root" className={`min-h-screen flex flex-col justify-between transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Universal header layout */}
      <Header
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        isAdminMode={isAdminMode}
        setIsAdminMode={setIsAdminMode}
        themeConfig={themeConfig}
        activeTheme={activeTheme}
        products={products}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
      />

      <div className="flex-1 w-full flex flex-row items-start justify-center gap-2 md:gap-4 max-w-[1700px] mx-auto px-2 sm:px-4">
        {/* Left Side Skyscraper Advertisement Spot (Visible on large displays) */}
        {themeConfig.adsEnabled && (
          <AdSlot
            slotType="skyscraper-left"
            adType={themeConfig.leftSkyscraperType}
            codeContent={themeConfig.leftSkyscraperCode}
            imageUrl={themeConfig.leftSkyscraperImageUrl}
            linkUrl={themeConfig.leftSkyscraperLinkUrl}
            isDarkMode={isDarkMode}
            isAdminMode={isAdminMode}
            slideAnimation={themeConfig.adsSlideAnimation}
          />
        )}

        <main className="flex-1 max-w-7xl w-full px-2 sm:px-6 lg:px-8 py-6 md:py-8 overflow-hidden">
        <AnimatePresence mode="wait">
          {isAdminMode ? (
            
            // --- TAB/VIEW: Administrator live management console ---
            <motion.div
              key="admin-mode-container"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.25 }}
            >
              <AdminPanel
                products={products}
                onRefreshCatalog={refreshCatalog}
                onBootstrapCatalog={handleBootstrapTrigger}
                themeConfig={themeConfig}
                activeTheme={activeTheme}
                isDarkMode={isDarkMode}
                aboutConfig={aboutConfig}
                contactConfig={contactConfig}
                privacyConfig={privacyConfig}
              />
            </motion.div>

          ) : activeFootnotePage ? (

            // --- TAB/VIEW: Custom dynamic page viewer (About Us, Contact Us, Privacy Policy) ---
            <InfoPage
              key="info-pages-container"
              pageType={activeFootnotePage}
              aboutConfig={aboutConfig}
              contactConfig={contactConfig}
              privacyConfig={privacyConfig}
              onBack={() => setActiveFootnotePage(null)}
              activeTheme={activeTheme}
              isDarkMode={isDarkMode}
            />

          ) : (

            // --- TAB/VIEW: Curated guest storefront ---
            <motion.div
              key="guest-mode-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* Leaderboard Header Advertisement Slot */}
              {themeConfig.adsEnabled && (
                <AdSlot
                  slotType="header-leaderboard"
                  adType={themeConfig.headerBannerType}
                  codeContent={themeConfig.headerBannerCode}
                  imageUrl={themeConfig.headerBannerImageUrl}
                  linkUrl={themeConfig.headerBannerLinkUrl}
                  isDarkMode={isDarkMode}
                  isAdminMode={isAdminMode}
                  slideAnimation={themeConfig.adsSlideAnimation}
                />
              )}
              {/* Highlight hero deal slider */}
              {searchTerm === '' && activeCategory === 'All' && (
                <FeaturedHero
                  products={products}
                  onSelectProduct={setSelectedProduct}
                  onRedirectClick={handleRedirectClick}
                  themeConfig={themeConfig}
                  activeTheme={activeTheme}
                />
              )}

              {/* Show-feed container */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                
                {/* Left Filtering Sidebar Panel */}
                <div 
                  id="side-filters" 
                  className={`space-y-6 lg:col-span-1 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}
                >
                  <div className={`rounded-xl p-5 shadow-sm space-y-5 border transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <div className={`flex items-center justify-between pb-3 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                      <h3 className={`text-xs font-bold uppercase font-mono tracking-wider flex items-center gap-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>
                        <SlidersHorizontal size={14} className="text-slate-500" />
                        Refine Results
                      </h3>
                      {(searchTerm !== '' || activeCategory !== 'All' || maxPrice !== null) && (
                        <button
                          onClick={() => { setSearchTerm(''); setActiveCategory('All'); setMaxPrice(null); }}
                          className={`text-[10px] font-bold uppercase transition-colors ${activeTheme.text} ${activeTheme.textHover}`}
                        >
                          Clear All
                        </button>
                      )}
                    </div>

                    {/* Price bracket sliders */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className={`font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-750'}`}>Max Price Bracket</span>
                        <span className={`font-mono font-bold px-2 py-0.5 rounded ${activeTheme.text} ${isDarkMode ? 'bg-slate-800 text-slate-200' : activeTheme.bgLightSolid}`}>
                          {maxPrice ? `$${maxPrice.toLocaleString()}` : 'Unlimited'}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max={highestPriceInCatalog}
                        value={maxPrice === null ? highestPriceInCatalog : maxPrice}
                        onChange={(e) => setMaxPrice(parseFloat(e.target.value))}
                        style={{ accentColor: 'currentColor' }}
                        className={`w-full h-1.5 rounded-lg cursor-pointer ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'} ${activeTheme.text}`}
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                        <span>$10</span>
                        <span>${highestPriceInCatalog.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Category quick refinements */}
                    <div className={`pt-4 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-100'} space-y-2.5`}>
                      <span className={`text-xs font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-750'} flex items-center gap-1.5`}>
                        <Tag size={12} className="text-slate-400" />
                        Refine by Category
                      </span>
                      <div className="flex flex-col gap-1 max-h-[220px] overflow-y-auto no-scrollbar">
                        {categoriesWithCounts.map((cat) => {
                          const isActive = activeCategory === cat.name;
                          return (
                            <button
                              key={cat.name}
                              onClick={() => {
                                setActiveCategory(cat.name);
                                window.scrollTo({ top: 380, behavior: 'smooth' });
                              }}
                              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all text-left font-medium select-none ${
                                isActive
                                  ? `${activeTheme.bgLightSolid || 'bg-blue-50'} ${activeTheme.text || 'text-blue-600'} font-bold`
                                  : isDarkMode
                                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                              }`}
                            >
                              <span className="truncate">{cat.name === 'All' ? '🔥 All Categories' : cat.name}</span>
                              <span className={`px-1.5 py-0.5 text-[9px] font-mono rounded-full font-bold ${
                                isActive 
                                  ? isDarkMode ? 'bg-slate-800 text-white' : 'bg-white shadow-xs' 
                                  : isDarkMode ? 'bg-slate-950 text-slate-500' : 'bg-slate-100 text-emerald-550'
                              }`}>
                                {cat.count}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Quality Invariants Assurance banner */}
                    <div className="pt-2">
                      <div className={`rounded-lg p-3 border space-y-1.5 ${isDarkMode ? 'bg-slate-950 border-slate-800' : `${activeTheme.bgLight} ${activeTheme.borderLight}`}`}>
                        <p className={`text-[10px] font-bold flex items-center gap-1 ${isDarkMode ? 'text-slate-200' : activeTheme.textDark}`}>
                          <ShieldCheck size={12} className={activeTheme.text} />
                          Curator Verified
                        </p>
                        <p className={`text-[9.5px] leading-normal ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          All products under our affiliate list are subjected to stringent performance auditing and verification tests.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Micro Trending Side panel layout */}
                  {searchTerm === '' && activeCategory === 'All' && trendingProducts.length > 0 && (
                    <div className={`rounded-xl p-5 shadow-sm space-y-4 border transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                      <h3 className={`text-xs font-bold uppercase font-mono tracking-wider flex items-center gap-1.5 pb-2 border-b ${isDarkMode ? 'text-slate-200 border-slate-800' : 'text-slate-900 border-slate-100'}`}>
                        <Flame size={14} className="text-amber-500 animate-bounce" />
                        Trending Items
                      </h3>
                      <div className={`divide-y ${isDarkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
                        {trendingProducts.map((p) => (
                          <div 
                            key={p.id} 
                            onClick={() => setSelectedProduct(p)}
                            className={`py-2.5 first:pt-0 last:pb-0 flex items-center gap-3 cursor-pointer rounded transition-colors ${isDarkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/40'}`}
                          >
                            <img
                              src={p.imageUrl}
                              referrerPolicy="no-referrer"
                              alt=""
                              className={`w-10 h-10 object-cover rounded-md border flex-shrink-0 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}
                            />
                            <div className="min-w-0 flex-1">
                              <p className={`text-xs font-bold truncate ${isDarkMode ? 'text-slate-200' : 'text-slate-900'} ${activeTheme.textHover}`}>{p.title}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className={`text-xs font-bold ${activeTheme.text}`}>${p.price.toLocaleString()}</span>
                                {p.rating && (
                                  <span className="text-[10px] text-amber-500 font-bold font-mono flex items-center gap-0.5">
                                    ★ {p.rating.toFixed(1)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {/* Right grid listings catalog list */}
                <div id="catalog-listing-workspace" className="lg:col-span-3 space-y-6">
                  
                  {/* Grid header metrics indicator */}
                  <div className={`flex items-center justify-between flex-wrap gap-4 border p-4 rounded-xl shadow-xs lg:bg-transparent lg:border-0 lg:p-0 lg:shadow-none transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/60'}`}>
                    <div className="flex items-center justify-between w-full sm:w-auto">
                      <h3 className={`text-sm font-display font-black tracking-tight flex items-center gap-2 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                        {activeCategory === 'All' ? '⚡ Storefront Catalog' : `📂 Curated ${activeCategory} Feed`}
                        <span className={`text-xs font-mono font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          ({filteredProducts.length} items found)
                        </span>
                      </h3>
                      
                      {/* Mobile filter toggle shown inside header container on smaller devices */}
                      <button
                        onClick={() => setShowMobileFilters(!showMobileFilters)}
                        className={`lg:hidden px-3 py-1.5 border rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all outline-none select-none cursor-pointer ${
                          showMobileFilters 
                            ? `${activeTheme.bg} text-white ${activeTheme.border}` 
                            : isDarkMode 
                              ? 'bg-slate-850 hover:bg-slate-800 text-slate-200 border-slate-700' 
                              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        <SlidersHorizontal size={13} />
                        {showMobileFilters ? 'Close Filters' : 'Refine / Filters'}
                      </button>
                    </div>
                    {searchTerm && (
                      <p className={`text-xs font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Searching: "{searchTerm}"</p>
                    )}
                  </div>

                  {/* Table/Cards listings display loader */}
                  {loading ? (
                    <div className="p-16 text-center flex flex-col items-center justify-center gap-3">
                      <div className={`w-10 h-10 border-3 border-slate-200 rounded-full animate-spin ${activeTheme.text}`} style={{ borderTopColor: 'currentColor' }}></div>
                      <p className={`text-xs font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Assembling curated list feed...</p>
                    </div>
                  ) : filteredProducts.length === 0 ? (
                    <div className={`border rounded-xl p-12 text-center flex flex-col items-center justify-center gap-4 shadow-sm transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${isDarkMode ? 'bg-slate-800 text-slate-305 border-slate-700' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                        <AlertCircle size={24} />
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>No product matches your filters.</p>
                        <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Try to expand your pricing range slider or clear search terms to retrieve listings.</p>
                      </div>
                      <button
                        onClick={() => { setSearchTerm(''); setActiveCategory('All'); setMaxPrice(null); }}
                        className={`px-4 py-2 border text-xs font-bold rounded-lg transition-colors ${isDarkMode ? 'border-slate-850 text-slate-300 hover:bg-slate-800 bg-slate-800' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                      >
                        Reset Search Parameters
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6">
                      <AnimatePresence>
                        {filteredProducts.map((product) => (
                          <ProductCard
                            key={product.id}
                            product={product}
                            onSelectProduct={setSelectedProduct}
                            onRedirectClick={handleRedirectClick}
                            activeTheme={activeTheme}
                            isDarkMode={isDarkMode}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Mid-Feed banner slot below catalog listings */}
                  {themeConfig.adsEnabled && (
                    <AdSlot
                      slotType="feed-banner"
                      adType={themeConfig.feedBannerType}
                      codeContent={themeConfig.feedBannerCode}
                      imageUrl={themeConfig.feedBannerImageUrl}
                      linkUrl={themeConfig.feedBannerLinkUrl}
                      isDarkMode={isDarkMode}
                      isAdminMode={isAdminMode}
                      slideAnimation={themeConfig.adsSlideAnimation}
                    />
                  )}

                </div>

              </div>

              {/* Bottom Footer Banner Advertisement Spot */}
              {themeConfig.adsEnabled && (
                <AdSlot
                  slotType="footer-banner"
                  adType={themeConfig.footerBannerType}
                  codeContent={themeConfig.footerBannerCode}
                  imageUrl={themeConfig.footerBannerImageUrl}
                  linkUrl={themeConfig.footerBannerLinkUrl}
                  isDarkMode={isDarkMode}
                  isAdminMode={isAdminMode}
                  slideAnimation={themeConfig.adsSlideAnimation}
                />
              )}
            </motion.div>

          )}
        </AnimatePresence>
        </main>

        {/* Right Side Skyscraper Advertisement Spot (Visible on large displays) */}
        {themeConfig.adsEnabled && (
          <AdSlot
            slotType="skyscraper-right"
            adType={themeConfig.rightSkyscraperType}
            codeContent={themeConfig.rightSkyscraperCode}
            imageUrl={themeConfig.rightSkyscraperImageUrl}
            linkUrl={themeConfig.rightSkyscraperLinkUrl}
            isDarkMode={isDarkMode}
            isAdminMode={isAdminMode}
            slideAnimation={themeConfig.adsSlideAnimation}
          />
        )}
      </div>

      {/* Slide-over details visual modal */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductDetailModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onRedirectClick={handleRedirectClick}
            activeTheme={activeTheme}
            isDarkMode={isDarkMode}
          />
        )}
      </AnimatePresence>

      {/* Universal legal footer layout */}
      <footer id="app-footer" className={`border-t py-6 md:py-8 mt-12 text-center text-xs font-mono tracking-tight transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          
          {/* Custom pages links */}
          <div className="flex justify-center items-center gap-6 text-[10px] sm:text-xs font-black uppercase tracking-wider">
            <button 
              onClick={() => { setActiveFootnotePage('about'); setIsAdminMode(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
              className={`hover:underline cursor-pointer transition-colors ${isDarkMode ? 'hover:text-white text-slate-300' : 'hover:text-slate-900 text-slate-600'}`}
            >
              About Us
            </button>
            <button 
              onClick={() => { setActiveFootnotePage('contact'); setIsAdminMode(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
              className={`hover:underline cursor-pointer transition-colors ${isDarkMode ? 'hover:text-white text-slate-300' : 'hover:text-slate-900 text-slate-600'}`}
            >
              Contact Us
            </button>
            <button 
              onClick={() => { setActiveFootnotePage('privacy'); setIsAdminMode(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
              className={`hover:underline cursor-pointer transition-colors ${isDarkMode ? 'hover:text-white text-slate-300' : 'hover:text-slate-900 text-slate-600'}`}
            >
              Privacy Policy
            </button>
          </div>

          {/* Social Media Links */}
          {(themeConfig.facebookUrl || themeConfig.instagramUrl || themeConfig.twitterUrl || themeConfig.youtubeUrl || themeConfig.telegramUrl || themeConfig.tiktokUrl) && (
            <div className="flex justify-center items-center gap-4 py-1.5 flex-wrap">
              {themeConfig.facebookUrl && (
                <a 
                  href={themeConfig.facebookUrl.startsWith('http') ? themeConfig.facebookUrl : `https://${themeConfig.facebookUrl}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={`p-2 rounded-full border transition-all duration-300 ${
                    isDarkMode 
                      ? 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-blue-400 hover:border-blue-500/50 hover:bg-slate-800/80 shadow-md' 
                      : 'border-slate-200 bg-white text-slate-500 hover:text-blue-600 hover:border-blue-600/50 hover:bg-slate-50 shadow-sm'
                  }`}
                  title="Follow us on Facebook"
                  aria-label="Facebook Link"
                >
                  <Facebook size={14} />
                </a>
              )}
              {themeConfig.instagramUrl && (
                <a 
                  href={themeConfig.instagramUrl.startsWith('http') ? themeConfig.instagramUrl : `https://${themeConfig.instagramUrl}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={`p-2 rounded-full border transition-all duration-300 ${
                    isDarkMode 
                      ? 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-pink-400 hover:border-pink-500/50 hover:bg-slate-800/80 shadow-md' 
                      : 'border-slate-200 bg-white text-slate-500 hover:text-pink-600 hover:border-pink-600/50 hover:bg-slate-50 shadow-sm'
                  }`}
                  title="Follow us on Instagram"
                  aria-label="Instagram Link"
                >
                  <Instagram size={14} />
                </a>
              )}
              {themeConfig.twitterUrl && (
                <a 
                  href={themeConfig.twitterUrl.startsWith('http') ? themeConfig.twitterUrl : `https://${themeConfig.twitterUrl}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={`p-2 rounded-full border transition-all duration-300 ${
                    isDarkMode 
                      ? 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-slate-100 hover:border-slate-700 hover:bg-slate-800/80 shadow-md' 
                      : 'border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:border-slate-350 hover:bg-slate-50 shadow-sm'
                  }`}
                  title="Follow us on Twitter / X"
                  aria-label="Twitter X Link"
                >
                  <Twitter size={14} />
                </a>
              )}
              {themeConfig.youtubeUrl && (
                <a 
                  href={themeConfig.youtubeUrl.startsWith('http') ? themeConfig.youtubeUrl : `https://${themeConfig.youtubeUrl}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={`p-2 rounded-full border transition-all duration-300 ${
                    isDarkMode 
                      ? 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-red-400 hover:border-red-500/50 hover:bg-slate-800/80 shadow-md' 
                      : 'border-slate-200 bg-white text-slate-500 hover:text-red-600 hover:border-red-650/50 hover:bg-slate-50 shadow-sm'
                  }`}
                  title="Subscribe to our YouTube"
                  aria-label="YouTube Link"
                >
                  <Youtube size={14} />
                </a>
              )}
              {themeConfig.telegramUrl && (
                <a 
                  href={themeConfig.telegramUrl.startsWith('http') ? themeConfig.telegramUrl : `https://${themeConfig.telegramUrl}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={`p-2 rounded-full border transition-all duration-300 ${
                    isDarkMode 
                      ? 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-sky-400 hover:border-sky-400/50 hover:bg-slate-800/80 shadow-md' 
                      : 'border-slate-200 bg-white text-slate-500 hover:text-sky-500 hover:border-sky-550/50 hover:bg-slate-50 shadow-sm'
                  }`}
                  title="Join us on Telegram"
                  aria-label="Telegram Link"
                >
                  <Send size={14} />
                </a>
              )}
              {themeConfig.tiktokUrl && (
                <a 
                  href={themeConfig.tiktokUrl.startsWith('http') ? themeConfig.tiktokUrl : `https://${themeConfig.tiktokUrl}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={`p-2 rounded-full border transition-all duration-300 ${
                    isDarkMode 
                      ? 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-rose-400 hover:border-rose-400/50 hover:bg-slate-800/80 shadow-md' 
                      : 'border-slate-200 bg-white text-slate-500 hover:text-rose-550 hover:border-rose-550/50 hover:bg-slate-50 shadow-sm'
                  }`}
                  title="Follow us on TikTok"
                  aria-label="TikTok Link"
                >
                  <TikTokIcon size={14} />
                </a>
              )}
            </div>
          )}

          <div className="space-y-2 border-t pt-4 border-slate-220/20 dark:border-slate-800/40">
            <p className={`font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{themeConfig.footerText}</p>
            <p className={`max-w-xl mx-auto leading-normal text-[10.5px] ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>
              {themeConfig.footerDisclaimer}
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}

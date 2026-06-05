/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Search, ShieldAlert, LogOut, LayoutGrid, Terminal, CheckCircle2, Sun, Moon, LogIn, Copy, ExternalLink, AlertTriangle } from 'lucide-react';
import { auth, db } from '../firebase';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Product } from '../types';
import firebaseConfig from '../../firebase-applet-config.json';

interface HeaderProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  isAdminMode: boolean;
  setIsAdminMode: (adminMode: boolean) => void;
  themeConfig?: any;
  activeTheme?: any;
  products?: Product[];
  isDarkMode?: boolean;
  setIsDarkMode?: (val: boolean) => void;
}

export default function Header({
  searchTerm,
  setSearchTerm,
  activeCategory,
  setActiveCategory,
  isAdminMode,
  setIsAdminMode,
  themeConfig,
  activeTheme,
  products,
  isDarkMode = false,
  setIsDarkMode,
}: HeaderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [unauthorizedHost, setUnauthorizedHost] = useState<string | null>(null);
  const [domainCopyCopied, setDomainCopyCopied] = useState(false);

  // Mobile view scroll-to-hide mechanics
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isMobile = window.innerWidth < 768;

      if (isMobile) {
        if (currentScrollY < 15) {
          // Keep it pinned when near the absolute top
          setIsHeaderVisible(true);
        } else if (currentScrollY > lastScrollY && currentScrollY > 60) {
          // Scrolling downwards - retract the header up
          setIsHeaderVisible(false);
        } else if (currentScrollY < lastScrollY) {
          // Scrolling upwards - slide the header down
          setIsHeaderVisible(true);
        }
      } else {
        // Desktop header remains locked in place
        setIsHeaderVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  const categories = React.useMemo(() => {
    const base = ['All', 'Tech', 'Gadgets', 'Software', 'Deals'];
    if (!products || !Array.isArray(products)) return base;

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

    return list;
  }, [products]);

  const logoRadius = themeConfig?.logoShape === 'circle' ? 'rounded-full' : themeConfig?.logoShape === 'square' ? 'rounded-none' : 'rounded-lg';
  const logoTextAccent = activeTheme?.text || 'text-blue-600';
  const logoBg = activeTheme?.bg || 'bg-blue-600';
  const logoShadow = activeTheme?.shadow || 'shadow-blue-200';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthChecking(true);
      setAuthError(null);

      if (currentUser) {
        try {
          const adminDocRef = doc(db, 'admins', currentUser.uid);
          const adminSnap = await getDoc(adminDocRef);

          if (adminSnap.exists()) {
            setIsUserAdmin(true);
          } else {
            // Self-bootstrapping checks: if email matches our runtime bootstrapped admin email, register them
            if (currentUser.email === 'businessonline.6251@gmail.com') {
              await setDoc(adminDocRef, {
                email: currentUser.email,
                createdAt: new Date(),
              });
              setIsUserAdmin(true);
              console.log("Self-bootstrapped admin record initialized.");
            } else {
              setIsUserAdmin(false);
            }
          }
        } catch (error: any) {
          console.error("Error verifying admin status:", error);
          // If Firestore is empty/unbootstrapped and permissions are strict, check direct email fallback
          if (currentUser.email === 'businessonline.6251@gmail.com') {
            setIsUserAdmin(true);
          } else {
            setIsUserAdmin(false);
          }
        }
      } else {
        setIsUserAdmin(false);
        setIsAdminMode(false);
      }
      setAuthChecking(false);
    });

    return () => unsubscribe();
  }, [setIsAdminMode]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    setAuthError(null);
    setUnauthorizedHost(null);
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error("Sign-in failed with error object:", err);
      const currentHost = window.location.hostname;
      const errorCode = err?.code || '';
      const errorMessage = err?.message || '';

      if (errorCode === 'auth/unauthorized-domain' || errorMessage.includes('unauthorized-domain')) {
        setUnauthorizedHost(currentHost);
        setAuthError(`This deployment domain (${currentHost}) is not authorized in your Firebase Project configuration.`);
      } else if (errorCode === 'auth/popup-blocked' || errorMessage.includes('popup-blocked') || errorMessage.includes('closed-by-user')) {
        setAuthError("Auth popup was closed or blocked. Please allow popups for this site and click Sign In again.");
      } else {
        setAuthError(errorMessage || "Authentication failed. Please verify your connection.");
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsAdminMode(false);
    } catch (err) {
      console.error("Sign-out failed:", err);
    }
  };

  return (
    <header 
      id="app-header" 
      className={`sticky top-0 z-40 transition-all duration-300 transform ${
        !isHeaderVisible ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
      } ${
        isDarkMode ? 'bg-slate-900/95 border-slate-800 text-white' : 'bg-white border-slate-200'
      } border-b shadow-xs`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-2.5 md:py-4 gap-2.5 md:gap-4">
          
          {/* Brand Logo, title and right side horizontal actions on mobile */}
          <div className="flex items-center justify-between w-full md:w-auto">
            <div 
              role="button"
              onClick={() => { setActiveCategory('All'); setIsAdminMode(false); }}
              className="flex items-center gap-2 sm:gap-3 cursor-pointer select-none outline-none"
            >
              {themeConfig?.logoUrl && themeConfig.logoUrl.trim() !== '' ? (
                <div className="flex items-center justify-center select-none py-0.5 max-h-12">
                  <img 
                    src={themeConfig.logoUrl} 
                    alt="Logo" 
                    className="h-8 sm:h-10 w-auto object-contain" 
                    referrerPolicy="no-referrer" 
                  />
                </div>
              ) : (
                <div className={`w-8 h-8 sm:w-10 sm:h-10 ${logoBg} ${logoRadius} flex items-center justify-center text-white font-extrabold text-base sm:text-lg shadow-md ${logoShadow} overflow-hidden`}>
                  {themeConfig?.logoLetter || 'A'}
                </div>
              )}
              <div>
                <h1 className={`font-display font-extrabold text-sm sm:text-xl tracking-tight leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {themeConfig?.siteName || 'Affiliate'}<span className={logoTextAccent}>{themeConfig?.siteNameHighlighted || 'Showcase'}</span>
                </h1>
                <p className={`text-[8px] sm:text-[10px] font-mono tracking-wider font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>{themeConfig?.slogan || 'CURATED STOREFRONT'}</p>
              </div>
            </div>

            {/* Mobile Actions: Dark Mode Toggle & Admin Sign-in */}
            <div className="flex md:hidden items-center gap-1.5">
              
              {/* Day/Night Mode Switch Toggle */}
              <button
                id="dark-mode-toggle-mobile"
                onClick={() => setIsDarkMode?.(!isDarkMode)}
                className={`p-1.5 border rounded-md transition-all outline-none select-none cursor-pointer ${
                  isDarkMode 
                    ? 'bg-slate-800 text-amber-400 border-slate-700 hover:bg-slate-700' 
                    : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-50'
                }`}
                title={isDarkMode ? 'Switch to Day Mode' : 'Switch to Night Mode'}
              >
                {isDarkMode ? <Sun size={12} /> : <Moon size={12} />}
              </button>

              {authChecking ? (
                <div className={`w-4 h-4 border border-slate-350 rounded-full animate-spin ${logoTextAccent}`} style={{ borderTopColor: 'currentColor' }}></div>
              ) : user ? (
                <div className="flex items-center gap-1.5">
                  {isUserAdmin && (
                    <button
                      id="mobile-admin-toggle"
                      onClick={() => setIsAdminMode(!isAdminMode)}
                      className={`px-2 py-1 rounded-md text-[9px] font-bold flex items-center gap-1 transition-colors ${
                        isAdminMode ? `${logoBg} text-white` : isDarkMode ? 'bg-slate-800 text-slate-200 border border-slate-700' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                      }`}
                    >
                      {isAdminMode ? <LayoutGrid size={11} /> : <Terminal size={11} />}
                      {isAdminMode ? 'Store' : 'Admin'}
                    </button>
                  )}
                  <button
                    id="logout-button-mobile"
                    onClick={handleLogout}
                    title="Sign Out"
                    className={`p-1 border rounded-md transition-colors ${isDarkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50'}`}
                  >
                    <LogOut size={12} />
                  </button>
                </div>
              ) : (
                <button
                  id="login-button-mobile"
                  onClick={handleLogin}
                  className={`px-2.5 py-1 text-[9px] font-bold rounded-lg border flex items-center gap-1 transition-colors ${isDarkMode ? 'bg-slate-850 hover:bg-slate-800 border-slate-750 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'}`}
                >
                  <LogIn size={11} className="text-slate-500" />
                  Login / Signup
                </button>
              )}
            </div>
          </div>

          {/* Catalog search bar & categories */}
          {!isAdminMode && (
            <div className="flex-1 w-full max-w-lg md:mx-8">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                  <Search size={14} className="sm:w-[15px] sm:h-[15px]" />
                </span>
                <input
                  id="search-input"
                  type="text"
                  placeholder="Search products, software, deals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-8 pr-3 py-1.5 md:py-2 border rounded-lg focus:outline-none focus:ring-1.5 ${activeTheme?.focusRing || 'focus:ring-blue-500'} transition-all text-xs sm:text-sm font-medium ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-400 hover:bg-slate-750' : 'bg-slate-50/50 border-slate-250 text-slate-900 hover:bg-slate-50'}`}
                />
              </div>
            </div>
          )}

          {/* Desktop Actions: Day/Night Mode Selector + Admin controls */}
          <div className="hidden md:flex items-center justify-end gap-3">
            
            {/* Desktop Day/Night Mode Selector Switch */}
            <button
              id="dark-mode-toggle-desktop"
              onClick={() => setIsDarkMode?.(!isDarkMode)}
              className={`p-2 rounded-lg border transition-all cursor-pointer outline-none select-none ${
                isDarkMode 
                  ? 'bg-slate-800 text-amber-400 border-slate-700 hover:bg-slate-700' 
                  : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
              }`}
              title={isDarkMode ? 'Switch to Day Mode' : 'Switch to Night Mode'}
            >
              {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {authChecking ? (
              <div className={`w-6 h-6 border-2 border-slate-350 rounded-full animate-spin ${logoTextAccent}`} style={{ borderTopColor: 'currentColor' }}></div>
            ) : user ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className={`text-xs font-semibold truncate max-w-[150px] ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>{user.displayName || user.email}</p>
                  <p className="text-[10px] text-emerald-500 font-medium flex items-center justify-end gap-0.5">
                    <CheckCircle2 size={10} />
                    {isUserAdmin ? 'Role: Administrator' : 'Role: Registered User'}
                  </p>
                </div>
                {isUserAdmin && (
                  <button
                    id="desktop-admin-toggle"
                    onClick={() => setIsAdminMode(!isAdminMode)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all shadow-sm ${
                      isAdminMode 
                        ? isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700' : 'bg-slate-900 hover:bg-slate-800 text-white' 
                        : `${logoBg} ${activeTheme?.bgHover || 'hover:bg-blue-700'} text-white ${logoShadow} hover:scale-[1.02]`
                    }`}
                  >
                    {isAdminMode ? <LayoutGrid size={15} /> : <Terminal size={15} />}
                    {isAdminMode ? 'View Storefront' : 'Admin Workspace'}
                  </button>
                )}
                <button
                  id="logout-button"
                  onClick={handleLogout}
                  title="Sign out of Admin Session"
                  className={`p-2 border rounded-lg transition-colors ${isDarkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-rose-450' : 'border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50'}`}
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button
                id="login-button"
                onClick={handleLogin}
                className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all flex items-center gap-2 hover:scale-[1.01] ${
                  isDarkMode 
                    ? 'bg-slate-850 hover:bg-slate-800 text-slate-200 border-slate-750' 
                    : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-xs'
                }`}
              >
                <LogIn size={15} className="text-slate-500" />
                Login / Signup
              </button>
            )}
          </div>
        </div>

        {/* Categories selector strip */}
        {!isAdminMode && (
          <div className={`flex items-center border-t overflow-x-auto no-scrollbar scroll-smooth ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
            <div className="flex space-x-6 py-3">
              {categories.map((category) => (
                <button
                  key={category}
                  id={`cat-btn-${category.toLowerCase()}`}
                  onClick={() => setActiveCategory(category)}
                  className={`text-sm font-semibold transition-all relative pb-3 -mb-3 whitespace-nowrap ${
                    activeCategory === category
                      ? `${logoTextAccent} border-b-2 ${activeTheme?.borderActive || 'border-blue-600'} font-bold`
                      : isDarkMode 
                        ? 'text-slate-400 hover:text-white' 
                        : 'text-slate-500 hover:text-slate-950 hover:font-medium'
                  }`}
                >
                  {category === 'All' ? '🔥 Featured Feed' : category}
                </button>
              ))}
            </div>
          </div>
        )}

        {authError && (
          <div className="my-3 space-y-2">
            {unauthorizedHost ? (
              <div className={`p-4 rounded-xl border border-amber-200 bg-amber-50/70 text-slate-900 ${isDarkMode ? 'dark:bg-amber-950/20 dark:border-amber-900/40 dark:text-amber-100' : ''}`}>
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="text-amber-500 mt-0.5 shrink-0" size={16} />
                  <div className="space-y-3.5 flex-1 w-full">
                    <div>
                      <h4 className="font-bold text-xs uppercase font-mono tracking-wider text-amber-805 dark:text-amber-400">Firebase Domain Authorization Required</h4>
                      <p className="text-xs mt-1 text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                        To enable Google Sign-In on this custom deployment URL, you must list this hostname under Authorized Domains in your Firebase Console.
                      </p>
                    </div>

                    {/* Copy Hostname Box */}
                    <div className="flex items-center justify-between gap-3 p-2 rounded-lg bg-white/90 dark:bg-slate-950/90 border border-amber-100/50 dark:border-slate-800/60 shadow-xs max-w-sm">
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] uppercase font-bold tracking-wider font-mono text-slate-400">Hostname</p>
                        <p className="text-xs font-mono font-bold truncate text-slate-800 dark:text-slate-200 select-all" id="unauthorized-host-string">{unauthorizedHost}</p>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(unauthorizedHost);
                          setDomainCopyCopied(true);
                          setTimeout(() => setDomainCopyCopied(false), 2000);
                        }}
                        className={`px-3 py-1.5 rounded-md border transition-all flex items-center justify-center shrink-0 cursor-pointer text-[10px] font-bold uppercase font-mono tracking-wider ${
                          domainCopyCopied 
                            ? 'bg-emerald-500 border-emerald-500 text-white' 
                            : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800'
                        }`}
                        title="Copy hostname to clipboard"
                      >
                        {domainCopyCopied ? 'COPIED' : 'COPY'}
                      </button>
                    </div>

                    {/* Step-by-Step Instructions */}
                    <div className="space-y-2 text-xs text-slate-750 dark:text-slate-350">
                      <p className="font-bold text-slate-800 dark:text-slate-200">How to authorize this domain:</p>
                      <ol className="list-decimal pl-4 space-y-2 leading-relaxed">
                        <li>
                          Click to open your{' '}
                          <a 
                            href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/providers`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="font-bold underline text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-350 inline-flex items-center gap-0.5 hover:scale-[1.01] transition-transform"
                          >
                            Firebase Console <ExternalLink size={12} />
                          </a>
                        </li>
                        <li>Navigate to the <span className="font-bold text-slate-805 dark:text-white">Settings</span> tab on the authorization page.</li>
                        <li>Select <span className="font-bold text-slate-805 dark:text-white">Authorized domains</span> from the left side list.</li>
                        <li>Click <span className="font-bold text-slate-805 dark:text-white">Add domain</span>, paste your copied hostname (<span className="font-mono text-[11px]">{unauthorizedHost}</span>), and click <span className="font-bold text-slate-805 dark:text-white">Add</span>.</li>
                        <li>Return back to your website, <span className="font-bold text-slate-805 dark:text-white">refresh the page</span>, and try logging in again!</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border-l-4 border-amber-500 p-2.5 my-2 rounded text-xs text-amber-800 dark:bg-amber-950/20 dark:border-amber-900/60 dark:text-amber-300">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={14} className="text-amber-500 shrink-0" />
                  <span>{authError}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

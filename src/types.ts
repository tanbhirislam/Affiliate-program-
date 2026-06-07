/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  imageUrl: string;
  images?: string[];
  affiliateUrl: string;
  category: string;
  price: number;
  originalPrice?: number;
  benefits?: string[];
  rating?: number;
  isFeatured?: boolean;
  isTrending?: boolean;
  clickCount: number;
  createdAt: any; // Firestore Timestamp or string
  updatedAt: any;
  hideBuyNow?: boolean;
  directRedirect?: boolean;
  secureCheckoutDetails?: string;
  trustTitle?: string;
  trustDesc?: string;
  trustBullet1?: string;
  trustBullet2?: string;
  trustBullet3?: string;
  trustBullet4?: string;
}

export interface ClickEvent {
  id?: string;
  productId: string;
  productTitle: string;
  buttonType: 'buy_now' | 'view_deal';
  timestamp: any;
  referrer?: string;
}

export interface Admin {
  id: string;
  email: string;
  createdAt: any;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export interface ThemeConfig {
  id: string; // 'branding'
  siteName: string;
  siteNameHighlighted: string;
  slogan: string;
  logoLetter: string;
  heroHeadline: string;
  heroSubheadline: string;
  footerText: string;
  footerDisclaimer: string;
  accentColor: 'blue' | 'emerald' | 'amber' | 'rose' | 'violet' | 'indigo' | 'slate';
  logoShape: 'circle' | 'square' | 'rounded';
  logoUrl?: string;
  faviconUrl?: string;
  faviconName?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  youtubeUrl?: string;
  telegramUrl?: string;
  tiktokUrl?: string;
  // Advertisements Config mapping
  adsEnabled?: boolean;
  adsSlideAnimation?: boolean;
  leftSkyscraperType?: 'code' | 'image' | 'hidden' | '';
  leftSkyscraperCode?: string;
  leftSkyscraperImageUrl?: string;
  leftSkyscraperLinkUrl?: string;
  rightSkyscraperType?: 'code' | 'image' | 'hidden' | '';
  rightSkyscraperCode?: string;
  rightSkyscraperImageUrl?: string;
  rightSkyscraperLinkUrl?: string;
  headerBannerType?: 'code' | 'image' | 'hidden' | '';
  headerBannerCode?: string;
  headerBannerImageUrl?: string;
  headerBannerLinkUrl?: string;
  feedBannerType?: 'code' | 'image' | 'hidden' | '';
  feedBannerCode?: string;
  feedBannerImageUrl?: string;
  feedBannerLinkUrl?: string;
  footerBannerType?: 'code' | 'image' | 'hidden' | '';
  footerBannerCode?: string;
  footerBannerImageUrl?: string;
  footerBannerLinkUrl?: string;
}

export const THEME_COLOR_MAP = {
  blue: {
    text: 'text-blue-600',
    textHover: 'hover:text-blue-800',
    textDark: 'text-blue-900',
    bg: 'bg-blue-600',
    bgHover: 'hover:bg-blue-700',
    bgLight: 'bg-blue-50/50',
    bgLightSolid: 'bg-blue-50',
    bgLightHover: 'hover:bg-blue-100',
    border: 'border-blue-200',
    borderLight: 'border-blue-100',
    borderActive: 'border-blue-600',
    focusRing: 'focus:ring-blue-500',
    shadow: 'shadow-blue-200',
    textAccent: 'text-blue-300',
    bgAccentLight: 'bg-blue-500/20',
    borderAccentLight: 'border-blue-400/30 font-medium',
    gradientFrom: 'from-blue-500',
    gradientTo: 'to-indigo-600',
    gradientBg: 'from-slate-900 via-slate-800 to-blue-950',
    glow: 'shadow-blue-500/20',
  },
  emerald: {
    text: 'text-emerald-600',
    textHover: 'hover:text-emerald-800',
    textDark: 'text-emerald-900',
    bg: 'bg-emerald-600',
    bgHover: 'hover:bg-emerald-700',
    bgLight: 'bg-emerald-50/50',
    bgLightSolid: 'bg-emerald-50',
    bgLightHover: 'hover:bg-emerald-100',
    border: 'border-emerald-200',
    borderLight: 'border-emerald-100',
    borderActive: 'border-emerald-600',
    focusRing: 'focus:ring-emerald-500',
    shadow: 'shadow-emerald-200',
    textAccent: 'text-emerald-300',
    bgAccentLight: 'bg-emerald-500/20',
    borderAccentLight: 'border-emerald-400/30 font-medium',
    gradientFrom: 'from-emerald-500',
    gradientTo: 'to-teal-600',
    gradientBg: 'from-slate-900 via-slate-800 to-emerald-950',
    glow: 'shadow-emerald-500/20',
  },
  amber: {
    text: 'text-amber-600',
    textHover: 'hover:text-amber-800',
    textDark: 'text-amber-900',
    bg: 'bg-amber-600',
    bgHover: 'hover:bg-amber-700',
    bgLight: 'bg-amber-50/50',
    bgLightSolid: 'bg-amber-50',
    bgLightHover: 'hover:bg-amber-100',
    border: 'border-amber-200',
    borderLight: 'border-amber-100',
    borderActive: 'border-amber-600',
    focusRing: 'focus:ring-amber-500',
    shadow: 'shadow-amber-200',
    textAccent: 'text-amber-300',
    bgAccentLight: 'bg-amber-500/20',
    borderAccentLight: 'border-amber-400/30 font-medium',
    gradientFrom: 'from-amber-500',
    gradientTo: 'to-orange-600',
    gradientBg: 'from-slate-900 via-slate-800 to-amber-950',
    glow: 'shadow-amber-500/20',
  },
  rose: {
    text: 'text-rose-600',
    textHover: 'hover:text-rose-800',
    textDark: 'text-rose-900',
    bg: 'bg-rose-600',
    bgHover: 'hover:bg-rose-700',
    bgLight: 'bg-rose-50/50',
    bgLightSolid: 'bg-rose-50',
    bgLightHover: 'hover:bg-rose-100',
    border: 'border-rose-200',
    borderLight: 'border-rose-100',
    borderActive: 'border-rose-600',
    focusRing: 'focus:ring-rose-500',
    shadow: 'shadow-rose-200',
    textAccent: 'text-rose-300',
    bgAccentLight: 'bg-rose-500/20',
    borderAccentLight: 'border-rose-400/30 font-medium',
    gradientFrom: 'from-rose-500',
    gradientTo: 'to-pink-600',
    gradientBg: 'from-slate-900 via-slate-800 to-rose-950',
    glow: 'shadow-rose-500/20',
  },
  violet: {
    text: 'text-violet-600',
    textHover: 'hover:text-violet-800',
    textDark: 'text-violet-900',
    bg: 'bg-violet-600',
    bgHover: 'hover:bg-violet-700',
    bgLight: 'bg-violet-50/50',
    bgLightSolid: 'bg-violet-50',
    bgLightHover: 'hover:bg-violet-100',
    border: 'border-violet-200',
    borderLight: 'border-violet-100',
    borderActive: 'border-violet-600',
    focusRing: 'focus:ring-violet-500',
    shadow: 'shadow-violet-200',
    textAccent: 'text-violet-300',
    bgAccentLight: 'bg-violet-500/20',
    borderAccentLight: 'border-violet-400/30 font-medium',
    gradientFrom: 'from-violet-500',
    gradientTo: 'to-fuchsia-600',
    gradientBg: 'from-slate-900 via-slate-800 to-violet-950',
    glow: 'shadow-violet-500/20',
  },
  indigo: {
    text: 'text-indigo-600',
    textHover: 'hover:text-indigo-800',
    textDark: 'text-indigo-900',
    bg: 'bg-indigo-600',
    bgHover: 'hover:bg-indigo-700',
    bgLight: 'bg-indigo-50/50',
    bgLightSolid: 'bg-indigo-50',
    bgLightHover: 'hover:bg-indigo-100',
    border: 'border-indigo-200',
    borderLight: 'border-indigo-100',
    borderActive: 'border-indigo-600',
    focusRing: 'focus:ring-indigo-500',
    shadow: 'shadow-indigo-200',
    textAccent: 'text-indigo-300',
    bgAccentLight: 'bg-indigo-500/20',
    borderAccentLight: 'border-indigo-400/30 font-medium',
    gradientFrom: 'from-indigo-500',
    gradientTo: 'to-purple-600',
    gradientBg: 'from-slate-900 via-slate-850 to-indigo-950',
    glow: 'shadow-indigo-500/20',
  },
  slate: {
    text: 'text-slate-700',
    textHover: 'hover:text-slate-900',
    textDark: 'text-slate-950',
    bg: 'bg-slate-800',
    bgHover: 'hover:bg-slate-900',
    bgLight: 'bg-slate-100/50',
    bgLightSolid: 'bg-slate-100',
    bgLightHover: 'hover:bg-slate-200',
    border: 'border-slate-300',
    borderLight: 'border-slate-200',
    borderActive: 'border-slate-800',
    focusRing: 'focus:ring-slate-500',
    shadow: 'shadow-slate-300',
    textAccent: 'text-slate-300',
    bgAccentLight: 'bg-slate-700/20',
    borderAccentLight: 'border-slate-600/35 font-medium',
    gradientFrom: 'from-slate-700',
    gradientTo: 'to-slate-900',
    gradientBg: 'from-slate-950 via-slate-900 to-slate-950',
    glow: 'shadow-slate-500/10',
  },
};


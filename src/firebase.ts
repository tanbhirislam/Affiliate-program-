/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, getDocs, writeBatch, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { OperationType, FirestoreErrorInfo, Product } from './types';

// Initialize core Firebase modules
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); /* CRITICAL: The app will break without this line */
export const auth = getAuth();

// Skill compliance verification connection test
async function testConnection() {
  try {
    const testDoc = doc(db, 'test', 'connection');
    // Non-blocking server fetch to verify auth credentials & connection state
    await getDocs(collection(db, 'products'));
    console.log("Firebase initialized and connection successfully established.");
  } catch (error) {
    if (error instanceof Error && error.message.includes('offline')) {
      console.error("Please check your Firebase configuration or networks.");
    }
  }
}
testConnection();

// Skill compliance standardized error proxy handler
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Seamless data bootstrapping for empty catalogs
export const INITIAL_PRODUCTS: Omit<Product, 'id'>[] = [
  {
    title: "MacBook Pro 16″ M3 Max (36GB/1TB SSD)",
    shortDescription: "The absolute pinnacle of mobile computer performance designed for software development, machine learning, and content creation.",
    description: "Supercharged by the elite Apple M3 Max processor. Features a stunning 16.2-inch Liquid Retina XDR display, up to 128GB of unified memory, and an astonishing 22 hours of battery lifespan. Perfect for compilation workloads, heavy rendering, or spinning up high-performance local AI models. Housed in a gorgeous spatial-black space gray anodized solid aluminum frame.",
    imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80",
    affiliateUrl: "https://www.amazon.com/dp/B0CM5N2YBM?tag=devshop-20",
    category: "Tech",
    price: 3499,
    originalPrice: 3599,
    rating: 4.9,
    benefits: [
      "Liquid Retina XDR top-tier display at 120Hz Promotion frequency",
      "Unmatched power efficiency and whisper-quiet cooling performance",
      "Studio grade 3-mic array and six-speaker soundstage with spatial audio"
    ],
    isFeatured: true,
    isTrending: true,
    clickCount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
    shortDescription: "Industry-leading digital noise cancellation paired with spectacular high-fidelity acoustic reproduction and lightweight chassis build comfort.",
    description: "The WH-1000XM5 headphones rewrite the rulebook for distraction-free listening. Equipped with two processors controlling eight microphones, automatic NC Optimizer, and custom carbon fiber drivers, they deliver unparalleled clarity in any environment from coffee shops to pressurized flights.",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
    affiliateUrl: "https://www.amazon.com/dp/B09XS7JWHH?tag=devshop-20",
    category: "Gadgets",
    price: 398,
    originalPrice: 449,
    rating: 4.8,
    benefits: [
      "Auto NC Optimizing that adapts actively depending on background volumes",
      "Astonishing 30-hour playback duration on a single rapid charge cycle",
      "Dual multi-point Bluetooth handshaking for lightning device swaps"
    ],
    isFeatured: true,
    isTrending: false,
    clickCount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Cursor AI Code Editor Pro Subscription",
    shortDescription: "The premier AI-first code editor designed to pair-program with local context awareness, custom models, and system-level shortcuts.",
    description: "Supercharge your software engineering output with Cursor. Features deep codebase indexing, inline terminal assistants, custom prompting models, and real-time git integration. Engineered to minimize cognitive load, automate repetitive refactoring, and accelerate your feature deployments.",
    imageUrl: "https://images.unsplash.com/photo-1618401471353-b98aedd07871?auto=format&fit=crop&w=1200&q=80",
    affiliateUrl: "https://cursor.com?via=devshop-ref",
    category: "Software",
    price: 20,
    rating: 4.7,
    benefits: [
      "Universal AI context injection targeting full project codebases",
      "Instant terminal instruction orchestration using conversational scripts",
      "Predictive multi-file logical code autocomplete suggestions"
    ],
    isFeatured: false,
    isTrending: true,
    clickCount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Keychron Q1 Max Mechanical Keyboard",
    shortDescription: "A premium 75% layout QMK/VIA key custom mechanical keyboard containing wireless 2.4G and solid acoustic sound dampening structure.",
    description: "A CNC aluminum masterpiece engineered for tactile enthusiasts. High-performance dual-receiver design with hot-swappable tactile pre-lubricated switches, acoustic sound-absorbing foam layers, and luxury double-shot PBT keycaps for ultimate comfort and durability.",
    imageUrl: "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=1200&q=80",
    affiliateUrl: "https://keychron.com?ref=devshop-key",
    category: "Deals",
    price: 189,
    originalPrice: 219,
    rating: 4.6,
    benefits: [
      "Anodized high-durability space-grade solid aluminum milled shell",
      "Full hardware reprogram customization compatibility via QMK and VIA",
      "Hot-swappable key modularity targeting both 3-pin and 5-pin key switches"
    ],
    isFeatured: false,
    isTrending: false,
    clickCount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export async function bootstrapDefaultProducts() {
  const path = 'products';
  if (!auth.currentUser || auth.currentUser.email !== 'businessonline.6251@gmail.com') {
    console.log("Automatic bootstrapping skipped because no authenticated admin session is active.");
    return;
  }
  try {
    // 1. Defend against the auth/bootstrap race condition by ensuring the admins entry exists first
    const adminDocRef = doc(db, 'admins', auth.currentUser.uid);
    const adminSnap = await getDoc(adminDocRef);
    if (!adminSnap.exists()) {
      console.log("Pre-creating admin credential record...");
      await setDoc(adminDocRef, {
        email: auth.currentUser.email,
        createdAt: serverTimestamp(),
      });
      console.log("Admin credential record setup.");
      // Small break to allow rules indexing state to propagate
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // 2. Fetch products and perform correct serverTimestamp batch seed
    const snap = await getDocs(collection(db, path));
    if (snap.empty) {
      console.log("No listings found. Bootstrapping initial catalog...");
      const batch = writeBatch(db);
      for (const prod of INITIAL_PRODUCTS) {
        // Generate pre-determined safe ID slugs
        const slug = prod.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const pdocRef = doc(db, path, slug);
        batch.set(pdocRef, {
          ...prod,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      await batch.commit();
      console.log("Catalog bootstrapping complete.");
    }
  } catch (error) {
    console.error("Bootstrapping could not complete because of:", error);
  }
}

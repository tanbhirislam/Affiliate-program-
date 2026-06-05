/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';

interface AdSlotProps {
  slotType: 'skyscraper-left' | 'skyscraper-right' | 'header-leaderboard' | 'feed-banner' | 'footer-banner';
  adType: 'code' | 'image' | 'hidden' | '';
  codeContent?: string;
  imageUrl?: string;
  linkUrl?: string;
  isDarkMode?: boolean;
  isAdminMode?: boolean;
  slideAnimation?: boolean;
}

export default function AdSlot({
  slotType,
  adType,
  codeContent = '',
  imageUrl = '',
  linkUrl = '',
  isDarkMode = false,
  isAdminMode = false,
  slideAnimation = false,
}: AdSlotProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Safely execute scripts if raw HTML code is used
  useEffect(() => {
    if (adType === 'code' && codeContent.trim() !== '' && containerRef.current) {
      // Clear previous content
      containerRef.current.innerHTML = '';
      
      // Create a clean container
      const wrapper = document.createElement('div');
      wrapper.className = 'w-full flex justify-center items-center overflow-hidden';
      wrapper.innerHTML = codeContent;
      containerRef.current.appendChild(wrapper);

      // Extract and execute script tags manually since dangerouslySetInnerHTML doesn't run scripts
      const scripts = wrapper.getElementsByTagName('script');
      Array.from(scripts).forEach((oldScript) => {
        const newScript = document.createElement('script');
        Array.from(oldScript.attributes).forEach((attr) => {
          newScript.setAttribute(attr.name, attr.value);
        });
        if (oldScript.innerHTML) {
          newScript.innerHTML = oldScript.innerHTML;
        }
        oldScript.parentNode?.replaceChild(newScript, oldScript);
      });
    }
  }, [adType, codeContent]);

  // If hidden and NOT in admin mode, show absolutely nothing
  if ((adType === 'hidden' || adType === '') && !isAdminMode) {
    return null;
  }

  // Define dimension labels and styling depending on slotType
  let dimensionsLabel = '';
  let slotTitle = '';
  let responsiveClasses = '';

  switch (slotType) {
    case 'skyscraper-left':
      dimensionsLabel = '160 x 600';
      slotTitle = 'Left Side Skyscraper';
      responsiveClasses = 'w-[160px] h-[600px] sticky top-24 hidden xl:flex';
      break;
    case 'skyscraper-right':
      dimensionsLabel = '160 x 600';
      slotTitle = 'Right Side Skyscraper';
      responsiveClasses = 'w-[160px] h-[600px] sticky top-24 hidden xl:flex';
      break;
    case 'header-leaderboard':
      dimensionsLabel = '970 x 90 or 728 x 90';
      slotTitle = 'Top Header Banner';
      responsiveClasses = 'w-full max-w-5xl h-[90px] md:h-[100px] px-4';
      break;
    case 'feed-banner':
      dimensionsLabel = '728 x 90 or 300 x 250';
      slotTitle = 'In-Feed Mid Banner';
      responsiveClasses = 'w-full max-w-4xl min-h-[90px] md:min-h-[120px] px-4';
      break;
    case 'footer-banner':
      dimensionsLabel = '970 x 90 or 728 x 90';
      slotTitle = 'Bottom Footer Banner';
      responsiveClasses = 'w-full max-w-5xl h-[90px] md:h-[100px] px-4';
      break;
  }

  // Motion config for slide-in entry when enabled
  const motionProps = slideAnimation ? {
    initial: {
      opacity: 0,
      x: slotType === 'skyscraper-left' ? -200 : slotType === 'skyscraper-right' ? 200 : 0,
      y: slotType === 'header-leaderboard' ? -80 : (slotType === 'feed-banner' || slotType === 'footer-banner') ? 80 : 0
    },
    animate: {
      opacity: 1,
      x: 0,
      y: 0
    },
    transition: {
      type: 'spring',
      stiffness: 75,
      damping: 15,
      mass: 0.8
    }
  } : {};

  // Outer float/drift looping motion definitions
  const loopAnimate = slideAnimation ? {
    y: slotType.includes('skyscraper') ? [0, -8, 0] : [0, -4, 0],
    x: slotType === 'skyscraper-left' ? [0, 5, 0] : slotType === 'skyscraper-right' ? [0, -5, 0] : [0, 0, 0],
  } : {};

  const loopTransition = slideAnimation ? {
    repeat: Infinity,
    duration: slotType.includes('skyscraper') ? 6 : 5,
    ease: "easeInOut"
  } : undefined;

  // Render Image Ad
  if (adType === 'image' && imageUrl.trim() !== '') {
    const content = (
      <img
        src={imageUrl}
        alt={`Advertisement - ${slotTitle}`}
        className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
        referrerPolicy="no-referrer"
      />
    );

    return (
      <motion.div 
        className={`flex justify-center items-center my-6 overflow-hidden ${responsiveClasses}`} 
        id={`ad-${slotType}`}
        {...motionProps}
      >
        <motion.div 
          className="w-full h-full flex justify-center items-center"
          animate={loopAnimate}
          transition={loopTransition}
        >
          {linkUrl ? (
            <a
              href={linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full h-full flex justify-center items-center transition-opacity hover:opacity-90"
            >
              {content}
            </a>
          ) : (
            <div className="w-full h-full flex justify-center items-center">
              {content}
            </div>
          )}
        </motion.div>
      </motion.div>
    );
  }

  // Render Custom Script/HTML Code Ad
  if (adType === 'code' && codeContent.trim() !== '') {
    return (
      <motion.div 
        ref={containerRef} 
        className={`flex justify-center items-center my-6 overflow-hidden ${responsiveClasses}`} 
        id={`ad-${slotType}`}
        {...motionProps}
      />
    );
  }

  // FALLBACK PREVIEW: Show slot frame to make monetization spots clear to the admin/user
  return (
    <motion.div 
      className={`my-6 flex flex-col justify-center items-center ${responsiveClasses}`} 
      id={`ad-${slotType}`}
      {...motionProps}
    >
      <motion.div
        className="w-full h-full"
        animate={loopAnimate}
        transition={loopTransition}
      >
        <div
          className={`w-full h-full flex flex-col items-center justify-center border-2 border-dashed rounded-xl px-4 py-3 text-center transition-all duration-300 ${
            isDarkMode
              ? 'border-slate-800 bg-slate-950/40 text-slate-500 hover:border-slate-700 hover:bg-slate-900/40'
              : 'border-slate-300 bg-slate-50/60 text-slate-400 hover:border-slate-400 hover:bg-slate-100/60'
          }`}
        >
          <span className="text-[10px] font-bold tracking-widest uppercase font-mono mb-1 text-slate-550">
            Advertisement Slot
          </span>
          <span className="text-xs font-semibold mb-0.5 max-w-full truncate">
            {slotTitle}
          </span>
          <span className="text-[10px] font-mono opacity-80">
            Size: {dimensionsLabel}
          </span>
          {isAdminMode && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-medium font-mono mt-2 animate-pulse">
              Configurable in Admin Panel
            </span>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

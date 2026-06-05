/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, Info, Mail, Phone, MapPin, Send, 
  MessageSquare, ShieldAlert, Sparkles, CheckCircle2 
} from 'lucide-react';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError } from '../firebase';
import { OperationType } from '../types';

interface InfoPageProps {
  key?: string;
  pageType: 'about' | 'contact' | 'privacy';
  aboutConfig: { content: string };
  contactConfig: { content: string; email?: string; phone?: string; address?: string };
  privacyConfig: { content: string };
  onBack: () => void;
  activeTheme: any;
  isDarkMode: boolean;
}

export default function InfoPage({
  pageType,
  aboutConfig,
  contactConfig,
  privacyConfig,
  onBack,
  activeTheme,
  isDarkMode,
}: InfoPageProps) {
  // Contact form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const getPageDetails = () => {
    switch (pageType) {
      case 'about':
        return {
          title: 'About Us',
          subtitle: 'Learn more about our curated showcase and vetting operations.',
          icon: <Info className="text-blue-500" size={24} />,
          content: aboutConfig.content || 'Welcome to our premium affiliate catalog showroom. We audit, review, and list elite products across technology, software, and lifestyle gear.',
        };
      case 'contact':
        return {
          title: 'Contact Us',
          subtitle: 'Reach out to our auditing team for questions, feedback, or partnerships.',
          icon: <Mail className="text-emerald-500" size={24} />,
          content: contactConfig.content || 'Have any inquiries? Fill out the contact form below or reach us directly using our official contact endpoints.',
        };
      case 'privacy':
        return {
          title: 'Privacy Policy',
          subtitle: 'Your privacy is respected. Read about our metrics and telemetry policies.',
          icon: <ShieldAlert className="text-violet-500" size={24} />,
          content: privacyConfig.content || 'We strongly believe in transparency. This storefront logs basic conversion click counters to identify checkout performance but never archives PII parameters.',
        };
    }
  };

  const details = getPageDetails();

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    
    setSubmitting(true);
    const path = 'contactMessages';
    try {
      const docRef = doc(collection(db, path));
      await setDoc(docRef, {
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
        timestamp: serverTimestamp()
      });
      setSubmitted(true);
      setName('');
      setEmail('');
      setMessage('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to render formatting text paragraphs
  const renderParagraphs = (text: string) => {
    return text
      .split(/\n+/)
      .filter((p) => p.trim().length > 0)
      .map((paragraph, idx) => (
        <p key={idx} className={`leading-relaxed mb-4 text-xs sm:text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-650'}`}>
          {paragraph.trim()}
        </p>
      ));
  };

  return (
    <motion.div
      id={`info-page-${pageType}`}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="max-w-4xl mx-auto space-y-6 md:space-y-8"
    >
      {/* Return button */}
      <div>
        <button
          onClick={onBack}
          className={`group px-4 py-2 border rounded-xl text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-2 transition-all outline-none select-none cursor-pointer ${
            isDarkMode 
              ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850 hover:text-white' 
              : 'bg-white border-slate-200 text-slate-705 hover:bg-slate-50 hover:text-slate-900 shadow-sm'
          }`}
        >
          <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
          Back to Storefront
        </button>
      </div>

      {/* Main Page Layout card */}
      <div className={`border rounded-2xl p-6 md:p-10 shadow-lg relative overflow-hidden transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-805' : 'bg-white border-slate-200'}`}>
        {/* Absolute ambient accent backdrop */}
        <div className={`absolute top-0 right-0 w-32 h-32 md:w-48 md:h-48 rounded-full blur-3xl opacity-10 pointer-events-none ${activeTheme.bg}`} />

        <div className="space-y-6 relative">
          
          {/* Section banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-20s dark:border-slate-800">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {details.icon}
                <h1 className="text-2xl md:text-3xl font-display font-extrabold tracking-tight font-sans">
                  {details.title}
                </h1>
              </div>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400 font-mono' : 'text-slate-500'}`}>
                {details.subtitle}
              </p>
            </div>
            <div className={`self-start md:self-auto inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg uppercase ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
              <Sparkles size={11} className={activeTheme.text} />
              Curator Guaranteed
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">
            {/* Rich text container */}
            <div className={`${pageType === 'contact' ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-4`}>
              <div className="prose max-w-none">
                {renderParagraphs(details.content)}
              </div>

              {pageType === 'contact' && (
                <div className="pt-4 space-y-4">
                  <h3 className={`text-xs font-bold uppercase font-mono tracking-wider ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>Official Channels</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Email Card */}
                    <div className={`p-4 border rounded-xl flex items-start gap-3 transition-all ${isDarkMode ? 'bg-slate-950 border-slate-800 hover:border-slate-700' : 'bg-slate-50 border-slate-150 hover:border-slate-200'}`}>
                      <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-slate-900 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                        <Mail size={16} />
                      </div>
                      <div className="min-w-0 w-full">
                        <p className={`text-[10px] uppercase font-mono font-bold ${isDarkMode ? 'text-slate-405' : 'text-slate-450'}`}>Email Address</p>
                        <p className={`text-xs sm:text-sm font-bold break-all mt-0.5 ${isDarkMode ? 'text-slate-200' : 'text-slate-850'}`}>{contactConfig.email || 'businessonline.6251@gmail.com'}</p>
                      </div>
                    </div>

                    {/* Phone Card */}
                    {contactConfig.phone && (
                      <div className={`p-4 border rounded-xl flex items-start gap-3 transition-all ${isDarkMode ? 'bg-slate-950 border-slate-800 hover:border-slate-700' : 'bg-slate-50 border-slate-150 hover:border-slate-200'}`}>
                        <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-slate-900 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                          <Phone size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className={`text-[10px] uppercase font-mono font-bold ${isDarkMode ? 'text-slate-405' : 'text-slate-450'}`}>Phone Support</p>
                          <p className={`text-xs sm:text-sm font-bold truncate mt-0.5 ${isDarkMode ? 'text-slate-200' : 'text-slate-850'}`}>{contactConfig.phone}</p>
                        </div>
                      </div>
                    )}

                    {/* Address Card */}
                    {contactConfig.address && (
                      <div className={`col-span-1 sm:col-span-2 p-4 border rounded-xl flex items-start gap-3 transition-all ${isDarkMode ? 'bg-slate-950 border-slate-800 hover:border-slate-700' : 'bg-slate-50 border-slate-150 hover:border-slate-200'}`}>
                        <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-slate-900 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>
                          <MapPin size={16} />
                        </div>
                        <div>
                          <p className={`text-[10px] uppercase font-mono font-bold ${isDarkMode ? 'text-slate-405' : 'text-slate-450'}`}>Corporate Office</p>
                          <p className={`text-xs sm:text-sm font-bold mt-0.5 ${isDarkMode ? 'text-slate-205' : 'text-slate-800'}`}>{contactConfig.address}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Interactive Contact us portal card */}
            {pageType === 'contact' && (
              <div className="lg:col-span-5">
                <div className={`border rounded-xl p-5 md:p-6 space-y-4 transition-all ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50/50 border-slate-200'}`}>
                  <div className="flex items-center gap-2">
                    <MessageSquare size={16} className={activeTheme.text} />
                    <h3 className={`text-xs font-black uppercase font-mono tracking-wider ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>Shoot Us a Message</h3>
                  </div>

                  {submitted ? (
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={`p-6 text-center space-y-3 rounded-lg border ${isDarkMode ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300' : 'bg-emerald-50 border-emerald-100 text-emerald-800'}`}
                    >
                      <CheckCircle2 className="mx-auto text-emerald-500" size={32} />
                      <div className="space-y-1">
                        <p className="text-sm font-bold">Message Dispatched!</p>
                        <p className="text-[11px] opacity-80 lead-normal">Thank you for your response. Our tech curation panel will inspect your query shortly.</p>
                      </div>
                      <button
                        onClick={() => setSubmitted(false)}
                        className={`text-xs font-extrabold underline transition-opacity hover:opacity-80 outline-none`}
                      >
                        Send another dispatch
                      </button>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="space-y-4">
                      {/* Form user name */}
                      <div className="space-y-1.5">
                        <label className={`block text-[10px] font-bold uppercase font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Full Name</label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg text-xs font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none ${
                            isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                          placeholder="John Doe"
                          required
                        />
                      </div>

                      {/* Form email */}
                      <div className="space-y-1.5">
                        <label className={`block text-[10px] font-bold uppercase font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Email Address</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg text-xs font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none ${
                            isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                          placeholder="john@example.com"
                          required
                        />
                      </div>

                      {/* Message area */}
                      <div className="space-y-1.5">
                        <label className={`block text-[10px] font-bold uppercase font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Your Message</label>
                        <textarea
                          rows={4}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg text-xs font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none leading-relaxed ${
                            isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                          placeholder="How can our curation panel catalog help you?"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={submitting}
                        className={`w-full py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer text-white shadow-sm ${
                          submitting 
                            ? 'bg-slate-600 cursor-not-allowed' 
                            : `${activeTheme.bg} ${activeTheme.bgHover} hover:scale-[1.01]`
                        }`}
                      >
                        {submitting ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Dispatching inquiry...
                          </>
                        ) : (
                          <>
                            <Send size={12} />
                            Send Message
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </motion.div>
  );
}

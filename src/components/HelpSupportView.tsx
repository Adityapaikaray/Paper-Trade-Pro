import React, { useState } from 'react';
import { HelpCircle, Search, Mail, MessageSquare, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FAQS = [
  {
    question: 'How do I fund my paper trading account?',
    answer: 'Your account starts with a virtual balance of $1,000,000. If you ever lose this or want to start fresh, you can reset your entire account from the Settings page under the "Danger Zone".'
  },
  {
    question: 'Are the market prices real-time?',
    answer: 'Yes, we provide live, real-time quotes using the Yahoo Finance API for the majority of large-cap global equities and indices. Small delays (1-3 seconds) may occur due to caching.'
  },
  {
    question: 'How do I trade an asset?',
    answer: 'You can trade an asset by searching for it using the Command Palette (Cmd+K) or clicking the "Trade" button on any asset card in your Dashboard or the Markets page.'
  },
  {
    question: 'What is the "Pro" upgrade?',
    answer: 'Currently, the TRADEPRO platform is in Beta and all features are free. The "Pro" tier will soon unlock institutional level-2 data, advanced charting, and AI-driven portfolio insights.'
  }
];

const HelpSupportView: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaqs = FAQS.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto py-8">
      {/* Header */}
      <div className="text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-6 bg-[#F6F4EB] dark:bg-gold/10 p-8 rounded-3xl border border-[#E9E4D4] dark:border-gold/20">
        <div>
          <h2 className="text-3xl font-serif font-black text-gray-900 dark:text-text-main italic mb-2 tracking-tight">Help & Support</h2>
          <p className="text-sm text-gray-600 dark:text-text-muted font-medium tracking-wide max-w-lg">
            Find answers to common questions or reach out to our team for dedicated support.
          </p>
        </div>
        <div className="w-16 h-16 rounded-full bg-white dark:bg-gold/20 flex shrink-0 items-center justify-center text-gold-dark shadow-sm">
          <HelpCircle size={32} strokeWidth={2} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search knowledge base..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white dark:bg-ui-surface border border-[#E9E4D4] dark:border-ui-border text-sm text-gray-900 dark:text-text-main placeholder:text-gray-400 focus:outline-none focus:border-[#B7873D] dark:focus:border-gold transition-colors shadow-sm"
            />
          </div>

          <div className="bg-white dark:bg-ui-surface rounded-3xl border border-[#E9E4D4] dark:border-ui-border p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-text-main mb-6">Frequently Asked Questions</h3>
            
            <div className="space-y-3">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq, idx) => (
                  <div key={idx} className="border border-[#F3F4F6] dark:border-ui-border rounded-xl overflow-hidden bg-gray-50 dark:bg-ui-bg">
                    <button 
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      className="w-full flex items-center justify-between p-4 text-left focus:outline-none"
                    >
                      <span className="text-sm font-bold text-gray-900 dark:text-text-main">{faq.question}</span>
                      <div className="text-gray-400">
                        {openFaq === idx ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    </button>
                    <AnimatePresence>
                      {openFaq === idx && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 pt-0 text-xs md:text-sm text-gray-600 dark:text-text-muted leading-relaxed border-t border-[#F3F4F6] dark:border-ui-border mt-1">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 py-4 text-center">No results found for "{searchQuery}"</p>
              )}
            </div>
          </div>
        </div>

        {/* Contact Cards */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-ui-surface rounded-3xl border border-[#E9E4D4] dark:border-ui-border p-6 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
              <Mail size={20} />
            </div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-text-main mb-1">Email Support</h4>
            <p className="text-xs text-gray-500 dark:text-text-muted mb-4">Get in touch with our team directly. We usually respond within 24 hours.</p>
            <button className="flex items-center gap-2 text-xs font-bold text-[#B7873D] dark:text-gold hover:opacity-80 transition-opacity">
              support@tradepro.com <ExternalLink size={14} />
            </button>
          </div>

          <div className="bg-white dark:bg-ui-surface rounded-3xl border border-[#E9E4D4] dark:border-ui-border p-6 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
              <MessageSquare size={20} />
            </div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-text-main mb-1">Live Chat</h4>
            <p className="text-xs text-gray-500 dark:text-text-muted mb-4">Talk to a support representative in real-time. Available 9am - 5pm EST.</p>
            <button className="w-full py-2.5 bg-gray-900 dark:bg-white text-white dark:text-ui-bg text-xs font-bold rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-sm">
              Start Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpSupportView;

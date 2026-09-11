import React, { useState } from 'react';
import { usePortfolio } from '../contexts/PortfolioContext.tsx';
import { useTheme } from '../contexts/ThemeContext.tsx';
import { useUI } from '../contexts/UIContext.tsx';
import { Settings, Moon, Sun, Trash2, Shield, Bell, User, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

const SettingsView: React.FC = () => {
  const { profile, resetAccount } = usePortfolio();
  const { theme, toggleTheme } = useTheme();
  const { addToast } = useUI();
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const handleReset = () => {
    resetAccount();
    addToast('Account data has been fully reset.', 'success');
    setShowConfirmReset(false);
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto py-8">
      <div>
        <h2 className="text-3xl font-serif font-black text-gray-900 dark:text-text-main italic mb-2 tracking-tight">Settings</h2>
        <p className="text-sm text-gray-500 dark:text-text-muted font-medium tracking-wide">
          Manage your account preferences, theme, and data.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Navigation Sidebar */}
        <div className="flex flex-col gap-2">
          <button className="flex items-center gap-3 p-3 rounded-xl bg-ui-surface-hover text-text-main font-bold border border-ui-border transition-colors">
            <User size={18} className="text-[#D4AF37] dark:text-primary" />
            General
          </button>
          <button className="flex items-center gap-3 p-3 rounded-xl bg-transparent text-text-muted hover:text-text-main hover:bg-ui-surface-hover font-semibold transition-colors border border-transparent">
            <Bell size={18} />
            Notifications
          </button>
          <button className="flex items-center gap-3 p-3 rounded-xl bg-transparent text-text-muted hover:text-text-main hover:bg-ui-surface-hover font-semibold transition-colors border border-transparent">
            <Shield size={18} />
            Privacy & Security
          </button>
        </div>

        {/* Content Area */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Profile Settings */}
          <div className="bg-white dark:bg-ui-surface rounded-3xl border border-[#E9E4D4] dark:border-ui-border p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-text-main mb-4 flex items-center gap-2">
              <User size={18} className="text-gray-400" /> Account Profile
            </h3>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-[#D4AF37] flex items-center justify-center text-white font-black uppercase text-xl shadow-md">
                JD
              </div>
              <div>
                <p className="text-base font-bold text-gray-900 dark:text-text-main">James Doe</p>
                <p className="text-sm text-gray-500 dark:text-text-muted">Prestige User &middot; Elite Tier</p>
              </div>
              <button className="ml-auto px-4 py-2 bg-gray-100 dark:bg-ui-surface-hover text-gray-700 dark:text-text-main text-xs font-bold rounded-lg hover:opacity-80 transition-opacity">
                Edit Profile
              </button>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white dark:bg-ui-surface rounded-3xl border border-[#E9E4D4] dark:border-ui-border p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-text-main mb-6 flex items-center gap-2">
              <Settings size={18} className="text-gray-400" /> Preferences
            </h3>
            
            <div className="flex items-center justify-between pb-6 border-b border-[#F3F4F6] dark:border-ui-border">
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-text-main">Appearance Theme</p>
                <p className="text-xs text-gray-500 dark:text-text-muted mt-1">Switch between light and dark mode</p>
              </div>
              <button 
                onClick={toggleTheme}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-ui-surface-hover text-gray-700 dark:text-text-main text-xs font-bold hover:opacity-80 transition-opacity border border-transparent dark:border-ui-border"
              >
                {theme === 'dark' ? <><Sun size={14} /> Light Mode</> : <><Moon size={14} /> Dark Mode</>}
              </button>
            </div>

            <div className="flex items-center justify-between pt-6">
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-text-main">Base Currency</p>
                <p className="text-xs text-gray-500 dark:text-text-muted mt-1">Display all prices in USD</p>
              </div>
              <button 
                onClick={() => addToast('Currency selection coming soon', 'info')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-ui-surface-hover text-gray-700 dark:text-text-main text-xs font-bold hover:opacity-80 transition-opacity border border-transparent dark:border-ui-border"
              >
                <DollarSign size={14} /> USD ($)
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white dark:bg-ui-surface rounded-3xl border border-rose-200 dark:border-rose-500/30 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-rose-600 dark:text-rose-500 mb-2 flex items-center gap-2">
              <Trash2 size={18} /> Danger Zone
            </h3>
            <p className="text-xs text-gray-500 dark:text-text-muted mb-6">
              Permanently delete all your trading history, holdings, and reset your account balance to the default starting capital. This action cannot be undone.
            </p>
            
            {showConfirmReset ? (
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20">
                <p className="text-sm font-bold text-rose-700 dark:text-rose-400 mb-3">Are you absolutely sure?</p>
                <div className="flex gap-3">
                  <button 
                    onClick={handleReset}
                    className="px-4 py-2 bg-rose-500 text-white text-xs font-bold rounded-lg hover:bg-rose-600 transition-colors shadow-sm"
                  >
                    Yes, Reset Everything
                  </button>
                  <button 
                    onClick={() => setShowConfirmReset(false)}
                    className="px-4 py-2 bg-white dark:bg-ui-surface border border-gray-200 dark:border-ui-border text-gray-700 dark:text-text-main text-xs font-bold rounded-lg hover:bg-gray-50 dark:hover:bg-ui-surface-hover transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setShowConfirmReset(true)}
                className="px-5 py-2.5 bg-rose-500 text-white text-xs font-bold rounded-xl hover:bg-rose-600 transition-colors shadow-sm w-full sm:w-auto"
              >
                Reset Account Data
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default SettingsView;

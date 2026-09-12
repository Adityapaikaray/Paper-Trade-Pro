import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useUI } from '../contexts/UIContext.tsx';
import { Lock, Mail, ArrowRight } from 'lucide-react';

const LoginView: React.FC = () => {
  const { login } = useAuth();
  const { addToast } = useUI();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      addToast('Please enter both email and password', 'error');
      return;
    }
    setIsSubmitting(true);
    // Simulate network request for premium feel
    setTimeout(() => {
      login();
      addToast('Successfully authenticated', 'success');
    }, 800);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ui-bg p-4 overflow-hidden"
    >
      {/* Background visual flair */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px]"></div>
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-primary-dark/5 blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md bg-ui-surface border border-ui-border rounded-3xl p-8 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="w-16 h-16 mx-auto bg-linear-to-tr from-[#D4AF37] to-amber-200 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-amber-500/20"
          >
            <Lock className="text-white" size={28} />
          </motion.div>
          
          <h2 className="text-[10px] font-black tracking-[0.3em] text-[#D4AF37] mb-2 uppercase">
            TRADEPRO
          </h2>
          <h1 className="text-2xl font-serif text-text-main mb-2">
            Access Your Account
          </h1>
          <p className="text-sm text-text-muted">
            Enter your credentials to manage your virtual portfolio.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="investor@tradepro.com"
                className="w-full pl-11 pr-4 py-3.5 bg-ui-bg border border-ui-border rounded-xl text-sm text-text-main focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2 flex justify-between">
              <span>Password</span>
              <span className="text-primary hover:underline cursor-pointer">Forgot?</span>
            </label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3.5 bg-ui-bg border border-ui-border rounded-xl text-sm text-text-main focus:outline-none focus:border-primary transition-colors font-mono tracking-widest placeholder:tracking-normal"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-xl bg-text-main text-ui-bg font-bold tracking-wide hover:bg-[#D4AF37] transition-all duration-300 mt-4 flex justify-center items-center h-14 group"
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-2 border-ui-bg border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <span className="flex items-center gap-2">
                Sign In
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </button>
        </form>

        <div className="mt-8 text-center pt-6 border-t border-ui-border">
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex justify-center items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Virtual Trading Environment
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default LoginView;

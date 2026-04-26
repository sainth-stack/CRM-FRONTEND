import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Lock, ArrowLeft, Eye, EyeOff, ShieldCheck, UserPlus } from 'lucide-react';
import API_BASE_URL from '../config';

const SetupPassword = () => {
  const [step, setStep] = useState(1); // 1: Form, 2: Success
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Extract token from URL query params: /setup-password?token=...
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    if (token) {
      setResetToken(token);
    } else {
      setError('Invalid or missing security token. Please check your email link.');
    }
  }, [location]);

  const handleSetupPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!resetToken) {
        setError('Security token is missing.');
        return;
    }

    setIsLoading(true);
    setError('');
    try {
      const resp = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          new_password: newPassword, 
          confirm_password: confirmPassword, 
          reset_token: resetToken 
        })
      });
      
      if (resp.ok) {
        setStep(2);
      } else {
        const data = await resp.json();
        throw new Error(data.detail || 'Account activation failed. The link may have expired.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-white font-outfit relative overflow-hidden pt-20">
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-brand-primary/5 to-transparent pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-[520px] px-8 text-center flex flex-col items-center"
      >
        <div className="mb-14 inline-flex flex-col items-center w-fit cursor-pointer" onClick={() => navigate('/')}>
          <h1 className="text-[52px] font-black text-brand-primary leading-none uppercase tracking-tighter mb-1 select-none">
            AI-PRIORI
          </h1>
          <div className="flex justify-between w-full items-center px-0.5">
            <span className="text-[12px] font-bold text-brand-secondary uppercase tracking-tight">Data</span>
            <span className="text-[12px] font-bold text-brand-dark leading-none opacity-30">•</span>
            <span className="text-[12px] font-bold text-brand-accent uppercase tracking-tight">Intelligence</span>
            <span className="text-[12px] font-bold text-brand-dark leading-none opacity-30">•</span>
            <span className="text-[12px] font-bold text-brand-primary uppercase tracking-tight">Autonomy</span>
          </div>
        </div>

        <div className="bg-white border border-zinc-100 p-10 rounded-[40px] shadow-[0_32px_80px_-20px_rgba(0,0,0,0.06)] w-full text-left">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="setup-form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                    <UserPlus size={24} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-zinc-800 tracking-tight">Initialize Account</h2>
                    <p className="text-sm text-zinc-500 font-medium">Secure your new intelligence sector.</p>
                  </div>
                </div>

                <form onSubmit={handleSetupPassword} className="space-y-6">
                  <div className="relative">
                    <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest ml-1 mb-2 block">Create Password</label>
                    <div className="relative">
                      <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-300" size={18} />
                      <input 
                        type={showPass ? "text" : "password"} 
                        required 
                        value={newPassword} 
                        onChange={(e) => setNewPassword(e.target.value)} 
                        placeholder="••••••••" 
                        className="w-full pl-14 pr-14 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-[#1e293b] font-semibold focus:ring-2 focus:ring-brand-primary/10 transition-all outline-none" 
                      />
                      <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-zinc-500 transition-colors">
                        {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest ml-1 mb-2 block">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-300" size={18} />
                      <input 
                        type={showConfirmPass ? "text" : "password"} 
                        required 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                        placeholder="••••••••" 
                        className="w-full pl-14 pr-14 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-[#1e293b] font-semibold focus:ring-2 focus:ring-brand-primary/10 transition-all outline-none" 
                      />
                      <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-zinc-500 transition-colors">
                        {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  {error && <div className="text-red-500 text-xs font-bold bg-red-50 p-4 rounded-xl">{error}</div>}
                  <button 
                    disabled={isLoading || !resetToken} 
                    className="w-full py-4.5 bg-brand-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-brand-primary/30 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isLoading ? "Synchronizing Credentials..." : "Activate Account"}
                  </button>
                </form>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 text-green-500 shadow-lg shadow-green-100">
                  <CheckCircle2 size={48} />
                </div>
                <h2 className="text-2xl font-bold text-zinc-800 mb-2 tracking-tight">Sector Activated</h2>
                <p className="text-sm text-zinc-500 mb-10 font-medium">Your identity has been fully synchronized. Authorized access is now granted.</p>
                <button 
                  onClick={() => navigate('/login')} 
                  className="w-full py-4.5 bg-brand-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-brand-primary/30 active:scale-95 transition-all"
                >
                  Proceed to Terminal
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-14 text-zinc-300 font-bold text-[10px] uppercase tracking-[0.4em]">Intelligence Sector Security</div>
      </motion.div>
    </div>
  );
};

export default SetupPassword;

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Lock, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';
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
    <div className="min-h-screen bg-[#030712] flex items-center justify-center font-outfit select-none text-white relative py-12 lg:py-0">
      
      {/* Glow Effects */}
      <div className="absolute top-[10%] left-1/4 w-[400px] h-[400px] bg-[#00f0ff]/5 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-[10%] right-1/4 w-[500px] h-[500px] bg-[#00d2ff]/4 blur-[130px] rounded-full pointer-events-none z-0" />

      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03] z-0" 
        style={{
          backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
          backgroundSize: "24px 24px"
        }}
      />

      <div className="max-w-6xl w-full px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center relative z-10">

        {/* LEFT COLUMN: Visual Brand Context (MAANG Style) */}
        <div className="hidden lg:flex lg:col-span-7 flex-col justify-between py-6 min-h-[520px] relative z-10 select-none">
          
          {/* Top Logo */}
          <Link to="/" className="flex items-center gap-3 w-fit">
            <div className="w-[34px] h-[34px] flex items-center justify-center shrink-0">
              <svg className="w-8 h-8 text-[#00f0ff] drop-shadow-[0_0_8px_rgba(0,240,255,0.45)]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="7.5" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="12" cy="12" r="1.8" fill="currentColor" />
                <line x1="12" y1="1" x2="12" y2="3.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <line x1="12" y1="20.8" x2="12" y2="23" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <line x1="1" y1="12" x2="3.2" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <line x1="20.8" y1="12" x2="23" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.2" strokeDasharray="1.2 2.2" strokeLinecap="round" />
              </svg>
            </div>
            <span className="font-black tracking-tight text-white" style={{ fontSize: "17.5px" }}>
              Focal<span className="text-[#00f0ff] font-black">Reach</span> <span className="text-zinc-500 font-semibold tracking-wider ml-1" style={{ fontSize: "11px" }}>AI</span>
            </span>
          </Link>

          {/* Middle Feature Content */}
          <div className="space-y-8 max-w-xl my-auto py-8">
            <h2 className="text-4xl font-extrabold tracking-tight leading-tight text-white uppercase">
              Configure secure<br />
              <span className="text-[#00f0ff]" style={{ textShadow: "0 0 30px rgba(0, 240, 255, 0.25)" }}>account access</span>
            </h2>
            
            <p className="text-[14.5px] text-zinc-300 leading-relaxed font-normal">
              Establish custom credentials to activate your secure multi-tenant B2B cold outreach platform.
            </p>

            <div className="space-y-6 pt-2">
              {[
                { icon: "💪", title: "High-Entropy Passwords", desc: "Establish custom access criteria protecting your outreach pipelines." },
                { icon: "⚡", title: "Fully Integrated Access", desc: "Your new credentials grant immediate entries to mailbox and calendar connectors." },
                { icon: "🛡️", title: "Strict Policy Controls", desc: "Industry-standard security configurations keep tenant logs perfectly private." }
              ].map((feat, i) => (
                <div key={i} className="flex gap-5 items-start select-none">
                  <div className="w-11 h-11 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-center text-lg shrink-0 shadow-md">
                    {feat.icon}
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-white mb-0.5">{feat.title}</h4>
                    <p className="text-[12.5px] text-zinc-400 leading-relaxed font-medium">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Stats */}
          <div className="flex items-center gap-4 text-[10px] font-extrabold uppercase tracking-wider text-zinc-500 border-t border-zinc-900/60 pt-6">
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Custom access</span>
            <span className="text-zinc-800">•</span>
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-pulse" /> Fully verified lane</span>
          </div>

        </div>

        {/* RIGHT COLUMN: The Auth Slide */}
        <div className="lg:col-span-5 flex items-center justify-center py-6 relative z-10 w-full">
          
          {/* Mobile Header Logo */}
          <div className="absolute -top-6 left-4 lg:hidden">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-[30px] h-[30px] flex items-center justify-center shrink-0">
                <svg className="w-7 h-7 text-[#00f0ff]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="7.5" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="12" cy="12" r="1.8" fill="currentColor" />
                  <line x1="12" y1="1" x2="12" y2="3.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <line x1="12" y1="20.8" x2="12" y2="23" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <line x1="1" y1="12" x2="3.2" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <line x1="20.8" y1="12" x2="23" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.2" strokeDasharray="1.2 2.2" strokeLinecap="round" />
                </svg>
              </div>
              <span className="font-black tracking-tight text-white text-base">
                Focal<span className="text-[#00f0ff] font-black">Reach</span> <span className="text-zinc-500 font-semibold tracking-wider ml-1" style={{ fontSize: "10px" }}>AI</span>
              </span>
            </Link>
          </div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full max-w-[420px] bg-zinc-900/10 border border-zinc-800/40 rounded-3xl p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-md relative z-10 text-left"
          >
            
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div 
                  key="setup-form" 
                  initial={{ opacity: 0, x: 20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-6 text-left">
                    <h2 className="text-2xl font-bold tracking-tight text-white mb-2">Set Password</h2>
                    <p className="text-xs text-zinc-400 font-medium leading-relaxed">Choose a secure password to complete your account setup.</p>
                  </div>
                  
                  <form onSubmit={handleSetupPassword} className="space-y-6">
                    
                    {/* Create Password */}
                    <div className="text-left">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1 mb-2.5 block">Create Password</label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 transition-colors group-focus-within:text-[#00f0ff]" />
                        <input 
                          type={showPass ? "text" : "password"} 
                          required 
                          value={newPassword} 
                          onChange={(e) => setNewPassword(e.target.value)} 
                          placeholder="••••••••" 
                          className="w-full pl-12 pr-12 py-3.5 bg-zinc-900/30 border border-zinc-800/60 rounded-xl text-white font-medium placeholder:text-zinc-600 focus:outline-none focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff]/25 transition-all text-xs" 
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowPass(!showPass)} 
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                        >
                          {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    
                    {/* Confirm Password */}
                    <div className="text-left">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1 mb-2.5 block">Confirm Password</label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 transition-colors group-focus-within:text-[#00f0ff]" />
                        <input 
                          type={showConfirmPass ? "text" : "password"} 
                          required 
                          value={confirmPassword} 
                          onChange={(e) => setConfirmPassword(e.target.value)} 
                          placeholder="••••••••" 
                          className="w-full pl-12 pr-12 py-3.5 bg-zinc-900/30 border border-zinc-800/60 rounded-xl text-white font-medium placeholder:text-zinc-600 focus:outline-none focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff]/25 transition-all text-xs" 
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowConfirmPass(!showConfirmPass)} 
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                        >
                          {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    
                    {error && (
                      <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold py-3.5 px-4 rounded-xl text-center">
                        {error}
                      </div>
                    )}
                    
                    <button 
                      disabled={isLoading || !resetToken} 
                      className="w-full py-3.5 bg-[#00f0ff] hover:bg-[#26f3ff] text-zinc-950 rounded-xl font-extrabold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.15)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 disabled:opacity-50 disabled:grayscale disabled:hover:scale-100 group"
                    >
                      {isLoading ? "Activating..." : "Activate Account"}
                      {!isLoading && <ArrowRight size={14} className="mt-0.5 group-hover:translate-x-1 transition-transform" />}
                    </button>
                  </form>
                  
                  <div className="text-center pt-2 select-none border-t border-zinc-900/60 mt-8">
                    <button 
                      type="button" 
                      onClick={() => navigate('/login')} 
                      className="text-zinc-500 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest"
                    >
                      Back to Login
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div 
                  key="success" 
                  initial={{ opacity: 0, scale: 0.9 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  transition={{ duration: 0.3 }}
                  className="text-center py-4"
                >
                  <div className="w-16 h-16 bg-[#00f0ff]/10 border border-[#00f0ff]/20 rounded-full flex items-center justify-center mx-auto mb-6 text-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.15)]">
                    <CheckCircle2 size={32} />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight text-white mb-2">Account Activated</h2>
                  <p className="text-xs text-zinc-400 font-medium leading-relaxed mb-8">Your password is set and your account is ready for use.</p>
                  <button 
                    onClick={() => navigate('/login')} 
                    className="w-full py-3.5 bg-[#00f0ff] hover:bg-[#26f3ff] text-zinc-950 rounded-xl font-extrabold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.15)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-300"
                  >
                    Back to Login
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>

          {/* Small security indicator */}
          <div className="absolute bottom-8 right-8 text-[9px] text-zinc-650 font-bold uppercase tracking-widest flex items-center gap-1.5 select-none">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-605 animate-pulse" />
            Secure B2B Outbound deck
          </div>

        </div>

      </div>

    </div>
  );
};

export default SetupPassword;

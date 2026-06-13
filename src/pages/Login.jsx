import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Verification failed. Please check your credentials.');
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
              Reach the accounts<br />
              <span className="text-[#00f0ff]" style={{ textShadow: "0 0 30px rgba(0, 240, 255, 0.25)" }}>that convert</span>
            </h2>
            
            <p className="text-[14.5px] text-zinc-300 leading-relaxed font-normal">
              FocalReach AI is an intelligent B2B cold outreach infrastructure that auto-crawls targets, ranks leads based on company fit, and drafts hyper-personalized campaigns that secure meetings.
            </p>

            <div className="space-y-6 pt-2">
              {[
                { icon: "📊", title: "Outbound Command Center", desc: "Track delivery metrics, open rates, and reply sentiments in real-time." },
                { icon: "⚡", title: "Unified Deliverability", desc: "Reach primary inboxes directly with our integrated sender health monitoring." },
                { icon: "🔒", title: "Automated Workspace Isolation", desc: "Keep outbound lists and prospect analytics completely separated." }
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
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> 12.4k+ active prospects</span>
            <span className="text-zinc-800">•</span>
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-pulse" /> 98.7% deliverability rate</span>
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
            className="w-full max-w-[420px] bg-zinc-900/10 border border-zinc-800/40 rounded-3xl p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-md relative z-10"
          >
            
            <div className="mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-white mb-2">Welcome back</h2>
              <p className="text-xs text-zinc-400 font-medium leading-relaxed">Sign in to your account to manage your outbound campaigns.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Email Input */}
            <div className="text-left">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1 mb-2.5 block">
                Work Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 transition-colors group-focus-within:text-[#00f0ff]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@focalreach-ai.com"
                  className="w-full pl-12 pr-6 py-3.5 bg-zinc-900/30 border border-zinc-800/60 rounded-xl text-white font-medium placeholder:text-zinc-600 focus:outline-none focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff]/25 transition-all text-xs"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="text-left relative">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1 mb-2.5 block">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 transition-colors group-focus-within:text-[#00f0ff]" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-12 pr-12 py-3.5 bg-zinc-900/30 border border-zinc-800/60 rounded-xl text-white font-medium placeholder:text-zinc-600 focus:outline-none focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff]/25 transition-all text-xs"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              
              <div className="flex justify-end mt-3 mr-1">
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-[10px] font-bold text-[#00f0ff] hover:text-[#26f3ff] transition-colors uppercase tracking-widest"
                >
                  Forgot Password?
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold py-3.5 px-4 rounded-xl text-center">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-[#00f0ff] hover:bg-[#26f3ff] text-zinc-950 rounded-xl font-extrabold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.15)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 disabled:opacity-50 disabled:grayscale disabled:hover:scale-100"
            >
              {isLoading ? "Signing in..." : "Sign In"}
              {!isLoading && <ArrowRight size={14} className="mt-0.5" />}
            </button>
          </form>

          {/* Prompt Sign Up — trial entry hidden for now; demo signup logic/routes preserved.
          <div className="mt-8 text-center pt-2 select-none border-t border-zinc-900/60">
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">New to the platform?</span>
            <Link
              to="/demo"
              className="text-[#00f0ff] hover:text-[#26f3ff] transition-colors text-[10px] font-bold uppercase tracking-widest ml-2"
            >
              Start Free Trial
            </Link>
          </div>
          */}
          <div className="mt-8 text-center pt-2 select-none border-t border-zinc-900/60">
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">New to the platform?</span>
            <Link
              to="/contact"
              className="text-[#00f0ff] hover:text-[#26f3ff] transition-colors text-[10px] font-bold uppercase tracking-widest ml-2"
            >
              Contact Us
            </Link>
          </div>

        </motion.div>

        {/* Small security indicator */}
        <div className="absolute bottom-8 right-8 text-[9px] text-zinc-600 font-bold uppercase tracking-widest flex items-center gap-1.5 select-none">
          <ShieldCheck className="w-3.5 h-3.5 text-zinc-600" />
          Secure B2B Outbound deck
        </div>

      </div>
    </div>
  </div>
  );
};

export default Login;

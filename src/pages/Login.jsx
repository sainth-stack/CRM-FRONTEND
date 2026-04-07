import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';

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
      setError(err.message || 'Identity verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-white font-outfit relative overflow-hidden pt-20">
      {/* Background Subtle Gradient */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-brand-primary/5 to-transparent pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[520px] px-8 text-center flex flex-col items-center"
      >
        {/* Logo and Tagline Matching Header */}
        <div className="mb-14 inline-flex flex-col items-center w-fit">
          <h1 className="text-[52px] font-black text-brand-primary leading-none uppercase tracking-tighter mb-1 select-none">
            AI-PRIORI
          </h1>
          <div className="flex justify-between w-full items-center px-0.5">
            <span className="text-[12px] font-bold text-brand-secondary uppercase tracking-tight">DATA</span>
            <span className="text-[12px] font-bold text-brand-dark leading-none opacity-30">•</span>
            <span className="text-[12px] font-bold text-brand-accent uppercase tracking-tight">INTELLIGENCE</span>
            <span className="text-[12px] font-bold text-brand-dark leading-none opacity-30">•</span>
            <span className="text-[12px] font-bold text-brand-primary uppercase tracking-tight">AUTONOMY</span>
          </div>
        </div>

        {/* Clean Login Card */}
        <div className="bg-white border border-zinc-100 p-10 rounded-[40px] shadow-[0_32px_80px_-20px_rgba(0,0,0,0.06)] w-full">
          <h2 className="text-xl font-bold text-zinc-800 mb-8 tracking-tight">
            Log In
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-left">
              <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest ml-1 mb-2 block">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@ai-priori.com"
                className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-[#1e293b] font-semibold placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/10 transition-all font-outfit"
              />
            </div>

            <div className="text-left relative">
              <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest ml-1 mb-2 block">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-[#1e293b] font-semibold placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/10 transition-all font-outfit"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-zinc-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="flex justify-start mt-3 ml-1">
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-[11px] font-bold text-brand-primary hover:text-brand-primary/80 transition-colors uppercase tracking-wider"
                >
                  Forgot Password?
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-500 text-xs font-bold py-3 px-4 rounded-xl mb-4">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4.5 bg-brand-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-brand-primary/30 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:grayscale disabled:hover:scale-100"
            >
              {isLoading ? "Synchronizing..." : "Log In"}
            </button>
          </form>

          <p className="mt-8 text-[11px] text-zinc-400 font-medium max-w-[280px] mx-auto leading-relaxed">
            Unauthorized access is strictly prohibited. <br />
            Access is restricted to authorized company members with vaulted credentials.
          </p>
        </div>

        {/* Subtle Footer */}
        <div className="mt-14 text-zinc-300 font-bold text-[10px] uppercase tracking-[0.4em]">
          Intelligence Sector Security
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

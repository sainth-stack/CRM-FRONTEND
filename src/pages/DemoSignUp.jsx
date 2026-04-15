import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Loader2, Rocket, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react';

const DemoSignUp = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { demoSignup } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await demoSignup(email, password);
            navigate('/demo/verify', { state: { email } });
        } catch (err) {
            setError(err.message || 'Onboarding mobilization failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-white flex items-center justify-center p-6 overflow-hidden font-outfit">
            {/* Sovereign Atmosphere Pulses */}
            <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-brand-primary/5 rounded-full blur-[150px] animate-pulse" />
            <div className="absolute bottom-[-5%] left-[-5%] w-[600px] h-[600px] bg-brand-secondary/5 rounded-full blur-[120px]" />

            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 max-w-lg w-full"
            >
                {/* Brand Identity Artifact */}
                <div className="flex flex-col items-center mb-6 pt-16">
                    <h1 className="text-5xl font-black text-brand-primary tracking-tighter mb-2">
                        AI-PRIORI
                    </h1>
                    <div className="flex items-center gap-2 mb-6">
                        <span className="text-[10px] font-black text-brand-secondary uppercase tracking-widest">DATA</span>
                        <span className="text-[10px] font-black text-brand-dark opacity-30">-</span>
                        <span className="text-[10px] font-black text-brand-accent uppercase tracking-widest">INTELLIGENCE</span>
                        <span className="text-[10px] font-black text-brand-dark opacity-30">-</span>
                        <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">AUTONOMY</span>
                    </div>
                    <p className="text-brand-primary font-black tracking-widest uppercase text-[8px] bg-brand-primary/10 py-1 px-4 rounded-full border border-brand-primary/20">
                        Sovereign Assessment Portal
                    </p>
                </div>

                <div className="bg-white/90 border border-zinc-200 rounded-[40px] p-12 backdrop-blur-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)]">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <AnimatePresence mode="wait">
                            {error && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="p-5 bg-brand-primary/10 border border-brand-primary/20 rounded-3xl text-brand-primary text-[11px] font-black uppercase tracking-wider flex items-center gap-4 text-center justify-center"
                                >
                                    <ShieldCheck className="w-4 h-4 shrink-0" />
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Identity Logic Nodes */}
                        <div className="space-y-4">
                            <div className="relative group">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 transition-colors group-focus-within:text-brand-primary" />
                                <input 
                                    type="email" 
                                    required
                                    placeholder="WORK EMAIL IDENTITY"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-5 pl-14 pr-6 text-brand-dark placeholder:text-zinc-400 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30 transition-all font-black text-[12px] tracking-widest"
                                />
                            </div>

                            <div className="relative group">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 transition-colors group-focus-within:text-brand-primary" />
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    required
                                    placeholder="ACCESS CREDENTIAL"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-5 pl-14 pr-12 text-brand-dark placeholder:text-zinc-400 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30 transition-all font-black text-[12px] tracking-widest"
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-brand-primary transition-colors"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Primary Mobilization Gear */}
                        <button 
                            disabled={loading}
                            className="relative w-full overflow-hidden h-16 rounded-2xl group transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                            <div className="absolute inset-0 bg-brand-primary transition-transform group-hover:scale-105" />
                            <div className="relative h-full flex items-center justify-center gap-3 text-white font-black text-xs uppercase tracking-[0.2em]">
                                {loading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        GET OTP
                                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                    </>
                                )}
                            </div>
                        </button>

                        <div className="text-center pt-2">
                            <Link 
                                to="/login" 
                                className="text-zinc-500 hover:text-brand-primary transition-all text-[10px] font-black uppercase tracking-[0.2em]"
                            >
                                Existing Profile? Identify
                            </Link>
                        </div>
                    </form>
                </div>

                {/* Compliance Artifacts */}
                <div className="mt-12 flex flex-col items-center gap-6 text-center">
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col items-center gap-1">
                            <ShieldCheck className="w-4 h-4 text-brand-primary" />
                            <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">AES-256 VAULT</span>
                        </div>
                        <div className="w-[1px] h-8 bg-zinc-200" />
                        <div className="flex flex-col items-center gap-1">
                            <Rocket className="w-4 h-4 text-zinc-400" />
                            <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">HIGH-SCALE HUB</span>
                        </div>
                    </div>
                    <p className="text-[9px] text-zinc-500 leading-relaxed max-w-xs font-black uppercase tracking-widest">
                        By proceeding, you activate a 5-day assessment identity. All outbound mobilization is monitored for compliance.
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default DemoSignUp;

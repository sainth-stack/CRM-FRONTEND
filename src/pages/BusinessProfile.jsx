import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Lock, RefreshCcw, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, Sliders } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API_BASE_URL from '../config';

const BusinessProfile = () => {
    const { user, checkAuth } = useAuth();
    const navigate = useNavigate();

    const [fullName, setFullName] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [roleTitle, setRoleTitle] = useState('');



    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        let cancelled = false;
        const loadProfile = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/auth/profile`);
                if (cancelled) return;
                setFullName(res.data.full_name || '');
                setCompanyName(res.data.company_name || '');
                setRoleTitle(res.data.role_title || '');
            } catch (err) {
                if (!cancelled) {
                    console.error('Failed to load business profile:', err);
                    setError('Unable to load existing profile. You can still fill it in below.');
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        loadProfile();
        return () => { cancelled = true; };
    }, []);

    const validate = () => {
        if (!fullName.trim()) return 'Full name is required.';
        if (!companyName.trim()) return 'Company name is required.';
        if (!roleTitle.trim()) return 'Role / title is required.';
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        setSaving(true);
        try {
            // Save user profile details
            await axios.put(`${API_BASE_URL}/auth/profile`, {
                full_name: fullName.trim(),
                company_name: companyName.trim(),
                role_title: roleTitle.trim(),
            });



            setSuccess(true);
            // Refresh session-level user info so downstream features see updated profile
            await checkAuth();
            setTimeout(() => {
                navigate('/');
            }, 1500);
        } catch (err) {
            const detail = err?.response?.data?.detail;
            if (Array.isArray(detail)) {
                setError(detail.map((d) => d.msg).join(' '));
            } else if (typeof detail === 'string') {
                setError(detail);
            } else {
                setError('Could not save profile information. Please try again.');
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#030712] flex items-center justify-center font-outfit">
                <RefreshCcw className="w-8 h-8 animate-spin text-[#00f0ff]" />
            </div>
        );
    }

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
                
                {/* Left Side: Branding / Info Column (Centered Vertically & Non-Scrollable) */}
                <div className="hidden lg:flex lg:col-span-7 flex-col justify-between py-6 min-h-[520px] relative z-10 select-none">
                    
                    {/* Top Logo */}
                    <div className="flex items-center gap-3 w-fit">
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
                    </div>

                    {/* Middle Feature Content */}
                    <div className="space-y-8 max-w-xl my-auto py-8">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 bg-[#00f0ff]/5 border border-[#00f0ff]/10 px-3 py-1.5 rounded-full self-start">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-pulse" />
                            <span className="text-[10px] font-black text-[#00f0ff] uppercase tracking-[0.2em]">
                                Smart Calibration
                            </span>
                        </div>

                        {/* Main Title */}
                        <h2 className="text-4xl font-extrabold tracking-tight leading-tight text-white uppercase">
                            Scale your outreach with <br />
                            <span className="text-[#00f0ff]" style={{ textShadow: "0 0 30px rgba(0, 240, 255, 0.25)" }}>precision.</span>
                        </h2>

                        {/* Subcopy */}
                        <p className="text-[14.5px] text-zinc-300 leading-relaxed font-normal">
                            Complete your Business Identity to calibrate our AI engine. We use these details to ensure every email reflects your brand's unique tone and professional signature.
                        </p>

                        {/* Features List */}
                        <div className="space-y-6 pt-2">
                            {/* Bullet 1 */}
                            <div className="flex items-start gap-4">
                               <div className="w-11 h-11 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-center text-lg shrink-0 shadow-md">
                                    <ShieldCheck className="w-5 h-5 text-[#00f0ff]" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-0.5">
                                        Authenticated Outreach
                                    </h3>
                                    <p className="text-[12.5px] text-zinc-400 leading-relaxed font-medium">
                                        Verified credentials build higher trust with high-value leads.
                                    </p>
                                </div>
                            </div>

                            {/* Bullet 2 */}
                            <div className="flex items-start gap-4">
                               <div className="w-11 h-11 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-center text-lg shrink-0 shadow-md">
                                    <Sliders className="w-5 h-5 text-[#00f0ff]" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-0.5">
                                        Tone Calibration
                                    </h3>
                                    <p className="text-[12.5px] text-zinc-400 leading-relaxed font-medium">
                                        Your role and company name guide the AI's linguistic choices.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Stats */}
                    <div className="flex items-center gap-4 text-[10px] font-extrabold uppercase tracking-wider text-zinc-500 border-t border-zinc-900/60 pt-6">
                        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Secure session</span>
                        <span className="text-zinc-800">•</span>
                        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-pulse" /> AES-256 encrypted</span>
                    </div>
                </div>

                {/* Right Side: Form Card */}
                <div className="lg:col-span-5 flex items-center justify-center py-6 relative z-10 w-full">
                    
                    {/* Mobile Header Logo */}
                    <div className="absolute -top-6 left-4 lg:hidden">
                        <div className="flex items-center gap-3">
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
                        </div>
                    </div>

                    <div className="w-full max-w-[460px] bg-zinc-900/10 border border-zinc-800/40 rounded-3xl p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-md relative z-10 text-left">
                        
                        <header className="mb-6">
                            <h2 className="text-2xl font-extrabold text-white tracking-tight mb-2">
                                Business Identity
                            </h2>
                            <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                                Complete your profile to personalize AI outreach.
                            </p>
                        </header>

                        {/* Dark Cyan Alert notice banner */}
                        <div className="bg-[#00f0ff]/5 border border-[#00f0ff]/10 rounded-xl p-4 flex gap-3 items-start mb-8">
                            <AlertCircle className="w-5 h-5 text-[#00f0ff] shrink-0 mt-0.5" />
                            <p className="text-[11px] leading-relaxed font-bold text-zinc-300">
                                Complete your business identity to calibrate AI outreach.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Registered Email */}
                            <div>
                                <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-2.5">
                                    Registered Email
                                </label>
                                <div className="relative group">
                                    <input
                                        type="email"
                                        value={user?.email || ''}
                                        readOnly
                                        disabled
                                        className="w-full pl-6 pr-12 py-3 bg-zinc-950/40 border border-zinc-900/80 rounded-xl text-zinc-500 font-semibold text-xs cursor-not-allowed border-dashed focus:outline-none"
                                    />
                                    <Lock className="w-4 h-4 text-zinc-655 absolute right-4 top-1/2 -translate-y-1/2" />
                                </div>
                                <span className="block text-[8px] font-bold text-zinc-600 mt-2 uppercase tracking-widest">
                                    Derived from your authenticated session
                                </span>
                            </div>

                            {/* Full Name & Company Name side-by-side */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="full_name" className="block text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-2.5">
                                        Full Name
                                    </label>
                                    <input
                                        id="full_name"
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="e.g. Aarav Mehta"
                                        maxLength={120}
                                        className="w-full px-4 py-3 bg-zinc-900/30 border border-zinc-850/80 rounded-xl focus:outline-none focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff]/25 font-bold text-white text-xs placeholder-zinc-600 transition-all"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="company_name" className="block text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-2.5">
                                        Company Name
                                    </label>
                                    <input
                                        id="company_name"
                                        type="text"
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        placeholder="e.g. FocalReach AI Labs"
                                        maxLength={160}
                                        className="w-full px-4 py-3 bg-zinc-900/30 border border-zinc-850/80 rounded-xl focus:outline-none focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff]/25 font-bold text-white text-xs placeholder-zinc-600 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Role / Title */}
                            <div>
                                <label htmlFor="role_title" className="block text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-2.5">
                                    Role / Title
                                </label>
                                <input
                                    id="role_title"
                                    type="text"
                                    value={roleTitle}
                                    onChange={(e) => setRoleTitle(e.target.value)}
                                    placeholder="e.g. Founder & CEO"
                                    maxLength={120}
                                    className="w-full px-4 py-3 bg-zinc-900/30 border border-zinc-850/80 rounded-xl focus:outline-none focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff]/25 font-bold text-white text-xs placeholder-zinc-600 transition-all"
                                />
                            </div>



                            {/* Status Banners */}
                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-450 shrink-0 mt-0.5" />
                                    <p className="text-xs text-red-300 font-bold leading-normal">{error}</p>
                                </div>
                            )}
                            {success && !error && (
                                <div className="p-4 bg-[#00f0ff]/5 border border-[#00f0ff]/10 text-[#00f0ff] rounded-xl flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-[#00f0ff] shrink-0" />
                                    <p className="text-xs text-[#00f0ff] font-bold">Identity & Settings saved successfully.</p>
                                </div>
                            )}

                            {/* Action buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-grow py-3.5 bg-[#00f0ff] hover:bg-[#26f3ff] text-zinc-950 rounded-xl font-extrabold text-xs uppercase tracking-widest hover:shadow-[0_0_20px_rgba(0,240,255,0.15)] transition-all flex items-center justify-center gap-2 group active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                                >
                                    {saving ? 'Saving Profile...' : 'Save Settings'}
                                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default BusinessProfile;

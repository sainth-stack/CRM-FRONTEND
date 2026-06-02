import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Calendar, CheckCircle2, XCircle, RefreshCcw, AlertCircle, Clock, ShieldCheck } from 'lucide-react';

const ConnectCalendar = () => {
    const { connectCalCalendar, checkAuth, getCalAuthorizationUrl } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('idle'); // idle, connecting, success, error
    const [errorMessage, setErrorMessage] = useState('');
    const [connectingCal, setConnectingCal] = useState(false);

    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const hasValidCode = code && code !== 'undefined' && code !== 'null';

    console.log("ConnectCalendar Render:", {
        href: window.location.href,
        search: window.location.search,
        code,
        state,
        hasValidCode,
        status: status
    });

    const handleCalendarSuccess = useCallback(async ({ code, state }) => {
        setStatus('connecting');
        try {
            await connectCalCalendar(code, state);
            await checkAuth(); 
            setStatus('success');
            setTimeout(() => navigate('/settings'), 1500); 
        } catch (error) {
            setErrorMessage(error.response?.data?.detail || "Calendar connection failed.");
            setStatus('error');
        }
    }, [connectCalCalendar, checkAuth, navigate]);

    useEffect(() => {
        if (hasValidCode && status === 'idle') {
            const sessionKey = `cal_handshake_triggered_${code}`;
            if (!sessionStorage.getItem(sessionKey)) {
                sessionStorage.setItem(sessionKey, 'true');
                handleCalendarSuccess({ code, state }); 
            }
        }
    }, [hasValidCode, status, code, state, handleCalendarSuccess]);

    const startCalAuthorization = async () => {
        setConnectingCal(true);
        setStatus('connecting');
        try {
            const url = await getCalAuthorizationUrl();
            if (!url) {
                throw new Error('Authorization URL was not returned.');
            }
            window.location.assign(url);
        } catch (error) {
            console.error("Cal.com authorization initialization failed:", error);
            setErrorMessage("Failed to initialize Cal.com authorization.");
            setStatus('error');
            setConnectingCal(false);
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
                                Calendar Sync
                            </span>
                        </div>

                        {/* Main Title */}
                        <h2 className="text-4xl font-extrabold tracking-tight leading-tight text-white uppercase">
                            Sync your professional <br />
                            <span className="text-[#00f0ff]" style={{ textShadow: "0 0 30px rgba(0, 240, 255, 0.25)" }}>calendar.</span>
                        </h2>

                        {/* Subcopy */}
                        <p className="text-[14.5px] text-zinc-300 leading-relaxed font-normal">
                            Connect your Cal.com scheduler to enable automated discovery call booking and availability synchronization.
                        </p>

                        {/* Features List */}
                        <div className="space-y-6 pt-2">
                            {/* Bullet 1 */}
                            <div className="flex items-start gap-4">
                               <div className="w-11 h-11 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-center text-lg shrink-0 shadow-md">
                                    <Clock className="w-5 h-5 text-[#00f0ff]" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-0.5">
                                        Availability Sync
                                    </h3>
                                    <p className="text-[12.5px] text-zinc-400 leading-relaxed font-medium">
                                        Identify open slots and match with prospects' preferred times.
                                    </p>
                                </div>
                            </div>

                            {/* Bullet 2 */}
                            <div className="flex items-start gap-4">
                               <div className="w-11 h-11 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-center text-lg shrink-0 shadow-md">
                                    <ShieldCheck className="w-5 h-5 text-[#00f0ff]" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-0.5">
                                        Autonomous Booking
                                    </h3>
                                    <p className="text-[12.5px] text-zinc-400 leading-relaxed font-medium">
                                        Instantly secure discovery calls upon positive replies.
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

                {/* Right Side: Form Card (Scrollable) */}
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

                    <div className="w-full max-w-[420px] bg-zinc-900/10 border border-zinc-800/40 rounded-3xl p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-md relative z-10">
                        
                        <header className="mb-6">
                            <h2 className="text-2xl font-extrabold text-white tracking-tight mb-2">
                                Sync Calendar
                            </h2>
                            <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                                Connect your Cal.com scheduler.
                            </p>
                        </header>

                        {/* Dark Cyan Alert notice banner */}
                        <div className="bg-[#00f0ff]/5 border border-[#00f0ff]/10 rounded-xl p-4 flex gap-3 items-start mb-8">
                            <AlertCircle className="w-5 h-5 text-[#00f0ff] shrink-0 mt-0.5" />
                            <p className="text-[11px] leading-relaxed font-bold text-zinc-300">
                                Connecting your calendar allows FocalReach AI to book discovery calls automatically.
                            </p>
                        </div>

                        <div className="space-y-6">
                            {status === 'connecting' && (
                                <div className="py-8 space-y-4 text-center">
                                    <RefreshCcw className="w-8 h-8 animate-spin text-[#00f0ff] mx-auto" />
                                    <p className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">
                                        Establishing Connection...
                                    </p>
                                </div>
                            )}

                            {status === 'success' && (
                                <div className="py-8 space-y-4 text-center">
                                    <div className="w-12 h-12 bg-[#00f0ff]/10 border border-[#00f0ff]/20 text-[#00f0ff] rounded-full flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(0,240,255,0.15)]">
                                        <CheckCircle2 className="w-6 h-6" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00f0ff] animate-pulse">
                                        Calendar Bridged Successfully!
                                    </p>
                                </div>
                            )}

                            {status === 'error' && (
                                <div className="py-8 space-y-6 text-center">
                                    <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto">
                                        <XCircle className="w-6 h-6" />
                                    </div>
                                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                                        <p className="text-xs text-red-300 font-bold leading-normal text-left">
                                            {errorMessage || "OAuth Handshake Failed."}
                                        </p>
                                    </div>
                                    <button 
                                        onClick={startCalAuthorization}
                                        className="w-full py-3.5 bg-[#00f0ff] hover:bg-[#26f3ff] text-zinc-950 rounded-xl font-extrabold text-xs uppercase tracking-widest hover:shadow-[0_0_20px_rgba(0,240,255,0.15)] transition-all active:scale-[0.98]"
                                    >
                                        Retry Connection
                                    </button>
                                </div>
                            )}

                            {status === 'idle' && (
                                <div className="py-4 text-center">
                                    {hasValidCode ? (
                                        <div className="space-y-4">
                                            <RefreshCcw className="w-8 h-8 animate-spin text-[#00f0ff] mx-auto" />
                                            <p className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">
                                                Initializing OAuth Handshake...
                                            </p>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={startCalAuthorization}
                                            disabled={connectingCal}
                                            className="w-full flex items-center justify-center gap-3 px-8 py-3.5 bg-[#00f0ff] hover:bg-[#26f3ff] text-zinc-950 rounded-xl font-extrabold text-xs uppercase tracking-widest hover:shadow-[0_0_20px_rgba(0,240,255,0.15)] transition-all active:scale-[0.98] disabled:opacity-50"
                                        >
                                            {connectingCal ? (
                                                <>
                                                    <RefreshCcw className="w-4 h-4 animate-spin" />
                                                    Redirecting to Cal.com...
                                                </>
                                            ) : (
                                                <>
                                                    <Calendar className="w-4 h-4" />
                                                    Connect Cal.com Calendar
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ConnectCalendar;

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
        <div className="min-h-screen lg:h-screen pt-[74px] lg:overflow-hidden bg-gradient-to-br from-[#FFF5F5] via-white to-[#FFF9F9] px-6 md:px-12 flex items-center justify-center font-outfit relative overflow-hidden">
            {/* Ambient luxury glow effects */}
            <div className="absolute top-[10%] -left-[10%] w-[500px] h-[500px] bg-red-200/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[10%] -right-[10%] w-[500px] h-[500px] bg-rose-200/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-6xl w-full lg:h-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center relative z-10 py-8 lg:py-0">
                
                {/* Left Side: Branding / Info Column (Centered Vertically & Non-Scrollable) */}
                <div className="text-left space-y-6 max-w-xl lg:h-full flex flex-col justify-center lg:overflow-hidden">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 bg-[#FE1919]/5 border border-[#FE1919]/10 px-3 py-1.5 rounded-full self-start">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FE1919] animate-pulse" />
                        <span className="text-[10px] font-black text-[#FE1919] uppercase tracking-[0.2em]">
                            Calendar Sync
                        </span>
                    </div>

                    {/* Main Title */}
                    <h1 className="text-4xl lg:text-5xl font-black text-zinc-900 tracking-tight leading-[1.1]">
                        Sync your professional <span className="text-[#FE1919]">calendar.</span>
                    </h1>

                    {/* Subcopy */}
                    <p className="text-zinc-500 font-medium text-sm leading-relaxed">
                        Connect your Cal.com scheduler to enable automated discovery call booking and availability synchronization.
                    </p>

                    {/* Features List */}
                    <div className="space-y-6 pt-6">
                        {/* Bullet 1 */}
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-[#FE1919] text-white flex items-center justify-center shrink-0 shadow-lg shadow-[#FE1919]/10">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider mb-0.5">
                                    Availability Sync
                                </h3>
                                <p className="text-xs text-zinc-400 font-medium leading-normal">
                                    Identify open slots and match with prospects' preferred times.
                                </p>
                            </div>
                        </div>

                        {/* Bullet 2 */}
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-white border border-zinc-200 text-[#FE1919] flex items-center justify-center shrink-0">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider mb-0.5">
                                    Autonomous Booking
                                </h3>
                                <p className="text-xs text-zinc-400 font-medium leading-normal">
                                    Instantly secure discovery calls upon positive replies.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Form Card (Scrollable) */}
                <div className="lg:h-full lg:overflow-y-auto w-full flex items-center justify-center lg:py-8 pr-1 scrollbar-thin">
                    <div className="bg-white p-8 md:p-12 rounded-[40px] shadow-[0_30px_70px_rgba(0,0,0,0.03)] border border-slate-100/80 w-full max-w-[540px] mx-auto my-auto">
                        
                        <header className="mb-6">
                            <h2 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight mb-1">
                                Sync Calendar
                            </h2>
                            <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">
                                Connect your Cal.com scheduler.
                            </p>
                        </header>

                        {/* Pink Alert notice banner */}
                        <div className="bg-[#FFF5F5] border border-[#FFE3E3] rounded-2xl p-4 flex gap-3 items-start mb-8">
                            <AlertCircle className="w-5 h-5 text-[#FE1919] shrink-0 mt-0.5" />
                            <p className="text-[11px] leading-relaxed font-bold text-[#8C1F1F]">
                                Connecting your calendar allows AI-PRIORI to book discovery calls automatically.
                            </p>
                        </div>

                        <div className="space-y-6">
                            {status === 'connecting' && (
                                <div className="py-8 space-y-4 text-center">
                                    <RefreshCcw className="w-8 h-8 animate-spin text-[#FE1919] mx-auto" />
                                    <p className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">
                                        Establishing Connection...
                                    </p>
                                </div>
                            )}

                            {status === 'success' && (
                                <div className="py-8 space-y-4 text-center">
                                    <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto scale-110">
                                        <CheckCircle2 className="w-6 h-6" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 animate-pulse">
                                        Calendar Bridged Successfully!
                                    </p>
                                </div>
                            )}

                            {status === 'error' && (
                                <div className="py-8 space-y-6 text-center">
                                    <div className="w-12 h-12 bg-rose-50 border border-rose-100 text-[#FE1919] rounded-full flex items-center justify-center mx-auto scale-110">
                                        <XCircle className="w-6 h-6" />
                                    </div>
                                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 animate-headshake">
                                        <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                                        <p className="text-xs text-rose-700 font-bold leading-normal">
                                            {errorMessage || "OAuth Handshake Failed."}
                                        </p>
                                    </div>
                                    <button 
                                        onClick={startCalAuthorization}
                                        className="w-full py-4.5 bg-[#FE1919] hover:bg-[#E01414] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-lg hover:shadow-[#FE1919]/25 transition-all active:scale-[0.98]"
                                    >
                                        Retry Connection
                                    </button>
                                </div>
                            )}

                            {status === 'idle' && (
                                <div className="py-4 text-center">
                                    {hasValidCode ? (
                                        <div className="space-y-4">
                                            <RefreshCcw className="w-8 h-8 animate-spin text-[#FE1919] mx-auto" />
                                            <p className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">
                                                Initializing OAuth Handshake...
                                            </p>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={startCalAuthorization}
                                            disabled={connectingCal}
                                            className="w-full flex items-center justify-center gap-3 px-8 py-4.5 bg-[#FE1919] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#E01414] transition-all shadow-xl shadow-[#FE1919]/15 active:scale-[0.98] disabled:opacity-50"
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

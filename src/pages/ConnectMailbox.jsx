import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Navigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, RefreshCcw, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, Mail } from 'lucide-react';

const MAILBOX_REDIRECT_STORAGE_KEY = 'mailbox_oauth_redirect_uri';

const rememberMailboxRedirectUri = (authorizationUrl) => {
    try {
        const parsed = new URL(authorizationUrl);
        const redirectUri = parsed.searchParams.get('redirect_uri');
        if (redirectUri) {
            sessionStorage.setItem(MAILBOX_REDIRECT_STORAGE_KEY, redirectUri);
        }
    } catch (error) {
        console.warn('Unable to persist mailbox redirect URI:', error);
    }
};

const ConnectMailbox = () => {
    const { isLoggedIn, user, hasMailbox, connectMailbox, checkAuth, getMailboxAuthorizationUrl } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('idle'); // idle, connecting, success, error
    const [errorMessage, setErrorMessage] = useState('');

    const handleMailboxSuccess = useCallback(async ({ code, state, redirectUri = null }) => {
        setStatus('connecting');
        try {
            await connectMailbox(code, state, redirectUri);
            sessionStorage.removeItem(MAILBOX_REDIRECT_STORAGE_KEY);
            await checkAuth(); 
            setStatus('success');
            
            // Strategic Redirection: Send users to their natural operational habitat
            const target = user?.role === 'super_admin' ? '/sovereign' : 
                         user?.role === 'admin' ? '/management' : '/';
            
            setTimeout(() => navigate(target), 1200); 
        } catch (error) {
            setErrorMessage(error.response?.data?.detail || "Mailbox connection failed.");
            setStatus('error');
        }
    }, [connectMailbox, checkAuth, navigate, user]);

    useEffect(() => {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const hasValidCode = code && code !== 'undefined' && code !== 'null';
        if (hasValidCode && status === 'idle') {
            const sessionKey = `mailbox_handshake_triggered_${code}`;
            if (!sessionStorage.getItem(sessionKey)) {
                sessionStorage.setItem(sessionKey, 'true');
                handleMailboxSuccess({ code, state }); 
            }
        }
    }, [searchParams, status, handleMailboxSuccess]);

    const loginMailbox = useCallback(async () => {
        if (status === 'connecting') return;
        setStatus('connecting');
        try {
            const url = await getMailboxAuthorizationUrl();
            if (!url) {
                throw new Error('Authorization URL was not returned.');
            }
            rememberMailboxRedirectUri(url);
            window.location.assign(url);
        } catch (error) {
            console.error("Mailbox authorization initialization failed:", error);
            setStatus('error');
        }
    }, [getMailboxAuthorizationUrl, status]);

    // Redirection check after Hook calls
    if (isLoggedIn && hasMailbox) {
        return <Navigate to="/" replace />;
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
                            Authorize your personal<br />
                            <span className="text-[#00f0ff]" style={{ textShadow: "0 0 30px rgba(0, 240, 255, 0.25)" }}>outreach</span>
                        </h2>
                        
                        <p className="text-[14.5px] text-zinc-300 leading-relaxed font-normal">
                            FocalReach AI needs secure authorization to dispatch your personalized drafts and monitor responses automatically, creating a seamless connection.
                        </p>

                        <div className="space-y-6 pt-2">
                            {[
                                { icon: "📬", title: "Inbox Diagnostics", desc: "Read-only access to identify prospect replies instantly." },
                                { icon: "✉️", title: "Autonomous Outbound", desc: "Dispatches high-sentiment drafts directly on your behalf." },
                                { icon: "🛡️", title: "AES-256 Vaulting", desc: "Global security protocols keep all mailbox connection tokens strictly isolated." }
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
                        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Secure session</span>
                        <span className="text-zinc-800">•</span>
                        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-pulse" /> AES-256 encrypted</span>
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

                    <div className="w-full max-w-[420px] bg-zinc-900/10 border border-zinc-800/40 rounded-3xl p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-md relative z-10">
                        
                        <header className="mb-6 text-left">
                        <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight mb-2">
                            Authorize Outreach
                        </h2>
                        <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                            Securely connect your personal mailbox.
                        </p>
                    </header>

                    {/* Dark Cyan Alert notice banner */}
                    <div className="bg-[#00f0ff]/5 border border-[#00f0ff]/10 rounded-xl p-4 flex gap-3 items-start mb-8">
                        <AlertCircle className="w-5 h-5 text-[#00f0ff] shrink-0 mt-0.5" />
                        <p className="text-[11px] leading-relaxed font-bold text-zinc-300">
                            Connecting your personal mailbox allows FocalReach AI to draft and send emails directly on your behalf.
                        </p>
                    </div>

                    <div className="space-y-6">
                        {status === 'idle' || status === 'error' ? (
                            <>
                                <button 
                                    onClick={loginMailbox}
                                    className="w-full flex items-center justify-center gap-4 px-8 py-3.5 bg-[#00f0ff] hover:bg-[#26f3ff] text-zinc-950 rounded-xl font-extrabold text-xs uppercase tracking-widest hover:shadow-[0_0_20px_rgba(0,240,255,0.15)] transition-all active:scale-[0.98]"
                                >
                                    <img src="https://authjs.dev/img/providers/google.svg" className="w-5 h-5 brightness-0" alt="Google Logo" />
                                    Connect Personal Mailbox
                                </button>
                                {status === 'error' && (
                                    <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold py-3.5 px-4 rounded-xl text-center">
                                        {errorMessage || "Authorization Deployment Failed. Try Again."}
                                    </div>
                                )}
                            </>
                        ) : status === 'connecting' ? (
                            <div className="py-6 space-y-4 text-center">
                                <RefreshCcw className="w-8 h-8 animate-spin text-[#00f0ff] mx-auto" />
                                <p className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">
                                    Vaulting Capability...
                                </p>
                            </div>
                        ) : (
                            <div className="py-6 space-y-4 text-center">
                                <div className="w-16 h-16 bg-[#00f0ff]/10 border border-[#00f0ff]/20 rounded-full flex items-center justify-center mx-auto mb-4 text-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.15)]">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00f0ff] animate-pulse">
                                    Capability Synchronized
                                </p>
                            </div>
                        )}

                        <div className="pt-6 border-t border-zinc-900/40 select-none">
                            <ul className="space-y-3 text-left">
                                <li className="flex items-start gap-3">
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#00f0ff] shrink-0" />
                                    <p className="text-[11px] text-zinc-400 font-bold">Read-only access to identify prospect replies</p>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#00f0ff] shrink-0" />
                                    <p className="text-[11px] text-zinc-400 font-bold">Send permissions for autonomous campaigns</p>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#00f0ff] shrink-0" />
                                    <p className="text-[11px] text-zinc-400 font-bold">Strict AES-256 vaulting of all credentials</p>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
    );
};

export default ConnectMailbox;

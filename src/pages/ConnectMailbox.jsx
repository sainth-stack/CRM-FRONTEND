import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Navigate, useSearchParams } from 'react-router-dom';
import { Lock, RefreshCcw, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, Mail, Key } from 'lucide-react';

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
                            Mailbox Autonomy
                        </span>
                    </div>

                    {/* Main Title */}
                    <h1 className="text-4xl lg:text-5xl font-black text-zinc-900 tracking-tight leading-[1.1]">
                        Authorize your personal <span className="text-[#FE1919]">outreach.</span>
                    </h1>

                    {/* Subcopy */}
                    <p className="text-zinc-500 font-medium text-sm leading-relaxed">
                        To mobilize your campaigns, AI-PRIORI needs permission to send and monitor professional outreach. This establishes a highly trusted bridge to run operations autonomously.
                    </p>

                    {/* Features List */}
                    <div className="space-y-6 pt-6">
                        {/* Bullet 1 */}
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-[#FE1919] text-white flex items-center justify-center shrink-0 shadow-lg shadow-[#FE1919]/10">
                                <Mail className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider mb-0.5">
                                    Inbox Diagnostics
                                </h3>
                                <p className="text-xs text-zinc-400 font-medium leading-normal">
                                    Read-only access to identify prospect replies instantly.
                                </p>
                            </div>
                        </div>

                        {/* Bullet 2 */}
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-white border border-zinc-200 text-[#FE1919] flex items-center justify-center shrink-0">
                                <Key className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider mb-0.5">
                                    AES-256 Vaulting
                                </h3>
                                <p className="text-xs text-zinc-400 font-medium leading-normal">
                                    All access tokens are vaulted using enterprise-grade end-to-end security protocols.
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
                                Authorize Outreach
                            </h2>
                            <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">
                                Securely connect your personal mailbox.
                            </p>
                        </header>

                        {/* Pink Alert notice banner */}
                        <div className="bg-[#FFF5F5] border border-[#FFE3E3] rounded-2xl p-4 flex gap-3 items-start mb-8">
                            <AlertCircle className="w-5 h-5 text-[#FE1919] shrink-0 mt-0.5" />
                            <p className="text-[11px] leading-relaxed font-bold text-[#8C1F1F]">
                                Connecting your personal mailbox allows AI-PRIORI to draft and send emails directly on your behalf.
                            </p>
                        </div>

                        <div className="space-y-6">
                            {status === 'idle' || status === 'error' ? (
                                <>
                                    <button 
                                        onClick={loginMailbox}
                                        className="w-full flex items-center justify-center gap-4 px-8 py-4.5 bg-[#FE1919] hover:bg-[#E01414] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-lg hover:shadow-[#FE1919]/25 transition-all active:scale-[0.98]"
                                    >
                                        <img src="https://authjs.dev/img/providers/google.svg" className="w-5 h-5 brightness-0 invert" alt="Google Logo" />
                                        Connect Personal Mailbox
                                    </button>
                                    {status === 'error' && (
                                        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 animate-headshake">
                                            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                                            <p className="text-xs text-rose-700 font-bold leading-normal">
                                                {errorMessage || "Authorization Deployment Failed. Try Again."}
                                            </p>
                                        </div>
                                    )}
                                </>
                            ) : status === 'connecting' ? (
                                <div className="py-6 space-y-4 text-center">
                                    <RefreshCcw className="w-8 h-8 animate-spin text-[#FE1919] mx-auto" />
                                    <p className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">
                                        Vaulting Capability...
                                    </p>
                                </div>
                            ) : (
                                <div className="py-6 space-y-4 text-center">
                                    <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto scale-110">
                                        <CheckCircle2 className="w-6 h-6" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 animate-pulse">
                                        Capability Synchronized
                                    </p>
                                </div>
                            )}

                            <div className="pt-6 border-t border-zinc-100">
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-3">
                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#FE1919] shrink-0" />
                                        <p className="text-[11px] text-zinc-500 font-bold">Read-only access to identify prospect replies</p>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#FE1919] shrink-0" />
                                        <p className="text-[11px] text-zinc-500 font-bold">Send permissions for autonomous campaigns</p>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#FE1919] shrink-0" />
                                        <p className="text-[11px] text-zinc-500 font-bold">Strict AES-256 vaulting of all credentials</p>
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

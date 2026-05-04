import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Navigate, useSearchParams } from 'react-router-dom';

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

    const handleMailboxSuccess = React.useCallback(async ({ code, state, redirectUri = null }) => {
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
    }, [status, connectMailbox, checkAuth, navigate, user]);

    React.useEffect(() => {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        if (code && status === 'idle') {
            handleMailboxSuccess({ code, state }); 
        }
    }, [searchParams, status, handleMailboxSuccess]);

    const loginMailbox = React.useCallback(async () => {
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
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-brand-light font-outfit pt-10 px-6">
            <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-40">
                <div className="absolute top-[10%] -left-[10%] w-[600px] h-[600px] bg-brand-primary/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[10%] -right-[10%] w-[500px] h-[500px] bg-brand-secondary/10 rounded-full blur-[100px]" />
            </div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.98, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative z-10 w-full max-w-[500px]"
            >
                <div className="bg-white border border-zinc-100 p-10 md:p-14 rounded-[40px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.06)] text-center">
                    <div className="mb-10">
                        <div className="w-20 h-20 bg-brand-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
                            <svg className="w-10 h-10 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-black text-brand-dark mb-3 tracking-tight">Authorize Outreach</h1>
                        <p className="text-zinc-500 text-sm font-medium leading-relaxed max-w-[320px] mx-auto">
                            To mobilize your campaigns, AI-PRIORI needs permission to send and monitor professional outreach.
                        </p>
                    </div>

                    <div className="space-y-6">
                        {status === 'idle' || status === 'error' ? (
                            <>
                                <button 
                                    onClick={loginMailbox}
                                    className="w-full flex items-center justify-center gap-4 px-8 py-[18px] bg-brand-primary text-white rounded-2xl font-bold hover:bg-brand-primary/95 transition-all shadow-xl shadow-brand-primary/20 active:scale-95"
                                >
                                    <img src="https://authjs.dev/img/providers/google.svg" className="w-5 h-5 brightness-0 invert" alt="" />
                                    Connect Personal Mailbox
                                </button>
                                {status === 'error' && (
                                    <p className="text-red-500 text-[11px] font-bold uppercase tracking-widest bg-red-50 py-2 rounded-lg px-4">
                                        {errorMessage || "Authorization Deployment Failed. Try Again."}
                                    </p>
                                )}
                            </>
                        ) : status === 'connecting' ? (
                            <div className="py-4 space-y-4">
                                <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto" />
                                <p className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">Vaulting Capability...</p>
                            </div>
                        ) : (
                            <div className="py-4 space-y-4 text-brand-secondary">
                                <div className="w-12 h-12 bg-brand-secondary/10 rounded-full flex items-center justify-center mx-auto scale-110">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em]">Capability Synchronized</p>
                            </div>
                        )}

                        <div className="pt-6 border-t border-zinc-50">
                            <ul className="text-left space-y-3">
                                <li className="flex items-start gap-3">
                                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-secondary shadow-[0_0_10px_rgba(var(--brand-secondary-rgb),0.5)]" />
                                    <p className="text-[11px] text-zinc-500 font-medium">Read-only access to identify prospect replies</p>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-secondary shadow-[0_0_10px_rgba(var(--brand-secondary-rgb),0.5)]" />
                                    <p className="text-[11px] text-zinc-500 font-medium">Send permissions for autonomous campaigns</p>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-secondary shadow-[0_0_10px_rgba(var(--brand-secondary-rgb),0.5)]" />
                                    <p className="text-[11px] text-zinc-500 font-medium">Strict AES-256 vaulting of all credentials</p>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="mt-10 text-center">
                    <p className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.4em]">
                        Intelligence • Autonomy • Scale
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default ConnectMailbox;

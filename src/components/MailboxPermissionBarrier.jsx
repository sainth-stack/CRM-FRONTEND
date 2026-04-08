import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Mail, Lock, CheckCircle2, ChevronRight, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const MailboxPermissionBarrier = () => {
    const { user, token, logout } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    const handleAuthorize = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Priority Token: Context > Storage
            const sessionToken = token || localStorage.getItem('token');
            
            if (!sessionToken) {
                logout();
                return;
            }

            // Initiate the secure OAuth handshake
            const response = await fetch(`${API_URL}/auth/google/url`, {
                headers: { 'Authorization': `Bearer ${sessionToken}` }
            });

            if (response.status === 401) {
                // Stale session detected, forcing identity re-verification
                logout();
                return;
            }

            const data = await response.json();
            if (data.url) {
                // Open the Google authorization portal in the current tab
                window.location.href = data.url;
            } else {
                throw new Error("Authorization portal offline.");
            }
        } catch {
            setError("Communication failure. Please try again.");
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-zinc-950/60 backdrop-blur-xl flex items-center justify-center p-6 font-outfit">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-[620px] bg-white rounded-[40px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden relative border border-zinc-100"
            >
                {/* Branding Accent */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent px-10" />

                <div className="p-12">
                    {/* Header Sector */}
                    <div className="flex items-start justify-between mb-10">
                        <div className="w-16 h-16 bg-brand-primary/5 rounded-2xl flex items-center justify-center text-brand-primary">
                            <ShieldAlert size={32} />
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-1">Security Protocol</div>
                            <div className="text-xs font-bold text-zinc-800">{user?.email}</div>
                        </div>
                    </div>

                    <h1 className="text-3xl font-black text-zinc-900 mb-4 tracking-tight leading-none">
                        Mailbox Authorization Required
                    </h1>
                    <p className="text-sm text-zinc-500 font-medium mb-10 leading-relaxed max-w-[480px]">
                        To initialize intelligence-driven outreach, AI-PRIORI requires secure authority to orchestrate communications through your professional identity.
                    </p>

                    {/* Capability Checklist */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                        {[
                            { icon: <Mail size={18} />, label: "Read Inbox", sub: "Analyze replies" },
                            { icon: <Lock size={18} />, label: "Send Mail", sub: "Automate outreach" },
                            { icon: <CheckCircle2 size={18} />, label: "MetaData", sub: "Thread tracking" }
                        ].map((item, idx) => (
                            <div key={idx} className="bg-zinc-50 p-5 rounded-3xl border border-zinc-100">
                                <div className="text-brand-primary mb-3">{item.icon}</div>
                                <div className="text-[11px] font-black text-zinc-800 uppercase tracking-widest mb-1">{item.label}</div>
                                <div className="text-[10px] font-bold text-zinc-400">{item.sub}</div>
                            </div>
                        ))}
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-500 p-4 rounded-2xl mb-6 text-xs font-bold flex items-center gap-3">
                            <Info size={16} /> {error}
                        </div>
                    )}

                    {/* Action Sector */}
                    <div className="space-y-4">
                        <button 
                            onClick={handleAuthorize}
                            disabled={isLoading}
                            className="w-full bg-brand-primary text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-brand-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                        >
                            {isLoading ? "Synchronizing..." : "Authorize Intelligent Access"}
                            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
                            <button 
                                onClick={logout}
                                className="text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:text-red-500 transition-colors"
                            >
                                Terminate Session
                            </button>
                            <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-2">
                                <Lock size={10} /> end-to-end encrypted
                            </span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default MailboxPermissionBarrier;

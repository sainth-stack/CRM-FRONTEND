import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Lock, CheckCircle2, ChevronRight, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CalendarPermissionBarrier = () => {
    const { user, logout, getCalAuthorizationUrl } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleAuthorize = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const url = await getCalAuthorizationUrl();
            if (url) {
                window.location.assign(url);
            } else {
                throw new Error("Calendar authorization portal offline.");
            }
        } catch (err) {
            setError(err.message || "Failed to initialize calendar connection. Please try again.");
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
                            <Calendar size={32} />
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-1">Outreach Protocol</div>
                            <div className="text-xs font-bold text-zinc-800">{user?.email}</div>
                        </div>
                    </div>

                    <h1 className="text-3xl font-black text-zinc-900 mb-4 tracking-tight leading-none">
                        Calendar Connection Required
                    </h1>
                    <p className="text-sm text-zinc-500 font-medium mb-10 leading-relaxed max-w-[480px]">
                        To mobilize outreach campaigns, AI-PRIORI requires access to your Cal.com calendar to dynamically match scheduling slots and book discovery meetings for positive replies.
                    </p>

                    {/* Capability Checklist */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                        {[
                            { icon: <Clock size={18} />, label: "Slot Sync", sub: "Match availability" },
                            { icon: <Calendar size={18} />, label: "Auto Booking", sub: "Instantly secure meetings" },
                            { icon: <CheckCircle2 size={18} />, label: "AES-256 Safe", sub: "Encrypted tokens" }
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
                            {isLoading ? "Synchronizing..." : "Connect Cal.com Calendar"}
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

export default CalendarPermissionBarrier;

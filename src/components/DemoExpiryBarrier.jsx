import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ExternalLink, ShieldAlert } from 'lucide-react';

const DemoExpiryBarrier = ({ children }) => {
    const { user, isLoggedIn, logout } = useAuth();
    
    // Only intercept if the user is a demo user AND has expired
    const isExpired = isLoggedIn && user?.is_demo && user?.is_expired;

    if (!isExpired) return children;

    return (
        <div className="relative min-h-screen bg-[#050505] overflow-hidden flex items-center justify-center p-6">
            {/* Ambient Background Pulse */}
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-red-500/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-red-600/5 rounded-full blur-[120px]" />

            <AnimatePresence>
                <motion.div 
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="relative z-10 max-w-lg w-full"
                >
                    <div className="bg-[#111] border border-red-500/30 rounded-3xl p-8 backdrop-blur-xl shadow-2xl shadow-red-900/10">
                        <div className="flex flex-col items-center text-center">
                            {/* Alert Icon Infrastructure */}
                            <div className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 border border-red-500/20">
                                <ShieldAlert className="w-10 h-10 text-red-500 animate-pulse" />
                            </div>

                            <h1 className="text-3xl font-bold text-white mb-4 tracking-tight">
                                Demo Period <span className="text-red-500">Completed</span>
                            </h1>
                            
                            <p className="text-gray-400 text-lg leading-relaxed mb-8">
                                Your 5-day AI-PRIORI trial identity has reached its temporal boundary. 
                                To continue leveraging our autonomous outreach engine, please transition to a professional subscription.
                            </p>

                            {/* Action Matrix */}
                            <div className="grid grid-cols-1 gap-4 w-full mb-8">
                                <a 
                                    href="mailto:sales@ai-priori.com?subject=AI-PRIORI%20Premium%20Upgrade%20Request"
                                    className="flex items-center justify-center gap-3 w-full py-4 bg-white text-black font-semibold rounded-2xl hover:bg-gray-100 transition-all active:scale-[0.98]"
                                >
                                    <Mail className="w-5 h-5" />
                                    Contact Sales Team
                                </a>
                                
                                <button 
                                    onClick={logout}
                                    className="flex items-center justify-center gap-3 w-full py-4 bg-[#1a1a1a] text-gray-300 font-medium rounded-2xl border border-white/5 hover:bg-[#222] transition-all"
                                >
                                    Switch Account
                                </button>
                            </div>

                            {/* Identity Manifest */}
                            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium py-3 px-4 bg-white/5 rounded-full border border-white/5">
                                <Lock className="w-4 h-4" />
                                identity_temporal_boundary_lock_active
                            </div>
                        </div>
                    </div>

                    <p className="text-center text-gray-500 text-sm mt-8">
                        © 2026 AI-PRIORI ENTERPRISE. All Rights Reserved.
                    </p>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default DemoExpiryBarrier;

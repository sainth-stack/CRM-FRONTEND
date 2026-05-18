import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Calendar, CheckCircle2, XCircle } from 'lucide-react';

const ConnectCalendar = () => {
    const { connectCalCalendar, checkAuth } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('idle'); // idle, connecting, success, error
    const [errorMessage, setErrorMessage] = useState('');

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
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        if (code && status === 'idle') {
            handleCalendarSuccess({ code, state }); 
        }
    }, [searchParams, status, handleCalendarSuccess]);

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
                            <Calendar className="w-10 h-10 text-brand-primary" />
                        </div>
                        <h1 className="text-3xl font-black text-brand-dark mb-3 tracking-tight">Sync Calendar</h1>
                        <p className="text-zinc-500 text-sm font-medium leading-relaxed max-w-[320px] mx-auto">
                            Bridging your personal Cal.com calendar to AI-PRIORI for automated scheduling sync and booking.
                        </p>
                    </div>

                    <div className="space-y-6">
                        {status === 'connecting' && (
                            <div className="py-6 space-y-4">
                                <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto" />
                                <p className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">
                                    Establishing Connection...
                                </p>
                            </div>
                        )}

                        {status === 'success' && (
                            <div className="py-6 space-y-4 text-emerald-500">
                                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto scale-110 border border-emerald-100">
                                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">
                                    Calendar Bridged Successfully!
                                </p>
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="py-6 space-y-4 text-rose-500">
                                <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto scale-110 border border-rose-100">
                                    <XCircle className="w-8 h-8 text-rose-500" />
                                </div>
                                <p className="text-rose-600 text-[11px] font-bold uppercase tracking-widest bg-rose-50 py-2 rounded-lg px-4">
                                    {errorMessage || "OAuth Handshake Failed."}
                                </p>
                                <button 
                                    onClick={() => navigate('/settings')}
                                    className="mt-4 px-6 py-2 bg-brand-primary text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-brand-primary/95 transition-all"
                                >
                                    Return to Settings
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ConnectCalendar;

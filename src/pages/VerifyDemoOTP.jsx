import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Loader2, ArrowRight, Mail } from 'lucide-react';

const VerifyDemoOTP = () => {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { verifyDemoOtp } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || '';

    useEffect(() => {
        if (!email) navigate('/demo');
    }, [email, navigate]);

    const handleVerify = async (e) => {
        e.preventDefault();
        if (otp.length !== 6) return setError('Invalid 6-digit code.');
        
        setLoading(true);
        setError('');
        try {
            await verifyDemoOtp(email, otp);
            navigate('/'); // Finalize session and enter HQ
        } catch (err) {
            setError(err.message || 'Verification handshake failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-[#050505] flex items-center justify-center p-6 overflow-hidden">
            {/* Ambient Pulse Infrastructure */}
            <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-green-600/10 rounded-full blur-[150px] animate-pulse" />
            
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 max-w-lg w-full text-center"
            >
                <div className="flex flex-col items-center mb-10">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10">
                        <Mail className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Verify Identity</h1>
                    <p className="text-gray-500 font-medium max-w-sm">
                        Access mobilization code dispatched to <span className="text-white">{email}</span>
                    </p>
                </div>

                <div className="bg-[#111] border border-white/10 rounded-3xl p-10 backdrop-blur-xl shadow-2xl">
                    <form onSubmit={handleVerify} className="space-y-8">
                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-medium">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <input 
                                type="text"
                                maxLength="6"
                                placeholder="000000"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 text-center text-4xl font-bold text-white tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-white/20 transition-all placeholder:text-gray-800"
                            />
                            <p className="text-gray-600 text-xs text-center font-medium">
                                code_exchange_v1_active_protocol
                            </p>
                        </div>

                        <button 
                            disabled={loading || otp.length !== 6}
                            className="w-full bg-white text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-gray-100 transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 group"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Verify & Activate Demo
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                        
                        <div className="text-gray-500 text-sm font-medium hover:text-white transition-colors">
                            <button type="button" onClick={() => navigate('/demo')}>
                                rethink_identity_parameters
                            </button>
                        </div>
                    </form>
                </div>

                <p className="mt-10 text-gray-700 text-xs flex items-center justify-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-gray-800" />
                    Secure Handshake Protocol Enabled
                </p>
            </motion.div>
        </div>
    );
};

export default VerifyDemoOTP;

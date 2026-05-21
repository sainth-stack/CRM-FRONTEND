import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Lock, RefreshCcw, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, Sliders, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API_BASE_URL from '../config';

const BusinessProfile = () => {
    const { user, checkAuth } = useAuth();
    const navigate = useNavigate();

    const [fullName, setFullName] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [roleTitle, setRoleTitle] = useState('');

    // Cal.com Calendar states
    const [calConnected, setCalConnected] = useState(false);
    const [calEventTypeId, setCalEventTypeId] = useState('');
    const [calTimezone, setCalTimezone] = useState('UTC');
    const [calEventTypes, setCalEventTypes] = useState([]);
    const [loadingEventTypes, setLoadingEventTypes] = useState(false);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        let cancelled = false;
        const loadProfileAndCal = async () => {
            try {
                // 1. Fetch Profile
                const res = await axios.get(`${API_BASE_URL}/auth/profile`);
                if (cancelled) return;
                setFullName(res.data.full_name || '');
                setCompanyName(res.data.company_name || '');
                setRoleTitle(res.data.role_title || '');

                // 2. Fetch Cal.com Status
                try {
                    const calRes = await axios.get(`${API_BASE_URL}/connect/cal/status`);
                    if (cancelled) return;
                    const connected = calRes.data.connected;
                    setCalConnected(connected);
                    setCalEventTypeId(calRes.data.cal_event_type_id ? String(calRes.data.cal_event_type_id) : '');
                    setCalTimezone(calRes.data.cal_timezone || 'UTC');

                    // 3. Fetch Event Types if Cal.com is connected
                    if (connected) {
                        setLoadingEventTypes(true);
                        try {
                            const eventTypesRes = await axios.get(`${API_BASE_URL}/connect/cal/event-types`);
                            if (cancelled) return;
                            setCalEventTypes(eventTypesRes.data.event_types || []);
                        } catch (etErr) {
                            console.error('Failed to fetch Cal.com event types in profile:', etErr);
                        } finally {
                            if (!cancelled) setLoadingEventTypes(false);
                        }
                    }
                } catch (calErr) {
                    console.error('Failed to fetch Cal.com status in profile:', calErr);
                }
            } catch (err) {
                if (!cancelled) {
                    console.error('Failed to load business profile:', err);
                    setError('Unable to load existing profile. You can still fill it in below.');
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        loadProfileAndCal();
        return () => { cancelled = true; };
    }, []);

    const validate = () => {
        if (!fullName.trim()) return 'Full name is required.';
        if (!companyName.trim()) return 'Company name is required.';
        if (!roleTitle.trim()) return 'Role / title is required.';
        if (calConnected && !calEventTypeId) return 'Please select or input a Cal.com calendar Event Type.';
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        setSaving(true);
        try {
            // Save user profile details
            await axios.put(`${API_BASE_URL}/auth/profile`, {
                full_name: fullName.trim(),
                company_name: companyName.trim(),
                role_title: roleTitle.trim(),
            });

            // Save calendar event type and timezone settings if Cal.com is connected
            if (calConnected) {
                await axios.post(`${API_BASE_URL}/connect/cal/settings`, {
                    event_type_id: calEventTypeId ? parseInt(calEventTypeId) : null,
                    timezone: calTimezone
                });
            }

            setSuccess(true);
            // Refresh session-level user info so downstream features see updated profile
            await checkAuth();
            setTimeout(() => {
                navigate('/');
            }, 1500);
        } catch (err) {
            const detail = err?.response?.data?.detail;
            if (Array.isArray(detail)) {
                setError(detail.map((d) => d.msg).join(' '));
            } else if (typeof detail === 'string') {
                setError(detail);
            } else {
                setError('Could not save profile information. Please try again.');
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#FFF5F5] via-white to-[#FFF9F9] flex items-center justify-center font-outfit">
                <RefreshCcw className="w-8 h-8 animate-spin text-red-500" />
            </div>
        );
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
                            Smart Calibration
                        </span>
                    </div>

                    {/* Main Title */}
                    <h1 className="text-4xl lg:text-5xl font-black text-zinc-900 tracking-tight leading-[1.1]">
                        Scale your outreach with <span className="text-[#FE1919]">precision.</span>
                    </h1>

                    {/* Subcopy */}
                    <p className="text-zinc-500 font-medium text-sm leading-relaxed">
                        Complete your Business Identity to calibrate our AI engine. We use these details to ensure every email reflects your brand's unique tone and professional signature.
                    </p>

                    {/* Features List */}
                    <div className="space-y-6 pt-6">
                        {/* Bullet 1 */}
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-[#FE1919] text-white flex items-center justify-center shrink-0 shadow-lg shadow-[#FE1919]/10">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider mb-0.5">
                                    Authenticated Outreach
                                </h3>
                                <p className="text-xs text-zinc-400 font-medium leading-normal">
                                    Verified credentials build higher trust with high-value leads.
                                </p>
                            </div>
                        </div>

                        {/* Bullet 2 */}
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-white border border-zinc-200 text-[#FE1919] flex items-center justify-center shrink-0">
                                <Sliders className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider mb-0.5">
                                    Tone Calibration
                                </h3>
                                <p className="text-xs text-zinc-400 font-medium leading-normal">
                                    Your role and company name guide the AI's linguistic choices.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Form Card (Scrollable) */}
                <div className="lg:h-full lg:overflow-y-auto w-full flex flex-col items-center lg:py-8 pr-1 scrollbar-thin">
                    <div className="bg-white p-8 md:p-12 rounded-[40px] shadow-[0_30px_70px_rgba(0,0,0,0.03)] border border-slate-100/80 w-full max-w-[540px] mx-auto my-auto">
                        
                        <header className="mb-6">
                            <h2 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight mb-1">
                                Business Identity
                            </h2>
                            <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">
                                Complete your profile to personalize AI outreach.
                            </p>
                        </header>

                        {/* Pink Alert notice banner */}
                        <div className="bg-[#FFF5F5] border border-[#FFE3E3] rounded-2xl p-4 flex gap-3 items-start mb-8">
                            <AlertCircle className="w-5 h-5 text-[#FE1919] shrink-0 mt-0.5" />
                            <p className="text-[11px] leading-relaxed font-bold text-[#8C1F1F]">
                                Complete your profile and calendar details below.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Registered Email */}
                            <div>
                                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                    Registered Email
                                </label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        value={user?.email || ''}
                                        readOnly
                                        disabled
                                        className="w-full px-4 py-3.5 pr-12 rounded-xl border border-slate-100 bg-[#FFFBFB] text-slate-500 font-semibold text-sm cursor-not-allowed border-dashed"
                                    />
                                    <Lock className="w-4 h-4 text-slate-300 absolute right-4 top-1/2 -translate-y-1/2" />
                                </div>
                                <span className="block text-[8px] font-bold text-slate-400 mt-1.5 uppercase tracking-widest">
                                    Derived from your authenticated session
                                </span>
                            </div>

                            {/* Full Name & Company Name side-by-side */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="full_name" className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                        Full Name
                                    </label>
                                    <input
                                        id="full_name"
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="e.g. Aarav Mehta"
                                        maxLength={120}
                                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#FE1919]/10 focus:border-[#FE1919] font-bold text-slate-800 text-sm placeholder-slate-300 transition-all"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="company_name" className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                        Company Name
                                    </label>
                                    <input
                                        id="company_name"
                                        type="text"
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        placeholder="e.g. AI-PRIORI Labs"
                                        maxLength={160}
                                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#FE1919]/10 focus:border-[#FE1919] font-bold text-slate-800 text-sm placeholder-slate-300 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Role / Title */}
                            <div>
                                <label htmlFor="role_title" className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                    Role / Title
                                </label>
                                <input
                                    id="role_title"
                                    type="text"
                                    value={roleTitle}
                                    onChange={(e) => setRoleTitle(e.target.value)}
                                    placeholder="e.g. Founder & CEO"
                                    maxLength={120}
                                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#FE1919]/10 focus:border-[#FE1919] font-bold text-slate-800 text-sm placeholder-slate-300 transition-all"
                                />
                            </div>

                            {/* Cal.com Calendar Settings (Only shown if calConnected is true) */}
                            {calConnected && (
                                <div className="space-y-6 pt-6 border-t border-slate-100">
                                    <div>
                                        <h3 className="text-xs font-black text-slate-800 tracking-tight uppercase flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-[#FE1919]" />
                                            Calendar Booking (Cal.com)
                                        </h3>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="cal_event_type" className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                                Cal.com Event Type ID
                                            </label>
                                            {loadingEventTypes ? (
                                                <div className="w-full px-4 py-3.5 rounded-xl border border-slate-200 flex items-center gap-2 text-slate-400 text-sm bg-slate-50">
                                                    <RefreshCcw className="w-4 h-4 animate-spin text-[#FE1919]" />
                                                    Loading...
                                                </div>
                                            ) : calEventTypes.length > 0 ? (
                                                <select
                                                    id="cal_event_type"
                                                    value={calEventTypeId}
                                                    onChange={(e) => setCalEventTypeId(e.target.value)}
                                                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#FE1919]/10 focus:border-[#FE1919] font-bold text-slate-800 text-sm"
                                                >
                                                    <option value="">-- Select Event Type --</option>
                                                    {calEventTypes.map((et) => (
                                                        <option key={et.id} value={String(et.id)}>
                                                            {et.title} ({et.duration} min)
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <input
                                                    id="cal_event_type"
                                                    type="number"
                                                    value={calEventTypeId}
                                                    onChange={(e) => setCalEventTypeId(e.target.value)}
                                                    placeholder="e.g. 5137238"
                                                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#FE1919]/10 focus:border-[#FE1919] font-bold text-slate-800 text-sm placeholder-slate-300 transition-all"
                                                />
                                            )}
                                            <span className="block text-[8px] font-bold text-slate-400 mt-1.5 uppercase tracking-widest leading-normal">
                                                Meeting template for booking
                                            </span>
                                        </div>
                                        <div>
                                            <label htmlFor="cal_timezone" className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                                Scheduling Timezone
                                            </label>
                                            <select 
                                                id="cal_timezone"
                                                value={calTimezone}
                                                onChange={(e) => setCalTimezone(e.target.value)}
                                                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#FE1919]/10 focus:border-[#FE1919] font-bold text-slate-800 text-sm"
                                            >
                                                <option value="UTC">UTC</option>
                                                <option value="US/Eastern">US/Eastern</option>
                                                <option value="US/Central">US/Central</option>
                                                <option value="US/Pacific">US/Pacific</option>
                                                <option value="Europe/London">Europe/London</option>
                                                <option value="Asia/Kolkata">Asia/Kolkata</option>
                                            </select>
                                            <span className="block text-[8px] font-bold text-slate-400 mt-1.5 uppercase tracking-widest leading-normal">
                                                Your local scheduling timezone
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Status Banners */}
                            {error && (
                                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 animate-headshake">
                                    <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                                    <p className="text-xs text-rose-700 font-bold leading-normal">{error}</p>
                                </div>
                            )}
                            {success && !error && (
                                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                    <p className="text-xs text-emerald-700 font-bold">Identity & Calendar settings saved successfully.</p>
                                </div>
                            )}

                            {/* Action buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-grow py-4.5 bg-[#FE1919] hover:bg-[#E01414] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-lg hover:shadow-[#FE1919]/25 transition-all flex items-center justify-center gap-2 group active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                                >
                                    {saving ? 'Saving Profile & Calendar...' : 'Save Profile & Calendar settings'}
                                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default BusinessProfile;

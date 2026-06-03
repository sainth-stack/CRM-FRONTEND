import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
    Calendar, 
    RefreshCcw, 
    CheckCircle2, 
    XCircle, 
    AlertCircle, 
    ArrowRight, 
    ShieldCheck, 
    Sliders, 
    Clock 
} from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../config';

const Settings = () => {
    const { getCalAuthorizationUrl } = useAuth();
    const navigate = useNavigate();

    // Cal.com states
    const [calConnected, setCalConnected] = useState(false);
    const [calReauthRequired, setCalReauthRequired] = useState(false);
    const [calEventTypeId, setCalEventTypeId] = useState('');
    const [calTimezone, setCalTimezone] = useState('UTC');
    const [loadingCal, setLoadingCal] = useState(true);
    const [savingCal, setSavingCal] = useState(false);
    const [connectingCal, setConnectingCal] = useState(false);
    const [calEventTypes, setCalEventTypes] = useState([]);
    const [loadingEventTypes, setLoadingEventTypes] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const fetchCalStatus = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/connect/cal/status`);
            setCalConnected(res.data.connected);
            setCalReauthRequired(res.data.reauth_required || false);
            setCalEventTypeId(res.data.cal_event_type_id ? String(res.data.cal_event_type_id) : '');
            setCalTimezone(res.data.cal_timezone || 'UTC');
            if (res.data.connected) {
                fetchCalEventTypes();
            }
        } catch (err) {
            console.error("Failed to fetch Cal.com status:", err);
            setError("Failed to fetch calendar status.");
        } finally {
            setLoadingCal(false);
        }
    };

    const fetchCalEventTypes = async () => {
        setLoadingEventTypes(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/connect/cal/event-types`);
            setCalEventTypes(res.data.event_types || []);
        } catch (err) {
            console.error("Failed to fetch Cal.com event types:", err);
        } finally {
            setLoadingEventTypes(false);
        }
    };

    useEffect(() => {
        fetchCalStatus();
    }, []);

    const startCalAuthorization = async () => {
        setConnectingCal(true);
        setError(null);
        try {
            const url = await getCalAuthorizationUrl();
            if (!url) {
                throw new Error('Authorization URL was not returned.');
            }
            window.location.assign(url);
        } catch (error) {
            console.error("Cal.com authorization initialization failed:", error);
            setError("Failed to initialize Cal.com authorization.");
            setConnectingCal(false);
        }
    };

    const saveCalSettings = async () => {
        if (!calEventTypeId) {
            setError("Please select an event type before saving.");
            return;
        }
        setSavingCal(true);
        setError(null);
        setSuccess(false);
        try {
            await axios.post(`${API_BASE_URL}/connect/cal/settings`, {
                event_type_id: calEventTypeId ? parseInt(calEventTypeId) : null,
                timezone: calTimezone
            });
            setSuccess(true);
            setTimeout(() => navigate('/'), 1200);
        } catch (error) {
            console.error("Failed to save Cal.com settings:", error);
            setError("Failed to save calendar settings.");
        } finally {
            setSavingCal(false);
        }
    };

    if (loadingCal) {
        return (
            <div className="min-h-screen bg-[#030712] flex items-center justify-center font-outfit">
                <RefreshCcw className="w-8 h-8 animate-spin text-[#00f0ff]" />
            </div>
        );
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
                
                {/* Left Side: Branding / Info Column (Centered Vertically & Non-Scrollable) */}
                <div className="hidden lg:flex lg:col-span-7 flex-col justify-between py-6 min-h-[520px] relative z-10 select-none">
                    
                    {/* Top Logo */}
                    <div className="flex items-center gap-3 w-fit">
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
                    </div>

                    {/* Middle Feature Content */}
                    <div className="space-y-8 max-w-xl my-auto py-8">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 bg-[#00f0ff]/5 border border-[#00f0ff]/10 px-3 py-1.5 rounded-full self-start">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-pulse" />
                            <span className="text-[10px] font-black text-[#00f0ff] uppercase tracking-[0.2em]">
                                Smart Calendaring
                            </span>
                        </div>

                        {/* Main Title */}
                        <h2 className="text-4xl font-extrabold tracking-tight leading-tight text-white uppercase">
                            Optimize your <span className="text-[#00f0ff]" style={{ textShadow: "0 0 30px rgba(0, 240, 255, 0.25)" }}>availability.</span>
                        </h2>

                        {/* Subcopy */}
                        <p className="text-[14.5px] text-zinc-300 leading-relaxed font-normal">
                            Configure your calendar event type and primary timezone. FocalReach AI schedules meetings autonomously, respecting your booking parameters.
                        </p>

                        {/* Features List */}
                        <div className="space-y-6 pt-2">
                            {/* Bullet 1 */}
                            <div className="flex items-start gap-4">
                               <div className="w-11 h-11 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-center text-lg shrink-0 shadow-md">
                                    <Sliders className="w-5 h-5 text-[#00f0ff]" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-0.5">
                                        Availability Sync
                                    </h3>
                                    <p className="text-[12.5px] text-zinc-400 leading-relaxed font-medium">
                                        Coordinate slots based on your designated event details.
                                    </p>
                                </div>
                            </div>

                            {/* Bullet 2 */}
                            <div className="flex items-start gap-4">
                               <div className="w-11 h-11 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-center text-lg shrink-0 shadow-md">
                                    <Clock className="w-5 h-5 text-[#00f0ff]" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-0.5">
                                        Timezone Sync
                                    </h3>
                                    <p className="text-[12.5px] text-zinc-400 leading-relaxed font-medium">
                                        Automatically adjust discovery call times to your local timezone.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Stats */}
                    <div className="flex items-center gap-4 text-[10px] font-extrabold uppercase tracking-wider text-zinc-500 border-t border-zinc-900/60 pt-6">
                        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Secure session</span>
                        <span className="text-zinc-800">•</span>
                        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-pulse" /> AES-256 encrypted</span>
                    </div>
                </div>

                {/* Right Side: Form Card (Scrollable) */}
                <div className="lg:col-span-5 flex items-center justify-center py-6 relative z-10 w-full">
                    
                    {/* Mobile Header Logo */}
                    <div className="absolute -top-6 left-4 lg:hidden">
                        <div className="flex items-center gap-3">
                            <div className="w-[30px] h-[30px] flex items-center justify-center shrink-0">
                                <svg className="w-7 h-7 text-[#00f0ff]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2050/svg">
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
                        </div>
                    </div>

                    <div className="w-full max-w-[520px] bg-zinc-900/10 border border-zinc-800/40 rounded-3xl p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-md relative z-10 text-left">
                        
                        <header className="mb-6">
                            <h2 className="text-2xl font-extrabold text-white tracking-tight mb-2">
                                Calendar Settings
                            </h2>
                            <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                                Calibrate your scheduling preferences.
                            </p>
                        </header>

                        {/* Dark Cyan Alert notice banner */}
                        <div className="bg-[#00f0ff]/5 border border-[#00f0ff]/10 rounded-xl p-4 flex gap-3 items-start mb-8">
                            <AlertCircle className="w-5 h-5 text-[#00f0ff] shrink-0 mt-0.5" />
                            <p className="text-[11px] leading-relaxed font-bold text-zinc-300">
                                Your event type and timezone control when prospects can book discovery calls.
                            </p>
                        </div>

                        <div className="space-y-6">
                            {calReauthRequired ? (
                                <div className="space-y-4">
                                    <div className="p-4 bg-amber-950/20 border border-amber-900/30 rounded-2xl flex items-start gap-3">
                                        <XCircle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                                        <div>
                                            <h4 className="font-bold text-amber-400 text-xs uppercase tracking-wider">Re-authorization Required</h4>
                                            <p className="text-[10px] text-amber-350 mt-1 leading-relaxed font-medium">
                                                Your Cal.com session has expired. Please reconnect to restore automatic meeting booking.
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={startCalAuthorization}
                                        disabled={connectingCal}
                                        className="w-full flex items-center justify-center gap-3 px-8 py-3.5 bg-[#00f0ff] text-zinc-950 hover:bg-[#26f3ff] rounded-xl font-extrabold text-xs uppercase tracking-widest transition-all active:scale-[0.98] disabled:opacity-50"
                                    >
                                        {connectingCal ? (
                                            <><RefreshCcw className="w-4 h-4 animate-spin" />Redirecting to Cal.com...</>
                                        ) : (
                                            <><Calendar className="w-4 h-4" />Reconnect Cal.com Calendar</>
                                        )}
                                    </button>
                                </div>
                            ) : !calConnected ? (
                                <div className="space-y-4">
                                    <div className="p-4 bg-red-950/20 border border-red-900/30 rounded-2xl flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                                        <div>
                                            <h4 className="font-bold text-red-400 text-xs uppercase tracking-wider">Calendar Disconnected</h4>
                                            <p className="text-[10px] text-red-350 mt-1 leading-relaxed font-medium">
                                                Please connect your Cal.com calendar to enable automatic meeting scheduling.
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={startCalAuthorization}
                                        disabled={connectingCal}
                                        className="w-full flex items-center justify-center gap-3 px-8 py-3.5 bg-[#00f0ff] text-zinc-950 hover:bg-[#26f3ff] rounded-xl font-extrabold text-xs uppercase tracking-widest transition-all active:scale-[0.98] disabled:opacity-50"
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
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="p-4 bg-emerald-950/20 border border-emerald-900/30 rounded-2xl flex items-center gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                        <div>
                                            <h4 className="font-bold text-emerald-400 text-xs uppercase tracking-wider">Calendar Connected</h4>
                                            <p className="text-[10px] text-emerald-300 font-semibold mt-0.5">Your Cal.com calendar is authorized and synced via OAuth 2.0.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-2">
                                                Meeting Event Type
                                            </label>
                                            {loadingEventTypes ? (
                                                <div className="w-full px-4 py-3.5 rounded-xl border border-zinc-800/60 flex items-center gap-2 text-zinc-400 text-xs bg-zinc-900/30">
                                                    <RefreshCcw className="w-3.5 h-3.5 animate-spin" />
                                                    Loading event types...
                                                </div>
                                            ) : calEventTypes.length > 0 ? (
                                                <select
                                                    value={calEventTypeId}
                                                    onChange={(e) => setCalEventTypeId(e.target.value)}
                                                    className="w-full px-4 py-3.5 rounded-xl border border-zinc-800/60 bg-zinc-900/40 text-white focus:outline-none focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff]/25 font-bold text-xs"
                                                >
                                                    <option value="" className="bg-zinc-950">-- Select an event type --</option>
                                                    {calEventTypes.map((et) => (
                                                        <option key={et.id} value={String(et.id)} className="bg-zinc-950 text-white">
                                                            {et.title} ({et.duration} min)
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <input
                                                    type="number"
                                                    value={calEventTypeId}
                                                    onChange={(e) => setCalEventTypeId(e.target.value)}
                                                    placeholder="e.g. 5137238"
                                                    className="w-full px-4 py-3.5 rounded-xl border border-zinc-800/60 bg-zinc-900/40 text-white focus:outline-none focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff]/25 font-bold text-xs placeholder-zinc-650 transition-all"
                                                />
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-2">
                                                Booking Timezone
                                            </label>
                                            <select 
                                                value={calTimezone}
                                                onChange={(e) => setCalTimezone(e.target.value)}
                                                className="w-full px-4 py-3.5 rounded-xl border border-zinc-800/60 bg-zinc-900/40 text-white focus:outline-none focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff]/25 font-bold text-xs"
                                            >
                                                <option value="UTC" className="bg-zinc-950">UTC</option>
                                                <option value="US/Eastern" className="bg-zinc-950">US/Eastern</option>
                                                <option value="US/Central" className="bg-zinc-950">US/Central</option>
                                                <option value="US/Pacific" className="bg-zinc-950">US/Pacific</option>
                                                <option value="Europe/London" className="bg-zinc-950">Europe/London</option>
                                                <option value="Asia/Kolkata" className="bg-zinc-950">Asia/Kolkata</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Status Banners */}
                                    {error && (
                                        <div className="p-4 bg-red-950/20 border border-red-900/30 rounded-xl flex items-start gap-3 animate-headshake">
                                            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                            <p className="text-[11px] text-red-350 font-bold leading-normal">{error}</p>
                                        </div>
                                    )}
                                    {success && (
                                        <div className="p-4 bg-emerald-950/20 border border-emerald-900/30 rounded-xl flex items-center gap-3">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                            <p className="text-[11px] text-emerald-300 font-bold">Calendar settings saved successfully.</p>
                                        </div>
                                    )}

                                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                        <button
                                            onClick={saveCalSettings}
                                            disabled={savingCal}
                                            className="flex-grow py-3.5 bg-[#00f0ff] hover:bg-[#26f3ff] text-zinc-950 rounded-xl font-extrabold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 group active:scale-[0.98] disabled:opacity-50 shadow-md shadow-[#00f0ff]/10"
                                        >
                                            {savingCal ? "Saving..." : "Save"}
                                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Settings;


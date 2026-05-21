import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
    Calendar, 
    Lock, 
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
    const { getCalAuthorizationUrl, user } = useAuth();
    const navigate = useNavigate();

    // Cal.com states
    const [calConnected, setCalConnected] = useState(false);
    const [calReauthRequired, setCalReauthRequired] = useState(false);
    const [calEventTypeId, setCalEventTypeId] = useState('');
    const [calTimezone, setCalTimezone] = useState('UTC');
    const [loadingCal, setLoadingCal] = useState(true);
    const [savingCal, setSavingCal] = useState(false);
    const [disconnectingCal, setDisconnectingCal] = useState(false);
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

    const disconnectCal = async () => {
        if (!window.confirm("Are you sure you want to disconnect your Cal.com calendar?")) return;
        setDisconnectingCal(true);
        setError(null);
        setSuccess(false);
        try {
            await axios.delete(`${API_BASE_URL}/connect/cal`);
            setCalConnected(false);
            setCalEventTypeId('');
            setCalTimezone('UTC');
            setCalEventTypes([]);
            setSuccess(true);
        } catch (error) {
            console.error("Failed to disconnect Cal.com calendar:", error);
            setError("Failed to disconnect calendar.");
        } finally {
            setDisconnectingCal(false);
        }
    };

    if (loadingCal) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#FFF5F5] via-white to-[#FFF9F9] flex items-center justify-center font-outfit">
                <RefreshCcw className="w-8 h-8 animate-spin text-[#FE1919]" />
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
                            Smart Calendaring
                        </span>
                    </div>

                    {/* Main Title */}
                    <h1 className="text-4xl lg:text-5xl font-black text-zinc-900 tracking-tight leading-[1.1]">
                        Optimize your <span className="text-[#FE1919]">availability.</span>
                    </h1>

                    {/* Subcopy */}
                    <p className="text-zinc-500 font-medium text-sm leading-relaxed">
                        Configure your calendar event type and primary timezone. AI-PRIORI schedules meetings autonomously, respecting your booking parameters.
                    </p>

                    {/* Features List */}
                    <div className="space-y-6 pt-6">
                        {/* Bullet 1 */}
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-[#FE1919] text-white flex items-center justify-center shrink-0 shadow-lg shadow-[#FE1919]/10">
                                <Sliders className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider mb-0.5">
                                    Availability Sync
                                </h3>
                                <p className="text-xs text-zinc-400 font-medium leading-normal">
                                    Coordinate slots based on your designated event details.
                                </p>
                            </div>
                        </div>

                        {/* Bullet 2 */}
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-white border border-zinc-200 text-[#FE1919] flex items-center justify-center shrink-0">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider mb-0.5">
                                    Timezone Sync
                                </h3>
                                <p className="text-xs text-zinc-400 font-medium leading-normal">
                                    Automatically adjust discovery call times to your primary timezone.
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
                                Calendar Settings
                            </h2>
                            <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">
                                Calibrate meeting coordination parameters.
                            </p>
                        </header>

                        {/* Pink Alert notice banner */}
                        <div className="bg-[#FFF5F5] border border-[#FFE3E3] rounded-2xl p-4 flex gap-3 items-start mb-8">
                            <AlertCircle className="w-5 h-5 text-[#FE1919] shrink-0 mt-0.5" />
                            <p className="text-[11px] leading-relaxed font-bold text-[#8C1F1F]">
                                Your event type and timezone determine when prospects book discovery slots.
                            </p>
                        </div>

                        <div className="space-y-6">
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

                            {calReauthRequired ? (
                                <div className="space-y-4">
                                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
                                        <XCircle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                                        <div>
                                            <h4 className="font-bold text-amber-800 text-sm">Re-authorization Required</h4>
                                            <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed font-medium">
                                                Your Cal.com session has expired. Please reconnect to restore automatic meeting booking.
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={startCalAuthorization}
                                        disabled={connectingCal}
                                        className="w-full flex items-center justify-center gap-3 px-8 py-4.5 bg-[#FE1919] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#E01414] transition-all shadow-xl shadow-[#FE1919]/15 active:scale-[0.98] disabled:opacity-50"
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
                                    <div className="p-4 bg-rose-50/50 border border-rose-100 rounded-2xl flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-[#FE1919] mt-0.5 shrink-0" />
                                        <div>
                                            <h4 className="font-bold text-rose-900 text-sm">Calendar Disconnected</h4>
                                            <p className="text-[11px] text-rose-700 mt-0.5 leading-relaxed font-medium">
                                                Please authorize your Cal.com scheduling coordinate to launch your outreach campaigns.
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={startCalAuthorization}
                                        disabled={connectingCal}
                                        className="w-full flex items-center justify-center gap-3 px-8 py-4.5 bg-[#FE1919] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#E01414] transition-all shadow-xl shadow-[#FE1919]/15 active:scale-[0.98] disabled:opacity-50"
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
                                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3">
                                        <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                                        <div>
                                            <h4 className="font-bold text-emerald-800 text-sm">Cal.com Bridge Active</h4>
                                            <p className="text-[11px] text-emerald-600 font-semibold">Your calendar is authorized and connected via secure OAuth 2.0.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                                Event Type
                                            </label>
                                            {loadingEventTypes ? (
                                                <div className="w-full px-4 py-3.5 rounded-xl border border-slate-200 flex items-center gap-2 text-slate-400 text-sm bg-slate-50">
                                                    <RefreshCcw className="w-4 h-4 animate-spin" />
                                                    Loading event types...
                                                </div>
                                            ) : calEventTypes.length > 0 ? (
                                                <select
                                                    value={calEventTypeId}
                                                    onChange={(e) => setCalEventTypeId(e.target.value)}
                                                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#FE1919]/10 focus:border-[#FE1919] font-bold text-slate-800 text-sm"
                                                >
                                                    <option value="">-- Select an event type --</option>
                                                    {calEventTypes.map((et) => (
                                                        <option key={et.id} value={String(et.id)}>
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
                                                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#FE1919]/10 focus:border-[#FE1919] font-bold text-slate-800 text-sm placeholder-slate-300 transition-all"
                                                />
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                                Scheduling Timezone
                                            </label>
                                            <select 
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
                                        </div>
                                    </div>

                                    {/* Status Banners */}
                                    {error && (
                                        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 animate-headshake">
                                            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                                            <p className="text-xs text-rose-700 font-bold leading-normal">{error}</p>
                                        </div>
                                    )}
                                    {success && (
                                        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                            <p className="text-xs text-emerald-700 font-bold">Settings synchronized successfully.</p>
                                        </div>
                                    )}

                                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                        <button
                                            onClick={saveCalSettings}
                                            disabled={savingCal}
                                            className="flex-grow py-4.5 bg-[#FE1919] hover:bg-[#E01414] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-lg hover:shadow-[#FE1919]/25 transition-all flex items-center justify-center gap-2 group active:scale-[0.98] disabled:opacity-50"
                                        >
                                            {savingCal ? "Saving Coordinates..." : "Save & Confirm"}
                                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                        </button>
                                        <button
                                            onClick={disconnectCal}
                                            disabled={disconnectingCal}
                                            className="px-6 py-4.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-100 hover:text-rose-700 transition-all active:scale-[0.98] disabled:opacity-50 shrink-0"
                                        >
                                            {disconnectingCal ? "Disconnecting..." : "Disconnect Calendar"}
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


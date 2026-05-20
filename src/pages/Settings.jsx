import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Shield, CheckCircle2, XCircle, RefreshCcw, Calendar } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../config';

const MAILBOX_REDIRECT_STORAGE_KEY = 'mailbox_oauth_redirect_uri';

const Settings = () => {
    const { getMailboxAuthorizationUrl, getCalAuthorizationUrl, user, mailboxHealth } = useAuth();
    const navigate = useNavigate();
    const [connecting, setConnecting] = useState(false);
    const [status, setStatus] = useState(null); // 'success', 'error'

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

    const startMailboxAuthorization = async () => {
        setConnecting(true);
        try {
            const url = await getMailboxAuthorizationUrl();
            if (!url) {
                throw new Error('Authorization URL was not returned.');
            }
            try {
                const parsed = new URL(url);
                const redirectUri = parsed.searchParams.get('redirect_uri');
                if (redirectUri) {
                    sessionStorage.setItem(MAILBOX_REDIRECT_STORAGE_KEY, redirectUri);
                }
            } catch (parseError) {
                console.warn("Unable to persist mailbox redirect URI:", parseError);
            }
            window.location.assign(url);
        } catch (error) {
            console.error("Mailbox authorization initialization failed:", error);
            setStatus('error');
            setConnecting(false);
        }
    };

    const startCalAuthorization = async () => {
        setConnectingCal(true);
        try {
            const url = await getCalAuthorizationUrl();
            if (!url) {
                throw new Error('Authorization URL was not returned.');
            }
            window.location.assign(url);
        } catch (error) {
            console.error("Cal.com authorization initialization failed:", error);
            setConnectingCal(false);
        }
    };

    const saveCalSettings = async () => {
        if (!calEventTypeId) {
            alert("Please select an event type before saving.");
            return;
        }
        setSavingCal(true);
        try {
            await axios.post(`${API_BASE_URL}/connect/cal/settings`, {
                event_type_id: calEventTypeId ? parseInt(calEventTypeId) : null,
                timezone: calTimezone
            });
            navigate('/');
        } catch (error) {
            console.error("Failed to save Cal.com settings:", error);
            alert("Failed to save calendar settings.");
        } finally {
            setSavingCal(false);
        }
    };

    const disconnectCal = async () => {
        if (!window.confirm("Are you sure you want to disconnect your Cal.com calendar?")) return;
        setDisconnectingCal(true);
        try {
            await axios.delete(`${API_BASE_URL}/connect/cal`);
            setCalConnected(false);
            setCalEventTypeId('');
            setCalTimezone('UTC');
            alert("Calendar disconnected successfully.");
        } catch (error) {
            console.error("Failed to disconnect Cal.com calendar:", error);
            alert("Failed to disconnect calendar.");
        } finally {
            setDisconnectingCal(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-6 py-12 font-outfit">
            <header className="mb-10 text-center">
                <h1 className="text-4xl font-extrabold text-brand-primary uppercase tracking-tighter mb-2">
                    Calendar Synchronization
                </h1>
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-[11px]">
                    Configure availability settings to complete your onboarding
                </p>
            </header>

            <div className="space-y-8">
                {/* Identity Summary Card */}
                <div className="bg-white px-8 py-5 rounded-3xl shadow-sm border border-zinc-100 flex items-center justify-between">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-black text-zinc-400 uppercase tracking-[0.15em]">
                            Authenticated Identity
                        </span>
                        <span className="text-md font-bold text-zinc-800">
                            {user?.email || 'N/A'}
                        </span>
                    </div>
                    <span className="text-[10px] text-brand-primary font-black uppercase bg-brand-primary/5 px-3 py-1.5 rounded-full border border-brand-primary/10">
                        Identity Bridged
                    </span>
                </div>

                {/* Calendar Configuration Card */}
                <section className="bg-white p-8 md:p-10 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-zinc-100">
                    <div className="flex items-start justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-extrabold text-brand-primary uppercase tracking-tight mb-2">
                                Cal.com Sync Settings
                            </h2>
                            <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                                Enter your event coordinate and scheduling timezone to dynamically coordinate slots for positive outreach replies.
                            </p>
                        </div>
                        <div className="p-3 bg-brand-primary/5 rounded-2xl">
                            <Calendar className="w-6 h-6 text-brand-primary" />
                        </div>
                    </div>

                    <div className="space-y-6">
                        {loadingCal ? (
                            <div className="flex items-center justify-center py-6">
                                <RefreshCcw className="w-6 h-6 animate-spin text-zinc-400" />
                            </div>
                        ) : calReauthRequired ? (
                            <div className="space-y-4">
                                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
                                    <XCircle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                                    <div>
                                        <h4 className="font-bold text-amber-800 text-sm">Re-authorization Required</h4>
                                        <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
                                            Your Cal.com session has expired. Please reconnect to restore automatic meeting booking.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={startCalAuthorization}
                                    disabled={connectingCal}
                                    className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-brand-primary text-white rounded-2xl font-bold text-lg hover:bg-brand-primary/90 transition-all shadow-xl shadow-brand-primary/20 active:scale-95 disabled:opacity-50"
                                >
                                    {connectingCal ? (
                                        <><RefreshCcw className="w-5 h-5 animate-spin" />Redirecting to Cal.com...</>
                                    ) : (
                                        <><Calendar className="w-5 h-5" />Reconnect Cal.com Calendar</>
                                    )}
                                </button>
                            </div>
                        ) : !calConnected ? (
                            <button
                                onClick={startCalAuthorization}
                                disabled={connectingCal}
                                className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-brand-primary text-white rounded-2xl font-bold text-lg hover:bg-brand-primary/90 transition-all shadow-xl shadow-brand-primary/20 active:scale-95 disabled:opacity-50"
                            >
                                {connectingCal ? (
                                    <>
                                        <RefreshCcw className="w-5 h-5 animate-spin" />
                                        Redirecting to Cal.com...
                                    </>
                                ) : (
                                    <>
                                        <Calendar className="w-5 h-5" />
                                        Connect Cal.com Calendar
                                    </>
                                )}
                            </button>
                        ) : (
                            <div className="space-y-6">
                                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3">
                                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                    <div>
                                        <h4 className="font-bold text-emerald-800 text-sm">Cal.com Bridge Active</h4>
                                        <p className="text-[11px] text-emerald-600">Your calendar is authorized and connected via secure OAuth 2.0.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-2">
                                            Event Type
                                        </label>
                                        {loadingEventTypes ? (
                                            <div className="w-full px-4 py-3 rounded-xl border border-zinc-200 flex items-center gap-2 text-zinc-400 text-sm">
                                                <RefreshCcw className="w-4 h-4 animate-spin" />
                                                Loading event types...
                                            </div>
                                        ) : calEventTypes.length > 0 ? (
                                            <select
                                                value={calEventTypeId}
                                                onChange={(e) => setCalEventTypeId(e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary font-bold text-zinc-800 text-sm"
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
                                                className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary font-bold text-zinc-800 text-sm"
                                            />
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-2">
                                            Scheduling Timezone
                                        </label>
                                        <select 
                                            value={calTimezone}
                                            onChange={(e) => setCalTimezone(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary font-bold text-zinc-800 text-sm"
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

                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <button
                                        onClick={saveCalSettings}
                                        disabled={savingCal}
                                        className="flex-grow py-4 bg-brand-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-primary/95 transition-all shadow-lg shadow-brand-primary/20 active:scale-98 disabled:opacity-50"
                                    >
                                        {savingCal ? "Saving Coordinates..." : "Save & Confirm"}
                                    </button>
                                    <button
                                        onClick={disconnectCal}
                                        disabled={disconnectingCal}
                                        className="px-6 py-4 bg-rose-50 text-rose-600 border border-rose-100 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-100 hover:text-rose-700 transition-all active:scale-98 disabled:opacity-50"
                                    >
                                        {disconnectingCal ? "Disconnecting..." : "Disconnect Calendar"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Settings;

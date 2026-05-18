import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Shield, CheckCircle2, XCircle, RefreshCcw, Calendar } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../config';

const MAILBOX_REDIRECT_STORAGE_KEY = 'mailbox_oauth_redirect_uri';

const Settings = () => {
    const { getMailboxAuthorizationUrl, getCalAuthorizationUrl, user, mailboxHealth } = useAuth();
    const [connecting, setConnecting] = useState(false);
    const [status, setStatus] = useState(null); // 'success', 'error'

    // Cal.com states
    const [calConnected, setCalConnected] = useState(false);
    const [calEventTypeId, setCalEventTypeId] = useState('');
    const [calTimezone, setCalTimezone] = useState('UTC');
    const [loadingCal, setLoadingCal] = useState(true);
    const [savingCal, setSavingCal] = useState(false);
    const [disconnectingCal, setDisconnectingCal] = useState(false);
    const [connectingCal, setConnectingCal] = useState(false);

    const fetchCalStatus = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/connect/cal/status`);
            setCalConnected(res.data.connected);
            setCalEventTypeId(res.data.cal_event_type_id || '');
            setCalTimezone(res.data.cal_timezone || 'UTC');
        } catch (err) {
            console.error("Failed to fetch Cal.com status:", err);
        } finally {
            setLoadingCal(false);
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
        setSavingCal(true);
        try {
            await axios.post(`${API_BASE_URL}/connect/cal/settings`, {
                event_type_id: calEventTypeId ? parseInt(calEventTypeId) : null,
                timezone: calTimezone
            });
            alert("Calendar settings saved successfully!");
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
        <div className="max-w-4xl mx-auto px-6 py-12 font-outfit">
            <header className="mb-12">
                <h1 className="text-4xl font-extrabold text-brand-primary uppercase tracking-tighter mb-2">
                    System Configuration
                </h1>
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-[11px]">
                    Identity & Capability Governance
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Panel: Profile */}
                <div className="md:col-span-1 space-y-6">
                    <section className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-100">
                        <h2 className="text-[12px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-4">
                            User Identity
                        </h2>
                        <div className="flex flex-col gap-1">
                            <span className="text-lg font-bold text-zinc-800 truncate">
                                {user?.email || 'N/A'}
                            </span>
                            <span className="text-[10px] text-zinc-400 font-bold uppercase bg-zinc-50 self-start px-2 py-1 rounded">
                                Google Identity Bridge
                            </span>
                        </div>
                    </section>
                </div>

                {/* Right Panel: Actions */}
                <div className="md:col-span-2 space-y-8">
                    <section className="bg-white p-8 rounded-3xl shadow-lg border border-zinc-100">
                        <div className="flex items-start justify-between mb-8">
                            <div>
                                <h2 className="text-xl font-extrabold text-brand-primary uppercase tracking-tight mb-2">
                                    Mailbox Outreach Sync
                                </h2>
                                <p className="text-sm text-zinc-500 font-medium leading-relaxed">
                                    Grant AI-PRIORI the capability to dispatch outreach engagement and track prospect dialogue using your enterprise mailbox.
                                </p>
                            </div>
                            <div className="p-3 bg-brand-primary/5 rounded-2xl">
                                <Mail className="w-6 h-6 text-brand-primary" />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center gap-4 p-4 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
                                <Shield className="w-5 h-5 text-zinc-400" />
                                <div className="flex-1">
                                    <div className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider">
                                        AES-256 Vault-Level Token Encryption Active
                                    </div>
                                    {mailboxHealth?.status && mailboxHealth.status !== 'NOT_CONNECTED' ? (
                                        <div className="mt-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                                            Mailbox Health: {mailboxHealth.status.replace(/_/g, ' ')}
                                        </div>
                                    ) : null}
                                </div>
                            </div>

                            {!status ? (
                                <button
                                    onClick={startMailboxAuthorization}
                                    disabled={connecting}
                                    className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-brand-primary text-white rounded-2xl font-bold text-lg hover:bg-brand-primary/90 transition-all shadow-xl shadow-brand-primary/20 active:scale-95 disabled:opacity-50"
                                >
                                    {connecting ? (
                                        <>
                                            <RefreshCcw className="w-5 h-5 animate-spin" />
                                            Synchronizing...
                                        </>
                                    ) : (
                                        <>
                                            <Mail className="w-5 h-5" />
                                            Connect Google Mailbox
                                        </>
                                    )}
                                </button>
                            ) : status === 'success' ? (
                                <motion.div 
                                    initial={{ scale: 0.95, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="p-6 bg-emerald-50 border border-emerald-100 rounded-2xl flex flex-col items-center text-center gap-3"
                                >
                                    <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                                    <div>
                                        <h3 className="font-extrabold text-emerald-800 text-lg">Capability Synchronized</h3>
                                        <p className="text-sm text-emerald-600 font-medium">Your enterprise mailbox is now bridged for outreach deployment.</p>
                                    </div>
                                    <button 
                                        onClick={() => setStatus(null)}
                                        className="mt-2 text-xs font-bold text-emerald-500 uppercase tracking-widest hover:underline"
                                    >
                                        Update Synchrony
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    initial={{ scale: 0.95, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="p-6 bg-rose-50 border border-rose-100 rounded-2xl flex flex-col items-center text-center gap-3"
                                >
                                    <XCircle className="w-12 h-12 text-rose-500" />
                                    <div>
                                        <h3 className="font-extrabold text-rose-800 text-lg">Synchronization Failed</h3>
                                        <p className="text-sm text-rose-600 font-medium">Protocol deployment was interrupted. Please ensure all permissions are granted.</p>
                                    </div>
                                    <button 
                                        onClick={() => setStatus(null)}
                                        className="mt-2 text-xs font-bold text-rose-500 uppercase tracking-widest hover:underline"
                                    >
                                        Try Again
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    </section>

                    <section className="bg-white p-8 rounded-3xl shadow-lg border border-zinc-100 mt-8">
                        <div className="flex items-start justify-between mb-8">
                            <div>
                                <h2 className="text-xl font-extrabold text-brand-primary uppercase tracking-tight mb-2">
                                    Calendar Scheduling Sync
                                </h2>
                                <p className="text-sm text-zinc-500 font-medium leading-relaxed">
                                    Bridge your personal Cal.com calendar to coordinate live campaign outreach slots and handle direct meeting bookings.
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
                                            <h4 className="font-bold text-emerald-800">Cal.com Bridge Active</h4>
                                            <p className="text-xs text-emerald-600">Your calendar is authorized and connected via secure OAuth 2.0.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-2">
                                                Event Type ID
                                            </label>
                                            <input 
                                                type="number"
                                                value={calEventTypeId}
                                                onChange={(e) => setCalEventTypeId(e.target.value)}
                                                placeholder="e.g. 5137238"
                                                className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary font-bold text-zinc-800"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-2">
                                                Scheduling Timezone
                                            </label>
                                            <select 
                                                value={calTimezone}
                                                onChange={(e) => setCalTimezone(e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary font-bold text-zinc-800"
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

                                    <div className="flex gap-4">
                                        <button
                                            onClick={saveCalSettings}
                                            disabled={savingCal}
                                            className="flex-1 py-3 bg-brand-primary text-white rounded-xl font-bold hover:bg-brand-primary/95 transition-all shadow-md active:scale-98 disabled:opacity-50"
                                        >
                                            {savingCal ? "Saving..." : "Save Settings"}
                                        </button>
                                        <button
                                            onClick={disconnectCal}
                                            disabled={disconnectingCal}
                                            className="px-6 py-3 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl font-bold hover:bg-rose-100 hover:text-rose-700 transition-all active:scale-98 disabled:opacity-50"
                                        >
                                            {disconnectingCal ? "Disconnecting..." : "Disconnect"}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Settings;

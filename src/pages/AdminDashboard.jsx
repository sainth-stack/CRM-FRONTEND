import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, 
  UserPlus, 
  Trash2, 
  Mail, 
  Lock, 
  BarChart3, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  Search,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API_BASE_URL from '../config';
import { useToast } from '../context/ToastContext';

const AdminDashboard = () => {
  const { token, user } = useAuth();
  const { showToast } = useToast();
  const [managedUsers, setManagedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [error, setError] = useState(null);
  
  // Provisioning Form
  const [newUser, setNewUser] = useState({ email: '' });
  
  const fetchManagedUsers = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/management/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setManagedUsers(Array.isArray(data) ? data : (data.users || []));
      } else {
        throw new Error("Failed to synchronize user sector.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (user?.role !== 'admin' && user?.role !== 'super_admin') return;
    fetchManagedUsers();
  }, [user, fetchManagedUsers]);

  const handleProvisionUser = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/management/users`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(newUser)
      });
      
      if (response.ok) {
        const data = await response.json();
        const dispatchMsg = data.email_dispatched 
          ? " An activation link has been dispatched via your professional identity." 
          : " User provisioned successfully. Manual instruction required (mailbox not connected).";
        showToast({
          tone: "success",
          title: "User identity provisioned",
          description: dispatchMsg.trim(),
        });
        
        setNewUser({ email: '' });
        setIsProvisioning(false);
        fetchManagedUsers();
      } else {
        const data = await response.json();
        throw new Error(data.detail || "Provisioning failure.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendActivation = async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/management/resend-activation/${userId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        showToast({
          tone: "success",
          title: "Activation Link Resent",
          description: "The secure setup link has been re-dispatched to the user's mailbox.",
        });
      } else {
        const data = await response.json();
        throw new Error(data.detail || "Resend failed.");
      }
    } catch (err) {
      showToast({ tone: "error", title: "Resend Failed", description: err.message });
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("CONFIRM DECOMMISSION: This will permanently remove this user sector and all associated campaigns.")) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/management/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchManagedUsers();
      } else {
        throw new Error("Decommissioning failed.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReplaceUser = async (oldUserId) => {
    if (window.confirm("IDENTITY REPLACEMENT: This will decommission the existing user and open the provisioning portal for a new identity.")) {
      try {
      const response = await fetch(`${API_BASE_URL}/auth/management/users/${oldUserId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          setIsProvisioning(true);
          fetchManagedUsers();
        }
      } catch {
        setError("Replacement handshake failed.");
      }
    }
  };

  if (user?.role !== 'admin' && user?.role !== 'super_admin') {
    return (
       <div className="min-h-screen bg-white flex items-center justify-center p-6 font-sans select-none">
         <div className="text-center max-w-sm">
           <AlertCircle size={56} className="text-rose-500 mx-auto mb-5" />
           <h1 className="text-2xl font-extrabold text-slate-900 mb-2 uppercase tracking-tight italic">Access Denied</h1>
           <p className="text-slate-400 font-bold mb-6 text-sm">Administrative clearance required for this sector.</p>
           <button onClick={() => window.location.href = '/'} className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-extrabold uppercase tracking-widest text-xs shadow-md shadow-red-500/10 transition-all select-none">Return to Operations</button>
         </div>
       </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/20 font-sans pb-20 select-none">
      {/* Top Administrative Header */}
      <div className="bg-white border-b border-slate-100/80 pt-10 pb-12 px-6 md:px-10 select-none">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
           <div className="space-y-3">
              <span className="px-3 py-1 bg-red-50 text-red-600 border border-red-100/60 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm self-start mb-1 inline-flex items-center gap-1.5 select-none">
                <ShieldCheck size={12} /> Admin Deck
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight uppercase italic leading-tight select-none">
                User Sector Hub
              </h1>
              <p className="text-slate-400 font-bold text-sm tracking-wide max-w-xl leading-relaxed select-none">
                 Managing <span className="text-red-600 font-black">{managedUsers.length} active identities</span> across your provisioned administrative jurisdiction.
              </p>
           </div>

           <div className="bg-white p-5 rounded-3xl border border-slate-100/80 flex items-center gap-6 min-w-[280px] select-none shadow-sm">
              <div className="flex-1">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Provisioned Quota</div>
                <div className="text-2xl font-extrabold text-slate-800 tracking-tight">{managedUsers.length} / {user?.user_limit}</div>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100/60 flex items-center justify-center p-2 relative shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="20" cy="20" r="16" fill="none" stroke="#f1f5f9" strokeWidth="5" />
                  <circle 
                    cx="20" cy="20" r="16" fill="none" stroke="currentColor" strokeWidth="5" 
                    strokeDasharray={100.5}
                    strokeDashoffset={100.5 - (100.5 * Math.min(managedUsers.length / user?.user_limit, 1))}
                    strokeLinecap="round"
                    className="text-red-600 transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-slate-400 uppercase select-none">
                  {Math.round((managedUsers.length / user?.user_limit) * 100) || 0}%
                </div>
              </div>
           </div>
        </div>
      </div>

      {/* Primary Operating Deck Context */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 mt-10">
        {/* Filter Toolbar Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-5 mb-8">
           <div className="relative flex-1 w-full max-w-md">
             <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
             <input 
               type="text" 
               placeholder="Filter identities..." 
               className="w-full pl-12 pr-5 py-3.5 bg-white border border-slate-100/80 rounded-2xl text-slate-800 font-extrabold outline-none focus:border-red-500/30 focus:shadow-sm transition-all text-sm placeholder:text-slate-300"
             />
           </div>
           
           <div className="flex items-center gap-3 w-full md:w-auto shrink-0 select-none">
             <button 
               onClick={fetchManagedUsers}
               className="p-3.5 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-red-600 hover:bg-slate-50/50 transition-all active:scale-95 shadow-sm"
             >
               <RefreshCw size={18} />
             </button>
             <button 
               onClick={() => setIsProvisioning(true)}
               disabled={managedUsers.length >= user?.user_limit}
               className="flex flex-1 md:flex-initial items-center justify-center gap-2.5 bg-red-600 hover:bg-red-700 text-white px-6 py-3.5 rounded-2xl font-extrabold text-xs uppercase tracking-widest shadow-md shadow-red-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed select-none"
             >
               <UserPlus size={16} /> Provision Identity
             </button>
           </div>
        </div>

        {/* Managed Identities Display Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {managedUsers.map((u, i) => (
            <motion.div 
              key={u.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-white p-6 rounded-3xl border border-slate-100/80 shadow-sm hover:shadow-md hover:border-red-100/40 transition-all relative overflow-hidden group select-none"
            >
              {/* Identity Interaction Sub-deck */}
              <div className="absolute top-5 right-5 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all select-none">
                {!u.is_activated && (
                  <button 
                    onClick={() => handleResendActivation(u.id)}
                    className="p-2 bg-amber-50 border border-amber-100/50 text-amber-500 hover:bg-amber-100/60 hover:text-amber-600 rounded-xl transition-all shadow-sm select-none"
                    title="Resend Activation Link"
                  >
                    <Mail size={14} />
                  </button>
                )}
                <button 
                  onClick={() => handleReplaceUser(u.id)}
                  className="p-2 bg-slate-50 border border-slate-100/60 text-slate-400 hover:text-red-600 hover:bg-red-50/30 rounded-xl transition-all shadow-sm select-none"
                  title="Replace Identity"
                >
                  <RefreshCw size={14} />
                </button>
                <button 
                  onClick={() => handleDeleteUser(u.id)}
                  className="p-2 bg-rose-50 border border-rose-100/60 text-rose-500 hover:bg-rose-100/50 hover:text-rose-600 rounded-xl transition-all shadow-sm select-none"
                  title="Decommission"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Individual Profile Overview */}
              <div className="flex items-start gap-4 mb-6">
                 <div className="w-12 h-12 bg-red-50 border border-red-100/60 rounded-xl flex items-center justify-center text-red-600 text-lg font-extrabold shadow-sm shrink-0 uppercase select-none">
                    {u.email[0]}
                 </div>
                 <div className="pt-0.5 select-text">
                    <h3 className="font-extrabold text-slate-800 text-base leading-none mb-1 tracking-tight truncate max-w-[170px]">{u.email.split('@')[0]}</h3>
                    <div className="flex items-center gap-1.5 flex-wrap select-none mt-2">
                        {u.has_mailbox ? (
                          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100/50 rounded-lg text-[8px] font-black uppercase tracking-wider">
                            <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                            Mailbox Active
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 text-amber-600 border border-amber-100/50 rounded-lg text-[8px] font-black uppercase tracking-wider">
                            <div className="w-1 h-1 rounded-full bg-amber-500" />
                            Handshake Pending
                          </div>
                        )}
                        {!u.is_activated && (
                          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-50 text-red-600 border border-red-100/50 rounded-lg text-[8px] font-black uppercase tracking-wider select-none">
                            <div className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
                            Activation Pending
                          </div>
                        )}
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50 border border-slate-100 px-2 py-0.5 rounded-lg select-none">Localized Operator</span>
                    </div>
                 </div>
              </div>

              {/* Status Metrics Block */}
              <div className="space-y-3 mb-6 select-none">
                 <div className="bg-slate-50/40 border border-slate-100/60 p-4 rounded-2xl select-none">
                    <div className="flex items-center justify-between mb-3 select-none">
                       <div className="flex items-center gap-2 select-none">
                          <div className="p-1.5 bg-white rounded-lg border border-slate-100 text-red-600 shrink-0 select-none shadow-sm">
                             <BarChart3 size={14} />
                          </div>
                          <div>
                             <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 select-none">Campaign Load</div>
                             <div className="text-xs font-extrabold text-slate-800 leading-none select-none">{u.campaign_count} Missions</div>
                          </div>
                       </div>
                       <div className="text-[9px] font-black text-slate-300 select-none">
                          {Math.round((u.campaign_count / 10) * 100)}%
                       </div>
                    </div>
                    {/* Operating Limit Line */}
                    <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden select-none">
                       <div 
                         className="h-full bg-red-600 transition-all duration-1000 select-none" 
                         style={{ width: `${Math.min((u.campaign_count / 10) * 100, 100)}%` }}
                       />
                    </div>
                 </div>

                 <div className="bg-slate-50/40 border border-slate-100/60 p-4 rounded-2xl flex items-center justify-between select-none">
                    <div className="flex items-center gap-2 select-none">
                       <div className="p-1.5 bg-white rounded-lg border border-slate-100 text-slate-400 shrink-0 select-none shadow-sm">
                          <ShieldCheck size={14} />
                       </div>
                       <div>
                          <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 select-none">Sector Initialized</div>
                          <div className="text-xs font-extrabold text-slate-800 leading-none select-none">
                            {u.created_at ? new Date(u.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Jan 01, 2026'}
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-slate-50 select-none">
                <CheckCircle2 size={13} className="text-red-500" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] select-none">Readiness Verified</span>
              </div>
            </motion.div>
          ))}

          {managedUsers.length === 0 && !isLoading && (
            <div className="col-span-full py-28 bg-white border border-slate-100/80 rounded-3xl border-dashed gap-4 text-center select-none shadow-sm">
               <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mx-auto mb-4 border border-slate-100">
                 <Users size={24} />
               </div>
               <h3 className="text-xl font-extrabold text-slate-400 italic mb-1 uppercase tracking-tight leading-tight">Empty Operational Grid</h3>
               <p className="text-slate-400 font-bold text-xs">Initialize your first user identity sector to begin deployment.</p>
            </div>
          )}
        </div>
      </div>

      {/* Identity Allocation Portal Overlay */}
      <AnimatePresence>
        {isProvisioning && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 select-none">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProvisioning(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm select-none" 
            />
            <motion.div 
              initial={{ scale: 0.96, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 15 }}
              className="bg-white w-full max-w-[480px] rounded-[36px] shadow-xl relative z-10 overflow-hidden border border-slate-100/80 select-none"
            >
               <div className="p-8 md:p-10 select-none">
                  <div className="w-14 h-14 bg-red-50 border border-red-100/60 text-red-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm shrink-0">
                    <UserPlus size={24} />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-2 uppercase italic leading-tight select-none">Provision Identity</h2>
                  <p className="text-slate-400 font-bold text-sm mb-8 leading-relaxed select-none">
                    Establish a new autonomous sector. This identity will have full outreach capabilities under your supervision.
                  </p>

                  <form onSubmit={handleProvisionUser} className="space-y-6">
                     <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1 select-none">User Email Address</label>
                       <div className="relative">
                         <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                         <input 
                           type="email" 
                           required 
                           value={newUser.email}
                           onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                           placeholder="user@outreach-mission.com" 
                           className="w-full pl-12 pr-5 py-4 bg-white border border-slate-100/80 rounded-2xl text-slate-800 font-extrabold focus:border-red-500/30 transition-all outline-none text-sm shadow-sm" 
                         />
                       </div>
                     </div>
                     
                     {error && (
                       <div className="bg-rose-50 p-4 rounded-2xl flex items-start gap-2.5 border border-rose-100 select-text">
                         <AlertCircle className="text-rose-500 shrink-0" size={16} />
                         <p className="text-rose-500 text-[11px] font-extrabold leading-relaxed">{error}</p>
                       </div>
                     )}

                     <div className="flex gap-3 pt-2">
                       <button 
                         type="button" 
                         onClick={() => setIsProvisioning(false)}
                         className="flex-1 py-4 bg-slate-50 border border-slate-100 text-slate-500 rounded-2xl font-extrabold text-xs uppercase tracking-widest hover:bg-slate-100/80 transition-all select-none"
                       >
                         Abort
                       </button>
                       <button 
                         type="submit" 
                         disabled={isLoading}
                         className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-extrabold text-xs uppercase tracking-widest shadow-md shadow-red-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 select-none"
                       >
                         {isLoading ? "Provisioning..." : "Activate Sector"}
                       </button>
                     </div>
                  </form>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;

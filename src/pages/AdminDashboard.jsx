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
       <div className="min-h-screen bg-white flex items-center justify-center p-6 font-outfit">
         <div className="text-center max-w-sm">
           <AlertCircle size={64} className="text-red-500 mx-auto mb-6" />
           <h1 className="text-3xl font-black text-zinc-900 mb-2">Access Denied</h1>
           <p className="text-zinc-500 font-bold mb-8 italic">Administrative clearance required for this sector.</p>
           <button onClick={() => window.location.href = '/'} className="w-full py-4 bg-brand-primary text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-brand-primary/20">Return to Operations</button>
         </div>
       </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] font-outfit pb-20">
      {/* Admin Header Section */}
      <div className="bg-white border-b border-zinc-100 pt-12 pb-16 px-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
           <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="px-3 py-1 bg-brand-operational/10 text-brand-operational rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1.5">
                  <ShieldCheck size={12} /> Administrative Deck
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-brand-operational" />
              </div>
              <h1 className="text-5xl font-black text-zinc-900 tracking-tighter mb-2">User Sector Hub</h1>
              <p className="text-zinc-500 font-medium text-lg leading-relaxed max-w-xl">
                 Managing <span className="text-brand-operational font-black underline decoration-brand-operational/30">{managedUsers.length} active identities</span> across your provisioned administrative jurisdiction.
              </p>
           </div>

           <div className="bg-zinc-50 p-6 rounded-[32px] border border-zinc-100 flex items-center gap-8 min-w-[300px]">
              <div className="flex-1">
                <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Provisioned Quota</div>
                <div className="text-2xl font-black text-zinc-900 tracking-tighter">{managedUsers.length} / {user?.user_limit}</div>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-white border border-zinc-100 shadow-sm flex items-center justify-center p-2 relative">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="24" cy="24" r="20" fill="none" stroke="#f4f4f5" strokeWidth="6" />
                  <circle 
                    cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="6" 
                    strokeDasharray={126}
                    strokeDashoffset={126 - (126 * Math.min(managedUsers.length / user?.user_limit, 1))}
                    strokeLinecap="round"
                    className="text-brand-operational transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-zinc-400 uppercase">
                  {Math.round((managedUsers.length / user?.user_limit) * 100) || 0}%
                </div>
              </div>
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-10 mt-12">
        {/* Actions Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
           <div className="relative flex-1 w-full max-w-md">
             <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-300" size={18} />
             <input 
               type="text" 
               placeholder="Filter Identities..." 
               className="w-full pl-14 pr-6 py-4 bg-white border border-zinc-100 rounded-2xl text-zinc-900 font-bold focus:ring-2 focus:ring-brand-operational/10 outline-none transition-all"
             />
           </div>
           
           <div className="flex items-center gap-3">
             <button 
               onClick={fetchManagedUsers}
               className="p-4 bg-white border border-zinc-100 text-zinc-400 rounded-2xl hover:text-brand-operational transition-all active:scale-95"
             >
               <RefreshCw size={18} />
             </button>
             <button 
               onClick={() => setIsProvisioning(true)}
               disabled={managedUsers.length >= user?.user_limit}
               className="flex items-center gap-3 bg-brand-operational text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-brand-operational/90 transition-all shadow-xl shadow-brand-operational/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
             >
               <UserPlus size={20} /> Provision Identity
             </button>
           </div>
        </div>

        {/* Managed Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {managedUsers.map((u, i) => (
            <motion.div 
              key={u.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white p-8 rounded-[40px] border border-zinc-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.03)] group hover:border-brand-operational/30 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] transition-all relative overflow-hidden"
            >
              {/* Contextual Actions */}
              <div className="absolute top-6 right-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                {!u.is_activated && (
                  <button 
                    onClick={() => handleResendActivation(u.id)}
                    className="p-2.5 bg-amber-50 text-amber-500 hover:text-amber-600 rounded-xl transition-all"
                    title="Resend Activation Link"
                  >
                    <Mail size={16} />
                  </button>
                )}
                <button 
                  onClick={() => handleReplaceUser(u.id)}
                  className="p-2.5 bg-zinc-50 text-zinc-400 hover:text-brand-operational hover:bg-brand-operational/5 rounded-xl transition-all"
                  title="Replace Identity"
                >
                  <RefreshCw size={16} />
                </button>
                <button 
                  onClick={() => handleDeleteUser(u.id)}
                  className="p-2.5 bg-zinc-50 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  title="Decommission"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* User Identity Section */}
              <div className="flex items-start gap-5 mb-8">
                 <div className="w-16 h-16 bg-gradient-to-br from-brand-operational/10 to-brand-operational/5 rounded-[22px] flex items-center justify-center text-brand-operational text-2xl font-black shadow-inner">
                    {u.email[0].toUpperCase()}
                 </div>
                 <div className="pt-1">
                    <h3 className="font-black text-zinc-900 text-lg leading-none mb-2 truncate max-w-[180px]">{u.email.split('@')[0]}</h3>
                    <div className="flex items-center gap-2 flex-wrap">
                        {u.has_mailbox ? (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-wider border border-emerald-100/50">
                            <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                            Mailbox Active
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-600 rounded-lg text-[9px] font-black uppercase tracking-wider border border-amber-100/50">
                            <div className="w-1 h-1 rounded-full bg-amber-500" />
                            Handshake Pending
                          </div>
                        )}
                        {!u.is_activated && (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-brand-primary/5 text-brand-primary rounded-lg text-[9px] font-black uppercase tracking-wider border border-brand-primary/10">
                            <div className="w-1 h-1 rounded-full bg-brand-primary animate-pulse" />
                            Activation Pending
                          </div>
                        )}
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest bg-zinc-50 px-2.5 py-1 rounded-lg border border-zinc-100/50">Localized Operator</span>
                    </div>
                 </div>
              </div>

              {/* Operational Metrics */}
              <div className="space-y-4 mb-8">
                 <div className="bg-zinc-50/50 border border-zinc-100/50 p-5 rounded-[24px]">
                    <div className="flex items-center justify-between mb-4">
                       <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-white rounded-xl border border-zinc-100 shadow-sm text-brand-operational">
                             <BarChart3 size={18} />
                          </div>
                          <div>
                             <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Campaign Load</div>
                             <div className="text-sm font-black text-zinc-900">{u.campaign_count} Missions</div>
                          </div>
                       </div>
                       <div className="text-[10px] font-black text-zinc-300">
                          {Math.round((u.campaign_count / 10) * 100)}%
                       </div>
                    </div>
                    {/* Mini Progress Bar */}
                    <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                       <div 
                         className="h-full bg-brand-operational transition-all duration-1000" 
                         style={{ width: `${Math.min((u.campaign_count / 10) * 100, 100)}%` }}
                       />
                    </div>
                 </div>

                 <div className="bg-zinc-50/50 border border-zinc-100/50 p-5 rounded-[24px] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="p-2.5 bg-white rounded-xl border border-zinc-100 shadow-sm text-zinc-400">
                          <ShieldCheck size={18} />
                       </div>
                       <div>
                          <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Sector Initialized</div>
                          <div className="text-sm font-black text-zinc-900">
                            {u.created_at ? new Date(u.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Jan 01, 2026'}
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="flex items-center gap-2 pt-6 border-t border-zinc-50">
                <CheckCircle2 size={14} className="text-brand-operational" />
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Deployment Readiness Verified</span>
              </div>
            </motion.div>
          ))}

          {managedUsers.length === 0 && !isLoading && (
            <div className="col-span-full py-32 text-center">
               <div className="w-20 h-20 bg-zinc-50 rounded-[32px] flex items-center justify-center text-zinc-200 mx-auto mb-8">
                 <Users size={32} />
               </div>
               <h3 className="text-2xl font-black text-zinc-300 italic mb-2 tracking-tight">Empty Operational Grid</h3>
               <p className="text-zinc-400 font-medium">Initialize your first user identity sector to begin deployment.</p>
            </div>
          )}
        </div>
      </div>

      {/* Provisioning Modal */}
      <AnimatePresence>
        {isProvisioning && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProvisioning(false)}
              className="absolute inset-0 bg-zinc-950/60 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-[500px] rounded-[48px] shadow-2xl relative z-10 overflow-hidden"
            >
               <div className="p-12">
                  <div className="w-16 h-16 bg-brand-operational/10 text-brand-operational rounded-2xl flex items-center justify-center mb-8 shadow-inner">
                    <UserPlus size={28} />
                  </div>
                  <h2 className="text-4xl font-black text-zinc-900 tracking-tight mb-3">Provision Identity</h2>
                  <p className="text-zinc-500 font-medium mb-10 leading-relaxed italic">
                    Establish a new autonomous sector. This identity will have full outreach capabilities under your supervision.
                  </p>

                  <form onSubmit={handleProvisionUser} className="space-y-8">
                     <div>
                       <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest block ml-1 mb-2">User Email</label>
                       <div className="relative">
                         <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-300" size={18} />
                         <input 
                           type="email" 
                           required 
                           value={newUser.email}
                           onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                           placeholder="user@outreach-mission.com" 
                           className="w-full pl-14 pr-6 py-5 bg-zinc-50 border border-zinc-100 rounded-2xl text-zinc-900 font-bold focus:ring-2 focus:ring-brand-operational/10 transition-all outline-none" 
                         />
                       </div>
                     </div>
                     
                     {error && (
                       <div className="bg-red-50 p-5 rounded-2xl flex items-start gap-3 border border-red-100">
                         <AlertCircle className="text-red-500 shrink-0" size={18} />
                         <p className="text-red-500 text-xs font-black leading-relaxed">{error}</p>
                       </div>
                     )}

                     <div className="flex gap-4 pt-4">
                       <button 
                         type="button" 
                         onClick={() => setIsProvisioning(false)}
                         className="flex-1 py-5 bg-zinc-50 text-zinc-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:text-zinc-700 transition-all"
                       >
                         Abort
                       </button>
                       <button 
                         type="submit" 
                         disabled={isLoading}
                         className="flex-1 py-5 bg-zinc-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-zinc-200 hover:bg-brand-operational transition-all disabled:opacity-50"
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

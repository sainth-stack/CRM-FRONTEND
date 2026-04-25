import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  ShieldCheck, 
  Activity, 
  Plus, 
  Trash2, 
  AlertCircle, 
  ChevronRight, 
  CheckCircle2, 
  Settings,
  Mail,
  Lock,
  ArrowUpRight,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API_BASE_URL from '../config';
import { useToast } from '../context/ToastContext';

const SuperAdminDashboard = () => {
  const { token, user } = useAuth();
  const { showToast } = useToast();
  const [admins, setAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [error, setError] = useState(null);
  
  // Provisioning Form State
  const [newAdmin, setNewAdmin] = useState({ email: '', password: '', user_limit: 5 });
  const [showPassword, setShowPassword] = useState(false);
  
  const fetchAdmins = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/sovereign/admins`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAdmins(data);
      } else {
        throw new Error("Failed to synchronize admin sector.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role !== 'super_admin') return;
    fetchAdmins();
  }, [user]);

  const handleProvisionAdmin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/sovereign/admins`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(newAdmin)
      });
      
      if (response.ok) {
        const data = await response.json();
        const dispatchMsg = data.email_dispatched 
          ? " Credentials dispatched via your connected mailbox." 
          : " Identity provisioned, but no welcome email sent (mailbox not connected).";
        showToast({
          tone: "success",
          title: "Admin sector provisioned",
          description: dispatchMsg.trim(),
        });
        
        setNewAdmin({ email: '', password: '', user_limit: 5 });
        setIsAddingAdmin(false);
        fetchAdmins();
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

  const handleUpdateQuota = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/sovereign/admins/${editingAdmin.id}/quota`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ user_limit: editingAdmin.user_limit })
      });
      
      if (response.ok) {
        setEditingAdmin(null);
        fetchAdmins();
      } else {
        throw new Error("Quota adjustment failed.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    if (!window.confirm("ARE YOU SURE? This will permanently decommission this administrative sector.")) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/sovereign/admins/${adminId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchAdmins();
      } else {
        throw new Error("Decommissioning failed.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (user?.role !== 'super_admin') {
    return (
      <div className="min-h-screen bg-brand-light flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-[40px] text-center shadow-xl border border-zinc-100 max-w-md">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-6" />
          <h1 className="text-2xl font-black text-zinc-900 mb-4">Authority Conflict</h1>
          <p className="text-zinc-500 font-medium mb-8">Your identity does not possess the sovereign credentials required to access this sector.</p>
          <button onClick={() => window.location.href = '/'} className="w-full py-4 bg-brand-primary text-white rounded-2xl font-black uppercase tracking-widest text-sm">Return to Base</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] font-outfit pb-20">
      {/* Sovereign Header */}
      <div className="bg-white border-b border-zinc-100 pt-12 pb-16 px-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-brand-primary/5 to-transparent pointer-events-none" />
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-full text-[10px] font-black uppercase tracking-widest">
                Sovereign Control
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            </div>
            <h1 className="text-5xl font-black text-zinc-900 tracking-tighter mb-2">Governance Portal</h1>
            <p className="text-zinc-500 font-medium text-lg italic">Overseeing the global agentic workforce and administrative integrity.</p>
          </div>
          
          <div className="flex items-center gap-6">
             <div className="text-right hidden md:block">
               <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Authenticated As</div>
               <div className="font-bold text-zinc-800">{user?.email}</div>
             </div>
             <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-zinc-200">
               <ShieldCheck size={28} />
             </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-10 -mt-10 relative z-20">
        {/* Global Metric Deck */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {[
            { label: "Total Administrative Sectors", val: admins.length, icon: <ShieldCheck />, color: "bg-brand-primary" },
            { label: "Aggregate User Identities", val: admins.reduce((acc, a) => acc + a.current_users, 0), icon: <Users />, color: "bg-brand-secondary" },
            { label: "System Quota Integrity", val: `${admins.reduce((acc, a) => acc + a.user_limit, 0)} slots`, icon: <Activity />, color: "bg-brand-accent" }
          ].map((card, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-8 rounded-[32px] border border-zinc-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] flex items-start justify-between group hover:border-brand-primary/20 transition-all"
            >
              <div>
                <div className="text-[11px] font-black text-zinc-400 uppercase tracking-widest mb-4">{card.label}</div>
                <div className="text-4xl font-black text-zinc-900 tracking-tighter group-hover:scale-105 origin-left transition-transform">{card.val}</div>
              </div>
              <div className={`${card.color} text-white p-4 rounded-2xl shadow-lg`}>
                {card.icon}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Admin Management Sector */}
        <div className="bg-white rounded-[40px] border border-zinc-100 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="p-10 border-b border-zinc-50 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-zinc-900 tracking-tight mb-1">Administrative Nodes</h2>
              <p className="text-zinc-400 text-sm font-medium italic">Provision and oversee Tier-1 administrative capabilities.</p>
            </div>
            <button 
              onClick={() => setIsAddingAdmin(true)}
              className="flex items-center gap-2 bg-zinc-900 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-primary transition-all shadow-xl shadow-zinc-200 active:scale-95"
            >
              <Plus size={18} /> Provision Admin
            </button>
          </div>

          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-50/50">
                  <th className="px-10 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">Administrative Sector</th>
                  <th className="px-6 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">Identity</th>
                  <th className="px-6 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">Provisioned Quota</th>
                  <th className="px-6 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">Status</th>
                  <th className="px-10 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {admins.map((adm) => (
                  <tr key={adm.id} className="group hover:bg-zinc-50/30 transition-colors">
                    <td className="px-10 py-8">
                       <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-brand-primary/5 rounded-xl flex items-center justify-center text-brand-primary font-black">
                           {adm.email[0].toUpperCase()}
                         </div>
                         <div>
                           <div className="text-[11px] font-black text-zinc-400 uppercase tracking-tighter mb-0.5">Sector ID</div>
                           <div className="text-xs font-mono font-bold text-zinc-800">...{adm.id.slice(-8)}</div>
                         </div>
                       </div>
                    </td>
                    <td className="px-6 py-8">
                      <div className="font-bold text-zinc-900">{adm.email}</div>
                      <div className="text-[10px] text-zinc-400 font-medium">Joined {new Date(adm.created_at).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-8">
                       <div className="w-full max-w-[140px] mx-auto text-center">
                         <div className="flex justify-between items-end mb-2">
                           <span className="text-[10px] font-black text-zinc-800 uppercase tracking-widest">{adm.current_users} / {adm.user_limit}</span>
                           <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                             {Math.round((adm.current_users / adm.user_limit) * 100) || 0}%
                           </span>
                         </div>
                         <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden mb-2">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${Math.min((adm.current_users / adm.user_limit) * 100, 100)}%` }}
                             className={`h-full ${adm.current_users > adm.user_limit ? 'bg-red-500' : 'bg-brand-primary'} transition-all`} 
                           />
                         </div>
                         {adm.is_over_quota && (
                           <div className="text-[9px] font-black text-red-500 uppercase tracking-widest flex items-center justify-center gap-1">
                             <AlertCircle size={10} /> Quota Overrun
                           </div>
                         )}
                       </div>
                    </td>
                    <td className="px-6 py-8 text-center">
                       {adm.is_over_quota ? (
                         <span className="px-4 py-1.5 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> Conflict
                         </span>
                       ) : (
                         <span className="px-4 py-1.5 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Authorized
                         </span>
                       )}
                    </td>
                    <td className="px-10 py-8 text-right">
                       <div className="flex items-center justify-end gap-3">
                         <button 
                           onClick={() => setEditingAdmin({...adm})}
                           className="p-3 text-zinc-400 hover:text-brand-primary transition-colors"
                         >
                           <Settings size={18} />
                         </button>
                         <button 
                           onClick={() => handleDeleteAdmin(adm.id)}
                           className="p-3 text-zinc-400 hover:text-red-500 transition-colors"
                         >
                           <Trash2 size={18} />
                         </button>
                       </div>
                    </td>
                  </tr>
                ))}
                {admins.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan="5" className="px-10 py-20 text-center text-zinc-300 font-bold italic">
                      Zero administrative nodes provisioned. Start by adding an Admin.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Provisioning Modal */}
      <AnimatePresence>
        {isAddingAdmin && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingAdmin(false)}
              className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-[500px] rounded-[40px] shadow-2xl relative z-10 overflow-hidden border border-zinc-100"
            >
               <div className="h-2 w-full bg-brand-primary" />
               <div className="p-12">
                 <h2 className="text-3xl font-black text-zinc-900 tracking-tight mb-2">Provision Admin</h2>
                 <p className="text-sm text-zinc-500 font-medium mb-10 leading-relaxed">
                   Initialize a new administrative sector and define their user capacity boundaries.
                 </p>
                 
                 <form onSubmit={handleProvisionAdmin} className="space-y-6">
                   <div>
                     <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest block ml-1 mb-2">Identity Email</label>
                     <div className="relative">
                       <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-300" size={18} />
                       <input 
                         type="email" 
                         required 
                         value={newAdmin.email}
                         onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
                         placeholder="admin@ai-priori.com" 
                         className="w-full pl-14 pr-6 py-4.5 bg-zinc-50 border border-zinc-100 rounded-2xl text-zinc-900 font-bold focus:ring-2 focus:ring-brand-primary/10 transition-all outline-none" 
                       />
                     </div>
                   </div>
                   
                   <div>
                     <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest block ml-1 mb-2">Security Credential</label>
                     <div className="relative">
                       <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-300" size={18} />
                        <input 
                          type={showPassword ? "text" : "password"} 
                          required 
                          value={newAdmin.password}
                          onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})}
                          placeholder="••••••••" 
                          className="w-full pl-14 pr-14 py-4.5 bg-zinc-50 border border-zinc-100 rounded-2xl text-zinc-900 font-bold focus:ring-2 focus:ring-brand-primary/10 transition-all outline-none" 
                        />
                        <button 
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-zinc-500 transition-colors"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                     </div>
                   </div>

                   <div>
                     <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest block ml-1 mb-2">User Provision Limit: <span className="text-brand-primary">{newAdmin.user_limit}</span></label>
                     <input 
                       type="range" 
                       min="1" 
                       max="50" 
                       value={newAdmin.user_limit}
                       onChange={(e) => setNewAdmin({...newAdmin, user_limit: parseInt(e.target.value)})}
                       className="w-full h-1.5 bg-zinc-100 rounded-full appearance-none cursor-pointer accent-brand-primary"
                     />
                     <div className="flex justify-between mt-2 text-[10px] font-black text-zinc-300 uppercase tracking-widest">
                       <span>1 User</span>
                       <span>50 Users</span>
                     </div>
                   </div>

                   {error && <p className="text-red-500 text-xs font-black bg-red-50 p-4 rounded-xl">{error}</p>}

                   <div className="flex gap-4 pt-4">
                     <button 
                       type="button" 
                       onClick={() => setIsAddingAdmin(false)}
                       className="flex-1 py-4.5 bg-zinc-50 text-zinc-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:text-zinc-600 transition-all"
                     >
                       Cancel
                     </button>
                     <button 
                       type="submit" 
                       disabled={isLoading}
                       className="flex-1 py-4.5 bg-brand-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                     >
                       {isLoading ? "Provisioning..." : "Initialize Sector"}
                     </button>
                   </div>
                 </form>
               </div>
            </motion.div>
          </div>
        )}

        {/* Quota Adjustment Modal */}
        {editingAdmin && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingAdmin(null)}
              className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-[500px] rounded-[40px] shadow-2xl relative z-10 overflow-hidden border border-zinc-100"
            >
               <div className="h-2 w-full bg-brand-primary" />
               <div className="p-12">
                 <h2 className="text-3xl font-black text-zinc-900 tracking-tight mb-2">Adjust Quota</h2>
                 <p className="text-sm text-zinc-500 font-medium mb-10 leading-relaxed italic">
                   Modifying provisioned boundaries for <span className="text-zinc-900 font-bold">{editingAdmin.email}</span>.
                 </p>
                 
                 <form onSubmit={handleUpdateQuota} className="space-y-8">
                   <div>
                     <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest block ml-1 mb-4">Revised User Limit: <span className="text-brand-primary">{editingAdmin.user_limit}</span></label>
                     <input 
                       type="range" 
                       min="1" 
                       max="100" 
                       value={editingAdmin.user_limit}
                       onChange={(e) => setEditingAdmin({...editingAdmin, user_limit: parseInt(e.target.value)})}
                       className="w-full h-1.5 bg-zinc-100 rounded-full appearance-none cursor-pointer accent-brand-primary"
                     />
                     <div className="flex justify-between mt-2 text-[10px] font-black text-zinc-300 uppercase tracking-widest">
                       <span>1 Slot</span>
                       <span>100 Slots</span>
                     </div>
                   </div>

                   {error && <p className="text-red-500 text-xs font-black bg-red-50 p-4 rounded-xl">{error}</p>}

                   <div className="flex gap-4 pt-4">
                     <button 
                       type="button" 
                       onClick={() => setEditingAdmin(null)}
                       className="flex-1 py-4.5 bg-zinc-50 text-zinc-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:text-zinc-600 transition-all"
                     >
                       Abort
                     </button>
                     <button 
                       type="submit" 
                       disabled={isLoading}
                       className="flex-1 py-4.5 bg-brand-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                     >
                       {isLoading ? "Synchronizing..." : "Update Quota"}
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

export default SuperAdminDashboard;

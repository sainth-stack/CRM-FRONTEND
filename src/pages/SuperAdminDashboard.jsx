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
  const [newAdmin, setNewAdmin] = useState({ email: '', user_limit: 5 });
  
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
          ? " An activation link has been dispatched via your connected mailbox." 
          : " Identity provisioned, but no welcome email sent (mailbox not connected).";
        showToast({
          tone: "success",
          title: "Admin sector provisioned",
          description: dispatchMsg.trim(),
        });
        
        setNewAdmin({ email: '', user_limit: 5 });
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

  const handleResendActivation = async (adminId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/management/resend-activation/${adminId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        showToast({
          tone: "success",
          title: "Activation Resent",
          description: "A fresh setup link has been dispatched to the administrative sector.",
        });
      } else {
        const data = await response.json();
        throw new Error(data.detail || "Resend failed.");
      }
    } catch (err) {
      showToast({ tone: "error", title: "Dispatch Failure", description: err.message });
    }
  };

  if (user?.role !== 'super_admin') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans select-none">
        <div className="bg-white p-10 rounded-[40px] text-center shadow-md border border-slate-100/80 max-w-md select-none">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-6 select-none" />
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2 uppercase italic tracking-tight select-none">Authority Conflict</h1>
          <p className="text-slate-400 font-bold mb-8 text-sm select-none">Your identity does not possess the sovereign credentials required to access this sector.</p>
          <button onClick={() => window.location.href = '/'} className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-extrabold uppercase tracking-widest text-xs shadow-md transition-all select-none">Return to Base</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/20 font-sans pb-20 select-none">
      {/* Sovereign Header */}
      <div className="bg-white border-b border-slate-100/80 pt-10 pb-12 px-6 md:px-10 relative overflow-hidden select-none">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-red-500/5 to-transparent pointer-events-none" />
        
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10 select-none">
          <div className="space-y-3 select-none">
            <div className="flex items-center gap-3 select-none">
              <div className="px-3 py-1 bg-red-50 text-red-600 border border-red-100/60 rounded-xl text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1.5 select-none shadow-sm">
                Sovereign Control
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight uppercase italic leading-tight select-none">Governance Portal</h1>
            <p className="text-slate-400 font-bold text-sm tracking-wide max-w-xl leading-relaxed select-none">Overseeing the global agentic workforce and administrative integrity.</p>
          </div>
          
          <div className="flex items-center gap-5 select-none">
             <div className="text-right hidden md:block select-none">
               <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 select-none">Authenticated As</div>
               <div className="font-extrabold text-slate-800 text-sm select-none">{user?.email}</div>
             </div>
             <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-md shadow-red-500/10 shrink-0 select-none">
               <ShieldCheck size={22} />
             </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-10 mt-10 relative z-20 select-none">
        {/* Global Metric Deck */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 select-none">
          {[
            { label: "Total Administrative Sectors", val: admins.length, icon: <ShieldCheck />, color: "bg-red-50 border-red-100/60 text-red-600" },
            { label: "Aggregate User Identities", val: admins.reduce((acc, a) => acc + a.current_users, 0), icon: <Users />, color: "bg-red-50 border-red-100/60 text-red-600" },
            { label: "System Quota Integrity", val: `${admins.reduce((acc, a) => acc + a.user_limit, 0)} slots`, icon: <Activity />, color: "bg-red-50 border-red-100/60 text-red-600" }
          ].map((card, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-white p-6 rounded-3xl border border-slate-100/80 shadow-sm flex items-start justify-between group hover:border-red-100/40 hover:shadow-md transition-all select-none"
            >
              <div className="select-none">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 select-none">{card.label}</div>
                <div className="text-3xl font-extrabold text-slate-800 tracking-tight select-none">{card.val}</div>
              </div>
              <div className={`${card.color} border p-3 rounded-2xl shadow-sm shrink-0 select-none`}>
                {card.icon}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Admin Management Sector */}
        <div className="bg-white rounded-3xl border border-slate-100/80 shadow-sm overflow-hidden select-none">
          <div className="p-6 md:p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
            <div className="select-none">
              <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight uppercase italic leading-tight select-none">Administrative Nodes</h2>
              <p className="text-slate-400 font-bold text-xs max-w-md leading-relaxed select-none">Provision and oversee Tier-1 administrative capabilities.</p>
            </div>
            <button 
              onClick={() => setIsAddingAdmin(true)}
              className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-3.5 rounded-2xl font-extrabold text-xs uppercase tracking-widest shadow-md shadow-red-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all select-none"
            >
              <Plus size={16} /> Provision Admin
            </button>
          </div>

          <div className="p-0 overflow-x-auto select-none">
            <table className="w-full text-left select-none">
              <thead className="select-none">
                <tr className="bg-slate-50/50 select-none">
                  <th className="px-6 md:px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center select-none">Sector ID</th>
                  <th className="px-4 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest select-none">Identity</th>
                  <th className="px-4 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center select-none">Provisioned Quota</th>
                  <th className="px-4 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center select-none">Status</th>
                  <th className="px-6 md:px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right select-none">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/60 select-none">
                {admins.map((adm) => (
                  <tr key={adm.id} className="group hover:bg-slate-50/30 transition-colors select-none">
                    <td className="px-6 md:px-8 py-6 select-none">
                       <div className="flex items-center justify-center gap-3 select-none">
                          <div className="w-9 h-9 bg-red-50 border border-red-100/60 rounded-xl flex items-center justify-center text-red-600 font-extrabold select-none shrink-0 text-sm uppercase">
                            {adm.email[0]}
                          </div>
                          <div className="select-none">
                            <div className="text-[8px] font-black text-slate-400 uppercase tracking-wider mb-0.5 select-none">Sector Node</div>
                            <div className="text-xs font-mono font-bold text-slate-800 select-none">...{adm.id.slice(-6)}</div>
                          </div>
                       </div>
                    </td>
                    <td className="px-4 py-6 select-text">
                      <div className="font-bold text-slate-800 text-sm truncate max-w-[200px]">{adm.email}</div>
                      <div className="text-[9px] text-slate-400 font-bold select-none">Joined {new Date(adm.created_at).toLocaleDateString()}</div>
                    </td>
                    <td className="px-4 py-6 select-none">
                       <div className="w-full max-w-[130px] mx-auto text-center select-none">
                          <div className="flex justify-between items-end mb-1.5 select-none">
                            <span className="text-[9px] font-black text-slate-800 uppercase tracking-widest select-none">{adm.current_users} / {adm.user_limit}</span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest select-none">
                              {Math.round((adm.current_users / adm.user_limit) * 100) || 0}%
                            </span>
                          </div>
                          <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden mb-1.5 select-none">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min((adm.current_users / adm.user_limit) * 100, 100)}%` }}
                              className={`h-full ${adm.current_users > adm.user_limit ? 'bg-rose-600' : 'bg-red-600'} transition-all select-none`} 
                            />
                          </div>
                          {adm.is_over_quota && (
                            <div className="text-[8px] font-black text-rose-500 uppercase tracking-widest flex items-center justify-center gap-1 select-none">
                              <AlertCircle size={10} /> Over quota
                            </div>
                          )}
                       </div>
                    </td>
                    <td className="px-4 py-6 text-center select-none">
                       {adm.is_over_quota ? (
                         <span className="px-2.5 py-1 bg-rose-50 text-rose-600 border border-rose-100/50 rounded-lg text-[8px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 select-none">
                           <div className="w-1 h-1 rounded-full bg-rose-500 animate-pulse" /> Overload
                         </span>
                       ) : !adm.is_activated ? (
                         <span className="px-2.5 py-1 bg-amber-50 text-amber-600 border border-amber-100/50 rounded-lg text-[8px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 select-none">
                           <div className="w-1 h-1 rounded-full bg-amber-500" /> Pending
                         </span>
                       ) : (
                         <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100/50 rounded-lg text-[8px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 select-none">
                           <div className="w-1 h-1 rounded-full bg-emerald-500" /> Authorized
                         </span>
                       )}
                    </td>
                    <td className="px-6 md:px-8 py-6 text-right select-none">
                       <div className="flex items-center justify-end gap-2 select-none">
                         {!adm.is_activated && (
                           <button 
                             onClick={() => handleResendActivation(adm.id)}
                             className="p-2 text-amber-500 hover:text-amber-600 hover:bg-amber-50/50 bg-amber-50/30 border border-amber-100/50 rounded-xl transition-all shadow-sm select-none"
                             title="Resend Activation Link"
                           >
                             <Mail size={14} />
                           </button>
                         )}
                         <button 
                           onClick={() => setEditingAdmin({...adm})}
                           className="p-2 text-slate-400 hover:text-red-600 hover:bg-slate-50/60 bg-slate-50/30 border border-slate-100/60 rounded-xl transition-all shadow-sm select-none"
                           title="Adjust Quota"
                         >
                           <Settings size={14} />
                         </button>
                         <button 
                           onClick={() => handleDeleteAdmin(adm.id)}
                           className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50/60 bg-slate-50/30 border border-slate-100/60 rounded-xl transition-all shadow-sm select-none"
                           title="Decommission Node"
                         >
                           <Trash2 size={14} />
                         </button>
                       </div>
                    </td>
                  </tr>
                ))}
                {admins.length === 0 && !isLoading && (
                  <tr className="select-none">
                    <td colSpan="5" className="px-8 py-16 text-center text-slate-300 font-bold italic text-sm select-none">
                      Zero administrative nodes provisioned. Start by adding an Admin.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Provisioning Modal Overlay */}
      <AnimatePresence>
        {isAddingAdmin && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 select-none">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingAdmin(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm select-none" 
            />
            <motion.div 
              initial={{ scale: 0.96, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 15 }}
              className="bg-white w-full max-w-[480px] rounded-[36px] shadow-xl relative z-10 overflow-hidden border border-slate-100/80 select-none"
            >
               <div className="p-8 md:p-10 select-none">
                  <div className="w-14 h-14 bg-red-50 border border-red-100/60 text-red-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm shrink-0 select-none">
                    <Plus size={24} />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-2 uppercase italic leading-tight select-none">Provision Admin</h2>
                  <p className="text-slate-400 font-bold text-sm mb-8 leading-relaxed select-none">
                    Initialize a new administrative sector and define their user capacity boundaries.
                  </p>
                  
                  <form onSubmit={handleProvisionAdmin} className="space-y-6 select-none">
                    <div className="space-y-2 select-none">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1 select-none">Identity Email</label>
                      <div className="relative select-none">
                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 select-none" size={16} />
                        <input 
                          type="email" 
                          required 
                          value={newAdmin.email}
                          onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
                          placeholder="admin@ai-priori.com" 
                          className="w-full pl-12 pr-5 py-4 bg-white border border-slate-100/80 rounded-2xl text-slate-800 font-extrabold focus:border-red-500/30 transition-all outline-none text-sm shadow-sm select-none" 
                        />
                      </div>
                    </div>

                    <div className="space-y-2 select-none">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1 select-none">User Provision Limit: <span className="text-red-600 font-extrabold select-none">{newAdmin.user_limit}</span></label>
                      <input 
                        type="range" 
                        min="1" 
                        max="50" 
                        value={newAdmin.user_limit}
                        onChange={(e) => setNewAdmin({...newAdmin, user_limit: parseInt(e.target.value)})}
                        className="w-full h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-red-600 select-none"
                      />
                      <div className="flex justify-between mt-2 text-[9px] font-black text-slate-300 uppercase tracking-widest select-none">
                        <span>1 User</span>
                        <span>50 Users</span>
                      </div>
                    </div>

                    {error && <p className="text-rose-500 text-[11px] font-extrabold bg-rose-50/50 border border-rose-100 p-3.5 rounded-xl select-text">{error}</p>}

                    <div className="flex gap-3 pt-2 select-none">
                      <button 
                        type="button" 
                        onClick={() => setIsAddingAdmin(false)}
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

        {/* Quota Adjustment Modal Overlay */}
        {editingAdmin && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 select-none">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingAdmin(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm select-none" 
            />
            <motion.div 
              initial={{ scale: 0.96, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 15 }}
              className="bg-white w-full max-w-[480px] rounded-[36px] shadow-xl relative z-10 overflow-hidden border border-slate-100/80 select-none"
            >
               <div className="p-8 md:p-10 select-none">
                  <div className="w-14 h-14 bg-red-50 border border-red-100/60 text-red-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm shrink-0 select-none">
                    <Settings size={24} />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-2 uppercase italic leading-tight select-none">Adjust Quota</h2>
                  <p className="text-slate-400 font-bold text-sm mb-8 leading-relaxed select-none">
                    Modifying capacity boundaries for <span className="text-slate-800 font-extrabold">{editingAdmin.email}</span>.
                  </p>
                  
                  <form onSubmit={handleUpdateQuota} className="space-y-6 select-none">
                    <div className="space-y-2 select-none">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1 select-none">Revised User Limit: <span className="text-red-600 font-extrabold select-none">{editingAdmin.user_limit}</span></label>
                      <input 
                        type="range" 
                        min="1" 
                        max="100" 
                        value={editingAdmin.user_limit}
                        onChange={(e) => setEditingAdmin({...editingAdmin, user_limit: parseInt(e.target.value)})}
                        className="w-full h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-red-600 select-none"
                      />
                      <div className="flex justify-between mt-2 text-[9px] font-black text-slate-300 uppercase tracking-widest select-none">
                        <span>1 Slot</span>
                        <span>100 Slots</span>
                      </div>
                    </div>

                    {error && <p className="text-rose-500 text-[11px] font-extrabold bg-rose-50/50 border border-rose-100 p-3.5 rounded-xl select-text">{error}</p>}

                    <div className="flex gap-3 pt-2 select-none">
                      <button 
                        type="button" 
                        onClick={() => setEditingAdmin(null)}
                        className="flex-1 py-4 bg-slate-50 border border-slate-100 text-slate-500 rounded-2xl font-extrabold text-xs uppercase tracking-widest hover:bg-slate-100/80 transition-all select-none"
                      >
                        Abort
                      </button>
                      <button 
                        type="submit" 
                        disabled={isLoading}
                        className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-extrabold text-xs uppercase tracking-widest shadow-md shadow-red-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 select-none"
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

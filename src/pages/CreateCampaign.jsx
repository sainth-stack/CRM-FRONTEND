import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Megaphone, ArrowRight, AlertCircle, ShieldAlert, Mail } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const CreateCampaign = () => {
  const { user } = useAuth();
  const [campaignName, setCampaignName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const isLimitReached = user?.is_demo && user?.has_used_trial_quota;

  const handleNext = (e) => {
    e.preventDefault();
    if (isLimitReached) return;
    
    if (!campaignName.trim()) {
      setError("Please give your campaign a descriptive name.");
      return;
    }
    setError("");
    navigate("/create/query", { state: { campaignName } });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center relative px-6 overflow-hidden select-none">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[100px] opacity-40" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[500px] bg-white rounded-[36px] shadow-sm p-10 md:p-12 relative z-10 border border-slate-100/80"
      >
        {isLimitReached ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-rose-50/50 rounded-2xl flex items-center justify-center mb-6 mx-auto border border-rose-100">
              <ShieldAlert className="w-7 h-7 text-rose-600" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-800 mb-3 tracking-tight uppercase italic leading-tight">
              Trial Limit Reached
            </h2>
            <p className="text-slate-400 font-medium mb-6 text-sm leading-relaxed select-text">
              You have already utilized your 1-campaign entitlement for this trial period. 
              Upgrade to professional access to continue mobilizing unlimited outreach fleets.
            </p>
            
            <a 
              href="mailto:sales@ai-priori.com?subject=AI-PRIORI%20Professional%20Access%20Request"
              className="flex items-center justify-center gap-3 w-full py-4 bg-slate-900 text-white font-extrabold rounded-2xl hover:bg-black transition-all mb-4 text-xs uppercase tracking-widest shadow-sm"
            >
              <Mail className="w-4 h-4" />
              Contact Sales for Upgrade
            </a>
            
            <Link 
              to="/" 
              className="text-slate-400 hover:text-red-600 text-[12px] font-bold transition-colors select-none uppercase tracking-wider"
            >
              Return to dashboard
            </Link>
          </div>
        ) : (
          <>
            {/* Icon Banner */}
            <div className="w-14 h-14 bg-red-50 border border-red-100/60 rounded-xl flex items-center justify-center mb-8 shrink-0">
              <Megaphone className="w-6 h-6 text-red-600" />
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-3 tracking-tight uppercase italic leading-tight select-none">
              Create Campaign
            </h1>
            
            <p className="text-slate-400 font-bold mb-8 text-sm leading-relaxed select-none">
              Define the identifying context for your new outbound mission. 
              This will serve as your core campaign label.
            </p>

            <form onSubmit={handleNext} className="space-y-6">
              <div className="space-y-2 relative">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 select-none">
                    Campaign Name
                 </label>
                 <input
                   type="text"
                   value={campaignName}
                   onChange={(e) => {
                     setCampaignName(e.target.value);
                     if (error) setError("");
                   }}
                   placeholder="e.g., Q4 Enterprise Outreach"
                   className={`w-full bg-white border rounded-2xl px-5 py-4 text-slate-800 font-extrabold focus:bg-white outline-none transition-all placeholder:text-slate-300 shadow-sm text-sm ${
                     error ? "border-rose-500 bg-rose-50/10 focus:border-rose-500" : "border-slate-100/80 focus:border-red-500/30"
                   }`}
                 />
                 
                 <AnimatePresence>
                   {error && (
                     <motion.div 
                       initial={{ opacity: 0, y: -10 }}
                       animate={{ opacity: 1, y: 0 }}
                       exit={{ opacity: 0, y: -10 }}
                       className="absolute -bottom-6 left-1 flex items-center gap-1.5 text-rose-600 text-[10px] font-bold select-none leading-none"
                     >
                       <AlertCircle size={12} />
                       {error}
                     </motion.div>
                   )}
                 </AnimatePresence>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2.5 uppercase tracking-widest shadow-lg shadow-red-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all select-none mt-4"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link 
                to="/" 
                className="text-slate-400 hover:text-red-600 text-[12px] font-bold transition-colors uppercase tracking-wider select-none"
              >
                Cancel and return
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default CreateCampaign;

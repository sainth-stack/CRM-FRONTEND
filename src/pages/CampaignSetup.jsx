import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Zap, AlertCircle, Loader2 } from "lucide-react";
import axios from "axios";
import API_BASE_URL from "../config";

const CampaignSetup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const campaignName = location.state?.campaignName || "New Campaign";
  
  const [userUrl, setUserUrl] = useState("");
  const [targetIndustry, setTargetIndustry] = useState("");
  const [targetLocation, setTargetLocation] = useState("");
  const [targetEmployeeCount, setTargetEmployeeCount] = useState("51-200");
  const [prompt, setPrompt] = useState("");
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState("");

  const validateUrl = (url) => {
    if (!url.trim()) return false;
    const domainRegex = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,24}([/\w .-]*)*\/?$/i;
    return domainRegex.test(url);
  };

  const handleUrlChange = (val) => {
    let cleanVal = val.trim();
    if (cleanVal && !cleanVal.startsWith("http://") && !cleanVal.startsWith("https://")) {
      // Only prefix if it looks like they are starting a domain (e.g. has a dot or enough chars)
      if (cleanVal.includes(".") || cleanVal.length > 5) {
        cleanVal = "https://" + cleanVal;
      }
    }
    setUserUrl(cleanVal);
    if (validateUrl(cleanVal)) {
      setIsVerified(true);
      setError("");
    } else {
      setIsVerified(false);
    }
  };

  const handleStart = async (e) => {
    e.preventDefault();
    
    if (!isVerified) {
      setError("Mission Origin URL must be verified before deployment.");
      return;
    }
    if (targetIndustry.trim().length < 2) {
      setError("Please specify the target industry (min 2 chars).");
      return;
    }
    if (targetLocation.trim().length < 2) {
      setError("Please specify the target location (min 2 chars).");
      return;
    }
    if (!file) {
      setError("Please upload a CSV lead source before deployment.");
      return;
    }
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("Only CSV lead source files are supported.");
      return;
    }

    setError("");
    setIsLoading(true);

    const formData = new FormData();
    formData.append("name", campaignName);
    formData.append("user_url", userUrl);
    formData.append("target_industry", targetIndustry);
    formData.append("target_location", targetLocation);
    formData.append("target_employee_count", targetEmployeeCount);
    formData.append("prompt", prompt);
    formData.append("file", file);

    try {
      const response = await axios.post(`${API_BASE_URL}/campaigns`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data?.status === "needs_clarification") {
        const questions = response.data.clarification_questions || [];
        setError(questions[0] || "Please clarify the campaign setup inputs before continuing.");
        return;
      }
      const campaignId = response.data.id;
      navigate(`/campaign/${campaignId}`);
    } catch (error) {
      console.error("Error starting campaign:", error);
      setError(error.response?.data?.detail || "Deployment failed. System synchronization error.");
    } finally {
      setIsLoading(false);
    }
  };

  const canDeploy = isVerified && targetIndustry.trim().length >= 2 && targetLocation.trim().length >= 2 && !!file && !isLoading;

  const getButtonText = () => {
    if (isLoading) return "Validating Inputs...";
    if (!isVerified) return "Verify URL to Enable";
    if (targetIndustry.trim().length < 2) return "Specify Industry to Enable";
    if (targetLocation.trim().length < 2) return "Specify Location to Enable";
    if (!file) return "Upload CSV to Enable";
    return "Validate Campaign Inputs";
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center relative px-6 overflow-hidden py-20">
      {/* Background Decorative Rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] bg-brand-primary/5 rounded-full blur-[100px] opacity-50" />
        <div className="absolute w-[400px] h-[400px] border border-brand-primary/5 rounded-full" />
        <div className="absolute w-[800px] h-[800px] border border-brand-primary/5 rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[600px] bg-white rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-12 relative z-10 border border-zinc-100"
      >
        {/* Icon Header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-14 h-14 bg-brand-primary/5 border border-brand-primary/10 rounded-2xl flex items-center justify-center">
            <Bot className="w-7 h-7 text-brand-primary" />
          </div>
          <div>
             <h1 className="text-2xl font-black text-[#1e293b] tracking-tight leading-none italic uppercase">
              Campaign Setup
            </h1>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mt-2">Input Validation</p>
          </div>
        </div>
        
        <form onSubmit={handleStart} className="space-y-8">
          {/* Phase 1: Mission Origin */}
          <div className="space-y-4">
             <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-brand-primary rounded-full" />
                  <label className="text-[12px] font-black text-[#1e293b] uppercase tracking-wider">
                    Mission Origin (URL)
                  </label>
                </div>
                <AnimatePresence>
                  {isVerified && (
                    <motion.span 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-1 text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100"
                    >
                      <Zap size={10} className="fill-emerald-500" /> Verified
                    </motion.span>
                  )}
                </AnimatePresence>
             </div>
             <div className="relative">
                <input
                  type="text"
                  value={userUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="e.g., ai-priori.solutions"
                  className={`w-full bg-zinc-50 border rounded-2xl px-6 py-4 text-[#1e293b] font-bold focus:bg-white outline-none transition-all placeholder:text-zinc-300 shadow-sm text-sm ${
                    isVerified ? "border-emerald-500/30 bg-emerald-50/5" : "border-zinc-200 focus:border-brand-primary"
                  }`}
                />
             </div>
          </div>

          {/* Campaign targeting inputs */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                 <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-4 bg-indigo-500 rounded-full" />
                    <label className="text-[12px] font-black text-[#1e293b] uppercase tracking-wider">
                      Target Industry
                    </label>
                 </div>
                 <input
                    type="text"
                    value={targetIndustry}
                    onChange={(e) => setTargetIndustry(e.target.value)}
                    placeholder="e.g., SaaS, Fintech"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-6 py-4 text-[#1e293b] font-bold focus:bg-white focus:border-brand-primary outline-none transition-all placeholder:text-zinc-300 shadow-sm text-sm"
                 />
              </div>

              <div className="space-y-4">
                 <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-4 bg-purple-500 rounded-full" />
                    <label className="text-[12px] font-black text-[#1e293b] uppercase tracking-wider">
                      Target Location
                    </label>
                 </div>
                 <input
                    type="text"
                    value={targetLocation}
                    onChange={(e) => setTargetLocation(e.target.value)}
                    placeholder="e.g., London, USA"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-6 py-4 text-[#1e293b] font-bold focus:bg-white focus:border-brand-primary outline-none transition-all placeholder:text-zinc-300 shadow-sm text-sm"
                 />
              </div>
            </div>

            <div className="space-y-4">
               <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-4 bg-amber-500 rounded-full" />
                    <label className="text-[12px] font-black text-[#1e293b] uppercase tracking-wider">
                      Employee Count <span className="text-zinc-400 lowercase italic">(Optional)</span>
                    </label>
                  </div>
               </div>
               <select
                  value={targetEmployeeCount}
                  onChange={(e) => setTargetEmployeeCount(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-6 py-4 text-[#1e293b] font-bold focus:bg-white focus:border-brand-primary outline-none transition-all shadow-sm text-sm"
               >
                 <option>1-10</option>
                 <option>11-50</option>
                 <option>51-200</option>
                 <option>201-500</option>
                 <option>501-1000</option>
                 <option>1000+</option>
               </select>
            </div>

            <div className="space-y-4">
               <div className="flex items-center gap-2 mb-2">
                  <div className="w-1 h-4 bg-red-500 rounded-full" />
                  <label className="text-[12px] font-black text-[#1e293b] uppercase tracking-wider">
                    Strategic Mission Context (Prompt)
                  </label>
               </div>
               <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., Target companies struggling with AI scaling who need fractional CTO services..."
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-6 py-4 text-[#1e293b] font-bold focus:bg-white focus:border-brand-primary outline-none transition-all placeholder:text-zinc-300 shadow-sm text-sm h-32"
               />
            </div>

            <div className="space-y-4">
               <div className="flex items-center gap-2 mb-2">
                  <div className="w-1 h-4 bg-emerald-500 rounded-full" />
                  <label className="text-[12px] font-black text-[#1e293b] uppercase tracking-wider">
                    Prospect CSV Injection <span className="text-zinc-400 lowercase italic">(Required for seed targeting)</span>
                  </label>
               </div>
               <div className="relative border-2 border-dashed border-zinc-200 rounded-2xl p-8 text-center hover:border-brand-primary transition-colors cursor-pointer bg-zinc-50/50">
                  <input 
                    type="file" 
                    accept=".csv"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={e => setFile(e.target.files[0])}
                  />
                  <p className="text-sm font-bold text-zinc-500">
                    {file ? file.name : "Click to upload target CSV file"}
                  </p>
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-2">Strictly .CSV Format Authorization</p>
               </div>
            </div>
          </div>

          <div className="relative pt-2">
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute -top-4 left-1 flex items-center gap-1.5 text-red-500 text-[11px] font-bold"
                >
                  <AlertCircle size={14} />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={!canDeploy}
              className={`w-full py-5 rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-2xl transition-all ${
                canDeploy 
                ? "bg-black text-white hover:bg-zinc-800 hover:scale-[1.02] active:scale-95 cursor-pointer" 
                : "bg-zinc-100 text-zinc-400 cursor-not-allowed opacity-70"
              }`}
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className={`w-5 h-5 ${canDeploy ? 'fill-brand-primary text-brand-primary' : 'text-zinc-300'}`} />}
              {getButtonText()}
            </button>
          </div>
        </form>


        <div className="mt-10 text-center">
          <Link 
            to="/create" 
            className="text-zinc-400 hover:text-brand-primary text-[11px] font-black uppercase tracking-widest transition-colors"
          >
            Modify Mission Parameters
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default CampaignSetup;

import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  BadgeCheck,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Loader2,
  ChevronRight,
  UploadCloud,
  FileSpreadsheet,
  X,
} from "lucide-react";
import axios from "axios";
import API_BASE_URL from "../config";

// Matches the backend cap: sanitize_text(prompt, max_length=2000) in campaigns.py
const PROMPT_MAX = 2000;

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
      setError("Please enter a valid website URL.");
      return;
    }
    if (targetIndustry.trim().length < 2) {
      setError("Please add a target industry.");
      return;
    }
    if (targetLocation.trim().length < 2) {
      setError("Please add a target location.");
      return;
    }
    if (!file) {
      setError("Please upload a prospect list (CSV) to continue.");
      return;
    }
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("Only .CSV files are supported.");
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
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data?.status === "needs_clarification") {
        const questions = response.data.clarification_questions || [];
        setError(questions[0] || "Please clarify the campaign details before continuing.");
        return;
      }
      const campaignId = response.data.id;
      navigate(`/campaign/${campaignId}`);
    } catch (error) {
      console.error("Error starting campaign:", error);
      setError(error.response?.data?.detail || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const canDeploy =
    isVerified &&
    targetIndustry.trim().length >= 2 &&
    targetLocation.trim().length >= 2 &&
    !!file &&
    !isLoading;

  const getButtonText = () => {
    if (isLoading) return "Creating campaign…";
    if (!isVerified) return "Enter your website to continue";
    if (targetIndustry.trim().length < 2) return "Add a target industry";
    if (targetLocation.trim().length < 2) return "Add a target location";
    if (!file) return "Upload a prospect list";
    return "Create campaign";
  };

  // Shared input styling (the global dark theme also enforces dark bg + cyan focus).
  const inputClass =
    "w-full bg-[#060a14]/70 border border-zinc-800 rounded-xl px-4 py-3 text-sm font-medium text-white placeholder:text-zinc-600 outline-none transition-all focus:border-[#00f0ff]";

  return (
    <div className="relative w-full px-4 sm:px-6 lg:px-10 py-10 md:py-14">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[640px] h-[640px] bg-[#00f0ff]/[0.06] blur-[150px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-3xl mx-auto"
      >
        {/* ===== Page header ===== */}
        <div className="mb-7">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-500 mb-4">
            <Link to="/create" className="hover:text-[#00f0ff] transition-colors">
              New campaign
            </Link>
            <ChevronRight size={13} className="text-zinc-600" />
            <span className="text-zinc-300">Targeting details</span>
            <span className="ml-2 px-2 py-0.5 rounded-full bg-zinc-800/60 border border-zinc-700/50 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              Step 2 of 2
            </span>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#00f0ff]/10 border border-[#00f0ff]/20 flex items-center justify-center shrink-0">
              <Globe className="w-6 h-6 text-[#00f0ff]" />
            </div>
            <div>
              <h1 className="text-white font-bold tracking-tight leading-tight">Campaign setup</h1>
              <p className="text-sm text-zinc-400 mt-1.5 leading-relaxed max-w-xl">
                Tell us who to reach. We&apos;ll research each prospect and draft personalized
                outreach for{" "}
                <span className="text-zinc-200 font-semibold">{campaignName}</span>.
              </p>
            </div>
          </div>
        </div>

        {/* ===== Form card ===== */}
        <form
          onSubmit={handleStart}
          className="relative rounded-2xl border border-zinc-800/80 bg-[#0a0f1c]/70 backdrop-blur-xl shadow-[0_24px_80px_-20px_rgba(0,0,0,0.6)] overflow-hidden"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00f0ff]/60 to-transparent" />

          <div className="p-6 sm:p-8 space-y-7">
            {/* Website */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[12px] font-semibold uppercase tracking-wider text-zinc-300">
                  Your website
                </label>
                <AnimatePresence>
                  {isVerified && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20"
                    >
                      <BadgeCheck size={11} /> Verified
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              <input
                type="text"
                value={userUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="yourcompany.com"
                className={inputClass}
              />
              <p className="text-[11px] text-zinc-500 mt-2">
                We analyze this to understand your product and positioning.
              </p>
            </div>

            {/* Industry + Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[12px] font-semibold uppercase tracking-wider text-zinc-300 mb-2">
                  Target industry
                </label>
                <input
                  type="text"
                  value={targetIndustry}
                  onChange={(e) => setTargetIndustry(e.target.value)}
                  placeholder="e.g. SaaS, Fintech"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold uppercase tracking-wider text-zinc-300 mb-2">
                  Target location
                </label>
                <input
                  type="text"
                  value={targetLocation}
                  onChange={(e) => setTargetLocation(e.target.value)}
                  placeholder="e.g. London, USA"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Company size */}
            <div>
              <label className="block text-[12px] font-semibold uppercase tracking-wider text-zinc-300 mb-2">
                Company size{" "}
                <span className="text-zinc-500 normal-case font-medium tracking-normal">(optional)</span>
              </label>
              <select
                value={targetEmployeeCount}
                onChange={(e) => setTargetEmployeeCount(e.target.value)}
                className={`${inputClass} appearance-none cursor-pointer`}
              >
                <option>1-10</option>
                <option>11-50</option>
                <option>51-200</option>
                <option>201-500</option>
                <option>501-1000</option>
                <option>1000+</option>
              </select>
            </div>

            {/* Campaign context */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[12px] font-semibold uppercase tracking-wider text-zinc-300">
                  Campaign context{" "}
                  <span className="text-zinc-500 normal-case font-medium tracking-normal">(optional)</span>
                </label>
                <span
                  className={`text-[11px] font-semibold tabular-nums ${
                    prompt.length >= PROMPT_MAX
                      ? "text-rose-400"
                      : prompt.length >= PROMPT_MAX * 0.9
                      ? "text-amber-400"
                      : "text-zinc-500"
                  }`}
                >
                  {prompt.length}/{PROMPT_MAX}
                </span>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value.slice(0, PROMPT_MAX))}
                maxLength={PROMPT_MAX}
                placeholder="Describe who you're targeting and the value you offer — e.g. companies scaling AI who need fractional CTO services."
                className={`${inputClass} h-28 resize-none leading-relaxed`}
              />
              <p className="text-[11px] text-zinc-500 mt-2">
                The more context you give, the sharper the personalization.
              </p>
            </div>

            {/* Prospect list */}
            <div>
              <label className="block text-[12px] font-semibold uppercase tracking-wider text-zinc-300 mb-2">
                Prospect list
              </label>

              {file ? (
                <div className="flex items-center gap-3 rounded-xl border border-[#00f0ff]/25 bg-[#00f0ff]/[0.04] px-4 py-3.5">
                  <div className="w-9 h-9 rounded-lg bg-[#00f0ff]/10 border border-[#00f0ff]/20 flex items-center justify-center shrink-0">
                    <FileSpreadsheet size={17} className="text-[#00f0ff]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white truncate">{file.name}</p>
                    <p className="text-[11px] text-zinc-500">
                      {(file.size / 1024).toFixed(0)} KB · ready to import
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800/60 transition-colors shrink-0"
                    aria-label="Remove file"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="relative rounded-xl border-2 border-dashed border-zinc-800 hover:border-[#00f0ff]/50 hover:bg-[#00f0ff]/[0.02] transition-colors px-6 py-8 text-center cursor-pointer">
                  <input
                    type="file"
                    accept=".csv"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => setFile(e.target.files[0])}
                  />
                  <UploadCloud size={26} className="mx-auto text-zinc-500 mb-2.5" />
                  <p className="text-sm font-semibold text-zinc-300">
                    Drag &amp; drop or{" "}
                    <span className="text-[#00f0ff]">browse</span> to upload
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-1">.CSV files only</p>
                </div>
              )}
            </div>
          </div>

          {/* ===== Footer action bar ===== */}
          <div className="border-t border-zinc-800/70 bg-[#070b14]/70 px-6 sm:px-8 py-5">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="flex items-center gap-2 text-rose-400 text-[12px] font-semibold mb-4"
                >
                  <AlertCircle size={14} className="shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between gap-4">
              <Link
                to="/create"
                className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-zinc-400 hover:text-white transition-colors"
              >
                <ArrowLeft size={15} />
                Back
              </Link>

              <button
                type="submit"
                disabled={!canDeploy}
                className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold tracking-tight transition-all ${
                  canDeploy
                    ? "bg-[#00f0ff] text-zinc-950 hover:bg-[#26f3ff] shadow-[0_0_24px_rgba(0,240,255,0.25)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                    : "bg-zinc-800/80 text-zinc-500 cursor-not-allowed"
                }`}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {getButtonText()}
                    {canDeploy && <ArrowRight size={16} />}
                  </>
                )}
                {isLoading && getButtonText()}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CampaignSetup;

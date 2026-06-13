import { useState, useRef, useEffect } from "react";
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
  ChevronDown,
  Check,
  UploadCloud,
  FileSpreadsheet,
  X,
} from "lucide-react";
import axios from "axios";
import API_BASE_URL from "../config";

// Matches the backend cap: sanitize_text(prompt, max_length=2000) in campaigns.py
const PROMPT_MAX = 2000;

const SIZE_BANDS = ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"];

const INPUT_CLASS =
  "w-full bg-[#060a14]/70 border border-zinc-800 rounded-xl px-4 py-3 text-sm font-medium text-white placeholder:text-zinc-600 outline-none transition-all focus:border-[#00f0ff]";

// Error state ring: red border + soft glow so invalid fields stand out (Google / Meta style).
const INPUT_ERROR_CLASS =
  "border-rose-500/70 ring-2 ring-rose-500/30 focus:border-rose-500";

// Small required-field marker shown next to mandatory labels.
function RequiredMark() {
  return (
    <span className="text-rose-400 ml-0.5" aria-hidden="true">
      *
    </span>
  );
}

// Inline, field-level error message rendered directly beneath a field.
function FieldError({ message }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          className="flex items-center gap-1.5 text-rose-400 text-[11px] font-semibold mt-2"
          role="alert"
        >
          <AlertCircle size={12} className="shrink-0" />
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

// Module-level so it is NOT redefined on every parent render (which would remount
// the <input> and drop focus after each keystroke).
function ChipField({ label, placeholder, list, value, onChange, onKeyDown, onBlur, onRemove, error, inputRef }) {
  return (
    <div>
      <label className="block text-[12px] font-semibold uppercase tracking-wider text-zinc-300 mb-2">
        {label}
        <RequiredMark />
      </label>
      <div
        className={`${INPUT_CLASS} flex flex-wrap gap-2 items-center min-h-[46px] py-2 ${
          error ? INPUT_ERROR_CLASS : ""
        }`}
      >
        {list.map((chip, idx) => (
          <span
            key={`${chip}-${idx}`}
            className="inline-flex items-center gap-1 bg-[#00f0ff]/10 border border-[#00f0ff]/25 text-[#aef6ff] text-xs font-semibold rounded-md px-2 py-1"
          >
            {chip}
            <button
              type="button"
              onClick={() => onRemove(idx)}
              className="text-[#7fdfe8] hover:text-white"
              aria-label={`Remove ${chip}`}
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onBlur={onBlur}
          aria-invalid={!!error}
          placeholder={list.length === 0 ? placeholder : "Add another…"}
          className="flex-1 min-w-[120px] bg-transparent outline-none text-sm text-white placeholder:text-zinc-600"
        />
      </div>
      {error ? (
        <FieldError message={error} />
      ) : (
        <p className="text-[11px] text-zinc-500 mt-2">Type and press Enter or comma to add multiple.</p>
      )}
    </div>
  );
}

const CampaignSetup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const campaignName = location.state?.campaignName || "New Campaign";

  const [userUrl, setUserUrl] = useState("");
  // Multi-value targeting: one or more industries / locations / size bands.
  const [industries, setIndustries] = useState([]);
  const [industryInput, setIndustryInput] = useState("");
  const [locations, setLocations] = useState([]);
  const [locationInput, setLocationInput] = useState("");
  const [sizes, setSizes] = useState(["51-200"]);
  const [prompt, setPrompt] = useState("");
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState("");
  // Per-field validation errors, keyed by field name (MAANG-style inline errors).
  const [fieldErrors, setFieldErrors] = useState({});

  // Company-size dropdown open/close state + outside-click handling.
  const [sizeOpen, setSizeOpen] = useState(false);

  // Refs so we can scroll to / focus the first invalid field on submit.
  const urlRef = useRef(null);
  const industryRef = useRef(null);
  const locationRef = useRef(null);
  const sizeRef = useRef(null);
  const promptRef = useRef(null);
  const fileRef = useRef(null);

  // Close the size dropdown when clicking anywhere outside it.
  useEffect(() => {
    if (!sizeOpen) return;
    const onClick = (e) => {
      if (sizeRef.current && !sizeRef.current.contains(e.target)) setSizeOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [sizeOpen]);

  const clearFieldError = (field) =>
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });

  const validateUrl = (url) => {
    if (!url.trim()) return false;
    const domainRegex = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,24}([/\w .-]*)*\/?$/i;
    return domainRegex.test(url);
  };

  const handleUrlChange = (val) => {
    let cleanVal = val.trim();
    if (cleanVal && !cleanVal.startsWith("http://") && !cleanVal.startsWith("https://")) {
      if (cleanVal.includes(".") || cleanVal.length > 5) {
        cleanVal = "https://" + cleanVal;
      }
    }
    setUserUrl(cleanVal);
    if (validateUrl(cleanVal)) {
      setIsVerified(true);
      setError("");
      clearFieldError("url");
    } else {
      setIsVerified(false);
    }
  };

  // --- Chip helpers (industry / location) ---
  const addChips = (raw, list, setList, setInput, fieldKey) => {
    const parts = raw
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length) {
      const merged = [...list];
      for (const p of parts) {
        if (!merged.some((x) => x.toLowerCase() === p.toLowerCase())) merged.push(p);
      }
      setList(merged);
      if (fieldKey) clearFieldError(fieldKey);
    }
    setInput("");
    if (error) setError("");
  };

  const handleChipKeyDown = (e, value, list, setList, setInput, fieldKey) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (value.trim()) addChips(value, list, setList, setInput, fieldKey);
    } else if (e.key === "Backspace" && !value && list.length) {
      setList(list.slice(0, -1));
    }
  };

  const removeChip = (idx, list, setList) => setList(list.filter((_, i) => i !== idx));

  const toggleSize = (band) => {
    setSizes((prev) =>
      prev.includes(band) ? prev.filter((b) => b !== band) : [...prev, band]
    );
    if (error) setError("");
    clearFieldError("sizes");
  };

  const handleStart = async (e) => {
    e.preventDefault();

    // Flush any text left in the chip inputs into the lists before validating.
    const finalIndustries = industryInput.trim()
      ? [...industries, ...industryInput.split(",").map((s) => s.trim()).filter(Boolean)]
      : industries;
    const finalLocations = locationInput.trim()
      ? [...locations, ...locationInput.split(",").map((s) => s.trim()).filter(Boolean)]
      : locations;

    // Collect ALL field-level errors at once so every invalid field highlights
    // simultaneously (instead of surfacing one error at a time).
    const errors = {};
    if (!isVerified) {
      errors.url = !userUrl.trim()
        ? "Website is required."
        : "Enter a valid website URL (e.g. yourcompany.com).";
    }
    if (finalIndustries.length === 0) errors.industries = "Add at least one target industry.";
    if (finalLocations.length === 0) errors.locations = "Add at least one target location.";
    if (sizes.length === 0) errors.sizes = "Select at least one company size band.";
    if (!prompt.trim()) errors.prompt = "Add campaign context so we can personalize outreach.";
    if (!file) {
      errors.file = "Upload a prospect list (CSV) to continue.";
    } else if (!file.name.toLowerCase().endsWith(".csv")) {
      errors.file = "Only .CSV files are supported.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("");
      // Scroll to and focus the first invalid field, in visual order.
      const order = [
        ["url", urlRef],
        ["industries", industryRef],
        ["locations", locationRef],
        ["sizes", sizeRef],
        ["prompt", promptRef],
        ["file", fileRef],
      ];
      const first = order.find(([key]) => errors[key]);
      if (first?.[1]?.current) {
        first[1].current.scrollIntoView({ behavior: "smooth", block: "center" });
        if (typeof first[1].current.focus === "function") first[1].current.focus({ preventScroll: true });
      }
      return;
    }

    setFieldErrors({});
    setError("");
    setIsLoading(true);

    const formData = new FormData();
    formData.append("name", campaignName);
    formData.append("user_url", userUrl);
    // Multi-values are sent comma-joined; the backend treats them as one-or-more.
    formData.append("target_industry", finalIndustries.join(", "));
    formData.append("target_location", finalLocations.join(", "));
    formData.append("target_employee_count", sizes.join(", "));
    formData.append("prompt", prompt);
    formData.append("file", file);

    try {
      const response = await axios.post(`${API_BASE_URL}/campaigns`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
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

  const hasIndustry = industries.length > 0 || industryInput.trim().length > 0;
  const hasLocation = locations.length > 0 || locationInput.trim().length > 0;
  const hasContext = prompt.trim().length > 0;
  const canDeploy =
    isVerified && hasIndustry && hasLocation && sizes.length > 0 && hasContext && !!file && !isLoading;

  const getButtonText = () => {
    if (isLoading) return "Creating campaign…";
    if (!isVerified) return "Enter your website to continue";
    if (!hasIndustry) return "Add a target industry";
    if (!hasLocation) return "Add a target location";
    if (sizes.length === 0) return "Select a company size";
    if (!hasContext) return "Add campaign context";
    if (!file) return "Upload a prospect list";
    return "Create campaign";
  };

  const inputClass = INPUT_CLASS;

  return (
    <div className="relative w-full px-4 sm:px-6 lg:px-10 py-10 md:py-14">
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
                  <RequiredMark />
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
                ref={urlRef}
                type="text"
                value={userUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                aria-invalid={!!fieldErrors.url}
                placeholder="yourcompany.com"
                className={`${inputClass} ${fieldErrors.url ? INPUT_ERROR_CLASS : ""}`}
              />
              {fieldErrors.url ? (
                <FieldError message={fieldErrors.url} />
              ) : (
                <p className="text-[11px] text-zinc-500 mt-2">
                  We analyze this to understand your product and positioning.
                </p>
              )}
            </div>

            {/* Industry + Location (multi-value chips) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <ChipField
                label="Target industries"
                placeholder="e.g. SaaS, Fintech"
                list={industries}
                value={industryInput}
                inputRef={industryRef}
                error={fieldErrors.industries}
                onChange={(e) => setIndustryInput(e.target.value)}
                onKeyDown={(e) => handleChipKeyDown(e, industryInput, industries, setIndustries, setIndustryInput, "industries")}
                onBlur={() => industryInput.trim() && addChips(industryInput, industries, setIndustries, setIndustryInput, "industries")}
                onRemove={(idx) => removeChip(idx, industries, setIndustries)}
              />
              <ChipField
                label="Target locations"
                placeholder="e.g. London, USA"
                list={locations}
                value={locationInput}
                inputRef={locationRef}
                error={fieldErrors.locations}
                onChange={(e) => setLocationInput(e.target.value)}
                onKeyDown={(e) => handleChipKeyDown(e, locationInput, locations, setLocations, setLocationInput, "locations")}
                onBlur={() => locationInput.trim() && addChips(locationInput, locations, setLocations, setLocationInput, "locations")}
                onRemove={(idx) => removeChip(idx, locations, setLocations)}
              />
            </div>

            {/* Company size (multi-select dropdown with checkboxes) */}
            <div ref={sizeRef}>
              <label className="block text-[12px] font-semibold uppercase tracking-wider text-zinc-300 mb-2">
                Company size
                <RequiredMark />{" "}
                <span className="text-zinc-500 normal-case font-medium tracking-normal">(select one or more)</span>
              </label>

              <div className="relative">
                {/* Trigger */}
                <button
                  type="button"
                  onClick={() => setSizeOpen((o) => !o)}
                  aria-haspopup="listbox"
                  aria-expanded={sizeOpen}
                  aria-invalid={!!fieldErrors.sizes}
                  className={`${inputClass} flex items-center justify-between gap-2 text-left ${
                    fieldErrors.sizes ? INPUT_ERROR_CLASS : ""
                  } ${sizeOpen ? "border-[#00f0ff]" : ""}`}
                >
                  {sizes.length > 0 ? (
                    <span className="flex flex-wrap gap-1.5">
                      {sizes.map((band) => (
                        <span
                          key={band}
                          className="inline-flex items-center gap-1 bg-[#00f0ff]/10 border border-[#00f0ff]/25 text-[#aef6ff] text-xs font-semibold rounded-md px-2 py-0.5"
                        >
                          {band}
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSize(band);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleSize(band);
                              }
                            }}
                            className="text-[#7fdfe8] hover:text-white cursor-pointer"
                            aria-label={`Remove ${band}`}
                          >
                            <X size={11} />
                          </span>
                        </span>
                      ))}
                    </span>
                  ) : (
                    <span className="text-zinc-600">Select company size…</span>
                  )}
                  <ChevronDown
                    size={16}
                    className={`shrink-0 text-zinc-500 transition-transform ${sizeOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Checkbox menu */}
                <AnimatePresence>
                  {sizeOpen && (
                    <motion.ul
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                      role="listbox"
                      aria-multiselectable="true"
                      className="absolute z-20 mt-2 w-full rounded-xl border border-zinc-800 bg-[#0a0f1c] shadow-[0_24px_60px_-20px_rgba(0,0,0,0.8)] overflow-hidden p-1"
                    >
                      {SIZE_BANDS.map((band) => {
                        const active = sizes.includes(band);
                        return (
                          <li key={band} role="option" aria-selected={active}>
                            <button
                              type="button"
                              onClick={() => toggleSize(band)}
                              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-300 hover:bg-[#00f0ff]/[0.06] transition-colors"
                            >
                              <span
                                className={`w-4 h-4 rounded-[5px] border flex items-center justify-center shrink-0 transition-colors ${
                                  active
                                    ? "bg-[#00f0ff] border-[#00f0ff]"
                                    : "border-zinc-600 bg-transparent"
                                }`}
                              >
                                {active && <Check size={12} className="text-zinc-950" strokeWidth={3} />}
                              </span>
                              <span className={active ? "text-[#aef6ff]" : ""}>{band}</span>
                            </button>
                          </li>
                        );
                      })}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>

              <FieldError message={fieldErrors.sizes} />
            </div>

            {/* Campaign context (mandatory) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[12px] font-semibold uppercase tracking-wider text-zinc-300">
                  Campaign context
                  <RequiredMark />
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
                ref={promptRef}
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value.slice(0, PROMPT_MAX));
                  if (e.target.value.trim()) clearFieldError("prompt");
                }}
                maxLength={PROMPT_MAX}
                aria-invalid={!!fieldErrors.prompt}
                placeholder="Describe who you're targeting and the value you offer — e.g. companies scaling AI who need fractional CTO services."
                className={`${inputClass} h-28 resize-none leading-relaxed ${
                  fieldErrors.prompt ? INPUT_ERROR_CLASS : ""
                }`}
              />
              {fieldErrors.prompt ? (
                <FieldError message={fieldErrors.prompt} />
              ) : (
                <p className="text-[11px] text-zinc-500 mt-2">
                  The more context you give, the sharper the personalization.
                </p>
              )}
            </div>

            {/* Prospect list */}
            <div ref={fileRef}>
              <label className="block text-[12px] font-semibold uppercase tracking-wider text-zinc-300 mb-2">
                Prospect list
                <RequiredMark />
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
                <div
                  className={`relative rounded-xl border-2 border-dashed transition-colors px-6 py-8 text-center cursor-pointer ${
                    fieldErrors.file
                      ? "border-rose-500/70 bg-rose-500/[0.04]"
                      : "border-zinc-800 hover:border-[#00f0ff]/50 hover:bg-[#00f0ff]/[0.02]"
                  }`}
                >
                  <input
                    type="file"
                    accept=".csv"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => {
                      setFile(e.target.files[0]);
                      clearFieldError("file");
                    }}
                  />
                  <UploadCloud size={26} className="mx-auto text-zinc-500 mb-2.5" />
                  <p className="text-sm font-semibold text-zinc-300">
                    Drag &amp; drop or <span className="text-[#00f0ff]">browse</span> to upload
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-1">.CSV files only</p>
                </div>
              )}
              <FieldError message={fieldErrors.file} />
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
                disabled={isLoading}
                className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold tracking-tight transition-all ${
                  canDeploy
                    ? "bg-[#00f0ff] text-zinc-950 hover:bg-[#26f3ff] shadow-[0_0_24px_rgba(0,240,255,0.25)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                    : "bg-zinc-800/80 text-zinc-400 hover:bg-zinc-700/80 cursor-pointer"
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

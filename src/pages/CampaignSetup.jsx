import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
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
import API_BASE_URL from "@/config";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const PROMPT_MAX = 2000;
const SIZE_BANDS = ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"];

function RequiredMark() {
  return (
    <span className="text-destructive ml-0.5" aria-hidden="true">
      *
    </span>
  );
}

function FieldError({ message }) {
  if (!message) return null;
  return (
    <p className="flex items-center gap-1.5 text-sm text-destructive mt-2" role="alert">
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      {message}
    </p>
  );
}

function ChipField({ label, placeholder, list, value, onChange, onKeyDown, onBlur, onRemove, error, inputRef }) {
  return (
    <div>
      <Label>
        {label}
        <RequiredMark />
      </Label>
      <div
        className={cn(
          "mt-2 flex flex-wrap gap-2 items-center min-h-[40px] rounded-md border border-input bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          error && "border-destructive ring-2 ring-destructive/30"
        )}
      >
        {list.map((chip, idx) => (
          <span
            key={`${chip}-${idx}`}
            className="inline-flex items-center gap-1 bg-primary/10 border border-primary/20 text-primary text-xs font-medium rounded-md px-2 py-1"
          >
            {chip}
            <button
              type="button"
              onClick={() => onRemove(idx)}
              className="text-primary/70 hover:text-primary"
              aria-label={`Remove ${chip}`}
            >
              <X className="h-3 w-3" />
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
          className="flex-1 min-w-[120px] bg-transparent outline-none text-sm placeholder:text-muted-foreground"
        />
      </div>
      {error ? (
        <FieldError message={error} />
      ) : (
        <p className="text-xs text-muted-foreground mt-2">Type and press Enter or comma to add multiple.</p>
      )}
    </div>
  );
}

const CampaignSetup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const campaignName = location.state?.campaignName || "New Campaign";

  const [userUrl, setUserUrl] = useState("");
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
  const [fieldErrors, setFieldErrors] = useState({});
  const [sizeOpen, setSizeOpen] = useState(false);

  const urlRef = useRef(null);
  const industryRef = useRef(null);
  const locationRef = useRef(null);
  const sizeRef = useRef(null);
  const promptRef = useRef(null);
  const fileRef = useRef(null);

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
    setSizes((prev) => (prev.includes(band) ? prev.filter((b) => b !== band) : [...prev, band]));
    if (error) setError("");
    clearFieldError("sizes");
  };

  const handleStart = async (e) => {
    e.preventDefault();

    const finalIndustries = industryInput.trim()
      ? [...industries, ...industryInput.split(",").map((s) => s.trim()).filter(Boolean)]
      : industries;
    const finalLocations = locationInput.trim()
      ? [...locations, ...locationInput.split(",").map((s) => s.trim()).filter(Boolean)]
      : locations;

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
    } catch (err) {
      console.error("Error starting campaign:", err);
      setError(err.response?.data?.detail || "Something went wrong. Please try again.");
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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link to="/create" className="hover:text-foreground transition-colors">
          New campaign
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground font-medium">Targeting details</span>
        <Badge variant="secondary" className="ml-1 text-[10px]">
          Step 2 of 2
        </Badge>
      </div>

      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Globe className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Campaign setup</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl">
            Tell us who to reach. We&apos;ll research each prospect and draft personalized outreach for{" "}
            <span className="font-medium text-foreground">{campaignName}</span>.
          </p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleStart}>
          <CardContent className="pt-6 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="website">
                  Your website
                  <RequiredMark />
                </Label>
                {isVerified && (
                  <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    <BadgeCheck className="h-3 w-3" /> Verified
                  </span>
                )}
              </div>
              <Input
                ref={urlRef}
                id="website"
                type="text"
                value={userUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                aria-invalid={!!fieldErrors.url}
                placeholder="yourcompany.com"
                className={fieldErrors.url ? "border-destructive" : ""}
              />
              {fieldErrors.url ? (
                <FieldError message={fieldErrors.url} />
              ) : (
                <p className="text-xs text-muted-foreground mt-2">
                  We analyze this to understand your product and positioning.
                </p>
              )}
            </div>

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

            <div ref={sizeRef}>
              <Label>
                Company size
                <RequiredMark />{" "}
                <span className="text-muted-foreground font-normal">(select one or more)</span>
              </Label>
              <div className="relative mt-2">
                <button
                  type="button"
                  onClick={() => setSizeOpen((o) => !o)}
                  aria-haspopup="listbox"
                  aria-expanded={sizeOpen}
                  aria-invalid={!!fieldErrors.sizes}
                  className={cn(
                    "flex h-10 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    fieldErrors.sizes && "border-destructive ring-2 ring-destructive/30"
                  )}
                >
                  {sizes.length > 0 ? (
                    <span className="flex flex-wrap gap-1.5">
                      {sizes.map((band) => (
                        <span
                          key={band}
                          className="inline-flex items-center gap-1 bg-primary/10 border border-primary/20 text-primary text-xs font-medium rounded-md px-2 py-0.5"
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
                            className="text-primary/70 hover:text-primary cursor-pointer"
                            aria-label={`Remove ${band}`}
                          >
                            <X className="h-3 w-3" />
                          </span>
                        </span>
                      ))}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Select company size…</span>
                  )}
                  <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", sizeOpen && "rotate-180")} />
                </button>

                {sizeOpen && (
                  <ul
                    role="listbox"
                    aria-multiselectable="true"
                    className="absolute z-20 mt-2 w-full rounded-md border bg-card shadow-md overflow-hidden p-1"
                  >
                    {SIZE_BANDS.map((band) => {
                      const active = sizes.includes(band);
                      return (
                        <li key={band} role="option" aria-selected={active}>
                          <button
                            type="button"
                            onClick={() => toggleSize(band)}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-sm text-sm hover:bg-muted transition-colors"
                          >
                            <span
                              className={cn(
                                "w-4 h-4 rounded border flex items-center justify-center shrink-0",
                                active ? "bg-primary border-primary text-primary-foreground" : "border-input"
                              )}
                            >
                              {active && <Check className="h-3 w-3" strokeWidth={3} />}
                            </span>
                            <span className={active ? "font-medium" : ""}>{band}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
              <FieldError message={fieldErrors.sizes} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="prompt">
                  Campaign context
                  <RequiredMark />
                </Label>
                <span
                  className={cn(
                    "text-xs tabular-nums",
                    prompt.length >= PROMPT_MAX
                      ? "text-destructive"
                      : prompt.length >= PROMPT_MAX * 0.9
                      ? "text-amber-600"
                      : "text-muted-foreground"
                  )}
                >
                  {prompt.length}/{PROMPT_MAX}
                </span>
              </div>
              <textarea
                ref={promptRef}
                id="prompt"
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value.slice(0, PROMPT_MAX));
                  if (e.target.value.trim()) clearFieldError("prompt");
                }}
                maxLength={PROMPT_MAX}
                aria-invalid={!!fieldErrors.prompt}
                placeholder="Describe who you're targeting and the value you offer — e.g. companies scaling AI who need fractional CTO services."
                className={cn(
                  "flex min-h-[112px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none",
                  fieldErrors.prompt && "border-destructive"
                )}
              />
              {fieldErrors.prompt ? (
                <FieldError message={fieldErrors.prompt} />
              ) : (
                <p className="text-xs text-muted-foreground mt-2">
                  The more context you give, the sharper the personalization.
                </p>
              )}
            </div>

            <div ref={fileRef}>
              <Label>
                Prospect list
                <RequiredMark />
              </Label>

              {file ? (
                <div className="mt-2 flex items-center gap-3 rounded-md border border-primary/30 bg-primary/5 px-4 py-3">
                  <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                    <FileSpreadsheet className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(0)} KB · ready to import
                    </p>
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={() => setFile(null)} aria-label="Remove file">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div
                  className={cn(
                    "relative mt-2 rounded-md border-2 border-dashed px-6 py-8 text-center cursor-pointer transition-colors hover:border-primary/50 hover:bg-muted/50",
                    fieldErrors.file ? "border-destructive bg-destructive/5" : "border-muted-foreground/25"
                  )}
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
                  <UploadCloud className="h-7 w-7 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">
                    Drag &amp; drop or <span className="text-primary">browse</span> to upload
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">.CSV files only</p>
                </div>
              )}
              <FieldError message={fieldErrors.file} />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 border-t pt-6">
            {error && (
              <div className="w-full flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}
            <div className="w-full flex items-center justify-between gap-4">
              <Button variant="ghost" asChild>
                <Link to="/create">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Link>
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    Creating campaign…
                  </>
                ) : (
                  <>
                    {getButtonText()}
                    {canDeploy && <ArrowRight className="h-4 w-4 ml-1" />}
                  </>
                )}
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default CampaignSetup;

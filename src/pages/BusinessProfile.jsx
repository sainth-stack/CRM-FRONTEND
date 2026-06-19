import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Lock,
  ShieldCheck,
  Sliders,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import API_BASE_URL from "@/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function BusinessProfile() {
  const { user, checkAuth } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const loadProfile = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/auth/profile`);
        if (cancelled) return;
        setFullName(res.data.full_name || "");
        setCompanyName(res.data.company_name || "");
        setRoleTitle(res.data.role_title || "");
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to load business profile:", err);
          setError("Unable to load existing profile. You can still fill it in below.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  const validate = () => {
    if (!fullName.trim()) return "Full name is required.";
    if (!companyName.trim()) return "Company name is required.";
    if (!roleTitle.trim()) return "Role / title is required.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    try {
      await axios.put(`${API_BASE_URL}/auth/profile`, {
        full_name: fullName.trim(),
        company_name: companyName.trim(),
        role_title: roleTitle.trim(),
      });

      setSuccess(true);
      await checkAuth();
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      const detail = err?.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail.map((d) => d.msg).join(" "));
      } else if (typeof detail === "string") {
        setError(detail);
      } else {
        setError("Could not save profile information. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Complete your business identity so outreach matches your brand voice.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <ShieldCheck className="mb-1 h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm">Authenticated outreach</CardTitle>
            <CardDescription className="text-xs">
              Verified profile details improve trust with high-value leads.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <Sliders className="mb-1 h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm">Tone calibration</CardTitle>
            <CardDescription className="text-xs">
              Your role and company guide the AI&apos;s linguistic choices.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Business identity</CardTitle>
          <CardDescription>
            These details personalize campaign copy and sender context across the platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Registered email</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ""}
                  readOnly
                  disabled
                  className="pr-10 bg-muted/40"
                />
                <Lock className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">Derived from your authenticated session.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full name</Label>
                <Input
                  id="full_name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Aarav Mehta"
                  maxLength={120}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company_name">Company name</Label>
                <Input
                  id="company_name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. FocalReach AI Labs"
                  maxLength={160}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role_title">Role / title</Label>
              <Input
                id="role_title"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                placeholder="e.g. Founder & CEO"
                maxLength={120}
              />
            </div>

            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {success && !error && (
              <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <p className="text-sm text-emerald-800">Profile saved successfully. Redirecting…</p>
              </div>
            )}

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
              <Button type="submit" variant="brand" size="pill" disabled={saving} className="sm:min-w-[180px]">
                {saving ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    Save profile
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
              <Button type="button" variant="brand-outline" size="pill" asChild>
                <Link to="/change-password">Change password</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

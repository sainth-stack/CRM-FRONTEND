import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { AppLogo } from "@/components/AppLogo";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen min-h-[100dvh] w-full" style={{ background: "#030712" }}>
      <div
        className="flex flex-1 flex-col justify-center px-6 py-10 sm:px-10 md:px-16 lg:px-[70px]"
        style={{ background: "#060a14" }}
      >
        <div className="mb-10 flex flex-col items-center text-center max-w-[420px]">
          <AppLogo size="xl" showWordmark showTagline layout="stacked" />
          <p className="mt-5 text-sm text-white/45 leading-relaxed">
            Sign in to manage campaigns, prospects, and outreach automation.
          </p>
        </div>

        <h1 className="mb-6 text-[22px] font-semibold text-white/90 max-w-[420px]">Welcome back</h1>

        {error && (
          <div className="mb-4 max-w-[420px] rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-5 w-full max-w-[420px]">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-white/70">
              Email<span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="h-11 w-full rounded-full border bg-white/5 px-5 text-sm text-white placeholder:text-white/30 outline-none transition-colors"
              style={{ borderColor: "rgba(255,255,255,0.15)" }}
              onFocus={(e) => (e.target.style.borderColor = "#00f0ff")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.15)")}
              placeholder="Enter your email"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-white/70">
              Password<span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="h-11 w-full rounded-full border bg-white/5 px-5 pr-12 text-sm text-white placeholder:text-white/30 outline-none transition-colors"
                style={{ borderColor: "rgba(255,255,255,0.15)" }}
                onFocus={(e) => (e.target.style.borderColor = "#00f0ff")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.15)")}
                placeholder="Enter your password"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="text-right">
            <Link to="/forgot-password" className="text-sm hover:underline" style={{ color: "#00f0ff" }}>
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="h-11 w-full rounded-full text-sm font-bold text-zinc-950 uppercase transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
            style={{ backgroundColor: "#00f0ff", letterSpacing: "1.5px" }}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = "#26f3ff")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#00f0ff")}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Logging in…
              </>
            ) : (
              "LOGIN"
            )}
          </button>
        </form>

        <p className="mt-10 text-xs text-center max-w-[420px]" style={{ color: "rgba(255,255,255,0.3)" }}>
          © All Rights Reserved, FocalReach AI 2026
        </p>
      </div>

      <div
        className="hidden md:flex w-1/2 flex-col items-center justify-center px-10"
        style={{ background: "#030712" }}
      >
        <h2 className="mb-6 text-center text-[22px] font-bold uppercase" style={{ color: "#00f0ff", letterSpacing: "1px" }}>
          Welcome to FocalReach AI
        </h2>
        <p className="mb-8 text-center text-sm max-w-md" style={{ color: "rgba(255,255,255,0.5)" }}>
          Intelligent B2B cold outreach — research targets, rank leads, and draft hyper-personalized campaigns that convert.
        </p>
        <div
          className="w-full max-w-[520px] rounded-[14px] p-8 border"
          style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}
        >
          <div className="grid grid-cols-2 gap-4 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
            <div className="rounded-lg p-4" style={{ background: "rgba(0,240,255,0.08)" }}>
              <p className="font-semibold text-white mb-1">Targeted Analytics</p>
              <p className="text-xs">AI-powered prospect research</p>
            </div>
            <div className="rounded-lg p-4" style={{ background: "rgba(0,240,255,0.08)" }}>
              <p className="font-semibold text-white mb-1">Personalization</p>
              <p className="text-xs">Context-aware email drafts</p>
            </div>
            <div className="rounded-lg p-4" style={{ background: "rgba(0,240,255,0.08)" }}>
              <p className="font-semibold text-white mb-1">Scale</p>
              <p className="text-xs">Multi-tenant campaign ops</p>
            </div>
            <div className="rounded-lg p-4" style={{ background: "rgba(0,240,255,0.08)" }}>
              <p className="font-semibold text-white mb-1">Deliverability</p>
              <p className="text-xs">Enterprise-grade outreach</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

const ToastContext = createContext(undefined);

const TOAST_STYLES = {
  success: {
    icon: CheckCircle2,
    shell: "border-emerald-200 bg-emerald-50/95 text-emerald-900",
    iconColor: "text-emerald-500",
  },
  error: {
    icon: AlertCircle,
    shell: "border-rose-200 bg-rose-50/95 text-rose-900",
    iconColor: "text-rose-500",
  },
  info: {
    icon: Info,
    shell: "border-slate-200 bg-white/95 text-slate-900",
    iconColor: "text-brand-primary",
  },
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const dismissToast = useCallback((toastId) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== toastId));
  }, []);

  const showToast = useCallback(({ title, description = "", tone = "info", duration = 4000 }) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const normalizedTone = TOAST_STYLES[tone] ? tone : "info";

    setToasts((prev) => [...prev, { id, title, description, tone: normalizedTone }]);

    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, duration);

    return id;
  }, []);

  const value = useMemo(
    () => ({
      showToast,
      dismissToast,
    }),
    [dismissToast, showToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-5 top-5 z-[200] flex w-full max-w-sm flex-col gap-3">
        {toasts.map((toast) => {
          const style = TOAST_STYLES[toast.tone];
          const Icon = style.icon;

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto rounded-2xl border px-4 py-4 shadow-[0_24px_60px_-20px_rgba(15,23,42,0.35)] backdrop-blur ${style.shell}`}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 shrink-0 ${style.iconColor}`}>
                  <Icon size={18} strokeWidth={2.5} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black tracking-tight">{toast.title}</p>
                  {toast.description ? (
                    <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-600">
                      {toast.description}
                    </p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => dismissToast(toast.id)}
                  className="shrink-0 rounded-lg p-1 text-slate-400 transition-colors hover:bg-black/5 hover:text-slate-700"
                  aria-label="Dismiss notification"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

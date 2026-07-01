import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

const TONE_STYLES = {
  danger: { iconBg: "bg-rose-50", icon: "text-rose-500", confirmBtn: "bg-rose-600 hover:bg-rose-700" },
  default: { iconBg: "bg-slate-100", icon: "text-slate-600", confirmBtn: "bg-slate-900 hover:bg-slate-800" },
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  tone = "danger",
  onConfirm,
  onCancel,
}) {
  const style = TONE_STYLES[tone] || TONE_STYLES.default;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-black/40"
          />
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl z-10 p-6"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${style.iconBg} mb-4`}>
              <AlertTriangle size={18} className={style.icon} />
            </div>
            <h3 className="text-base font-bold text-slate-900">{title}</h3>
            {description && (
              <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{description}</p>
            )}
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className={`px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors ${style.confirmBtn}`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

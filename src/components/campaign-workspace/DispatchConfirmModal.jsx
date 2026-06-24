import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Mail, Loader2, X } from "lucide-react";

export const DispatchConfirmModal = ({
  isOpen,
  onClose,
  recipientName,
  recipientEmail,
  scheduledTime,
  onSchedule,
  onSendNow,
  isLoading,
}) => {
  if (!isOpen) return null;

  const parsedTime = scheduledTime ? new Date(scheduledTime) : null;

  const formatScheduledTime = () => {
    if (!parsedTime || isNaN(parsedTime.getTime())) return "Calculating...";
    return parsedTime.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
        />

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md bg-white rounded-[28px] border border-surgical-border shadow-2xl shadow-surgical-navy/10 p-8 space-y-6"
        >
          <button
            onClick={onClose}
            disabled={isLoading}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all disabled:opacity-50"
          >
            <X size={18} />
          </button>

          <div className="space-y-1">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Confirm Deployment</h2>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Email Dispatch Options</p>
          </div>

          <div className="space-y-4">
            {/* Recipient */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Recipient</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-surgical-navy/10 text-surgical-navy flex items-center justify-center font-bold text-xs">
                  {(recipientName || "P")[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{recipientName}</p>
                  <p className="text-[10px] text-slate-500">{recipientEmail}</p>
                </div>
              </div>
            </div>

            {/* Scheduled time */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 space-y-1">
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">If Scheduled</p>
              <div className="flex items-center gap-2 text-blue-700">
                <Calendar size={14} strokeWidth={3} />
                <span className="text-sm font-bold">{formatScheduledTime()}</span>
              </div>
              <p className="text-[10px] text-blue-500 italic">
                Optimal slot based on recipient timezone and delivery windows.
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>

            <button
              onClick={onSchedule}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 size={12} className="animate-spin" /> : <Calendar size={12} />}
              Schedule
            </button>

            <button
              onClick={onSendNow}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-surgical-navy hover:bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md shadow-surgical-navy/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 size={12} className="animate-spin" /> : <Mail size={12} />}
              Send Now
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles } from "lucide-react";

const ComingSoon = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#050505] px-6 overflow-hidden">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[640px] h-[640px] bg-[#00f0ff]/[0.07] blur-[160px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-col items-center text-center max-w-lg"
      >
        <div className="w-16 h-16 rounded-2xl bg-[#00f0ff]/10 border border-[#00f0ff]/20 flex items-center justify-center mb-7">
          <Sparkles className="w-7 h-7 text-[#00f0ff]" />
        </div>

        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#00f0ff] mb-4">
          Contact Us
        </span>

        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
          Coming Soon
        </h1>

        <p className="text-zinc-400 font-medium leading-relaxed mb-10 max-w-md">
          We&apos;re putting the finishing touches on this experience. Check back
          shortly — it&apos;ll be worth the wait.
        </p>

        <button
          onClick={() => navigate(-1)}
          className="group inline-flex items-center gap-2 px-7 py-3.5 bg-white/[0.03] border border-zinc-800 hover:border-[#00f0ff]/50 hover:bg-[#00f0ff]/[0.04] text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
          Back
        </button>
      </motion.div>
    </div>
  );
};

export default ComingSoon;

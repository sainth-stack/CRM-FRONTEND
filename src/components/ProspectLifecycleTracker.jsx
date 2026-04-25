import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react';

const ProspectLifecycleTracker = ({ timeline, state, nextActionAt, holdReleaseAt, retryAfter }) => {
  if (!timeline || timeline.length === 0) return null;

  const timingMeta = (() => {
    if (state === 'ON_HOLD' && holdReleaseAt) {
      return { label: 'Hold Until', value: holdReleaseAt };
    }
    if (state === 'TERMINATED' && retryAfter) {
      return { label: 'Retry On', value: retryAfter };
    }
    if (nextActionAt && state !== 'TERMINATED' && state !== 'MEETING_BOOKED') {
      return { label: 'Next Action', value: nextActionAt };
    }
    return null;
  })();

  return (
    <div className="flex flex-col gap-4 py-4 px-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Lifecycle Timeline
        </span>
        {timingMeta && (
          <div className="flex items-center gap-2 bg-brand-primary/5 px-3 py-1 rounded-full border border-brand-primary/10">
            <Clock size={12} className="text-brand-primary" />
            <span className="text-[10px] font-black text-brand-primary uppercase">
              {timingMeta.label}: {new Date(timingMeta.value).toLocaleString()}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center w-full">
        {timeline.map((step, index) => {
          const isDone = step.status === 'done';
          const isActive = step.status === 'active';
          const isError = step.status === 'error';
          const isLast = index === timeline.length - 1;

          return (
            <React.Fragment key={index}>
              <div className="flex flex-col items-center relative group">
                {/* Step Node */}
                <motion.div
                  initial={isActive ? { scale: 0.8, opacity: 0 } : false}
                  animate={isActive ? { scale: 1, opacity: 1 } : false}
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 z-10 ${
                    isDone ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' :
                    isActive ? 'bg-white border-brand-primary text-brand-primary animate-pulse' :
                    isError ? 'bg-red-50 border-red-200 text-red-500' :
                    'bg-white border-slate-200 text-slate-300'
                  }`}
                >
                  {isDone ? <CheckCircle2 size={16} strokeWidth={3} /> : 
                   isError ? <AlertCircle size={16} strokeWidth={3} /> :
                   <Circle size={12} strokeWidth={isActive ? 3 : 2} fill={isActive ? 'currentColor' : 'none'} />}
                </motion.div>

                {/* Step Label */}
                <div className="absolute -bottom-8 w-24 text-center">
                  <p className={`text-[9px] font-black uppercase tracking-tighter transition-colors ${
                    isDone ? 'text-emerald-600' :
                    isActive ? 'text-brand-primary' :
                    isError ? 'text-red-500' :
                    'text-slate-400'
                  }`}>
                    {step.step}
                  </p>
                </div>

                {/* Tooltip on Hover */}
                <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-all bg-slate-900 text-white text-[8px] font-black uppercase px-2 py-1 rounded whitespace-nowrap z-50">
                  {step.status === 'done' ? 'Protocol Completed' : 
                   step.status === 'active' ? 'Active Segment' : 'Awaiting Mobilization'}
                </div>
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div className="flex-grow h-0.5 mx-2 relative overflow-hidden bg-slate-100 rounded-full">
                  {isDone && (
                    <motion.div
                      initial={{ x: '-100%' }}
                      animate={{ x: 0 }}
                      transition={{ duration: 0.8 }}
                      className="absolute inset-0 bg-emerald-500"
                    />
                  )}
                  {isActive && (
                    <motion.div
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                      className="absolute inset-0 bg-brand-primary opacity-30"
                    />
                  )}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
      
      {/* Spacer for labels */}
      <div className="h-6" />
    </div>
  );
};

export default ProspectLifecycleTracker;

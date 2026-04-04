'use client';
import { motion, AnimatePresence } from 'framer-motion';

interface StepExplanationProps {
  explanation: string;
  show: boolean;
}

export default function StepExplanation({ explanation, show }: StepExplanationProps) {
  if (!show) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={explanation}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="rounded-xl p-4 mb-4"
        style={{
          background: 'rgba(0,229,255,0.08)',
          border: '1px solid rgba(0,229,255,0.2)',
        }}
      >
        <div className="flex items-start gap-3">
          <div className="text-xl mt-0.5">💡</div>
          <div className="flex-1">
            <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-1">
              What's Happening
            </div>
            <div className="text-sm text-slate-200 font-mono leading-relaxed">
              {explanation}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

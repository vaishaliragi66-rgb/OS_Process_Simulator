'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimStore } from '@/store/useSimStore';

interface ExplainBoxProps {
  text: string;
}

export default function ExplainBox({ text }: ExplainBoxProps) {
  const isExplainMode = useSimStore(s => s.isExplainMode);

  return (
    <AnimatePresence>
      {isExplainMode && (
        <motion.div
          initial={{ opacity: 0, height: 0, marginTop: 0 }}
          animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
          exit={{ opacity: 0, height: 0, marginTop: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div
            className="flex items-start gap-2 px-3 py-2.5 rounded-lg text-xs text-slate-300 font-mono"
            style={{
              background: 'rgba(0,229,255,0.04)',
              border: '1px solid rgba(0,229,255,0.15)',
            }}
          >
            <span className="text-cyan-400 mt-0.5 shrink-0">💡</span>
            <span className="leading-relaxed">{text}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

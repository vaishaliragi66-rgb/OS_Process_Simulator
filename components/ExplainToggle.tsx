'use client';
import { motion } from 'framer-motion';
import { useSimStore } from '@/store/useSimStore';

export default function ExplainToggle() {
  const { isExplainMode, toggleExplainMode } = useSimStore();

  return (
    <motion.button
      onClick={toggleExplainMode}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-xs font-mono cursor-pointer"
      style={{
        borderColor: isExplainMode ? 'rgba(0,229,255,0.5)' : 'rgba(255,255,255,0.1)',
        background: isExplainMode ? 'rgba(0,229,255,0.08)' : 'rgba(255,255,255,0.03)',
        color: isExplainMode ? '#00E5FF' : '#64748b',
      }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
    >
      <span>🧠</span>
      <span className="tracking-wide">Explain</span>
      <div
        className="relative w-8 h-4 rounded-full transition-colors"
        style={{ background: isExplainMode ? 'rgba(0,229,255,0.4)' : 'rgba(255,255,255,0.1)' }}
      >
        <motion.div
          className="absolute top-0.5 w-3 h-3 rounded-full"
          style={{ background: isExplainMode ? '#00E5FF' : '#475569' }}
          animate={{ left: isExplainMode ? '17px' : '2px' }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        />
      </div>
    </motion.button>
  );
}

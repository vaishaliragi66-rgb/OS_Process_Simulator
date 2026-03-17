'use client';
import { motion } from 'framer-motion';
import { Process } from '@/types';

interface ProcessCardProps {
  process: Process;
  isActive?: boolean;
  isRunning?: boolean;
  showRemove?: boolean;
  onRemove?: () => void;
  compact?: boolean;
  index?: number;
}

export default function ProcessCard({
  process,
  isActive,
  isRunning,
  showRemove,
  onRemove,
  compact,
  index = 0,
}: ProcessCardProps) {
  const color = process.color;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85, y: -10 }}
      transition={{ delay: index * 0.06, type: 'spring', stiffness: 300, damping: 25 }}
      className="relative rounded-xl overflow-hidden select-none"
      style={{
        background: isRunning
          ? `linear-gradient(135deg, ${color}18, ${color}08)`
          : 'rgba(255,255,255,0.04)',
        border: `1px solid ${isRunning ? color : isActive ? color + '88' : color + '33'}`,
        boxShadow: isRunning
          ? `0 0 20px ${color}44, 0 0 40px ${color}22, inset 0 0 20px ${color}08`
          : isActive
          ? `0 0 10px ${color}33`
          : 'none',
        minWidth: compact ? '80px' : '120px',
      }}
    >
      {/* Running pulse ring */}
      {isRunning && (
        <motion.div
          className="absolute inset-0 rounded-xl"
          style={{ border: `2px solid ${color}` }}
          animate={{ opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}

      <div className={compact ? 'px-3 py-2' : 'px-4 py-3'}>
        {/* PID header */}
        <div className="flex items-center justify-between mb-1">
          <span
            className="font-orbitron font-black text-sm tracking-wider"
            style={{ color }}
          >
            P{process.pid}
          </span>
          {showRemove && (
            <button
              onClick={onRemove}
              className="w-4 h-4 rounded flex items-center justify-center opacity-40 hover:opacity-100 text-slate-400 hover:text-red-400 transition-all text-xs cursor-pointer"
            >
              ×
            </button>
          )}
        </div>

        {!compact && (
          <>
            {/* Burst time bar */}
            <div className="mb-1.5">
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mb-0.5">
                <span>burst</span>
                <span style={{ color }}>{process.burstTime}ms</span>
              </div>
              <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((process.burstTime / 20) * 100, 100)}%` }}
                  transition={{ delay: 0.2 + index * 0.06 }}
                />
              </div>
            </div>

            {/* Priority */}
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-slate-600">priority</span>
              <span className="text-slate-400">{process.priority}</span>
            </div>
          </>
        )}

        {compact && (
          <div className="text-[10px] font-mono text-slate-500">
            B:{process.burstTime}
          </div>
        )}
      </div>
    </motion.div>
  );
}

'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimStore } from '@/store/useSimStore';
import ProcessCard from './ProcessCard';
import ExplainBox from './ExplainBox';

const MAX_PROCESSES = 6;

export default function ProcessCreation() {
  const { processes, addProcess, removeProcess, goToStep } = useSimStore();
  const [customBurst, setCustomBurst] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const handleAdd = () => {
    if (processes.length >= MAX_PROCESSES) return;
    const burst = customBurst ? parseInt(customBurst, 10) : undefined;
    addProcess(burst ? { burstTime: burst, remainingTime: burst } : undefined);
    setCustomBurst('');
    setShowCustom(false);
  };

  const canProceed = processes.length >= 2;

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      className="max-w-2xl mx-auto px-4 py-8"
    >
      {/* Header */}
      <motion.div className="mb-8" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-orbitron font-bold"
            style={{ background: 'rgba(0,229,255,0.15)', border: '1px solid rgba(0,229,255,0.3)', color: '#00E5FF' }}>
            1
          </div>
          <h2 className="font-orbitron text-xl font-bold text-white">Process Creation</h2>
        </div>
        <p className="text-slate-400 text-sm ml-11">Create 2–6 processes to simulate</p>
        <ExplainBox text='A process is a program in execution. Each has a burst time (how long it needs CPU) and a priority.' />
      </motion.div>

      {/* Process grid */}
      <div className="min-h-[140px] mb-6">
        <AnimatePresence mode="popLayout">
          {processes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center h-28 rounded-xl border border-dashed border-white/10 text-slate-600 text-sm font-mono"
            >
              No processes yet — create some below
            </motion.div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {processes.map((p, i) => (
                <ProcessCard
                  key={p.id}
                  process={p}
                  showRemove
                  onRemove={() => removeProcess(p.id)}
                  index={i}
                />
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3">
        {/* Custom burst input toggle */}
        <AnimatePresence>
          {showCustom && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex gap-2 overflow-hidden"
            >
              <input
                type="number"
                min={1}
                max={20}
                value={customBurst}
                onChange={e => setCustomBurst(e.target.value)}
                placeholder="Burst time (1–20)"
                className="flex-1 px-3 py-2 rounded-lg text-sm font-mono text-white outline-none"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(0,229,255,0.3)',
                  caretColor: '#00E5FF',
                }}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                autoFocus
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-3">
          {/* Toggle custom input */}
          {processes.length < MAX_PROCESSES && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCustom(v => !v)}
              className="px-4 py-2.5 rounded-lg text-sm font-mono border cursor-pointer"
              style={{
                border: '1px solid rgba(0,229,255,0.2)',
                background: showCustom ? 'rgba(0,229,255,0.08)' : 'transparent',
                color: '#64748b',
              }}
            >
              {showCustom ? 'Cancel' : '⚙ Custom Burst'}
            </motion.button>
          )}

          {/* Add process button */}
          {processes.length < MAX_PROCESSES ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAdd}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-orbitron font-bold text-sm cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, rgba(0,229,255,0.2), rgba(68,136,255,0.2))',
                border: '1px solid rgba(0,229,255,0.4)',
                color: '#00E5FF',
                boxShadow: '0 0 15px rgba(0,229,255,0.15)',
              }}
            >
              <motion.span
                animate={{ rotate: [0, 90, 0] }}
                transition={{ duration: 0.4, repeat: Infinity, repeatDelay: 3 }}
              >
                +
              </motion.span>
              Create Process
            </motion.button>
          ) : (
            <div className="px-5 py-2.5 rounded-lg text-sm font-mono text-slate-600 border border-white/5">
              Max processes reached
            </div>
          )}
        </div>

        {/* Process count indicator */}
        <div className="flex items-center gap-2 mt-1">
          {[...Array(MAX_PROCESSES)].map((_, i) => (
            <div
              key={i}
              className="w-6 h-1.5 rounded-full transition-all duration-300"
              style={{
                background: i < processes.length ? '#00E5FF' : 'rgba(255,255,255,0.08)',
                boxShadow: i < processes.length ? '0 0 6px rgba(0,229,255,0.5)' : 'none',
              }}
            />
          ))}
          <span className="text-xs font-mono text-slate-500 ml-1">{processes.length} / {MAX_PROCESSES}</span>
        </div>
      </div>

      {/* Next step */}
      <AnimatePresence>
        {canProceed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 flex justify-end"
          >
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => goToStep('queue')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-orbitron font-bold text-sm cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #00E5FF, #4488FF)',
                color: '#050A14',
                boxShadow: '0 0 20px rgba(0,229,255,0.4)',
              }}
            >
              View Ready Queue
              <motion.span animate={{ x: [0, 3, 0] }} transition={{ duration: 1, repeat: Infinity }}>
                →
              </motion.span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

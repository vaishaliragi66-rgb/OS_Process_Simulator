'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimStore } from '@/store/useSimStore';
import ExplainBox from './ExplainBox';

export default function ReadyQueueDisplay() {
  const { processes, goToStep } = useSimStore();

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
            style={{ background: 'rgba(255,184,0,0.15)', border: '1px solid rgba(255,184,0,0.3)', color: '#FFB800' }}>
            2
          </div>
          <h2 className="font-orbitron text-xl font-bold text-white">Ready Queue</h2>
        </div>
        <p className="text-slate-400 text-sm ml-11">All processes waiting for CPU time</p>
        <ExplainBox text='The Ready Queue is like a waiting line at a bank. Processes sit here until the CPU scheduler picks one to run.' />
      </motion.div>

      {/* Queue visualization */}
      <div
        className="relative p-6 rounded-2xl mb-8 overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,184,0,0.15)',
        }}
      >
        {/* Label */}
        <div className="flex items-center gap-2 mb-5">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-xs font-mono text-amber-400 tracking-widest uppercase">Ready Queue</span>
          <span className="text-xs font-mono text-slate-600">({processes.length} processes)</span>
        </div>

        {/* CPU intake arrow */}
        <div className="flex items-center gap-0 overflow-x-auto pb-2">
          {/* Entry arrow */}
          <div className="flex flex-col items-center mr-3 shrink-0">
            <div className="text-[10px] font-mono text-slate-600 mb-1">NEW</div>
            <motion.div
              className="text-amber-400 text-lg"
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            >
              →
            </motion.div>
          </div>

          {/* Queue bracket start */}
          <div className="text-2xl text-amber-400/30 font-mono mr-1 shrink-0">[ </div>

          {/* Process cards */}
          <div className="flex items-center gap-2">
            <AnimatePresence>
              {processes.map((p, i) => (
                <motion.div
                  key={p.id}
                  className="flex items-center gap-2 shrink-0"
                  initial={{ opacity: 0, x: 30, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ delay: i * 0.1, type: 'spring', stiffness: 300, damping: 25 }}
                >
                  {/* Process tile */}
                  <motion.div
                    className="px-4 py-3 rounded-xl relative"
                    style={{
                      background: i === 0
                        ? `linear-gradient(135deg, ${p.color}20, ${p.color}08)`
                        : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${i === 0 ? p.color + '88' : p.color + '33'}`,
                      boxShadow: i === 0 ? `0 0 15px ${p.color}33` : 'none',
                    }}
                    animate={i === 0 ? { scale: [1, 1.03, 1] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {/* "NEXT" badge on first */}
                    {i === 0 && (
                      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full"
                          style={{ background: p.color, color: '#050A14' }}>
                          NEXT
                        </span>
                      </div>
                    )}
                    <div className="font-orbitron font-black text-sm" style={{ color: p.color }}>
                      P{p.pid}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                      B:{p.burstTime} P:{p.priority}
                    </div>
                  </motion.div>

                  {/* Arrow between processes */}
                  {i < processes.length - 1 && (
                    <motion.span
                      className="text-slate-600 text-sm"
                      animate={{ opacity: [0.4, 0.8, 0.4] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                    >
                      →
                    </motion.span>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Queue bracket end */}
          <div className="text-2xl text-amber-400/30 font-mono ml-1 shrink-0"> ]</div>

          {/* CPU arrow */}
          <div className="flex flex-col items-center ml-3 shrink-0">
            <div className="text-[10px] font-mono text-slate-600 mb-1">CPU</div>
            <motion.div
              className="text-cyan-400 text-lg"
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: 0.3 }}
            >
              →
            </motion.div>
          </div>
        </div>
      </div>

      {/* Process summary table */}
      <div
        className="rounded-xl overflow-hidden mb-8"
        style={{ border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="grid grid-cols-4 px-4 py-2.5 text-[10px] font-mono text-slate-600 uppercase tracking-wider"
          style={{ background: 'rgba(255,255,255,0.02)' }}>
          <span>Process</span>
          <span>Burst Time</span>
          <span>Priority</span>
          <span>Arrival</span>
        </div>
        {processes.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07 }}
            className="grid grid-cols-4 px-4 py-2.5 text-xs font-mono"
            style={{
              background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
              borderTop: '1px solid rgba(255,255,255,0.04)',
            }}
          >
            <span className="font-bold" style={{ color: p.color }}>P{p.pid}</span>
            <span className="text-slate-300">{p.burstTime} ms</span>
            <span className="text-slate-400">{p.priority}</span>
            <span className="text-slate-600">t=0</span>
          </motion.div>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => goToStep('create')}
          className="flex items-center gap-2 text-sm font-mono text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
        >
          ← Back
        </button>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => goToStep('algorithm')}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-orbitron font-bold text-sm cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, #00E5FF, #4488FF)',
            color: '#050A14',
            boxShadow: '0 0 20px rgba(0,229,255,0.4)',
          }}
        >
          Choose Algorithm
          <motion.span animate={{ x: [0, 3, 0] }} transition={{ duration: 1, repeat: Infinity }}>→</motion.span>
        </motion.button>
      </div>
    </motion.div>
  );
}

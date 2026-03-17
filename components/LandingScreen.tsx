'use client';
import { motion } from 'framer-motion';
import { useSimStore } from '@/store/useSimStore';

export default function LandingScreen() {
  const goToStep = useSimStore(s => s.goToStep);

  return (
    <motion.div
      className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.8 }}
    >
      {/* Top badge */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8 px-4 py-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/5 text-cyan-400 text-xs font-mono tracking-widest uppercase"
      >
        Interactive OS Learning Experience
      </motion.div>

      {/* Main title */}
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="font-orbitron text-5xl md:text-7xl font-black mb-4 leading-tight"
        style={{
          background: 'linear-gradient(135deg, #00E5FF 0%, #4488FF 50%, #00FF88 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: 'none',
          filter: 'drop-shadow(0 0 30px rgba(0,229,255,0.5))',
        }}
      >
        Kernel
        <br />
        Process
        <br />
        Simulator
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="text-slate-400 text-lg md:text-xl mb-12 font-light tracking-wide max-w-md"
      >
        Step inside the mind of an operating system
      </motion.p>

      {/* Feature pills */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        className="flex flex-wrap justify-center gap-2 mb-12 max-w-lg"
      >
        {['FCFS', 'SJF', 'Priority', 'Round Robin'].map((algo) => (
          <span
            key={algo}
            className="px-3 py-1 text-xs font-mono rounded border border-cyan-400/20 bg-cyan-400/5 text-cyan-300 tracking-wider"
          >
            {algo}
          </span>
        ))}
        {['Gantt Chart', 'Predict & Learn', 'Step-by-Step'].map((f) => (
          <span
            key={f}
            className="px-3 py-1 text-xs font-mono rounded border border-purple-400/20 bg-purple-400/5 text-purple-300 tracking-wider"
          >
            {f}
          </span>
        ))}
      </motion.div>

      {/* CTA Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.3, type: 'spring', stiffness: 200 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => goToStep('create')}
        className="relative group px-10 py-4 rounded-xl font-orbitron font-bold text-lg tracking-widest uppercase text-black cursor-pointer overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #00E5FF, #4488FF)',
          boxShadow: '0 0 30px rgba(0,229,255,0.5), 0 0 60px rgba(0,229,255,0.2)',
        }}
      >
        <motion.div
          className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"
        />
        Press Enter to Start
        <motion.span
          className="ml-3"
          animate={{ x: [0, 4, 0] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        >
          →
        </motion.span>
      </motion.button>

      {/* Bottom hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 1.8 }}
        className="mt-8 text-slate-500 text-sm font-mono"
      >
        4 algorithms · interactive predictions · visual learning
      </motion.p>

      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-cyan-400"
          style={{
            left: `${15 + i * 14}%`,
            top: `${20 + (i % 3) * 25}%`,
            opacity: 0.3,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 2.5 + i * 0.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.4,
          }}
        />
      ))}
    </motion.div>
  );
}

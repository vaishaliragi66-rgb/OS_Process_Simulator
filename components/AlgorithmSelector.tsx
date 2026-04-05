'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Algorithm, ALGORITHM_INFO } from '@/types';
import { useSimStore } from '@/store/useSimStore';
import { getPreviewOrder } from '@/utils/scheduling';
import ExplainBox from './ExplainBox';
import AlgorithmInputModal, { AlgorithmInputs } from './AlgorithmInputModal';

const ALGO_ICONS: Record<Algorithm, string> = {
  fcfs: '📋',
  sjf: '⚡',
  priority: '🎯',
  rr: '🔄',
  srtf: '⚡',
  'preemptive-priority': '🎯',
};

const ALGO_COLORS: Record<Algorithm, string> = {
  fcfs: '#00E5FF',
  sjf: '#00FF88',
  priority: '#FFB800',
  rr: '#BB88FF',
  srtf: '#FF8844',
  'preemptive-priority': '#FF4466',
};

export default function AlgorithmSelector() {
  const { selectedAlgorithm, selectAlgorithm, processes, goToStep, startExecution, setAlgorithmInputs } = useSimStore();
  const [showInputModal, setShowInputModal] = useState(false);

  const algorithms: Algorithm[] = ['fcfs', 'sjf', 'priority', 'rr', 'srtf', 'preemptive-priority'];

  const handleStartExecution = () => {
    const needsInputs =
      selectedAlgorithm === 'priority' ||
      selectedAlgorithm === 'preemptive-priority' ||
      selectedAlgorithm === 'rr';

    if (needsInputs) {
      setShowInputModal(true);
    } else {
      setAlgorithmInputs({});
      startExecution();
      goToStep('execution');
    }
  };

  const handleInputsComplete = (inputs: AlgorithmInputs) => {
    setAlgorithmInputs(inputs);
    setShowInputModal(false);
    startExecution();
    goToStep('execution');
  };

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
            style={{ background: 'rgba(187,136,255,0.15)', border: '1px solid rgba(187,136,255,0.3)', color: '#BB88FF' }}>
            3
          </div>
          <h2 className="font-orbitron text-xl font-bold text-white">Scheduling Algorithm</h2>
        </div>
        <p className="text-slate-400 text-sm ml-11">Choose how the OS decides which process runs next</p>
        <ExplainBox text='The scheduler is the "brain" of the OS. It decides which process gets CPU time and when. Different algorithms have different trade-offs.' />
      </motion.div>

      {/* Algorithm cards */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        {algorithms.map((algo, i) => {
          const info = ALGORITHM_INFO[algo];
          const color = ALGO_COLORS[algo];
          const isSelected = selectedAlgorithm === algo;

          return (
            <motion.button
              key={algo}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => selectAlgorithm(algo)}
              className="relative p-4 rounded-xl text-left cursor-pointer overflow-hidden"
              style={{
                background: isSelected ? `linear-gradient(135deg, ${color}15, ${color}05)` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isSelected ? color + '66' : 'rgba(255,255,255,0.07)'}`,
                boxShadow: isSelected ? `0 0 20px ${color}22` : 'none',
              }}
            >
              {isSelected && (
                <motion.div
                  className="absolute inset-0 opacity-5"
                  style={{ background: `radial-gradient(circle at 30% 50%, ${color}, transparent 70%)` }}
                  animate={{ opacity: [0.05, 0.1, 0.05] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}

              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5">{ALGO_ICONS[algo]}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="font-orbitron font-black text-sm"
                      style={{ color: isSelected ? color : '#94a3b8' }}
                    >
                      {info.name}
                    </span>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: color, boxShadow: `0 0 6px ${color}` }}
                      />
                    )}
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 leading-relaxed">
                    {info.explanation}
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Preview: execution order */}
      {selectedAlgorithm && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl p-4 mb-6"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-3">
            Execution Preview ({ALGORITHM_INFO[selectedAlgorithm].name})
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {getPreviewOrder(processes, selectedAlgorithm).map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.07 }}
                className="flex items-center gap-2"
              >
                <div
                  className="px-3 py-1.5 rounded-lg text-xs font-orbitron font-bold"
                  style={{
                    background: `${p.color}15`,
                    border: `1px solid ${p.color}44`,
                    color: p.color,
                  }}
                >
                  P{p.pid}
                  <span className="font-mono font-normal opacity-60 ml-1">
                    {selectedAlgorithm === 'sjf' ? `(B:${p.burstTime})` :
                     selectedAlgorithm === 'priority' ? `(P:${p.priority})` : ''}
                  </span>
                </div>
                {i < processes.length - 1 && (
                  <span className="text-slate-600 text-xs">→</span>
                )}
              </motion.div>
            ))}
            {selectedAlgorithm === 'rr' && (
              <span className="text-[10px] font-mono text-slate-600">... (cycles with Q=4)</span>
            )}
          </div>
        </motion.div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => goToStep('queue')}
          className="flex items-center gap-2 text-sm font-mono text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
        >
          ← Back
        </button>
        <motion.button
          whileHover={selectedAlgorithm ? { scale: 1.04 } : {}}
          whileTap={selectedAlgorithm ? { scale: 0.96 } : {}}
          onClick={selectedAlgorithm ? handleStartExecution : undefined}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-orbitron font-bold text-sm transition-all"
          style={{
            background: selectedAlgorithm
              ? 'linear-gradient(135deg, #00E5FF, #4488FF)'
              : 'rgba(255,255,255,0.05)',
            color: selectedAlgorithm ? '#050A14' : '#334155',
            boxShadow: selectedAlgorithm ? '0 0 20px rgba(0,229,255,0.4)' : 'none',
            cursor: selectedAlgorithm ? 'pointer' : 'not-allowed',
          }}
        >
          Start Simulation
          {selectedAlgorithm && (
            <motion.span animate={{ x: [0, 3, 0] }} transition={{ duration: 1, repeat: Infinity }}>→</motion.span>
          )}
        </motion.button>
      </div>

      {/* Algorithm Input Modal */}
      <AlgorithmInputModal
        isOpen={showInputModal}
        onClose={() => setShowInputModal(false)}
        onComplete={handleInputsComplete}
      />
    </motion.div>
  );
}

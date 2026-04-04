'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimStore } from '@/store/useSimStore';
import { Algorithm, ALGORITHM_INFO } from '@/types';

interface AlgorithmInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (inputs: AlgorithmInputs) => void;
}

export interface AlgorithmInputs {
  quantum?: number;
  priorityValues?: Record<string, number>;
}

export default function AlgorithmInputModal({ isOpen, onClose, onComplete }: AlgorithmInputModalProps) {
  const { processes, selectedAlgorithm } = useSimStore();
  const [quantum, setQuantum] = useState(4);
  const [priorityValues, setPriorityValues] = useState<Record<string, number>>(
    processes.reduce((acc, p) => ({ ...acc, [p.id]: p.priority }), {})
  );

  if (!selectedAlgorithm) return null;

  const needsPriority = selectedAlgorithm === 'priority' || selectedAlgorithm === 'preemptive-priority';
  const needsQuantum = selectedAlgorithm === 'rr';
  const needsInputs = needsPriority || needsQuantum;

  const handleSubmit = () => {
    const inputs: AlgorithmInputs = {};
    if (needsQuantum) inputs.quantum = quantum;
    if (needsPriority) inputs.priorityValues = priorityValues;
    onComplete(inputs);
  };

  const updatePriority = (processId: string, value: number) => {
    setPriorityValues(prev => ({ ...prev, [processId]: value }));
  };

  if (!needsInputs) {
    // No inputs needed, auto-complete
    setTimeout(() => onComplete({}), 0);
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(5,10,20,0.9)', backdropFilter: 'blur(8px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl p-6"
            style={{
              background: 'rgba(15,20,30,0.95)',
              border: '1px solid rgba(0,229,255,0.2)',
              boxShadow: '0 0 40px rgba(0,229,255,0.15)',
            }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                style={{ background: 'rgba(0,229,255,0.15)', border: '1px solid rgba(0,229,255,0.3)' }}
              >
                ⚙️
              </div>
              <div>
                <h3 className="font-orbitron text-lg font-bold text-white">Algorithm Configuration</h3>
                <p className="text-xs font-mono text-slate-500">{ALGORITHM_INFO[selectedAlgorithm].short}</p>
              </div>
            </div>

            {/* Round Robin Quantum Input */}
            {needsQuantum && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-white mb-3">
                  Time Quantum (CPU time slice per process)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={quantum}
                    onChange={(e) => setQuantum(parseInt(e.target.value))}
                    className="flex-1"
                    style={{ accentColor: '#00E5FF' }}
                  />
                  <div
                    className="px-4 py-2 rounded-lg font-orbitron font-bold text-lg min-w-[60px] text-center"
                    style={{
                      background: 'rgba(0,229,255,0.12)',
                      border: '1px solid rgba(0,229,255,0.3)',
                      color: '#00E5FF',
                    }}
                  >
                    {quantum}
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Each process runs for {quantum} time unit{quantum !== 1 ? 's' : ''} before switching
                </p>
              </div>
            )}

            {/* Priority Input */}
            {needsPriority && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-white mb-3">
                  Process Priorities <span className="text-slate-500 text-xs">(lower number = higher priority)</span>
                </label>
                <div className="space-y-3">
                  {processes.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-3 p-3 rounded-lg"
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      <span
                        className="font-orbitron font-bold text-sm w-12"
                        style={{ color: p.color }}
                      >
                        P{p.pid}
                      </span>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={priorityValues[p.id] || p.priority}
                        onChange={(e) => updatePriority(p.id, parseInt(e.target.value) || 1)}
                        className="flex-1 px-3 py-2 rounded-lg text-sm font-mono text-white outline-none"
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.15)',
                          caretColor: p.color,
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-xl font-mono text-sm cursor-pointer"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#94a3b8',
                }}
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                className="flex-1 px-4 py-3 rounded-xl font-orbitron font-bold text-sm cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #00E5FF, #4488FF)',
                  color: '#050A14',
                  boxShadow: '0 0 20px rgba(0,229,255,0.4)',
                }}
              >
                Continue →
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

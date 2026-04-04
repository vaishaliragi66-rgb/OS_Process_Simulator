'use client';
import { motion } from 'framer-motion';
import { Algorithm, ALGORITHM_INFO } from '@/types';

interface AlgorithmExplanationProps {
  algorithm: Algorithm;
}

const getAlgorithmSteps = (algorithm: Algorithm): string[] => {
  switch (algorithm) {
    case 'fcfs':
      return [
        'Sort processes by arrival time',
        'Execute first arrived process completely',
        'Move to next process in arrival order',
        'Repeat until all processes complete'
      ];
    case 'sjf':
      return [
        'Look at all available processes',
        'Pick process with shortest burst time',
        'Execute it completely (non-preemptive)',
        'Repeat for remaining processes'
      ];
    case 'srtf':
      return [
        'Check arriving processes at each time unit',
        'Pick process with shortest remaining time',
        'Execute for 1 unit or until preempted',
        'Switch if shorter job arrives'
      ];
    case 'priority':
      return [
        'Sort processes by priority (lower number = higher priority)',
        'Execute highest priority process first',
        'Complete it fully (non-preemptive)',
        'Move to next highest priority'
      ];
    case 'preemptive-priority':
      return [
        'Check arriving processes at each time unit',
        'Pick highest priority process',
        'Execute until higher priority arrives',
        'Switch immediately on higher priority arrival'
      ];
    case 'rr':
      return [
        'Maintain a ready queue of processes',
        'Give each process a time quantum (4 units)',
        'Execute for quantum or until complete',
        'Move to back of queue if not done'
      ];
    default:
      return [];
  }
};

export default function AlgorithmExplanation({ algorithm }: AlgorithmExplanationProps) {
  const info = ALGORITHM_INFO[algorithm];
  const steps = getAlgorithmSteps(algorithm);

  const workflowSteps = [
    { label: 'Ready Queue', icon: '📋', color: '#00E5FF' },
    { label: 'Select Process', icon: '🔍', color: '#00FF88' },
    { label: 'CPU Execution', icon: '⚡', color: '#FFB800' },
    { label: 'Complete', icon: '✓', color: '#BB88FF' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <div
        className="rounded-2xl p-6"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
            style={{ background: 'rgba(0,229,255,0.15)', border: '1px solid rgba(0,229,255,0.3)' }}
          >
            💡
          </div>
          <div>
            <h3 className="font-orbitron text-lg font-bold text-white">{info.name}</h3>
            <p className="text-xs font-mono text-slate-500">{info.short}</p>
          </div>
        </div>

        {/* Explanation */}
        <p className="text-sm text-slate-300 mb-5 leading-relaxed">
          {info.explanation}
        </p>

        {/* Algorithm Steps */}
        <div className="mb-6">
          <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-3">
            How it works:
          </div>
          <div className="space-y-2">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-3 text-sm text-slate-400"
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ background: 'rgba(0,229,255,0.15)', color: '#00E5FF' }}
                >
                  {i + 1}
                </div>
                <span className="pt-0.5">{step}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Animated Workflow */}
        <div>
          <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-3">
            Execution Flow:
          </div>
          <div className="flex items-center justify-between gap-2">
            {workflowSteps.map((step, i) => (
              <div key={i} className="flex items-center flex-1">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1,
                  }}
                  transition={{ delay: 0.5 + i * 0.15 }}
                  className="flex-1"
                >
                  <motion.div
                    className="rounded-lg p-3 text-center"
                    style={{ 
                      background: `${step.color}08`, 
                      border: `1px solid ${step.color}30` 
                    }}
                    animate={{ 
                      borderColor: [`${step.color}30`, `${step.color}60`, `${step.color}30`],
                      boxShadow: [
                        `0 0 0 ${step.color}00`,
                        `0 0 8px ${step.color}44`,
                        `0 0 0 ${step.color}00`,
                      ]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      delay: i * 0.5,
                      ease: 'easeInOut'
                    }}
                  >
                    <div className="text-2xl mb-1">{step.icon}</div>
                    <div 
                      className="text-[10px] font-mono font-bold"
                      style={{ color: step.color }}
                    >
                      {step.label}
                    </div>
                  </motion.div>
                </motion.div>
                {i < workflowSteps.length - 1 && (
                  <motion.div
                    className="w-6 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 + i * 0.15 + 0.1 }}
                  >
                    <motion.div
                      animate={{ x: [0, 3, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.5 }}
                      className="text-slate-600"
                    >
                      →
                    </motion.div>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

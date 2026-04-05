'use client';
import { motion } from 'framer-motion';
import { Process } from '@/types';
import { StepExecutionState } from '@/utils/stepExecution';

interface ProcessTableProps {
  processes: Process[];
  stepState: StepExecutionState | null;
}

export default function ProcessTable({ processes, stepState }: ProcessTableProps) {
  if (!stepState) return null;

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
      <table className="w-full">
        <thead>
          <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
            <th className="px-3 py-2 text-left text-[10px] font-mono text-slate-600 uppercase tracking-wider">
              PID
            </th>
            <th className="px-3 py-2 text-left text-[10px] font-mono text-slate-600 uppercase tracking-wider">
              Arrival
            </th>
            <th className="px-3 py-2 text-left text-[10px] font-mono text-slate-600 uppercase tracking-wider">
              Burst
            </th>
            <th className="px-3 py-2 text-left text-[10px] font-mono text-slate-600 uppercase tracking-wider">
              Remaining
            </th>
            <th className="px-3 py-2 text-left text-[10px] font-mono text-slate-600 uppercase tracking-wider">
              Completion
            </th>
            <th className="px-3 py-2 text-left text-[10px] font-mono text-slate-600 uppercase tracking-wider">
              Waiting
            </th>
            <th className="px-3 py-2 text-left text-[10px] font-mono text-slate-600 uppercase tracking-wider">
              TAT
            </th>
          </tr>
        </thead>
        <tbody>
          {processes.map((p, i) => {
            const state = stepState.processStates[p.id];
            const isRunning = stepState.runningProcess?.id === p.id;
            const isCompleted = stepState.completedProcesses.has(p.id);
            
            return (
              <motion.tr
                key={p.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{
                  background: isRunning 
                    ? `${p.color}15` 
                    : i % 2 === 0 
                    ? 'transparent' 
                    : 'rgba(255,255,255,0.015)',
                  borderTop: '1px solid rgba(255,255,255,0.04)',
                  borderLeft: isRunning ? `3px solid ${p.color}` : '3px solid transparent',
                }}
              >
                <td className="px-3 py-2">
                  <span className="font-orbitron font-bold text-sm" style={{ color: p.color }}>
                    P{p.pid}
                  </span>
                </td>
                <td className="px-3 py-2 text-xs font-mono text-slate-300">
                  {p.arrivalTime}
                </td>
                <td className="px-3 py-2 text-xs font-mono text-slate-300">
                  {p.burstTime}
                </td>
                <td className="px-3 py-2 text-xs font-mono" style={{ color: isCompleted ? '#00FF88' : '#94a3b8' }}>
                  {state?.remainingTime ?? p.remainingTime}
                  {isRunning && (
                    <motion.span
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="ml-1"
                    >
                      ⚡
                    </motion.span>
                  )}
                </td>
                <td className="px-3 py-2 text-xs font-mono text-slate-300">
                  {state?.completionTime ?? '—'}
                </td>
                <td className="px-3 py-2 text-xs font-mono text-slate-300">
                  {state?.waitingTime !== undefined ? state.waitingTime : '—'}
                </td>
                <td className="px-3 py-2 text-xs font-mono text-slate-300">
                  {state?.turnaroundTime ?? '—'}
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

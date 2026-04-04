'use client';
import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimStore } from '@/store/useSimStore';
import { ALGORITHM_INFO } from '@/types';
import ProcessTable from './ProcessTable';
import StepExplanation from './StepExplanation';
import AlgorithmExplanation from './AlgorithmExplanation';

const AUTO_STEP_MS = 2000;

export default function CPUExecution() {
  const {
    processes,
    stepState,
    selectedAlgorithm,
    isPlaying,
    executeNextStep,
    setPlaying,
    goToStep,
    isExplainMode,
    algorithmInputs,
    visibleBlocks,
  } = useSimStore();

  const autoRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying && stepState) {
      autoRef.current = setInterval(() => {
        executeNextStep();
      }, AUTO_STEP_MS);
    }
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, [isPlaying, executeNextStep, stepState]);

  if (!selectedAlgorithm || !stepState) {
    return null;
  }

  const currentQuantum = algorithmInputs.quantum || 4;
  const totalProcesses = processes.length;
  const completedCount = stepState.completedProcesses.size;
  const progress = (completedCount / totalProcesses) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      className="max-w-5xl mx-auto px-4 py-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-orbitron font-bold"
            style={{ background: 'rgba(0,255,136,0.15)', border: '1px solid rgba(0,255,136,0.3)', color: '#00FF88' }}>
            4
          </div>
          <div>
            <h2 className="font-orbitron text-lg font-bold text-white">Step-by-Step Execution</h2>
            <p className="text-xs font-mono text-slate-500">
              {ALGORITHM_INFO[selectedAlgorithm].short}
              {selectedAlgorithm === 'rr' && ` (Q=${currentQuantum})`}
            </p>
          </div>
        </div>
        
        {/* Progress */}
        <div className="text-right">
          <div className="text-xs font-mono text-slate-500 mb-1">
            {completedCount} / {totalProcesses} completed
          </div>
          <div className="w-32 h-1.5 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #00E5FF, #00FF88)' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>
      </div>

      {/* Algorithm Explanation (collapsible) */}
      {isExplainMode && (
        <div className="mb-6">
          <AlgorithmExplanation algorithm={selectedAlgorithm} />
        </div>
      )}

      {/* Step Explanation */}
      <StepExplanation explanation={stepState.explanation} show={isExplainMode} />

      {/* Current Time Display */}
      <div className="mb-6 flex items-center gap-4">
        <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="text-[10px] font-mono text-slate-600 uppercase tracking-wider mb-1">
            Current Time
          </div>
          <div className="font-orbitron text-2xl font-bold" style={{ color: '#00E5FF' }}>
            {stepState.currentTime}
          </div>
        </div>

        {/* Ready Queue */}
        <div className="flex-1 rounded-xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="text-[10px] font-mono text-slate-600 uppercase tracking-wider mb-2">
            Ready Queue
          </div>
          <div className="flex gap-2 flex-wrap">
            {stepState.readyQueue.length === 0 ? (
              <span className="text-xs font-mono text-slate-600">Empty</span>
            ) : (
              stepState.readyQueue.map((p) => (
                <div
                  key={p.id}
                  className="px-2 py-1 rounded text-xs font-orbitron font-bold"
                  style={{
                    background: `${p.color}20`,
                    border: `1px solid ${p.color}60`,
                    color: p.color,
                  }}
                >
                  P{p.pid}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="mb-6">
        <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-3">
          Gantt Chart (Timeline)
        </div>
        <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {visibleBlocks.length === 0 ? (
            <div className="text-center text-slate-600 text-sm font-mono py-4">
              No execution yet — click "Next Step" to begin
            </div>
          ) : (
            <div className="relative h-16">
              <div className="absolute inset-0 flex">
                {visibleBlocks.map((block, i) => {
                  const totalTime = stepState.currentTime || 1;
                  const widthPercent = ((block.endTime - block.startTime) / totalTime) * 100;
                  const leftPercent = (block.startTime / totalTime) * 100;
                  
                  return (
                    <motion.div
                      key={`${block.processId}-${block.startTime}-${i}`}
                      initial={{ scaleX: 0, opacity: 0 }}
                      animate={{ scaleX: 1, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      className="absolute h-full flex items-center justify-center rounded"
                      style={{
                        left: `${leftPercent}%`,
                        width: `${widthPercent}%`,
                        background: `linear-gradient(135deg, ${block.color}40, ${block.color}20)`,
                        border: `1px solid ${block.color}80`,
                        transformOrigin: 'left',
                      }}
                    >
                      <span className="font-orbitron font-bold text-xs" style={{ color: block.color }}>
                        P{block.pid}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Timeline labels */}
          {visibleBlocks.length > 0 && (
            <div className="flex justify-between mt-2 text-[10px] font-mono text-slate-600">
              <span>0</span>
              <span>t = {stepState.currentTime}</span>
            </div>
          )}
        </div>
      </div>

      {/* Process Table */}
      <div className="mb-6">
        <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-3">
          Process Status Table
        </div>
        <ProcessTable processes={processes} stepState={stepState} />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => goToStep('algorithm')}
          className="text-sm font-mono text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
        >
          ← Back
        </button>

        <div className="flex gap-3">
          {/* Play/Pause */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setPlaying(!isPlaying)}
            className="px-5 py-3 rounded-xl font-orbitron font-bold text-sm cursor-pointer"
            style={{
              background: isPlaying 
                ? 'rgba(255,68,102,0.15)' 
                : 'rgba(0,229,255,0.15)',
              border: `1px solid ${isPlaying ? 'rgba(255,68,102,0.4)' : 'rgba(0,229,255,0.4)'}`,
              color: isPlaying ? '#FF4466' : '#00E5FF',
            }}
          >
            {isPlaying ? '⏸ Pause' : '▶ Auto Play'}
          </motion.button>

          {/* Next Step */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              setPlaying(false);
              executeNextStep();
            }}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-orbitron font-bold text-sm cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #00E5FF, #4488FF)',
              color: '#050A14',
              boxShadow: '0 0 20px rgba(0,229,255,0.4)',
            }}
          >
            Next Step →
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

'use client';
import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimStore } from '@/store/useSimStore';
import { ALGORITHM_INFO } from '@/types';
import ExplainBox from './ExplainBox';

const QUANTUM = 4;
const AUTO_STEP_MS = 1800;

export default function CPUExecution() {
  const {
    processes,
    schedule,
    executionIndex,
    visibleBlocks,
    isPlaying,
    prediction,
    selectedAlgorithm,
    advanceExecution,
    makePrediction,
    setPlaying,
    goToStep,
    isExplainMode,
  } = useSimStore();

  const autoRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying) {
      autoRef.current = setInterval(() => {
        const state = useSimStore.getState();
        // Only auto-advance if prediction is revealed or none
        if (!state.prediction || state.prediction.revealed) {
          state.advanceExecution();
        }
      }, AUTO_STEP_MS);
    }
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, [isPlaying]);

  if (!schedule) return null;

  const totalBlocks = schedule.blocks.length;
  const currentBlock = schedule.blocks[executionIndex] ?? null;
  const runningProcess = currentBlock ? processes.find(p => p.id === currentBlock.processId) : null;
  const progress = totalBlocks > 0 ? (visibleBlocks.length / totalBlocks) * 100 : 0;
  const isAllDone = executionIndex >= totalBlocks && visibleBlocks.length === totalBlocks;

  // Active queue: processes not yet fully terminated (simplified display)
  const processBlockCounts: Record<string, number> = {};
  for (const b of schedule.blocks) {
    processBlockCounts[b.processId] = (processBlockCounts[b.processId] ?? 0) + 1;
  }
  const doneIds = new Set(
    visibleBlocks.reduce((acc, b) => {
      const remaining = schedule.blocks.filter(sb => sb.processId === b.processId && sb.startTime > b.endTime).length;
      if (remaining === 0) acc.add(b.processId);
      return acc;
    }, new Set<string>())
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      className="max-w-3xl mx-auto px-4 py-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-orbitron font-bold"
            style={{ background: 'rgba(0,255,136,0.15)', border: '1px solid rgba(0,255,136,0.3)', color: '#00FF88' }}>
            4
          </div>
          <div>
            <h2 className="font-orbitron text-lg font-bold text-white">CPU Execution</h2>
            {selectedAlgorithm && (
              <p className="text-xs font-mono text-slate-500">{ALGORITHM_INFO[selectedAlgorithm].short}</p>
            )}
          </div>
        </div>
        {/* Overall progress */}
        <div className="text-right">
          <div className="text-xs font-mono text-slate-500 mb-1">Overall Progress</div>
          <div className="w-28 h-1.5 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #00E5FF, #00FF88)' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>
      </div>

      {/* Main layout: CPU panel + Queue sidebar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* CPU Panel */}
        <div className="md:col-span-2">
          <div
            className="relative rounded-2xl p-5 overflow-hidden"
            style={{
              background: runningProcess && !prediction?.revealed === false
                ? `linear-gradient(135deg, ${runningProcess?.color ?? '#00E5FF'}08, transparent)`
                : 'rgba(255,255,255,0.02)',
              border: `1px solid ${runningProcess ? (runningProcess.color + '44') : 'rgba(255,255,255,0.07)'}`,
              boxShadow: runningProcess && prediction?.revealed
                ? `0 0 30px ${runningProcess.color}22`
                : 'none',
              minHeight: '180px',
            }}
          >
            {/* CPU label */}
            <div className="flex items-center gap-2 mb-4">
              <motion.div
                className="w-2 h-2 rounded-full"
                style={{ background: runningProcess ? '#00FF88' : '#334155' }}
                animate={runningProcess ? { scale: [1, 1.5, 1], opacity: [1, 0.5, 1] } : {}}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <span className="text-xs font-mono tracking-widest uppercase text-slate-500">CPU Core</span>
            </div>

            {/* Running process display */}
            <AnimatePresence mode="wait">
              {prediction && !prediction.revealed ? (
                // Waiting for prediction
                <motion.div
                  key="waiting"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-24 text-center"
                >
                  <div className="text-slate-600 text-sm font-mono mb-1">⏳ Waiting for prediction...</div>
                  <div className="text-xs text-slate-700 font-mono">Make your guess below</div>
                </motion.div>
              ) : runningProcess && prediction?.revealed ? (
                <motion.div
                  key={`running-${currentBlock?.startTime}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                >
                  {/* Process name */}
                  <div className="flex items-center gap-3 mb-3">
                    <motion.div
                      className="font-orbitron text-4xl font-black"
                      style={{ color: runningProcess.color, filter: `drop-shadow(0 0 10px ${runningProcess.color}88)` }}
                      animate={{ opacity: [1, 0.7, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      P{runningProcess.pid}
                    </motion.div>
                    <div>
                      <div className="text-xs font-mono text-slate-500">Running</div>
                      <div className="text-sm font-mono text-slate-300">
                        t={currentBlock?.startTime} → t={currentBlock?.endTime}
                      </div>
                    </div>
                  </div>

                  {/* Burst info */}
                  <div className="text-xs font-mono text-slate-600 mb-2">
                    Burst duration: {(currentBlock?.endTime ?? 0) - (currentBlock?.startTime ?? 0)} units
                    {selectedAlgorithm === 'rr' && (currentBlock?.endTime ?? 0) - (currentBlock?.startTime ?? 0) <= QUANTUM && (
                      <span className="ml-2 text-purple-400">(quantum)</span>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${runningProcess.color}, ${runningProcess.color}88)` }}
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 1.2, ease: 'easeInOut' }}
                    />
                  </div>

                  {isExplainMode && (
                    <div className="mt-2 text-[10px] font-mono text-slate-600">
                      Process P{runningProcess.pid} is using the CPU. Burst: {runningProcess.burstTime}ms, Priority: {runningProcess.priority}
                    </div>
                  )}
                </motion.div>
              ) : isAllDone ? (
                <motion.div
                  key="done"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-20"
                >
                  <div className="text-green-400 font-mono text-sm mb-1">✓ All processes complete</div>
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  className="flex flex-col items-center justify-center h-20"
                >
                  <div className="text-slate-700 font-mono text-sm">CPU Idle</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Process status sidebar */}
        <div
          className="rounded-2xl p-4"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="text-[10px] font-mono text-slate-600 uppercase tracking-wider mb-3">Process Status</div>
          <div className="flex flex-col gap-2">
            {processes.map(p => {
              const isRunning = prediction?.revealed && currentBlock?.processId === p.id;
              const isDone = doneIds.has(p.id);
              const hasRun = visibleBlocks.some(b => b.processId === p.id);

              return (
                <div
                  key={p.id}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all"
                  style={{
                    background: isRunning ? `${p.color}12` : 'transparent',
                    border: `1px solid ${isRunning ? p.color + '44' : 'transparent'}`,
                  }}
                >
                  <motion.div
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{
                      background: isRunning ? p.color : isDone ? '#00FF88' : hasRun ? p.color + '88' : '#334155',
                    }}
                    animate={isRunning ? { scale: [1, 1.4, 1] } : {}}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                  <span className="text-xs font-orbitron font-bold" style={{ color: p.color }}>P{p.pid}</span>
                  <span className="text-[10px] font-mono text-slate-600 ml-auto">
                    {isRunning ? 'RUNNING' : isDone ? 'DONE' : hasRun ? 'WAITING' : 'READY'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Block counter */}
          <div className="mt-4 pt-3 border-t border-white/5">
            <div className="text-[10px] font-mono text-slate-600 mb-1">Scheduler Steps</div>
            <div className="font-orbitron text-lg font-black text-cyan-400">
              {visibleBlocks.length} <span className="text-slate-600 text-sm">/ {totalBlocks}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Prediction challenge */}
      <AnimatePresence>
        {prediction && (
          <motion.div
            key="prediction"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-2xl p-5 mb-4"
            style={{
              background: 'rgba(187,136,255,0.05)',
              border: '1px solid rgba(187,136,255,0.25)',
              boxShadow: prediction.revealed ? 'none' : '0 0 20px rgba(187,136,255,0.1)',
            }}
          >
            {!prediction.revealed ? (
              <>
                <div className="text-center mb-4">
                  <div className="text-[10px] font-mono text-purple-400 tracking-widest uppercase mb-1">
                    🎮 Prediction Challenge
                  </div>
                  <div className="font-orbitron text-sm text-white font-bold">
                    Which process runs next?
                  </div>
                </div>
                <div className="flex justify-center gap-3 flex-wrap">
                  {prediction.options.map(p => (
                    <motion.button
                      key={p.id}
                      whileHover={{ scale: 1.06, y: -2 }}
                      whileTap={{ scale: 0.94 }}
                      onClick={() => makePrediction(p.id)}
                      className="px-5 py-2.5 rounded-xl font-orbitron font-black text-base cursor-pointer"
                      style={{
                        background: `${p.color}18`,
                        border: `1px solid ${p.color}55`,
                        color: p.color,
                        boxShadow: `0 0 10px ${p.color}22`,
                      }}
                    >
                      P{p.pid}
                    </motion.button>
                  ))}
                </div>
                <div className="text-center mt-3">
                  <button
                    onClick={() => makePrediction('')}
                    className="text-xs font-mono text-slate-600 hover:text-slate-400 transition-colors cursor-pointer"
                  >
                    Skip →
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Result */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1">Result</div>
                    {prediction.selected === '' ? (
                      <div className="font-mono text-sm text-slate-400">
                        Correct answer:{' '}
                        <span
                          className="font-orbitron font-black"
                          style={{ color: processes.find(p => p.id === prediction.correctId)?.color }}
                        >
                          P{processes.find(p => p.id === prediction.correctId)?.pid}
                        </span>
                      </div>
                    ) : prediction.selected === prediction.correctId ? (
                      <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="flex items-center gap-2"
                      >
                        <span className="text-green-400 text-lg">✓</span>
                        <span className="font-orbitron text-sm text-green-400 font-bold">Correct!</span>
                        <span className="text-xs font-mono text-slate-500">
                          P{processes.find(p => p.id === prediction.correctId)?.pid} was next
                        </span>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="flex items-center gap-2"
                      >
                        <span className="text-red-400 text-lg">✗</span>
                        <span className="font-mono text-sm text-red-400">
                          You picked P{processes.find(p => p.id === prediction.selected!)?.pid}
                        </span>
                        <span className="text-xs font-mono text-slate-500">
                          · Correct: P{processes.find(p => p.id === prediction.correctId)?.pid}
                        </span>
                      </motion.div>
                    )}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={advanceExecution}
                    className="px-4 py-2 rounded-xl font-mono text-xs cursor-pointer"
                    style={{
                      background: 'linear-gradient(135deg, rgba(0,229,255,0.2), rgba(68,136,255,0.2))',
                      border: '1px solid rgba(0,229,255,0.4)',
                      color: '#00E5FF',
                    }}
                  >
                    Continue →
                  </motion.button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live Gantt preview */}
      {visibleBlocks.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl p-4 mb-4"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="text-[10px] font-mono text-slate-600 uppercase tracking-wider mb-3">Timeline</div>
          <div className="flex items-center gap-0 overflow-x-auto pb-1">
            {visibleBlocks.map((block, i) => {
              const width = (block.endTime - block.startTime) * 12;
              return (
                <motion.div
                  key={`${block.processId}-${block.startTime}`}
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="relative h-8 flex items-center justify-center shrink-0 overflow-hidden"
                  style={{
                    background: block.color + '33',
                    borderTop: `2px solid ${block.color}`,
                    borderBottom: `2px solid ${block.color}`,
                    borderRight: i < visibleBlocks.length - 1 ? `1px solid ${block.color}44` : `2px solid ${block.color}`,
                    borderLeft: i === 0 ? `2px solid ${block.color}` : 'none',
                  }}
                  title={`P${block.pid}: t=${block.startTime}–${block.endTime}`}
                >
                  <span
                    className="font-orbitron text-[10px] font-bold whitespace-nowrap px-1"
                    style={{ color: block.color }}
                  >
                    P{block.pid}
                  </span>
                </motion.div>
              );
            })}
          </div>
          {/* Time axis */}
          <div className="flex mt-1 overflow-x-auto">
            {visibleBlocks.map((block, i) => {
              const width = (block.endTime - block.startTime) * 12;
              return (
                <div
                  key={`time-${i}`}
                  className="shrink-0 text-[8px] font-mono text-slate-700"
                  style={{ width, paddingLeft: 2 }}
                >
                  {block.startTime}
                </div>
              );
            })}
            {visibleBlocks.length > 0 && (
              <div className="text-[8px] font-mono text-slate-700 ml-0.5">
                {visibleBlocks[visibleBlocks.length - 1].endTime}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => goToStep('algorithm')}
          className="text-sm font-mono text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
        >
          ← Back
        </button>
        <div className="flex gap-3">
          {/* Auto play toggle */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setPlaying(!isPlaying)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xs cursor-pointer"
            style={{
              background: isPlaying ? 'rgba(255,68,102,0.15)' : 'rgba(0,255,136,0.1)',
              border: `1px solid ${isPlaying ? 'rgba(255,68,102,0.4)' : 'rgba(0,255,136,0.3)'}`,
              color: isPlaying ? '#FF4466' : '#00FF88',
            }}
          >
            {isPlaying ? '⏸ Pause' : '▶ Auto Run'}
          </motion.button>

          {/* Step button */}
          {!isPlaying && !isAllDone && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={advanceExecution}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xs cursor-pointer"
              style={{
                background: 'rgba(0,229,255,0.1)',
                border: '1px solid rgba(0,229,255,0.3)',
                color: '#00E5FF',
              }}
            >
              Step →
            </motion.button>
          )}

          {/* View full timeline */}
          {isAllDone && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => goToStep('complete')}
              className="flex items-center gap-2 px-5 py-2 rounded-xl font-orbitron font-bold text-sm cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #00E5FF, #4488FF)',
                color: '#050A14',
                boxShadow: '0 0 20px rgba(0,229,255,0.4)',
              }}
            >
              View Results →
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

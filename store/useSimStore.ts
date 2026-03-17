'use client';
import { create } from 'zustand';
import { Process, TimelineBlock, Algorithm, AppStep, ScheduleResult } from '@/types';
import { computeSchedule, createProcess, resetPidCounter } from '@/utils/scheduling';

export interface PredictionState {
  options: Process[];
  correctId: string;
  selected: string | null;
  revealed: boolean;
}

interface SimState {
  step: AppStep;
  processes: Process[];
  selectedAlgorithm: Algorithm | null;
  schedule: ScheduleResult | null;
  executionIndex: number;
  visibleBlocks: TimelineBlock[];
  isPlaying: boolean;
  isExplainMode: boolean;
  prediction: PredictionState | null;

  goToStep: (step: AppStep) => void;
  addProcess: (overrides?: Partial<Process>) => void;
  removeProcess: (id: string) => void;
  selectAlgorithm: (algo: Algorithm) => void;
  startExecution: () => void;
  advanceExecution: () => void;
  setPlaying: (val: boolean) => void;
  toggleExplainMode: () => void;
  makePrediction: (processId: string) => void;
  resetSimulation: () => void;
}

function buildPrediction(processes: Process[], blocks: TimelineBlock[], index: number): PredictionState | null {
  if (index >= blocks.length) return null;
  const nextBlock = blocks[index];
  const correct = processes.find(p => p.id === nextBlock.processId);
  if (!correct) return null;

  const others = processes.filter(p => p.id !== nextBlock.processId);
  const shuffled = [...others].sort(() => Math.random() - 0.5).slice(0, 2);
  const options = [...shuffled, correct].sort(() => Math.random() - 0.5);

  return { options, correctId: correct.id, selected: null, revealed: false };
}

export const useSimStore = create<SimState>((set, get) => ({
  step: 'landing',
  processes: [],
  selectedAlgorithm: null,
  schedule: null,
  executionIndex: 0,
  visibleBlocks: [],
  isPlaying: false,
  isExplainMode: true,
  prediction: null,

  goToStep: (step) => set({ step }),

  addProcess: (overrides) => {
    const p = createProcess(overrides);
    set(state => ({ processes: [...state.processes, p] }));
  },

  removeProcess: (id) => {
    set(state => ({ processes: state.processes.filter(p => p.id !== id) }));
  },

  selectAlgorithm: (algo) => set({ selectedAlgorithm: algo }),

  startExecution: () => {
    const { processes, selectedAlgorithm } = get();
    if (!selectedAlgorithm || processes.length === 0) return;
    const schedule = computeSchedule(processes, selectedAlgorithm);
    const prediction = buildPrediction(processes, schedule.blocks, 0);
    set({ schedule, executionIndex: 0, visibleBlocks: [], prediction });
  },

  advanceExecution: () => {
    const { schedule, executionIndex, visibleBlocks, prediction, processes } = get();
    if (!schedule) return;

    // If prediction shown but not yet revealed, reveal it first
    if (prediction && !prediction.revealed) {
      set(state => ({
        prediction: state.prediction ? { ...state.prediction, revealed: true } : null,
      }));
      return;
    }

    // If revealed, advance to next block
    if (executionIndex >= schedule.blocks.length) {
      set({ step: 'complete', isPlaying: false });
      return;
    }

    const currentBlock = schedule.blocks[executionIndex];
    const newBlocks = [...visibleBlocks, currentBlock];
    const newIndex = executionIndex + 1;

    const nextPrediction = newIndex < schedule.blocks.length
      ? buildPrediction(processes, schedule.blocks, newIndex)
      : null;

    set({
      visibleBlocks: newBlocks,
      executionIndex: newIndex,
      prediction: nextPrediction,
    });

    if (newIndex >= schedule.blocks.length && !nextPrediction) {
      setTimeout(() => set({ step: 'complete', isPlaying: false }), 1400);
    }
  },

  setPlaying: (val) => set({ isPlaying: val }),

  toggleExplainMode: () => set(state => ({ isExplainMode: !state.isExplainMode })),

  makePrediction: (processId) => {
    set(state => ({
      prediction: state.prediction
        ? { ...state.prediction, selected: processId, revealed: true }
        : null,
    }));
  },

  resetSimulation: () => {
    resetPidCounter();
    set({
      step: 'create',
      processes: [],
      selectedAlgorithm: null,
      schedule: null,
      executionIndex: 0,
      visibleBlocks: [],
      isPlaying: false,
      prediction: null,
    });
  },
}));

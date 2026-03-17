import { Process, TimelineBlock, ScheduleResult, Algorithm, PROCESS_COLORS } from '@/types';

const QUANTUM = 4;

function computeFCFS(processes: Process[]): TimelineBlock[] {
  const sorted = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
  const blocks: TimelineBlock[] = [];
  let time = 0;
  for (const p of sorted) {
    blocks.push({ pid: p.pid, processId: p.id, startTime: time, endTime: time + p.burstTime, color: p.color });
    time += p.burstTime;
  }
  return blocks;
}

function computeSJF(processes: Process[]): TimelineBlock[] {
  const sorted = [...processes].sort((a, b) => a.burstTime - b.burstTime);
  const blocks: TimelineBlock[] = [];
  let time = 0;
  for (const p of sorted) {
    blocks.push({ pid: p.pid, processId: p.id, startTime: time, endTime: time + p.burstTime, color: p.color });
    time += p.burstTime;
  }
  return blocks;
}

function computePriority(processes: Process[]): TimelineBlock[] {
  const sorted = [...processes].sort((a, b) => a.priority - b.priority);
  const blocks: TimelineBlock[] = [];
  let time = 0;
  for (const p of sorted) {
    blocks.push({ pid: p.pid, processId: p.id, startTime: time, endTime: time + p.burstTime, color: p.color });
    time += p.burstTime;
  }
  return blocks;
}

function computeRR(processes: Process[]): TimelineBlock[] {
  type QItem = { id: string; pid: number; remaining: number; color: string };
  const queue: QItem[] = processes.map(p => ({ id: p.id, pid: p.pid, remaining: p.burstTime, color: p.color }));
  const blocks: TimelineBlock[] = [];
  let time = 0;

  const readyQueue = [...queue];
  let iterations = 0;
  while (readyQueue.length > 0 && iterations < 10000) {
    const current = readyQueue.shift()!;
    const duration = Math.min(QUANTUM, current.remaining);
    blocks.push({ pid: current.pid, processId: current.id, startTime: time, endTime: time + duration, color: current.color });
    time += duration;
    current.remaining -= duration;
    if (current.remaining > 0) readyQueue.push(current);
    iterations++;
  }
  return blocks;
}

export function computeSchedule(processes: Process[], algorithm: Algorithm): ScheduleResult {
  let blocks: TimelineBlock[];
  switch (algorithm) {
    case 'fcfs': blocks = computeFCFS(processes); break;
    case 'sjf': blocks = computeSJF(processes); break;
    case 'priority': blocks = computePriority(processes); break;
    case 'rr': blocks = computeRR(processes); break;
    default: blocks = computeFCFS(processes);
  }

  // Compute waiting and turnaround times per process
  const finishTimes: Record<string, number> = {};
  for (const b of blocks) {
    finishTimes[b.processId] = b.endTime;
  }

  const waitingTimes: Record<string, number> = {};
  const turnaroundTimes: Record<string, number> = {};
  for (const p of processes) {
    const finish = finishTimes[p.id] ?? 0;
    turnaroundTimes[p.id] = finish - p.arrivalTime;
    waitingTimes[p.id] = turnaroundTimes[p.id] - p.burstTime;
  }

  return { blocks, waitingTimes, turnaroundTimes };
}

export function getPreviewOrder(processes: Process[], algorithm: Algorithm): Process[] {
  switch (algorithm) {
    case 'fcfs': return [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
    case 'sjf': return [...processes].sort((a, b) => a.burstTime - b.burstTime);
    case 'priority': return [...processes].sort((a, b) => a.priority - b.priority);
    case 'rr': return [...processes];
    default: return processes;
  }
}

let pidCounter = 1;
export function createProcess(overrides?: Partial<Process>): Process {
  const pid = pidCounter++;
  const colorIndex = (pid - 1) % PROCESS_COLORS.length;
  return {
    id: `proc-${pid}-${Date.now()}`,
    pid,
    burstTime: overrides?.burstTime ?? Math.floor(Math.random() * 12) + 3,
    remainingTime: overrides?.burstTime ?? Math.floor(Math.random() * 12) + 3,
    priority: overrides?.priority ?? Math.floor(Math.random() * 9) + 1,
    arrivalTime: overrides?.arrivalTime ?? 0,
    status: 'ready',
    color: PROCESS_COLORS[colorIndex],
    ...overrides,
  };
}

export function resetPidCounter() {
  pidCounter = 1;
}

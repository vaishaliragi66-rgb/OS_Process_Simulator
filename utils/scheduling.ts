import { Process, TimelineBlock, ScheduleResult, Algorithm, PROCESS_COLORS } from '@/types';

const QUANTUM = 4;
const CS_COLOR = '#6B7280'; // gray for context switches

// Insert context switch blocks between different processes
function insertContextSwitches(blocks: TimelineBlock[], contextSwitchTime: number): TimelineBlock[] {
  if (contextSwitchTime === 0 || blocks.length === 0) return blocks;
  
  const result: TimelineBlock[] = [];
  let timeOffset = 0;
  
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    
    // Add context switch before this block if it's not the first and processId changed
    if (i > 0 && blocks[i - 1].processId !== block.processId) {
      result.push({
        pid: -1, // Special PID for context switch
        processId: 'context-switch',
        startTime: block.startTime + timeOffset,
        endTime: block.startTime + timeOffset + contextSwitchTime,
        color: CS_COLOR,
        type: 'context-switch',
        label: 'CS',
      });
      timeOffset += contextSwitchTime;
    }
    
    // Add the process block with adjusted time
    result.push({
      ...block,
      startTime: block.startTime + timeOffset,
      endTime: block.endTime + timeOffset,
    });
  }
  
  return result;
}

function computeFCFS(processes: Process[]): TimelineBlock[] {
  const sorted = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
  const blocks: TimelineBlock[] = [];
  let time = 0;
  for (const p of sorted) {
    blocks.push({ pid: p.pid, processId: p.id, startTime: time, endTime: time + p.burstTime, color: p.color, type: 'process' });
    time += p.burstTime;
  }
  return blocks;
}

function computeSJF(processes: Process[]): TimelineBlock[] {
  const sorted = [...processes].sort((a, b) => a.burstTime - b.burstTime);
  const blocks: TimelineBlock[] = [];
  let time = 0;
  for (const p of sorted) {
    blocks.push({ pid: p.pid, processId: p.id, startTime: time, endTime: time + p.burstTime, color: p.color, type: 'process' });
    time += p.burstTime;
  }
  return blocks;
}

function computePriority(processes: Process[]): TimelineBlock[] {
  const sorted = [...processes].sort((a, b) => a.priority - b.priority);
  const blocks: TimelineBlock[] = [];
  let time = 0;
  for (const p of sorted) {
    blocks.push({ pid: p.pid, processId: p.id, startTime: time, endTime: time + p.burstTime, color: p.color, type: 'process' });
    time += p.burstTime;
  }
  return blocks;
}

function computeRR(processes: Process[], quantum: number = 4): TimelineBlock[] {
  type QItem = { id: string; pid: number; remaining: number; color: string };
  const queue: QItem[] = processes.map(p => ({ id: p.id, pid: p.pid, remaining: p.burstTime, color: p.color }));
  const blocks: TimelineBlock[] = [];
  let time = 0;

  const readyQueue = [...queue];
  let iterations = 0;
  while (readyQueue.length > 0 && iterations < 10000) {
    const current = readyQueue.shift()!;
    const duration = Math.min(quantum, current.remaining);
    blocks.push({ pid: current.pid, processId: current.id, startTime: time, endTime: time + duration, color: current.color, type: 'process' });
    time += duration;
    current.remaining -= duration;
    if (current.remaining > 0) readyQueue.push(current);
    iterations++;
  }
  return blocks;
}

// SRTF (Shortest Remaining Time First) - Preemptive SJF
function computeSRTF(processes: Process[]): TimelineBlock[] {
  type ProcState = { id: string; pid: number; arrivalTime: number; remaining: number; color: string };
  
  const procs: ProcState[] = processes.map(p => ({
    id: p.id,
    pid: p.pid,
    arrivalTime: p.arrivalTime,
    remaining: p.burstTime,
    color: p.color,
  }));

  const blocks: TimelineBlock[] = [];
  let time = 0;
  const completed: Set<string> = new Set();

  while (completed.size < procs.length) {
    // Get processes that have arrived
    const available = procs.filter(p => p.arrivalTime <= time && !completed.has(p.id) && p.remaining > 0);
    
    if (available.length === 0) {
      // No process available, advance time to next arrival
      const nextArrival = Math.min(...procs.filter(p => p.arrivalTime > time && !completed.has(p.id)).map(p => p.arrivalTime));
      if (nextArrival !== Infinity) {
        time = nextArrival;
        continue;
      }
      break;
    }

    // Select process with shortest remaining time
    const selected = available.reduce((min, p) => p.remaining < min.remaining ? p : min);
    
    // Find next preemption point (new arrival or process completion)
    const nextArrival = Math.min(...procs.filter(p => p.arrivalTime > time).map(p => p.arrivalTime), Infinity);
    const executionTime = Math.min(selected.remaining, nextArrival - time);
    
    if (executionTime > 0) {
      blocks.push({
        pid: selected.pid,
        processId: selected.id,
        startTime: time,
        endTime: time + executionTime,
        color: selected.color,
        type: 'process',
      });
      
      selected.remaining -= executionTime;
      time += executionTime;
      
      if (selected.remaining === 0) {
        completed.add(selected.id);
      }
    }
  }

  return blocks;
}

// Preemptive Priority Scheduling
function computePreemptivePriority(processes: Process[]): TimelineBlock[] {
  type ProcState = { id: string; pid: number; arrivalTime: number; remaining: number; priority: number; color: string };
  
  const procs: ProcState[] = processes.map(p => ({
    id: p.id,
    pid: p.pid,
    arrivalTime: p.arrivalTime,
    remaining: p.burstTime,
    priority: p.priority,
    color: p.color,
  }));

  const blocks: TimelineBlock[] = [];
  let time = 0;
  const completed: Set<string> = new Set();

  while (completed.size < procs.length) {
    // Get processes that have arrived
    const available = procs.filter(p => p.arrivalTime <= time && !completed.has(p.id) && p.remaining > 0);
    
    if (available.length === 0) {
      // No process available, advance time to next arrival
      const nextArrival = Math.min(...procs.filter(p => p.arrivalTime > time && !completed.has(p.id)).map(p => p.arrivalTime));
      if (nextArrival !== Infinity) {
        time = nextArrival;
        continue;
      }
      break;
    }

    // Select process with highest priority (lower number = higher priority)
    const selected = available.reduce((min, p) => p.priority < min.priority ? p : min);
    
    // Find next preemption point (new arrival or process completion)
    const nextArrival = Math.min(...procs.filter(p => p.arrivalTime > time).map(p => p.arrivalTime), Infinity);
    const executionTime = Math.min(selected.remaining, nextArrival - time);
    
    if (executionTime > 0) {
      blocks.push({
        pid: selected.pid,
        processId: selected.id,
        startTime: time,
        endTime: time + executionTime,
        color: selected.color,
        type: 'process',
      });
      
      selected.remaining -= executionTime;
      time += executionTime;
      
      if (selected.remaining === 0) {
        completed.add(selected.id);
      }
    }
  }

  return blocks;
}

export function computeSchedule(
  processes: Process[], 
  algorithm: Algorithm, 
  contextSwitchTime: number = 1,
  quantum: number = 4
): ScheduleResult {
  let blocks: TimelineBlock[];
  switch (algorithm) {
    case 'fcfs': blocks = computeFCFS(processes); break;
    case 'sjf': blocks = computeSJF(processes); break;
    case 'priority': blocks = computePriority(processes); break;
    case 'rr': blocks = computeRR(processes, quantum); break;
    case 'srtf': blocks = computeSRTF(processes); break;
    case 'preemptive-priority': blocks = computePreemptivePriority(processes); break;
    default: blocks = computeFCFS(processes);
  }

  // Insert context switches
  const blocksWithCS = insertContextSwitches(blocks, contextSwitchTime);
  
  // Count context switches
  const contextSwitches = blocksWithCS.filter(b => b.type === 'context-switch').length;

  // Compute waiting and turnaround times per process
  const finishTimes: Record<string, number> = {};
  for (const b of blocksWithCS) {
    if (b.type === 'process') {
      finishTimes[b.processId] = b.endTime;
    }
  }

  const waitingTimes: Record<string, number> = {};
  const turnaroundTimes: Record<string, number> = {};
  for (const p of processes) {
    const finish = finishTimes[p.id] ?? 0;
    turnaroundTimes[p.id] = finish - p.arrivalTime;
    waitingTimes[p.id] = turnaroundTimes[p.id] - p.burstTime;
  }

  // Calculate total time and metrics
  const totalTime = blocksWithCS.length > 0 ? blocksWithCS[blocksWithCS.length - 1].endTime : 0;
  const totalCPUTime = blocksWithCS
    .filter(b => b.type === 'process')
    .reduce((sum, b) => sum + (b.endTime - b.startTime), 0);
  
  const cpuUtilization = totalTime > 0 ? (totalCPUTime / totalTime) * 100 : 0;
  const throughput = totalTime > 0 ? processes.length / totalTime : 0;

  return { 
    blocks: blocksWithCS, 
    waitingTimes, 
    turnaroundTimes,
    cpuUtilization,
    throughput,
    contextSwitches,
    totalTime,
  };
}

export function getPreviewOrder(processes: Process[], algorithm: Algorithm): Process[] {
  switch (algorithm) {
    case 'fcfs': return [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
    case 'sjf': return [...processes].sort((a, b) => a.burstTime - b.burstTime);
    case 'priority': 
    case 'preemptive-priority': 
      return [...processes].sort((a, b) => a.priority - b.priority);
    case 'srtf': return [...processes].sort((a, b) => a.burstTime - b.burstTime);
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

import { Process, Algorithm, TimelineBlock } from '@/types';

export interface StepExecutionState {
  currentTime: number;
  readyQueue: Process[];
  waitingProcesses: Process[]; // Not yet arrived
  runningProcess: Process | null;
  completedProcesses: Set<string>;
  explanation: string;
  processStates: Record<string, {
    remainingTime: number;
    completionTime?: number;
    waitingTime?: number;
    turnaroundTime?: number;
  }>;
  ganttBlocks: TimelineBlock[];
  quantum?: number;
  lastContextSwitchTime?: number;
}

export function initializeStepExecution(
  processes: Process[],
  algorithm: Algorithm,
  quantum?: number
): StepExecutionState {
  // Sort by arrival time to track waiting processes
  const sorted = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
  
  return {
    currentTime: 0,
    readyQueue: [],
    waitingProcesses: sorted,
    runningProcess: null,
    completedProcesses: new Set(),
    explanation: 'Simulation starting. Processes will enter the ready queue as they arrive.',
    processStates: processes.reduce((acc, p) => ({
      ...acc,
      [p.id]: { remainingTime: p.burstTime }
    }), {}),
    ganttBlocks: [],
    quantum,
  };
}

function generateExplanation(
  algorithm: Algorithm,
  selectedProcess: Process | null,
  readyQueue: Process[],
  currentTime: number,
  quantum?: number
): string {
  if (!selectedProcess) {
    if (readyQueue.length === 0) {
      return `Time ${currentTime}: No processes in ready queue. Waiting for arrivals...`;
    }
    return `Time ${currentTime}: Ready queue empty, CPU idle.`;
  }

  const pid = `P${selectedProcess.pid}`;
  
  switch (algorithm) {
    case 'fcfs':
      return `Time ${currentTime}: ${pid} selected (FCFS - first arrival in queue, arrived at t=${selectedProcess.arrivalTime})`;
    case 'sjf':
      return `Time ${currentTime}: ${pid} selected (SJF - shortest burst time of ${selectedProcess.burstTime} units)`;
    case 'srtf':
      return `Time ${currentTime}: ${pid} selected (SRTF - shortest remaining time of ${selectedProcess.remainingTime} units)`;
    case 'priority':
      return `Time ${currentTime}: ${pid} selected (Priority ${selectedProcess.priority} - lower number = higher priority)`;
    case 'preemptive-priority':
      return `Time ${currentTime}: ${pid} selected (Preemptive Priority ${selectedProcess.priority} - highest priority available)`;
    case 'rr':
      return `Time ${currentTime}: ${pid} selected (Round Robin - executes for quantum=${quantum || 4} units)`;
    default:
      return `Time ${currentTime}: ${pid} is now running`;
  }
}

function selectNextProcess(
  algorithm: Algorithm,
  readyQueue: Process[]
): Process | null {
  if (readyQueue.length === 0) return null;

  switch (algorithm) {
    case 'fcfs':
      // Already sorted by arrival in ready queue
      return readyQueue[0];
    case 'sjf':
      return readyQueue.reduce((shortest, p) => 
        p.burstTime < shortest.burstTime ? p : shortest
      );
    case 'srtf':
      return readyQueue.reduce((shortest, p) => 
        p.remainingTime < shortest.remainingTime ? p : shortest
      );
    case 'priority':
    case 'preemptive-priority':
      return readyQueue.reduce((highest, p) => 
        p.priority < highest.priority ? p : highest
      );
    case 'rr':
      // Round robin takes first in queue
      return readyQueue[0];
    default:
      return readyQueue[0];
  }
}

export function executeStep(
  state: StepExecutionState,
  algorithm: Algorithm
): StepExecutionState {
  const newState = { ...state };
  
  // Step 1: Check for new arrivals and add to ready queue
  const arrivals = newState.waitingProcesses.filter(p => p.arrivalTime <= newState.currentTime);
  if (arrivals.length > 0) {
    newState.readyQueue = [...newState.readyQueue, ...arrivals];
    newState.waitingProcesses = newState.waitingProcesses.filter(p => p.arrivalTime > newState.currentTime);
  }
  
  // Step 2: If no running process, select next one
  if (!newState.runningProcess) {
    const selected = selectNextProcess(algorithm, newState.readyQueue);
    
    if (!selected) {
      // No process available, advance time to next arrival
      if (newState.waitingProcesses.length > 0) {
        const nextArrival = Math.min(...newState.waitingProcesses.map(p => p.arrivalTime));
        newState.currentTime = nextArrival;
        newState.explanation = `Time ${state.currentTime} → ${nextArrival}: CPU idle, fast-forwarding to next arrival`;
        return newState;
      } else {
        // All done
        newState.explanation = 'All processes completed!';
        return newState;
      }
    }
    
    newState.runningProcess = { ...selected };
    newState.readyQueue = newState.readyQueue.filter(p => p.id !== selected.id);
    newState.explanation = generateExplanation(algorithm, selected, newState.readyQueue, newState.currentTime, newState.quantum);
  }
  
  // Step 3: Execute the running process
  const running = newState.runningProcess!;
  const execTime = algorithm === 'rr' 
    ? Math.min(newState.quantum || 4, running.remainingTime)
    : running.remainingTime;
  
  const startTime = newState.currentTime;
  const endTime = startTime + execTime;
  
  // Add to Gantt chart
  newState.ganttBlocks = [
    ...newState.ganttBlocks,
    {
      pid: running.pid,
      processId: running.id,
      startTime,
      endTime,
      color: running.color,
      type: 'process',
    }
  ];
  
  // Update process state
  running.remainingTime -= execTime;
  newState.processStates[running.id].remainingTime = running.remainingTime;
  newState.currentTime = endTime;
  
  // Step 4: Check if process completed
  if (running.remainingTime === 0) {
    newState.completedProcesses.add(running.id);
    newState.processStates[running.id].completionTime = endTime;
    newState.processStates[running.id].turnaroundTime = endTime - running.arrivalTime;
    newState.processStates[running.id].waitingTime = 
      newState.processStates[running.id].turnaroundTime! - running.burstTime;
    newState.runningProcess = null;
    newState.explanation += ` → P${running.pid} completed at t=${endTime}`;
  } else if (algorithm === 'rr') {
    // Process used its quantum, move to back of queue
    newState.readyQueue.push(running);
    newState.runningProcess = null;
    newState.explanation += ` → P${running.pid} used quantum, moved to back of queue`;
  } else {
    // Process continues (non-preemptive or will be preempted next step)
    newState.runningProcess = null;
  }
  
  return newState;
}

export function isExecutionComplete(state: StepExecutionState, totalProcesses: number): boolean {
  return state.completedProcesses.size === totalProcesses && 
         state.waitingProcesses.length === 0 && 
         state.readyQueue.length === 0 &&
         state.runningProcess === null;
}

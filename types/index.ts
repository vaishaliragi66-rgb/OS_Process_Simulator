export type ProcessStatus = 'ready' | 'running' | 'terminated';
export type Algorithm = 'fcfs' | 'sjf' | 'priority' | 'rr' | 'srtf' | 'preemptive-priority';
export type AppStep = 'landing' | 'create' | 'queue' | 'algorithm' | 'execution' | 'complete';
export type BlockType = 'process' | 'context-switch';

export interface Process {
  id: string;
  pid: number;
  burstTime: number;
  remainingTime: number;
  priority: number;
  arrivalTime: number;
  status: ProcessStatus;
  color: string;
}

export interface TimelineBlock {
  pid: number;
  processId: string;
  startTime: number;
  endTime: number;
  color: string;
  type?: BlockType; // 'process' by default, 'context-switch' for CS blocks
  label?: string; // Optional label like 'CS'
}

export interface ScheduleResult {
  blocks: TimelineBlock[];
  waitingTimes: Record<string, number>;
  turnaroundTimes: Record<string, number>;
  cpuUtilization?: number;
  throughput?: number;
  contextSwitches?: number;
  totalTime?: number;
}

export const PROCESS_COLORS: string[] = [
  '#00E5FF', // cyan
  '#00FF88', // green
  '#FFB800', // amber
  '#FF4466', // red
  '#BB88FF', // purple
  '#FF8844', // orange
];

export const ALGORITHM_INFO: Record<Algorithm, { name: string; short: string; explanation: string }> = {
  fcfs: {
    name: 'FCFS',
    short: 'First Come First Serve',
    explanation: 'Processes run in the order they arrive. Simple but can cause long wait times.',
  },
  sjf: {
    name: 'SJF',
    short: 'Shortest Job First',
    explanation: 'Shortest burst time runs first. Minimizes average wait time.',
  },
  priority: {
    name: 'Priority',
    short: 'Priority Scheduling',
    explanation: 'Higher priority processes run first. Lower number = higher priority.',
  },
  rr: {
    name: 'Round Robin',
    short: 'Round Robin (Q=4)',
    explanation: 'Each process gets a fixed time slice (quantum=4). Fair and responsive.',
  },
  srtf: {
    name: 'SRTF',
    short: 'Shortest Remaining Time First',
    explanation: 'Preemptive SJF. Process with shortest remaining time runs. Preempts on new arrivals.',
  },
  'preemptive-priority': {
    name: 'Preemptive Priority',
    short: 'Priority with Preemption',
    explanation: 'Higher priority processes can interrupt lower priority ones. Lower number = higher priority.',
  },
};

export type ProcessStatus = 'ready' | 'running' | 'terminated';
export type Algorithm = 'fcfs' | 'sjf' | 'priority' | 'rr';
export type AppStep = 'landing' | 'create' | 'queue' | 'algorithm' | 'execution' | 'complete';

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
}

export interface ScheduleResult {
  blocks: TimelineBlock[];
  waitingTimes: Record<string, number>;
  turnaroundTimes: Record<string, number>;
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
};

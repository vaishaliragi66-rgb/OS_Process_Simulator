# OS Process Scheduler Simulator

An interactive, visual web application that demonstrates how different CPU scheduling algorithms work in operating systems. Built with Next.js, TypeScript, and Framer Motion for smooth animations.

![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 🎯 Overview

This educational simulator helps students and developers understand how operating system process schedulers work by providing a hands-on, visual experience. Create processes, select scheduling algorithms, and watch in real-time as the CPU executes them according to different scheduling policies.

## ✨ Features

### Core Features
- **Interactive Process Creation**: Add custom processes with configurable burst times, priorities, and arrival times
- **6 Scheduling Algorithms**:
  - **FCFS** (First Come First Serve) - Processes execute in arrival order
  - **SJF** (Shortest Job First) - Shortest burst time gets priority (non-preemptive)
  - **SRTF** (Shortest Remaining Time First) - Preemptive SJF with dynamic scheduling
  - **Priority Scheduling** - Higher priority processes run first (non-preemptive)
  - **Preemptive Priority** - Higher priority can interrupt lower priority processes
  - **Round Robin** - Time-sliced execution with quantum = 4
- **Visual Timeline**: Animated Gantt chart showing process execution
- **Context Switch Visualization**: See CPU overhead when switching between processes
- **Performance Metrics**: 
  - Waiting time and turnaround time per process
  - CPU utilization percentage
  - Throughput (processes/time unit)
  - Context switch count
- **Interactive Predictions**: Test your understanding by predicting which process runs next
- **Explain Mode**: Toggle detailed explanations for each step

### 🎓 Learning Features (NEW!)
- **Algorithm Explanation**: Before execution, learn how the algorithm works with:
  - Step-by-step logic breakdown
  - Animated workflow visualization (Ready Queue → Select → Execute → Complete)
  - Clear, concise descriptions
- **Pre-Execution Quiz**: Test your understanding before simulation
  - View all process details in a table
  - Predict which process executes first
  - Get instant feedback with explanations
  - Must answer correctly to start simulation
- **Interactive Learning Flow**: 
  - Understand → Test → Validate → Watch

### Advanced Features
- **Real-Time Simulation Mode**: Watch processes execute with configurable speed (0.5s, 1s, 2s per time unit)
- **File Upload**: Import process definitions from text files
- **Export Results**: 
  - Download Gantt chart as PNG image
  - Export complete simulation data as JSON
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Smooth Animations**: Powered by Framer Motion for fluid transitions

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/OS_Process_Simulator.git
cd OS_Process_Simulator
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

### Build for Production

```bash
npm run build
npm start
```

## 📖 How to Use

1. **Start**: Click "Start Simulation" on the landing screen
2. **Create Processes**: 
   - Click "Create Process" to add processes with random parameters
   - Use "Custom Burst" to specify exact burst time
   - Upload a text file with process definitions (see file format below)
3. **View Queue**: See all created processes in the ready queue
4. **Select Algorithm**: Choose from FCFS, SJF, SRTF, Priority, Preemptive Priority, or Round Robin
5. **Learn & Test** (NEW!):
   - Read the algorithm explanation and see animated workflow
   - View process table with all parameters
   - Answer the quiz question: "Which process executes first?"
   - Get instant feedback with detailed explanation
   - ✅ Unlock simulation after answering correctly
6. **Configure Settings**:
   - Toggle Real-Time Mode for step-by-step visualization
   - Adjust playback speed (Fast, Normal, Slow)
7. **Watch Execution**: Observe the CPU executing processes with visual timeline and context switches
8. **Analyze Results**: Review metrics including:
   - Waiting times and turnaround times
   - CPU utilization and throughput
   - Context switch overhead
9. **Export**: Download Gantt chart as image or complete data as JSON
10. **Try Predictions**: Test your knowledge by predicting next process execution

### File Upload Format

Create a text file with one process per line in the format:
```
ProcessID BurstTime ArrivalTime Priority
```

Example (`sample-processes.txt`):
```
P1 5 0 2
P2 3 1 1
P3 8 2 3
P4 6 3 2
```

**Field Ranges:**
- **BurstTime**: 1-30 time units
- **ArrivalTime**: 0-20 time units
- **Priority**: 1-10 (lower number = higher priority)

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) - React framework with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) - Lightweight state management
- **Animations**: [Framer Motion](https://www.framer.com/motion/) - Production-ready animations
- **Charts**: [Recharts](https://recharts.org/) - Composable charting library
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- **Export**: [html-to-image](https://github.com/bubkoo/html-to-image) - DOM to image conversion

## 📁 Project Structure

```
OS_Process_Simulator/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── SimulatorApp.tsx   # Main app component
│   ├── LandingScreen.tsx  # Welcome screen
│   ├── ProcessCreation.tsx # Process input form
│   ├── ReadyQueueDisplay.tsx # Process queue view
│   ├── AlgorithmSelector.tsx # Algorithm picker
│   ├── CPUExecution.tsx    # Execution timeline
│   ├── CompletionSummary.tsx # Results screen
│   ├── ProcessCard.tsx     # Individual process display
│   ├── ExplainBox.tsx      # Explanation panel
│   ├── ExplainToggle.tsx   # Toggle for explanations
│   ├── StepIndicator.tsx   # Progress indicator
│   └── Background.tsx      # Animated background
├── store/                  # State management
│   └── useSimStore.ts      # Zustand store
├── types/                  # TypeScript definitions
│   └── index.ts            # Type definitions
├── utils/                  # Utility functions
│   └── scheduling.ts       # Scheduling algorithms
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript config
├── tailwind.config.ts      # Tailwind config
└── next.config.js          # Next.js config
```

## 🧮 Scheduling Algorithms

### FCFS (First Come First Serve)
- **Type**: Non-preemptive
- **Strategy**: Executes processes in order of arrival
- **Pros**: Simple, no starvation
- **Cons**: Can cause long waiting times (convoy effect)
- **Use Case**: Batch systems

### SJF (Shortest Job First)
- **Type**: Non-preemptive
- **Strategy**: Selects process with shortest burst time
- **Pros**: Minimizes average waiting time
- **Cons**: Can cause starvation for long processes
- **Use Case**: Known burst times

### SRTF (Shortest Remaining Time First)
- **Type**: Preemptive
- **Strategy**: Preemptive version of SJF, switches to shorter jobs
- **Pros**: Optimal average waiting time
- **Cons**: High context switching overhead, starvation possible
- **Use Case**: Time-sharing systems with known burst times

### Priority Scheduling
- **Type**: Non-preemptive
- **Strategy**: Higher priority (lower number) executes first
- **Pros**: Important tasks get priority
- **Cons**: Can cause starvation (mitigated with aging)
- **Use Case**: Real-time systems

### Preemptive Priority
- **Type**: Preemptive
- **Strategy**: Higher priority can interrupt lower priority
- **Pros**: Immediate response to high-priority tasks
- **Cons**: Complexity, potential starvation
- **Use Case**: Real-time operating systems

### Round Robin
- **Type**: Preemptive
- **Strategy**: Each process gets fixed time quantum (4 units)
- **Pros**: Fair allocation, no starvation
- **Cons**: Higher context switching overhead
- **Use Case**: Time-sharing systems

## 📊 Performance Metrics

The simulator calculates and displays:

### Per-Process Metrics
- **Waiting Time**: Time spent in ready queue before execution starts
- **Turnaround Time**: Total time from arrival to completion
  - Formula: `Turnaround Time = Completion Time - Arrival Time`
  - Also: `Turnaround Time = Burst Time + Waiting Time`

### System-Wide Metrics
- **Average Waiting Time**: Mean waiting time across all processes
- **Average Turnaround Time**: Mean turnaround time across all processes
- **CPU Utilization**: Percentage of time CPU is actively executing processes
  - Formula: `(Total CPU Time / Total Simulation Time) × 100`
- **Throughput**: Number of processes completed per time unit
  - Formula: `Number of Processes / Total Time`
- **Context Switches**: Total number of process switches
  - Each switch adds overhead (default: 1 time unit)

### Gantt Chart
- Visual timeline showing when each process executes
- Context switch blocks (CS) shown in gray
- Time markers for reference

## 🎨 Customization

### Modify Time Quantum (Round Robin)

Edit `utils/scheduling.ts`:
```typescript
const QUANTUM = 4; // Change this value
```

### Adjust Context Switch Time

Default is 1 time unit. Can be configured in the Zustand store:
```typescript
setContextSwitchTime(2); // 2 time units
```

To disable context switches, set to 0.

### Modify Real-Time Speed

Edit `components/CPUExecution.tsx`:
```typescript
<option value={500}>Fast (0.5s)</option>
<option value={1000}>Normal (1s)</option>
<option value={2000}>Slow (2s)</option>
```

### Add New Colors

Edit `types/index.ts`:
```typescript
export const PROCESS_COLORS: string[] = [
  '#00E5FF', // Add your hex colors
  // ...
];
```

### Adjust Process Limits

Modify ranges in `components/ProcessCreation.tsx`:
- `MAX_PROCESSES`: Maximum number of processes (default: 6)
- Burst time range: 1-30 units
- Arrival time range: 0-20 units
- Priority range: 1-10

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👏 Acknowledgments

- Inspired by operating systems courses and educational simulations
- Built with modern web technologies for optimal performance
- Designed for students learning about CPU scheduling

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

## 🆕 New Features (v2.0)

This version includes major enhancements:

### Tier 1 Features
✅ **Preemptive Scheduling Algorithms** - SRTF and Preemptive Priority with dynamic process interruption  
✅ **Context Switch Visualization** - See CPU overhead between process switches  
✅ **Enhanced Metrics** - CPU utilization, throughput, and context switch tracking

### Tier 3 Features  
✅ **Real-Time Simulation Mode** - Watch execution with configurable speed  
✅ **File Upload** - Import process definitions from text files  
✅ **Export Results** - Download Gantt charts and data as PNG/JSON

### 🎓 Learning Features (v2.1 - NEW!)
✅ **Algorithm Explanation** - Learn how each algorithm works before simulation  
✅ **Animated Workflow** - Visual flow showing Ready Queue → Select → Execute → Complete  
✅ **Pre-Execution Quiz** - Test understanding with interactive questions  
✅ **Process Table Display** - See all process parameters before prediction  
✅ **Instant Feedback** - Get detailed explanations for quiz answers  
✅ **Learning Flow Control** - Must understand before watching simulation

### Technical Improvements
- Time-step simulation engine for preemptive algorithms
- Configurable context switch delay (default: 1 time unit)
- Process arrival time support for realistic scheduling
- Idle CPU time handling
- Enhanced Gantt chart with context switch visualization
- Comprehensive data export including all metrics
- Interactive learning system with quiz validation
- Smart answer detection for all algorithms

---

**Made with ❤️ for OS learners everywhere**


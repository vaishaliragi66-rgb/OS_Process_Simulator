'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { useSimStore } from '@/store/useSimStore';
import Background from './Background';
import LandingScreen from './LandingScreen';
import ProcessCreation from './ProcessCreation';
import ReadyQueueDisplay from './ReadyQueueDisplay';
import AlgorithmSelector from './AlgorithmSelector';
import CPUExecution from './CPUExecution';
import CompletionSummary from './CompletionSummary';
import ExplainToggle from './ExplainToggle';
import StepIndicator from './StepIndicator';

export default function SimulatorApp() {
  const step = useSimStore(s => s.step);
  const { goToStep } = useSimStore();

  return (
    <div className="min-h-screen relative font-inter" style={{ background: '#050A14' }}>
      <Background />

      {/* Header bar (hidden on landing) */}
      <AnimatePresence>
        {step !== 'landing' && (
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3"
            style={{
              background: 'rgba(5,10,20,0.85)',
              backdropFilter: 'blur(12px)',
              borderBottom: '1px solid rgba(0,229,255,0.08)',
            }}
          >
            {/* Logo */}
            <button
              onClick={() => goToStep('landing')}
              className="font-orbitron text-xs font-black tracking-widest cursor-pointer"
              style={{
                background: 'linear-gradient(90deg, #00E5FF, #4488FF)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              KERNEL SIM
            </button>

            {/* Center: Step indicator */}
            <StepIndicator />

            {/* Right: Explain toggle */}
            <ExplainToggle />
          </motion.header>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className={`relative z-10 ${step !== 'landing' ? 'pt-14 pb-8' : ''}`}>
        <AnimatePresence mode="wait">
          {step === 'landing' && (
            <motion.div key="landing">
              <LandingScreen />
            </motion.div>
          )}
          {step === 'create' && (
            <motion.div key="create">
              <ProcessCreation />
            </motion.div>
          )}
          {step === 'queue' && (
            <motion.div key="queue">
              <ReadyQueueDisplay />
            </motion.div>
          )}
          {step === 'algorithm' && (
            <motion.div key="algorithm">
              <AlgorithmSelector />
            </motion.div>
          )}
          {step === 'execution' && (
            <motion.div key="execution">
              <CPUExecution />
            </motion.div>
          )}
          {step === 'complete' && (
            <motion.div key="complete">
              <CompletionSummary />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

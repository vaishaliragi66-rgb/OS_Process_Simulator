'use client';
import { motion } from 'framer-motion';
import { AppStep } from '@/types';
import { useSimStore } from '@/store/useSimStore';

const STEPS: { id: AppStep; label: string }[] = [
  { id: 'create', label: 'Create' },
  { id: 'queue', label: 'Queue' },
  { id: 'algorithm', label: 'Algorithm' },
  { id: 'execution', label: 'Execute' },
  { id: 'complete', label: 'Complete' },
];

export default function StepIndicator() {
  const step = useSimStore(s => s.step);
  const currentIndex = STEPS.findIndex(s => s.id === step);

  if (step === 'landing') return null;

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      {STEPS.map((s, i) => {
        const isDone = i < currentIndex;
        const isActive = i === currentIndex;
        return (
          <div key={s.id} className="flex items-center gap-1 sm:gap-2">
            <div className="flex flex-col items-center gap-0.5">
              <motion.div
                className="w-2 h-2 rounded-full"
                style={{
                  background: isDone ? '#00FF88' : isActive ? '#00E5FF' : 'rgba(255,255,255,0.15)',
                  boxShadow: isActive ? '0 0 8px rgba(0,229,255,0.8)' : 'none',
                }}
                animate={isActive ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span
                className="text-[9px] font-mono hidden sm:block"
                style={{ color: isDone ? '#00FF88' : isActive ? '#00E5FF' : '#334155' }}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className="w-3 sm:w-6 h-px mb-3"
                style={{ background: isDone ? 'rgba(0,255,136,0.5)' : 'rgba(255,255,255,0.08)' }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

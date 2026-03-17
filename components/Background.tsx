'use client';
import { motion } from 'framer-motion';

export default function Background() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Deep space base */}
      <div className="absolute inset-0 bg-[#050A14]" />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,229,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.6) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      />

      {/* Radial glow center */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(0,229,255,0.06) 0%, transparent 70%)',
        }}
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Scanline */}
      <motion.div
        className="absolute left-0 right-0 h-[2px] opacity-[0.04]"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(0,229,255,0.8), transparent)' }}
        animate={{ top: ['-2px', '100vh'] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      />

      {/* Corner glow accents */}
      <div className="absolute top-0 left-0 w-96 h-96 opacity-10"
        style={{ background: 'radial-gradient(circle at 0 0, rgba(0,229,255,0.4), transparent 60%)' }} />
      <div className="absolute bottom-0 right-0 w-96 h-96 opacity-10"
        style={{ background: 'radial-gradient(circle at 100% 100%, rgba(68,136,255,0.4), transparent 60%)' }} />
    </div>
  );
}

'use client';
import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid,
} from 'recharts';
import { useSimStore } from '@/store/useSimStore';
import { ALGORITHM_INFO } from '@/types';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="px-3 py-2 rounded-lg text-xs font-mono"
        style={{ background: '#0D1626', border: '1px solid rgba(0,229,255,0.3)' }}
      >
        <div className="text-cyan-400 font-bold mb-1">{label}</div>
        {payload.map(p => (
          <div key={p.name} className="text-slate-300">{p.name}: {p.value} ms</div>
        ))}
      </div>
    );
  }
  return null;
};

export default function CompletionSummary() {
  const { processes, schedule, selectedAlgorithm, resetSimulation, resetToAlgorithmSelection } = useSimStore();
  const ganttRef = useRef<HTMLDivElement>(null);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  if (!schedule) return null;

  const { waitingTimes, turnaroundTimes, blocks, cpuUtilization = 100, throughput = 0, contextSwitches = 0, totalTime: schedTotalTime } = schedule;

  const avgWaiting = Object.values(waitingTimes).reduce((a, b) => a + b, 0) / processes.length;
  const avgTurnaround = Object.values(turnaroundTimes).reduce((a, b) => a + b, 0) / processes.length;
  const totalTime = schedTotalTime ?? (blocks[blocks.length - 1]?.endTime ?? 0);

  // Export Gantt chart as image
  const handleExportImage = async () => {
    if (ganttRef.current) {
      try {
        const dataUrl = await toPng(ganttRef.current, {
          backgroundColor: '#050A14',
          quality: 1,
          pixelRatio: 2,
          skipFonts: true, // Avoid CORS errors
        });
        const link = document.createElement('a');
        link.download = `gantt-chart-${selectedAlgorithm || 'schedule'}.png`;
        link.href = dataUrl;
        link.click();
      } catch (error) {
        console.error('Failed to export image:', error);
      }
    }
  };

  // Export Gantt chart as PDF
  const handleExportPDF = async () => {
    if (!ganttRef.current) return;

    setIsExportingPDF(true);
    try {
      // Capture the Gantt chart as high-quality image
      // Skip font embedding to avoid CORS errors with Google Fonts
      const dataUrl = await toPng(ganttRef.current, {
        quality: 1,
        pixelRatio: 2, // Higher resolution for better quality
        cacheBust: true,
        backgroundColor: '#0a0f1e', // Match dark theme
        skipFonts: true, // Skip font embedding to avoid CORS issues
        preferredFontFormat: 'woff2', // Use modern font format
      });

      // Create PDF in landscape mode
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: 'a4',
      });

      // Get PDF dimensions
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Get image properties
      const imgProps = pdf.getImageProperties(dataUrl);
      const imgWidth = imgProps.width;
      const imgHeight = imgProps.height;

      // Calculate scaling to fit width while maintaining aspect ratio
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const scaledWidth = imgWidth * ratio;
      const scaledHeight = imgHeight * ratio;

      // Center the image on the page
      const xOffset = (pdfWidth - scaledWidth) / 2;
      const yOffset = 40; // Leave space for title

      // Add title
      pdf.setFontSize(20);
      pdf.setTextColor(0, 229, 255); // Cyan color
      const title = 'CPU Scheduling Gantt Chart';
      const titleWidth = pdf.getTextWidth(title);
      pdf.text(title, (pdfWidth - titleWidth) / 2, 25);

      // Add metadata
      pdf.setFontSize(10);
      pdf.setTextColor(148, 163, 184); // Slate color
      const algorithmName = selectedAlgorithm ? ALGORITHM_INFO[selectedAlgorithm].name : 'Unknown';
      pdf.text(`Algorithm: ${algorithmName}`, 20, yOffset - 20);
      pdf.text(`Processes: ${processes.length}`, 20, yOffset - 10);
      pdf.text(`Avg Waiting Time: ${avgWaiting.toFixed(2)} units`, pdfWidth / 2, yOffset - 20);
      pdf.text(`Avg Turnaround Time: ${avgTurnaround.toFixed(2)} units`, pdfWidth / 2, yOffset - 10);
      pdf.text(`Generated: ${new Date().toLocaleString()}`, pdfWidth - 150, yOffset - 20);

      // Add the Gantt chart image
      pdf.addImage(dataUrl, 'PNG', xOffset, yOffset, scaledWidth, scaledHeight);

      // Add footer
      pdf.setFontSize(8);
      pdf.setTextColor(100, 116, 139);
      pdf.text(
        'OS Process Scheduling Simulator',
        pdfWidth / 2 - 60,
        pdfHeight - 10
      );

      // Save the PDF
      const filename = `gantt-chart-${selectedAlgorithm || 'schedule'}.pdf`;
      pdf.save(filename);

      console.log(`✅ PDF exported successfully: ${filename}`);
    } catch (error) {
      console.error('❌ Failed to export PDF:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExportingPDF(false);
    }
  };

  // Export data as JSON
  const handleExportJSON = () => {
    const exportData = {
      algorithm: selectedAlgorithm,
      algorithmName: selectedAlgorithm ? ALGORITHM_INFO[selectedAlgorithm].name : '',
      processes: processes.map(p => ({
        pid: p.pid,
        burstTime: p.burstTime,
        priority: p.priority,
        arrivalTime: p.arrivalTime,
        color: p.color,
      })),
      timeline: blocks.map(b => ({
        pid: b.pid === -1 ? 'CS' : b.pid,
        type: b.type,
        startTime: b.startTime,
        endTime: b.endTime,
      })),
      metrics: {
        avgWaitingTime: parseFloat(avgWaiting.toFixed(2)),
        avgTurnaroundTime: parseFloat(avgTurnaround.toFixed(2)),
        totalTime,
        cpuUtilization: parseFloat(cpuUtilization.toFixed(2)),
        throughput: parseFloat(throughput.toFixed(4)),
        contextSwitches,
      },
      perProcessMetrics: processes.map(p => ({
        pid: p.pid,
        waitingTime: waitingTimes[p.id] ?? 0,
        turnaroundTime: turnaroundTimes[p.id] ?? 0,
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `schedule-data-${selectedAlgorithm || 'export'}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Chart data
  const chartData = processes.map(p => ({
    name: `P${p.pid}`,
    waiting: waitingTimes[p.id] ?? 0,
    turnaround: turnaroundTimes[p.id] ?? 0,
    color: p.color,
  }));

  // Gantt blocks for display
  const maxTime = totalTime;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto px-4 py-8"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          className="text-5xl mb-3"
        >
          ✅
        </motion.div>
        <h2 className="font-orbitron text-2xl font-black text-white mb-2">Simulation Complete</h2>
        {selectedAlgorithm && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono"
            style={{ background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.25)', color: '#00E5FF' }}>
            {ALGORITHM_INFO[selectedAlgorithm].name} — {ALGORITHM_INFO[selectedAlgorithm].short}
          </div>
        )}
      </motion.div>

      {/* Stat cards - 2 rows */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        {[
          { label: 'Avg Wait Time', value: `${avgWaiting.toFixed(1)} ms`, color: '#FFB800', icon: '⏳' },
          { label: 'Avg Turnaround', value: `${avgTurnaround.toFixed(1)} ms`, color: '#00E5FF', icon: '🔄' },
          { label: 'Total Time', value: `${totalTime} ms`, color: '#00FF88', icon: '⚡' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="rounded-xl p-4 text-center"
            style={{
              background: `${stat.color}08`,
              border: `1px solid ${stat.color}30`,
            }}
          >
            <div className="text-xl mb-1">{stat.icon}</div>
            <div className="font-orbitron font-black text-lg mb-0.5" style={{ color: stat.color }}>
              {stat.value}
            </div>
            <div className="text-[10px] font-mono text-slate-500">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* New metrics row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'CPU Utilization', value: `${cpuUtilization.toFixed(1)}%`, color: '#BB88FF', icon: '📊' },
          { label: 'Throughput', value: `${throughput.toFixed(2)} p/ms`, color: '#FF8844', icon: '⚡' },
          { label: 'Context Switches', value: `${contextSwitches}`, color: '#6B7280', icon: '⚙️' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + i * 0.1 }}
            className="rounded-xl p-4 text-center"
            style={{
              background: `${stat.color}08`,
              border: `1px solid ${stat.color}30`,
            }}
          >
            <div className="text-xl mb-1">{stat.icon}</div>
            <div className="font-orbitron font-black text-lg mb-0.5" style={{ color: stat.color }}>
              {stat.value}
            </div>
            <div className="text-[10px] font-mono text-slate-500">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Full Gantt Chart */}
      <motion.div
        ref={ganttRef}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-2xl p-5 mb-6"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-4">Gantt Chart</div>

        {/* Gantt rows per process + context switches */}
        <div className="space-y-2 overflow-x-auto pb-2">
          {processes.map(p => {
            const pBlocks = blocks.filter(b => b.processId === p.id && b.type !== 'context-switch');
            return (
              <div key={p.id} className="flex items-center gap-2 min-w-[400px]">
                <span
                  className="text-xs font-orbitron font-bold w-6 shrink-0"
                  style={{ color: p.color }}
                >
                  P{p.pid}
                </span>
                <div className="flex-1 h-7 relative rounded bg-white/[0.03] overflow-hidden">
                  {pBlocks.map((block, bi) => {
                    const left = maxTime > 0 ? (block.startTime / maxTime) * 100 : 0;
                    const width = maxTime > 0 ? ((block.endTime - block.startTime) / maxTime) * 100 : 0;
                    return (
                      <motion.div
                        key={`${block.processId}-${block.startTime}-${bi}`}
                        className="absolute top-0 h-full flex items-center justify-center overflow-hidden"
                        style={{
                          left: `${left}%`,
                          width: `${width}%`,
                          background: `${p.color}33`,
                          borderLeft: `2px solid ${p.color}`,
                          borderRight: `1px solid ${p.color}44`,
                        }}
                        initial={{ scaleX: 0, originX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: 0.5 + bi * 0.1, duration: 0.4 }}
                        title={`P${p.pid}: t=${block.startTime}–${block.endTime}`}
                      >
                        <span className="text-[9px] font-mono" style={{ color: p.color }}>
                          {block.startTime}–{block.endTime}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          
          {/* Context switches row */}
          {contextSwitches > 0 && (
            <div className="flex items-center gap-2 min-w-[400px]">
              <span className="text-xs font-mono font-bold w-6 shrink-0 text-gray-400">
                CS
              </span>
              <div className="flex-1 h-7 relative rounded bg-white/[0.03] overflow-hidden">
                {blocks.filter(b => b.type === 'context-switch').map((block, bi) => {
                  const left = maxTime > 0 ? (block.startTime / maxTime) * 100 : 0;
                  const width = maxTime > 0 ? ((block.endTime - block.startTime) / maxTime) * 100 : 0;
                  return (
                    <motion.div
                      key={`cs-${block.startTime}-${bi}`}
                      className="absolute top-0 h-full flex items-center justify-center overflow-hidden"
                      style={{
                        left: `${left}%`,
                        width: `${width}%`,
                        background: '#6B728055',
                        borderLeft: '2px solid #6B7280',
                        borderRight: '1px solid #6B728044',
                      }}
                      initial={{ scaleX: 0, originX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 0.5 + bi * 0.1, duration: 0.4 }}
                      title={`Context Switch: t=${block.startTime}–${block.endTime}`}
                    >
                      <span className="text-[8px] font-mono text-gray-400">CS</span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Time markers */}
        <div className="flex mt-2 ml-8">
          {[...Array(Math.min(totalTime + 1, 12))].map((_, i) => {
            const t = Math.round((i / Math.min(totalTime, 11)) * totalTime);
            return (
              <div
                key={i}
                className="flex-1 text-[8px] font-mono text-slate-700 text-center"
              >
                {t}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Per-process stats + Recharts */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
        className="rounded-2xl p-5 mb-6"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-4">
          Waiting & Turnaround Times
        </div>
        <div style={{ height: 160 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="name"
                tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }}
                axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
                axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="waiting" name="Waiting" radius={[3, 3, 0, 0]} maxBarSize={30}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color + '99'} stroke={entry.color} strokeWidth={1} />
                ))}
              </Bar>
              <Bar dataKey="turnaround" name="Turnaround" radius={[3, 3, 0, 0]} maxBarSize={30}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color + '44'} stroke={entry.color + '88'} strokeWidth={1} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex gap-4 justify-center mt-2">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
            <div className="w-3 h-3 rounded-sm" style={{ background: 'rgba(0,229,255,0.6)' }} />
            Waiting Time
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
            <div className="w-3 h-3 rounded-sm" style={{ background: 'rgba(0,229,255,0.27)' }} />
            Turnaround Time
          </div>
        </div>
      </motion.div>

      {/* Per-process detail table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="rounded-xl overflow-hidden mb-8"
        style={{ border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="grid grid-cols-4 px-4 py-2.5 text-[10px] font-mono text-slate-600 uppercase tracking-wider"
          style={{ background: 'rgba(255,255,255,0.025)' }}>
          <span>Process</span>
          <span>Burst</span>
          <span>Wait</span>
          <span>Turnaround</span>
        </div>
        {processes.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.85 + i * 0.07 }}
            className="grid grid-cols-4 px-4 py-2.5 text-xs font-mono"
            style={{
              background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
              borderTop: '1px solid rgba(255,255,255,0.04)',
            }}
          >
            <span className="font-bold" style={{ color: p.color }}>P{p.pid}</span>
            <span className="text-slate-300">{p.burstTime} ms</span>
            <span className="text-amber-400">{waitingTimes[p.id] ?? 0} ms</span>
            <span className="text-cyan-400">{turnaroundTimes[p.id] ?? 0} ms</span>
          </motion.div>
        ))}
      </motion.div>

      {/* Export buttons */}
      <div className="flex gap-3 justify-center mb-4">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleExportImage}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-mono text-sm cursor-pointer"
          style={{
            background: 'rgba(0,255,136,0.12)',
            border: '1px solid rgba(0,255,136,0.35)',
            color: '#00FF88',
          }}
        >
          📸 Export PNG
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleExportPDF}
          disabled={isExportingPDF}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-mono text-sm cursor-pointer"
          style={{
            background: 'rgba(255,68,102,0.12)',
            border: '1px solid rgba(255,68,102,0.35)',
            color: '#FF4466',
            opacity: isExportingPDF ? 0.6 : 1,
            cursor: isExportingPDF ? 'not-allowed' : 'pointer',
          }}
        >
          {isExportingPDF ? '⏳ Generating...' : '📄 Download PDF'}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleExportJSON}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-mono text-sm cursor-pointer"
          style={{
            background: 'rgba(255,184,0,0.12)',
            border: '1px solid rgba(255,184,0,0.35)',
            color: '#FFB800',
          }}
        >
          💾 Export JSON
        </motion.button>
      </div>

      {/* CTA buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={resetSimulation}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-orbitron font-bold text-sm cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, #00E5FF, #4488FF)',
            color: '#050A14',
            boxShadow: '0 0 20px rgba(0,229,255,0.4)',
          }}
        >
          🔄 Try Again
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={resetToAlgorithmSelection}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-orbitron font-bold text-sm cursor-pointer"
          style={{
            background: 'rgba(187,136,255,0.12)',
            border: '1px solid rgba(187,136,255,0.35)',
            color: '#BB88FF',
          }}
        >
          ⚙ Select Another Algorithm
        </motion.button>
      </div>
    </motion.div>
  );
}

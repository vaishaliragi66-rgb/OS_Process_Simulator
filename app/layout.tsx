import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kernel Process Simulator',
  description: 'An interactive OS Process Scheduling Simulator — learn FCFS, SJF, Priority & Round Robin visually.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ background: '#050A14', margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}

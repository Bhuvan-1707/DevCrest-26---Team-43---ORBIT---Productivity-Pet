import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function PageContainer({ children }) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#07090e] text-slate-100 orbit-bg-glow">
      {/* Reusable Sidebar */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative orbit-grid-overlay">
        <Topbar />
        
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

import React from 'react';

export function KPISkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 animate-pulse">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-28 glass-card bg-slate-800/40 p-4 flex flex-col justify-between">
          <div className="h-4 bg-slate-700/60 rounded w-1/2"></div>
          <div className="h-8 bg-slate-700/60 rounded w-3/4"></div>
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
      <div className="h-72 glass-card bg-slate-800/40 p-6 flex items-center justify-center">
        <div className="w-48 h-48 rounded-full border-4 border-slate-700/60"></div>
      </div>
      <div className="h-72 glass-card bg-slate-800/40 p-6 flex flex-col justify-end gap-2">
        <div className="h-full bg-slate-700/40 rounded"></div>
      </div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="glass-card bg-slate-800/40 p-4 space-y-3 animate-pulse">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-10 bg-slate-700/50 rounded"></div>
      ))}
    </div>
  );
}

import React from 'react';
import type { Grammar, DoctorData, LL1Data, SLRData } from '../../types';
import { Code2, Stethoscope, Table, Layers, Sparkles } from 'lucide-react';
import type { TabType } from '../layout/Sidebar';

interface DashboardViewProps {
  grammarData: Grammar | null;
  doctorData: DoctorData | null;
  ll1Data: LL1Data | null;
  slrData: SLRData | null;
  onNavigate: (tab: TabType) => void;
  onSelectPreset: (text: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  grammarData,
  doctorData,
  ll1Data,
  slrData,
  onNavigate
}) => {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 bg-cyan-950/80 border border-cyan-800 text-cyan-300 text-xs px-3 py-1 rounded-full font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ParseLab IDE v2.0 — Compiler Laboratory</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
            Interactive LL(1) & SLR Parser Workbench
          </h1>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            Construct, transform, and analyze Context-Free Grammars. Compute exact FIRST & FOLLOW sets, inspect canonical LR(0) automaton state graphs, run step-by-step LL(1) & SLR simulations, and generate interactive syntax parse trees.
          </p>

          <div className="flex items-center space-x-3 mt-5">
            <button
              onClick={() => onNavigate('grammar')}
              className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-lg shadow-cyan-600/30 transition-all flex items-center space-x-1.5"
            >
              <Code2 className="w-4 h-4" />
              <span>Open Grammar Editor</span>
            </button>
            <button
              onClick={() => onNavigate('quiz')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2 rounded-lg border border-slate-700 transition-all"
            >
              <span>Take Compiler Quiz</span>
            </button>
          </div>
        </div>
      </div>

      {/* Status Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Grammar Status */}
        <div
          onClick={() => onNavigate('grammar')}
          className="bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 p-4 rounded-xl cursor-pointer transition-all shadow-xl"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Active Grammar</span>
            <Code2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-lg font-bold text-slate-100">
            {grammarData ? `${grammarData.productions.length} Rules` : 'No Grammar'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {grammarData ? `${grammarData.non_terminals.length} Non-terminals, ${grammarData.terminals.length} Terminals` : 'Click to specify productions'}
          </div>
        </div>

        {/* Doctor Health */}
        <div
          onClick={() => onNavigate('doctor')}
          className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 p-4 rounded-xl cursor-pointer transition-all shadow-xl"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Doctor Health</span>
            <Stethoscope className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-lg font-bold text-slate-100">
            {doctorData ? (doctorData.is_clean ? 'Clean CFG' : `${doctorData.total_issues} Warning(s)`) : 'Pending'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {doctorData?.is_clean ? 'No conflicts detected' : 'Left recursion or conflicts'}
          </div>
        </div>

        {/* LL(1) Status */}
        <div
          onClick={() => onNavigate('ll1')}
          className="bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 p-4 rounded-xl cursor-pointer transition-all shadow-xl"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">LL(1) Parser</span>
            <Table className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-lg font-bold text-slate-100">
            {ll1Data ? (ll1Data.is_ll1 ? 'Valid LL(1)' : 'LL(1) Conflict') : 'Pending'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Predictive parsing table M[A,a]
          </div>
        </div>

        {/* SLR Status */}
        <div
          onClick={() => onNavigate('slr')}
          className="bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 p-4 rounded-xl cursor-pointer transition-all shadow-xl"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">SLR(1) Parser</span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-lg font-bold text-slate-100">
            {slrData ? `${slrData.states.length} LR(0) States` : 'Pending'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {slrData?.is_slr ? 'Valid SLR(1) Grammar' : 'Shift/Reduce conflict'}
          </div>
        </div>
      </div>
    </div>
  );
};

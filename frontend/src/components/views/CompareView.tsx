import React from 'react';
import type { CompareResult } from '../../types';
import { CheckCheck, Zap, Table, Layers, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';

interface CompareViewProps {
  compareResult: CompareResult | null;
  inputString: string;
  setInputString: (val: string) => void;
  onCompare: (input: string) => void;
}

export const CompareView: React.FC<CompareViewProps> = ({
  compareResult,
  inputString,
  setInputString,
  onCompare
}) => {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center">
          <CheckCheck className="w-6 h-6 text-cyan-400 mr-2" /> LL(1) Top-Down vs SLR(1) Bottom-Up Comparison
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Head-to-head parsing performance, step complexity, table lookups, and acceptance matrix.
        </p>
      </div>

      {/* Input Control Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex-1 w-full flex items-center space-x-3">
          <span className="text-xs font-semibold text-slate-300 shrink-0">Benchmark Input String:</span>
          <input
            type="text"
            value={inputString}
            onChange={(e) => setInputString(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 code-font text-xs text-cyan-300 focus:outline-none focus:border-cyan-500"
            placeholder="e.g. id + id"
          />
        </div>

        <button
          onClick={() => onCompare(inputString)}
          className="flex items-center space-x-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-lg shadow-cyan-600/30 transition-all active:scale-95 shrink-0"
        >
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>Run Head-to-Head Benchmark</span>
        </button>
      </div>

      {compareResult ? (
        <div className="space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* LL(1) Card */}
            <div className="bg-slate-900/90 border border-cyan-900/50 rounded-xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Table className="w-5 h-5 text-cyan-400" />
                  <h3 className="font-bold text-slate-100 text-base">LL(1) Predictive Parser</h3>
                </div>
                {compareResult.metrics.ll1.accepted ? (
                  <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2.5 py-1 rounded text-xs font-bold flex items-center">
                    <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-400" /> ACCEPTED
                  </span>
                ) : (
                  <span className="bg-rose-950 text-rose-300 border border-rose-800 px-2.5 py-1 rounded text-xs font-bold flex items-center">
                    <AlertCircle className="w-3.5 h-3.5 mr-1 text-rose-400" /> REJECTED
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="text-slate-500 text-[10px] uppercase font-semibold">Total Steps</div>
                  <div className="text-cyan-300 font-bold text-lg mt-0.5">{compareResult.metrics.ll1.total_steps}</div>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="text-slate-500 text-[10px] uppercase font-semibold">Table Lookups</div>
                  <div className="text-cyan-300 font-bold text-lg mt-0.5">{compareResult.metrics.ll1.table_lookups}</div>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="text-slate-500 text-[10px] uppercase font-semibold">Time (ms)</div>
                  <div className="text-cyan-300 font-bold text-lg mt-0.5">{compareResult.metrics.ll1.execution_time_ms}</div>
                </div>
              </div>
            </div>

            {/* SLR(1) Card */}
            <div className="bg-slate-900/90 border border-indigo-900/50 rounded-xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Layers className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-bold text-slate-100 text-base">SLR(1) Shift-Reduce Parser</h3>
                </div>
                {compareResult.metrics.slr.accepted ? (
                  <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2.5 py-1 rounded text-xs font-bold flex items-center">
                    <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-400" /> ACCEPTED
                  </span>
                ) : (
                  <span className="bg-rose-950 text-rose-300 border border-rose-800 px-2.5 py-1 rounded text-xs font-bold flex items-center">
                    <AlertCircle className="w-3.5 h-3.5 mr-1 text-rose-400" /> REJECTED
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="text-slate-500 text-[10px] uppercase font-semibold">Total Steps</div>
                  <div className="text-indigo-300 font-bold text-lg mt-0.5">{compareResult.metrics.slr.total_steps}</div>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="text-slate-500 text-[10px] uppercase font-semibold">Table Lookups</div>
                  <div className="text-indigo-300 font-bold text-lg mt-0.5">{compareResult.metrics.slr.table_lookups}</div>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="text-slate-500 text-[10px] uppercase font-semibold">Time (ms)</div>
                  <div className="text-indigo-300 font-bold text-lg mt-0.5">{compareResult.metrics.slr.execution_time_ms}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Comparative Findings & Explanations */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Comparative Analysis Insights</h4>
            <div className="space-y-2">
              {compareResult.summary_notes.map((note, idx) => (
                <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs flex items-center text-slate-300">
                  <ArrowRight className="w-4 h-4 text-cyan-400 mr-2.5 shrink-0" />
                  <span>{note}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-slate-500 text-xs italic">Click "Run Head-to-Head Benchmark" to compare parsers.</div>
      )}
    </div>
  );
};

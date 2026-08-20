import React, { useState } from 'react';
import type { LL1Data, ParseResult, Grammar } from '../../types';
import { Table, Play, AlertCircle, CheckCircle } from 'lucide-react';

interface LL1ViewProps {
  grammarData: Grammar | null;
  ll1Data: LL1Data | null;
  inputString: string;
  setInputString: (val: string) => void;
  onParse: (input: string) => void;
  parseResult: ParseResult | null;
}

export const LL1View: React.FC<LL1ViewProps> = ({
  ll1Data,
  grammarData,
  inputString,
  setInputString,
  onParse,
  parseResult
}) => {
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);

  if (!ll1Data || !grammarData) {
    return (
      <div className="p-12 text-center text-slate-500 text-sm">
        No LL(1) table generated. Please analyze grammar first.
      </div>
    );
  }

  const steps = parseResult?.steps || [];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center">
            <Table className="w-6 h-6 text-cyan-400 mr-2" /> LL(1) Predictive Parsing Generator & Trace
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Top-down predictive parsing table M[A, a] with step-by-step stack & input token simulation.
          </p>
        </div>

        {/* LL(1) Status Badge */}
        <div>
          {ll1Data.is_ll1 ? (
            <span className="flex items-center space-x-1.5 bg-emerald-950/80 text-emerald-300 border border-emerald-800 px-3 py-1.5 rounded-lg text-xs font-semibold">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Valid LL(1) Grammar</span>
            </span>
          ) : (
            <span className="flex items-center space-x-1.5 bg-rose-950/80 text-rose-300 border border-rose-800 px-3 py-1.5 rounded-lg text-xs font-semibold">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>Grammar NOT LL(1) ({ll1Data.conflicts.length} Conflict(s))</span>
            </span>
          )}
        </div>
      </div>

      {/* Parse Input Control Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex-1 w-full flex items-center space-x-3">
          <span className="text-xs font-semibold text-slate-300 shrink-0">Input Test String:</span>
          <input
            type="text"
            value={inputString}
            onChange={(e) => setInputString(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 code-font text-xs text-cyan-300 focus:outline-none focus:border-cyan-500"
            placeholder="e.g. id + id"
          />
        </div>

        <button
          onClick={() => {
            setCurrentStepIdx(0);
            onParse(inputString);
          }}
          className="flex items-center space-x-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-lg shadow-cyan-600/30 transition-all active:scale-95 shrink-0"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Simulate LL(1) Parsing</span>
        </button>
      </div>

      {/* LL(1) Parsing Table M[A, a] */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
        <h3 className="text-sm font-bold text-slate-200 flex items-center">
          <Table className="w-4 h-4 text-cyan-400 mr-2" /> LL(1) Parsing Table M[Non-Terminal, Terminal]
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs border-collapse border border-slate-800">
            <thead>
              <tr className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3 border border-slate-800 text-left">Non-Terminal</th>
                {ll1Data.terminals.map((t) => (
                  <th key={t} className="py-2.5 px-3 border border-slate-800 font-mono text-cyan-400">
                    {t}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {ll1Data.non_terminals.map((nt) => (
                <tr key={nt} className="hover:bg-slate-850">
                  <td className="py-2.5 px-3 border border-slate-800 font-bold text-purple-300 text-left bg-slate-950">
                    {nt}
                  </td>
                  {ll1Data.terminals.map((t) => {
                    const prods = ll1Data.table[nt]?.[t] || [];
                    const isConflict = prods.length > 1;
                    return (
                      <td
                        key={t}
                        className={`py-2 px-2 border border-slate-800 text-[11px] ${
                          isConflict
                            ? 'bg-rose-950/80 text-rose-300 font-bold'
                            : prods.length > 0
                            ? 'bg-slate-900 text-slate-200'
                            : 'text-slate-600'
                        }`}
                      >
                        {prods.length > 0 ? (
                          <div className="space-y-1">
                            {prods.map((p, i) => (
                              <div key={i} className={isConflict ? 'text-rose-300' : 'text-cyan-300'}>
                                {p.representation}
                              </div>
                            ))}
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Parsing Trace Workbench */}
      {parseResult && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-3">
              <h3 className="text-sm font-bold text-slate-200">LL(1) Step-by-Step Parse Trace</h3>
              {parseResult.accepted ? (
                <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2.5 py-0.5 rounded text-xs font-semibold flex items-center">
                  <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-400" /> ACCEPTED ({parseResult.total_steps} steps, {parseResult.execution_time_ms} ms)
                </span>
              ) : (
                <span className="bg-rose-950 text-rose-300 border border-rose-800 px-2.5 py-0.5 rounded text-xs font-semibold flex items-center">
                  <AlertCircle className="w-3.5 h-3.5 mr-1 text-rose-400" /> REJECTED / PARSE ERROR
                </span>
              )}
            </div>

            {/* Step Controls */}
            <div className="flex items-center space-x-2">
              <button
                disabled={currentStepIdx === 0}
                onClick={() => setCurrentStepIdx((prev) => Math.max(0, prev - 1))}
                className="px-2.5 py-1 rounded bg-slate-800 text-slate-200 hover:bg-slate-700 disabled:opacity-40 text-xs font-semibold"
              >
                Prev Step
              </button>
              <span className="text-xs text-slate-400 font-mono">
                Step {currentStepIdx + 1} / {steps.length}
              </span>
              <button
                disabled={currentStepIdx === steps.length - 1}
                onClick={() => setCurrentStepIdx((prev) => Math.min(steps.length - 1, prev + 1))}
                className="px-2.5 py-1 rounded bg-cyan-600 text-white hover:bg-cyan-500 disabled:opacity-40 text-xs font-semibold"
              >
                Next Step
              </button>
            </div>
          </div>

          {/* Trace Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <th className="py-2.5 px-3">Step #</th>
                  <th className="py-2.5 px-3">Parser Stack</th>
                  <th className="py-2.5 px-3">Remaining Input</th>
                  <th className="py-2.5 px-3">Parser Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {steps.map((step, idx) => {
                  const isCurrent = idx === currentStepIdx;
                  return (
                    <tr
                      key={idx}
                      onClick={() => setCurrentStepIdx(idx)}
                      className={`cursor-pointer transition-colors ${
                        isCurrent
                          ? 'bg-cyan-950/60 font-semibold text-cyan-200 border-l-4 border-cyan-400'
                          : 'hover:bg-slate-850 text-slate-300'
                      }`}
                    >
                      <td className="py-2.5 px-3 text-slate-500">#{step.step}</td>
                      <td className="py-2.5 px-3 text-purple-300">
                        {Array.isArray(step.stack) ? step.stack.join(' ') : step.stack}
                      </td>
                      <td className="py-2.5 px-3 text-cyan-300">{step.input}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={
                            step.action.startsWith('ACCEPT')
                              ? 'text-emerald-400 font-bold'
                              : step.action.startsWith('ERROR')
                              ? 'text-rose-400 font-bold'
                              : step.action.startsWith('Expand')
                              ? 'text-indigo-300'
                              : 'text-slate-200'
                          }
                        >
                          {step.action}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Error Diagnostics if failed */}
          {parseResult.error && (
            <div className="p-4 bg-rose-950/40 border border-rose-800/60 rounded-xl text-xs text-rose-300 space-y-1.5">
              <div className="font-bold flex items-center text-rose-400">
                <AlertCircle className="w-4 h-4 mr-2" /> LL(1) Parse Diagnostics: {parseResult.error.reason}
              </div>
              <div>Position Token: <code className="text-cyan-300 font-mono">'{parseResult.error.token}'</code></div>
              <div>Suggestion: {parseResult.error.suggestion}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

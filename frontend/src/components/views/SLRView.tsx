import React, { useState } from 'react';
import type { SLRData, ParseResult, Grammar } from '../../types';
import { Layers, Play, CheckCircle, AlertCircle, Eye, Network } from 'lucide-react';

interface SLRViewProps {
  grammarData: Grammar | null;
  slrData: SLRData | null;
  inputString: string;
  setInputString: (val: string) => void;
  onParse: (input: string) => void;
  parseResult: ParseResult | null;
  onNavigateToAutomaton: () => void;
}

export const SLRView: React.FC<SLRViewProps> = ({
  grammarData,
  slrData,
  inputString,
  setInputString,
  onParse,
  parseResult,
  onNavigateToAutomaton
}) => {
  const [selectedStateId, setSelectedStateId] = useState<number | null>(0);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);

  if (!slrData || !grammarData) {
    return (
      <div className="p-12 text-center text-slate-500 text-sm">
        No SLR data generated. Please analyze grammar first.
      </div>
    );
  }

  const selectedState = slrData.states.find((s) => s.id === selectedStateId);
  const steps = parseResult?.steps || [];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center">
            <Layers className="w-6 h-6 text-indigo-400 mr-2" /> SLR (Simple LR) Parser & LR(0) Collection
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Canonical Collection of LR(0) item sets, CLOSURE, GOTO, and SLR ACTION/GOTO shift-reduce parsing tables.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onNavigateToAutomaton}
            className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold px-3.5 py-2 rounded-lg border border-slate-700 transition-all"
          >
            <Network className="w-4 h-4 text-cyan-400" />
            <span>Interactive LR(0) Automaton Graph</span>
          </button>

          {slrData.is_slr ? (
            <span className="flex items-center space-x-1.5 bg-emerald-950/80 text-emerald-300 border border-emerald-800 px-3 py-1.5 rounded-lg text-xs font-semibold">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Valid SLR(1) Grammar</span>
            </span>
          ) : (
            <span className="flex items-center space-x-1.5 bg-rose-950/80 text-rose-300 border border-rose-800 px-3 py-1.5 rounded-lg text-xs font-semibold">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>Grammar NOT SLR(1) ({slrData.conflicts.length} Conflict(s))</span>
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
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-lg shadow-indigo-600/30 transition-all active:scale-95 shrink-0"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Simulate SLR Shift-Reduce</span>
        </button>
      </div>

      {/* Grid: LR(0) States List on Left & State Detail Inspector on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LR(0) State Item Sets */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Canonical Collection ({slrData.states.length} States)
          </h3>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-72 overflow-y-auto pr-1">
            {slrData.states.map((st) => (
              <button
                key={st.id}
                onClick={() => setSelectedStateId(st.id)}
                className={`p-2.5 rounded-lg text-xs font-mono font-bold transition-all border text-center ${
                  selectedStateId === st.id
                    ? 'bg-indigo-950 text-indigo-300 border-indigo-500 shadow-md shadow-indigo-950'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>{st.name}</div>
                <div className="text-[10px] text-slate-500 font-sans font-normal mt-0.5">{st.items.length} items</div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected State Items Detail Inspector */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
          {selectedState ? (
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <h3 className="text-sm font-bold text-slate-200 flex items-center">
                  <Eye className="w-4 h-4 text-cyan-400 mr-2" /> Items in State {selectedState.name}
                </h3>
                <span className="text-xs bg-slate-950 text-slate-400 px-2 py-0.5 rounded border border-slate-800 font-mono">
                  {selectedState.items.length} LR(0) Items
                </span>
              </div>

              <div className="space-y-1.5 mt-3 max-h-60 overflow-y-auto">
                {selectedState.items.map((it, idx) => (
                  <div key={idx} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-xs flex items-center justify-between">
                    <span className="text-cyan-300 font-semibold">{it.representation}</span>
                    {it.is_complete && (
                      <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-800 px-1.5 py-0.5 rounded">
                        Complete Item (Reduce Candidate)
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-slate-500 text-xs italic">Select a state to inspect its LR(0) items.</div>
          )}
        </div>
      </div>

      {/* Combined SLR ACTION & GOTO Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
        <h3 className="text-sm font-bold text-slate-200 flex items-center">
          <Layers className="w-4 h-4 text-indigo-400 mr-2" /> SLR Parsing Table (ACTION & GOTO)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs border-collapse border border-slate-800 font-mono">
            <thead>
              <tr className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3 border border-slate-800 text-left" rowSpan={2}>State</th>
                <th className="py-2 px-3 border border-slate-800 text-cyan-400" colSpan={slrData.terminals.length}>
                  ACTION Table (Terminals + $)
                </th>
                <th className="py-2 px-3 border border-slate-800 text-purple-400" colSpan={slrData.non_terminals.length}>
                  GOTO Table (Non-Terminals)
                </th>
              </tr>
              <tr className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider">
                {slrData.terminals.map((t) => (
                  <th key={t} className="py-1.5 px-2 border border-slate-800 text-cyan-300">{t}</th>
                ))}
                {slrData.non_terminals.map((nt) => (
                  <th key={nt} className="py-1.5 px-2 border border-slate-800 text-purple-300">{nt}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {slrData.states.map((st) => {
                const sid = st.id;
                return (
                  <tr key={sid} className="hover:bg-slate-850">
                    <td className="py-2 px-3 border border-slate-800 font-bold text-indigo-300 text-left bg-slate-950">
                      I{sid}
                    </td>

                    {/* Action columns */}
                    {slrData.terminals.map((t) => {
                      const actions = slrData.action_table[sid]?.[t] || [];
                      const isConflict = actions.length > 1;
                      return (
                        <td
                          key={t}
                          className={`py-2 px-2 border border-slate-800 text-[11px] ${
                            isConflict
                              ? 'bg-rose-950/80 text-rose-300 font-bold'
                              : actions.length > 0
                              ? 'bg-slate-900 text-slate-200'
                              : 'text-slate-600'
                          }`}
                        >
                          {actions.length > 0 ? (
                            actions.map((act, i) => (
                              <span
                                key={i}
                                className={
                                  act.type === 'shift'
                                    ? 'text-cyan-300'
                                    : act.type === 'reduce'
                                    ? 'text-amber-300'
                                    : 'text-emerald-400 font-bold'
                                }
                              >
                                {act.representation}{' '}
                              </span>
                            ))
                          ) : (
                            '-'
                          )}
                        </td>
                      );
                    })}

                    {/* Goto columns */}
                    {slrData.non_terminals.map((nt) => {
                      const gotoState = slrData.goto_table[sid]?.[nt];
                      return (
                        <td key={nt} className="py-2 px-2 border border-slate-800 text-purple-300 text-[11px]">
                          {gotoState !== null && gotoState !== undefined ? gotoState : '-'}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SLR Shift-Reduce Parsing Trace Workbench */}
      {parseResult && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-3">
              <h3 className="text-sm font-bold text-slate-200">SLR Shift-Reduce Step Trace</h3>
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
                className="px-2.5 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40 text-xs font-semibold"
              >
                Next Step
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <th className="py-2.5 px-3">Step #</th>
                  <th className="py-2.5 px-3">State & Symbol Stack</th>
                  <th className="py-2.5 px-3">Remaining Input</th>
                  <th className="py-2.5 px-3">Shift / Reduce Action</th>
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
                          ? 'bg-indigo-950/60 font-semibold text-indigo-200 border-l-4 border-indigo-400'
                          : 'hover:bg-slate-850 text-slate-300'
                      }`}
                    >
                      <td className="py-2.5 px-3 text-slate-500">#{step.step}</td>
                      <td className="py-2.5 px-3 text-purple-300 font-mono">
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
                              : step.action.startsWith('Shift')
                              ? 'text-cyan-300'
                              : 'text-amber-300'
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
        </div>
      )}
    </div>
  );
};

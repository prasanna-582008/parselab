import React, { useState } from 'react';
import type { FirstFollowData, Grammar } from '../../types';
import { ListTree, Layers, HelpCircle } from 'lucide-react';

interface FirstFollowViewProps {
  grammarData: Grammar | null;
  firstFollowData: FirstFollowData | null;
  learningMode: boolean;
}

export const FirstFollowView: React.FC<FirstFollowViewProps> = ({
  grammarData,
  firstFollowData,
  learningMode
}) => {
  const [activeStepFilter, setActiveStepFilter] = useState<'ALL' | 'FIRST' | 'FOLLOW'>('ALL');

  if (!grammarData || !firstFollowData) {
    return (
      <div className="p-12 text-center text-slate-500 text-sm">
        No FIRST/FOLLOW data available. Please analyze grammar first.
      </div>
    );
  }

  const filteredSteps = firstFollowData.steps.filter(
    (step) => activeStepFilter === 'ALL' || step.type === activeStepFilter
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center">
          <ListTree className="w-6 h-6 text-indigo-400 mr-2" /> FIRST & FOLLOW Sets Construction
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Iterative fixed-point algorithms for predictive LL(1) parsing table construction.
        </p>
      </div>

      {/* Learning Mode Explainer Banner */}
      {learningMode && (
        <div className="bg-purple-950/40 border border-purple-800/50 rounded-xl p-4 text-xs text-purple-200 space-y-2">
          <div className="font-bold flex items-center text-purple-300">
            <HelpCircle className="w-4 h-4 mr-2 text-purple-400" /> Learning Insights: How FIRST & FOLLOW work
          </div>
          <p className="leading-relaxed">
            <strong>FIRST(X)</strong>: The set of terminals that can appear as the first symbol of a string derived from X. If X can derive &epsilon;, then &epsilon; is in FIRST(X).
          </p>
          <p className="leading-relaxed">
            <strong>FOLLOW(A)</strong>: The set of terminals that can appear immediately to the right of non-terminal A in some sentential form. Always includes <code className="text-cyan-300">$</code> for the start symbol.
          </p>
        </div>
      )}

      {/* Tables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* FIRST Sets Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl">
          <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 mr-2" /> FIRST Sets
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-2 px-3">Non-Terminal</th>
                  <th className="py-2 px-3">FIRST Set</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {grammarData.non_terminals.map((nt) => {
                  const setValues = firstFollowData.first[nt] || [];
                  return (
                    <tr key={nt} className="hover:bg-slate-850">
                      <td className="py-2.5 px-3 font-bold text-purple-300">{nt}</td>
                      <td className="py-2.5 px-3">
                        <div className="flex flex-wrap gap-1">
                          <span className="text-slate-500 font-sans">{'{'}</span>
                          {setValues.map((val) => (
                            <span key={val} className="bg-cyan-950 text-cyan-300 border border-cyan-800/60 px-1.5 py-0.5 rounded text-[11px]">
                              {val}
                            </span>
                          ))}
                          <span className="text-slate-500 font-sans">{'}'}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* FOLLOW Sets Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl">
          <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 mr-2" /> FOLLOW Sets
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-2 px-3">Non-Terminal</th>
                  <th className="py-2 px-3">FOLLOW Set</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {grammarData.non_terminals.map((nt) => {
                  const setValues = firstFollowData.follow[nt] || [];
                  return (
                    <tr key={nt} className="hover:bg-slate-850">
                      <td className="py-2.5 px-3 font-bold text-purple-300">{nt}</td>
                      <td className="py-2.5 px-3">
                        <div className="flex flex-wrap gap-1">
                          <span className="text-slate-500 font-sans">{'{'}</span>
                          {setValues.map((val) => (
                            <span key={val} className="bg-indigo-950 text-indigo-300 border border-indigo-800/60 px-1.5 py-0.5 rounded text-[11px]">
                              {val}
                            </span>
                          ))}
                          <span className="text-slate-500 font-sans">{'}'}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Step-by-Step Derivation Tracker */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-slate-200 flex items-center">
            <Layers className="w-4 h-4 text-cyan-400 mr-2" /> Fixed-Point Iteration Step Log ({filteredSteps.length} steps)
          </h3>

          <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setActiveStepFilter('ALL')}
              className={`px-2.5 py-1 rounded ${activeStepFilter === 'ALL' ? 'bg-cyan-600 text-white font-semibold' : 'text-slate-400'}`}
            >
              All
            </button>
            <button
              onClick={() => setActiveStepFilter('FIRST')}
              className={`px-2.5 py-1 rounded ${activeStepFilter === 'FIRST' ? 'bg-cyan-600 text-white font-semibold' : 'text-slate-400'}`}
            >
              FIRST Steps
            </button>
            <button
              onClick={() => setActiveStepFilter('FOLLOW')}
              className={`px-2.5 py-1 rounded ${activeStepFilter === 'FOLLOW' ? 'bg-cyan-600 text-white font-semibold' : 'text-slate-400'}`}
            >
              FOLLOW Steps
            </button>
          </div>
        </div>

        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {filteredSteps.map((step, idx) => (
            <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                    step.type === 'FIRST' ? 'bg-cyan-950 text-cyan-300 border-cyan-800' : 'bg-indigo-950 text-indigo-300 border-indigo-800'
                  }`}>
                    {step.type} Iteration #{step.iteration}
                  </span>
                  <span className="font-bold text-purple-300 font-mono">{step.symbol}</span>
                </div>

                {step.rule && (
                  <div className="text-slate-400 font-mono text-[11px]">
                    Applied Rule: <span className="text-slate-200">{step.rule}</span>
                  </div>
                )}
                {step.reason && (
                  <div className="text-slate-400 text-[11px]">{step.reason}</div>
                )}
              </div>

              <div className="text-right font-mono">
                <div className="text-slate-400 text-[11px]">Current Set:</div>
                <div className="text-cyan-300 font-bold">{'{ ' + step.current_set.join(', ') + ' }'}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

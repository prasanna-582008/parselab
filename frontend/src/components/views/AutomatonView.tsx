import React, { useState } from 'react';
import type { SLRData } from '../../types';
import { Network, Eye, ArrowRight, Layers } from 'lucide-react';

interface AutomatonViewProps {
  slrData: SLRData | null;
}

export const AutomatonView: React.FC<AutomatonViewProps> = ({ slrData }) => {
  const [selectedStateId, setSelectedStateId] = useState<number | null>(0);

  if (!slrData) {
    return (
      <div className="p-12 text-center text-slate-500 text-sm">
        No SLR Automaton generated. Please analyze grammar first.
      </div>
    );
  }

  const selectedState = slrData.states.find((s) => s.id === selectedStateId);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center">
          <Network className="w-6 h-6 text-cyan-400 mr-2" /> Interactive SLR Canonical LR(0) Automaton Graph
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          State transition diagram representing item sets I₀...Iₙ and transitions on terminals and non-terminals.
        </p>
      </div>

      {/* Main Grid: Visual Automaton Canvas & State Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Automaton Visual Diagram Box */}
        <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-slate-200 flex items-center">
              <Layers className="w-4 h-4 text-cyan-400 mr-2" /> States & Transition Flow ({slrData.states.length} States, {slrData.transitions.length} Edges)
            </h3>
            <span className="text-[11px] text-slate-400">Click any state to view item details</span>
          </div>

          {/* Interactive State Cards Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[460px] overflow-y-auto p-1">
            {slrData.states.map((st) => {
              const outTransitions = slrData.transitions.filter((t) => t.from === st.id);
              const isSelected = selectedStateId === st.id;
              return (
                <div
                  key={st.id}
                  onClick={() => setSelectedStateId(st.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-gradient-to-br from-cyan-950/90 to-slate-900 border-cyan-400 shadow-lg shadow-cyan-950 ring-1 ring-cyan-400'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-mono font-bold text-sm ${isSelected ? 'text-cyan-300' : 'text-slate-200'}`}>
                      {st.name}
                    </span>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                      {st.items.length} items
                    </span>
                  </div>

                  <div className="mt-2 text-[11px] font-mono text-slate-400 truncate">
                    {st.items[0]?.representation}
                  </div>

                  {outTransitions.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-slate-800/80 space-y-1">
                      <div className="text-[10px] text-slate-500 font-semibold uppercase">Transitions:</div>
                      <div className="flex flex-wrap gap-1">
                        {outTransitions.map((tr, idx) => (
                          <span
                            key={idx}
                            className="bg-slate-900 text-slate-300 border border-slate-800 px-1.5 py-0.5 rounded text-[10px] font-mono"
                          >
                            <span className="text-cyan-400 font-bold">{tr.symbol}</span> → I{tr.to}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* State Detail Inspector Panel */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-2xl space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center border-b border-slate-800 pb-2">
            <Eye className="w-4 h-4 text-cyan-400 mr-2" /> State Inspector {selectedState ? `(${selectedState.name})` : ''}
          </h3>

          {selectedState ? (
            <div className="space-y-4">
              <div>
                <div className="text-xs font-semibold text-slate-400 mb-2">LR(0) Items Kernel & Closure</div>
                <div className="space-y-1.5 max-h-72 overflow-y-auto">
                  {selectedState.items.map((item, i) => (
                    <div key={i} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-xs text-cyan-300">
                      <div>{item.representation}</div>
                      {item.is_complete && (
                        <div className="text-[10px] text-amber-400 font-sans mt-1">
                          Dot at end — Reduce by rule #{item.rule_id}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Outgoing transitions */}
              <div>
                <div className="text-xs font-semibold text-slate-400 mb-2">GOTO / Transition Table</div>
                <div className="space-y-1">
                  {slrData.transitions
                    .filter((t) => t.from === selectedState.id)
                    .map((t, idx) => (
                      <div key={idx} className="bg-slate-950 p-2 rounded border border-slate-800 text-xs font-mono flex items-center justify-between text-slate-300">
                        <span>On symbol <strong className="text-purple-300">'{t.symbol}'</strong></span>
                        <span className="flex items-center text-cyan-400">
                          <ArrowRight className="w-3.5 h-3.5 mx-1" /> Move to State I{t.to}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-slate-500 text-xs italic">Click a state in the automaton to inspect.</div>
          )}
        </div>
      </div>
    </div>
  );
};

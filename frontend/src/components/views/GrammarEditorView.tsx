import React from 'react';
import type { Grammar } from '../../types';
import { Code2, Play, Sparkles, Info } from 'lucide-react';

interface GrammarEditorViewProps {
  grammarText: string;
  setGrammarText: (text: string) => void;
  grammarData: Grammar | null;
  onAnalyze: () => void;
  onSelectPreset: (presetText: string) => void;
}

export const PRESET_GRAMMARS = [
  {
    name: 'Arithmetic Expressions (Left Recursive)',
    description: 'Standard math grammar with + and *. SLR parseable, LL(1) requires transformation.',
    text: `E -> E + T | T\nT -> T * F | F\nF -> ( E ) | id`
  },
  {
    name: 'Arithmetic Expressions (LL(1) Factored)',
    description: 'Transformed math grammar ready for LL(1) predictive parsing.',
    text: `E -> T E'\nE' -> + T E' | eps\nT -> F T'\nT' -> * F T' | eps\nF -> ( E ) | id`
  },
  {
    name: 'If-Else Dangling Statement (Conflict Example)',
    description: 'Classic shift/reduce conflict grammar.',
    text: `S -> if E then S | if E then S else S | a\nE -> b`
  },
  {
    name: 'Simple Assignment',
    description: 'Simple assignment grammar.',
    text: `S -> id = E\nE -> E + T | T\nT -> id | num`
  }
];

export const GrammarEditorView: React.FC<GrammarEditorViewProps> = ({
  grammarText,
  setGrammarText,
  grammarData,
  onAnalyze,
  onSelectPreset
}) => {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center">
            <Code2 className="w-6 h-6 text-cyan-400 mr-2" /> Grammar Specification & Editor
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Define Context-Free Grammar productions using <code className="text-cyan-300">A -&gt; B C | d</code> or <code className="text-cyan-300">A → B C | eps</code> syntax.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onAnalyze}
            className="flex items-center space-x-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-lg shadow-cyan-600/30 transition-all active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Analyze Grammar</span>
          </button>
        </div>
      </div>

      {/* Preset Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {PRESET_GRAMMARS.map((preset, idx) => (
          <div
            key={idx}
            onClick={() => onSelectPreset(preset.text)}
            className="bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 p-3 rounded-xl cursor-pointer transition-all hover:shadow-lg hover:shadow-cyan-950/30 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-400">{preset.name}</span>
              <Sparkles className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400" />
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-2">{preset.description}</p>
          </div>
        ))}
      </div>

      {/* Main Grid: Code Editor on Left, Parsed Grammar Spec on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Editor Box */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col">
          <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-mono">grammar.cfg</span>
            <span className="text-[11px] text-slate-500">Supports: →, -&gt;, ::=, |, eps, ε</span>
          </div>
          <div className="p-4 flex-1">
            <textarea
              value={grammarText}
              onChange={(e) => setGrammarText(e.target.value)}
              className="w-full h-80 bg-slate-950 border border-slate-800 rounded-lg p-3 code-font text-sm text-cyan-300 focus:outline-none focus:border-cyan-500/80 resize-none leading-relaxed"
              placeholder="Enter CFG rules here..."
            />
          </div>
        </div>

        {/* Breakdown Panel */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center">
              <Info className="w-4 h-4 text-cyan-400 mr-2" /> Symbol & Rule Inventory
            </h3>

            {grammarData ? (
              <div className="space-y-4 text-xs">
                {/* Start Symbol */}
                <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400">Start Symbol (S)</span>
                  <span className="font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/50">
                    {grammarData.start_symbol || 'None'}
                  </span>
                </div>

                {/* Non-terminals */}
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="text-slate-400 mb-2">Non-Terminals ({grammarData.non_terminals.length})</div>
                  <div className="flex flex-wrap gap-1.5">
                    {grammarData.non_terminals.map((nt) => (
                      <span key={nt} className="bg-purple-950/80 text-purple-300 border border-purple-800/50 px-2 py-0.5 rounded font-mono font-semibold">
                        {nt}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Terminals */}
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="text-slate-400 mb-2">Terminals ({grammarData.terminals.length})</div>
                  <div className="flex flex-wrap gap-1.5">
                    {grammarData.terminals.map((t) => (
                      <span key={t} className="bg-emerald-950/80 text-emerald-300 border border-emerald-800/50 px-2 py-0.5 rounded font-mono font-semibold">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Productions Count */}
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="text-slate-400 mb-2">Parsed Productions ({grammarData.productions.length})</div>
                  <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
                    {grammarData.productions.map((p) => (
                      <div key={p.id} className="flex items-center text-slate-300 font-mono text-[11px] bg-slate-900/60 px-2 py-1 rounded">
                        <span className="text-slate-500 w-8">#{p.id}</span>
                        <span className="text-slate-200">{p.representation}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 text-xs">
                Click "Analyze Grammar" to inspect symbols and rules.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

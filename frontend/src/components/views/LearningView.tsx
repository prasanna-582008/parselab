import React from 'react';
import { GraduationCap, BookOpen, Layers, Table, Network, ArrowRight } from 'lucide-react';

export const LearningView: React.FC = () => {
  const topics = [
    {
      title: 'Context-Free Grammar (CFG)',
      icon: BookOpen,
      color: 'text-cyan-400',
      description:
        'A formal grammar defined by 4 components (V, Σ, R, S) where V is non-terminals, Σ is terminals, R is production rules A → α, and S is start symbol.',
      keyTakeaways: [
        'Terminals are atomic tokens (e.g. id, +, *).',
        'Non-terminals represent syntactical structures (e.g. E, T, F).',
        'Epsilon ε represents empty derivation.'
      ]
    },
    {
      title: 'FIRST & FOLLOW Sets',
      icon: Table,
      color: 'text-indigo-400',
      description:
        'Iterative sets used by predictive top-down parsers to determine which production rule to expand without backtracking.',
      keyTakeaways: [
        'FIRST(α) gives the first terminal symbol appearing in any string derived from α.',
        'FOLLOW(A) gives all terminals that can immediately follow non-terminal A in sentential forms.',
        'End of input symbol $ is always in FOLLOW(Start Symbol).'
      ]
    },
    {
      title: 'LL(1) Top-Down Parsing',
      icon: Layers,
      color: 'text-purple-400',
      description:
        'Left-to-right scan, Leftmost derivation, using 1 lookahead token. Uses stack and predictive parsing table M[A, a].',
      keyTakeaways: [
        'Requires grammars WITHOUT left recursion.',
        'Requires left factoring for common prefixes.',
        'Conflict occurs if table entry M[A, a] contains > 1 production.'
      ]
    },
    {
      title: 'SLR(1) Bottom-Up Parsing',
      icon: Network,
      color: 'text-emerald-400',
      description:
        'Simple LR parser using canonical collection of LR(0) item sets and GOTO graph. Performs Shift and Reduce actions.',
      keyTakeaways: [
        'Shift pushes input token & state onto stack.',
        'Reduce pops RHS symbols and replaces them with LHS non-terminal.',
        'Uses FOLLOW sets to restrict Reduce actions to valid lookahead tokens.'
      ]
    }
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center">
          <GraduationCap className="w-6 h-6 text-purple-400 mr-2" /> Compiler Design Learning Laboratory
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Interactive educational guide explaining core formal language theory and parsing concepts.
        </p>
      </div>

      {/* Grid of Topics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {topics.map((t, idx) => {
          const Icon = t.icon;
          return (
            <div key={idx} className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
              <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
                <Icon className={`w-5 h-5 ${t.color}`} />
                <h3 className="font-bold text-sm text-slate-100">{t.title}</h3>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{t.description}</p>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Key Principles</div>
                {t.keyTakeaways.map((point, i) => (
                  <div key={i} className="text-xs text-slate-300 flex items-start">
                    <ArrowRight className="w-3.5 h-3.5 text-cyan-400 mr-2 shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

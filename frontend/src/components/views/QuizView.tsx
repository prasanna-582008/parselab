import React, { useState } from 'react';
import type { QuizQuestion } from '../../types';
import { HelpCircle, CheckCircle2, XCircle, Trophy, RefreshCw, ArrowRight } from 'lucide-react';

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    category: 'LL(1)',
    question: 'Why can top-down LL(1) parsers NOT handle grammars with direct left recursion (e.g. E → E + T)?',
    options: [
      'Left-recursive rules cause the parser stack expansion to loop infinitely without consuming input tokens.',
      'Left recursion causes the LR(0) canonical automaton to enter a deadlock.',
      'Left-recursive rules prevent terminals from being generated in FIRST sets.',
      'Left recursion is invalid in Context-Free Grammars.'
    ],
    correctIndex: 0,
    explanation:
      'Predictive top-down LL(1) parsers expand non-terminals on top of the stack. If E expands to E + T, the stack top remains E indefinitely, resulting in an infinite loop.'
  },
  {
    id: 2,
    category: 'FIRST/FOLLOW',
    question: 'Which symbol is ALWAYS automatically included in the FOLLOW set of the grammar start symbol?',
    options: [
      'Epsilon (ε)',
      'End-of-input marker ($)',
      'Plus sign (+)',
      'Identifier (id)'
    ],
    correctIndex: 1,
    explanation:
      'By formal definition, the special end-of-input marker $ is always added to FOLLOW(S) where S is the start symbol of the CFG.'
  },
  {
    id: 3,
    category: 'LR(0)',
    question: 'What does an LR(0) item A → α · β represent during parsing?',
    options: [
      'The production rule has finished parsing completely.',
      'The parser has recognized α at top of stack and expects to see input matching β next.',
      'A Shift action must immediately be performed regardless of input.',
      'The terminal symbol α is invalid.'
    ],
    correctIndex: 1,
    explanation:
      'The dot (·) in an LR(0) item indicates how much of the right-hand side has already been seen on the parser stack (α) and what is expected next (β).'
  },
  {
    id: 4,
    category: 'SLR',
    question: 'How does an SLR(1) parser decide when to place a Reduce action in state I on lookahead symbol a?',
    options: [
      'Places Reduce for item A → α · on ALL terminal columns indiscriminately.',
      'Places Reduce for item A → α · ONLY on terminals in FOLLOW(A).',
      'Places Reduce for item A → α · ONLY on terminals in FIRST(A).',
      'Places Reduce for item A → α · only if input is $.'
    ],
    correctIndex: 1,
    explanation:
      'Simple LR (SLR) uses the FOLLOW(A) set to restrict Reduce actions. ACTION[i, a] = Reduce A → α is set for each terminal a ∈ FOLLOW(A).'
  },
  {
    id: 5,
    category: 'Conflicts',
    question: 'What constitutes a Shift/Reduce conflict in an SLR parsing table cell ACTION[i, a]?',
    options: [
      'The cell contains two distinct Shift actions to different states.',
      'The cell contains both a Shift action and a Reduce action.',
      'The cell contains two distinct Reduce actions.',
      'The cell is completely empty.'
    ],
    correctIndex: 1,
    explanation:
      'A Shift/Reduce conflict occurs when the parser cannot decide whether to shift the lookahead token onto the stack or reduce the stack contents using a production rule.'
  }
];

export const QuizView: React.FC = () => {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const currentQ = QUIZ_QUESTIONS[currentIdx];
  const userChoice = selectedOptions[currentQ.id];

  const handleSelect = (optionIdx: number) => {
    if (isSubmitted) return;
    setSelectedOptions({ ...selectedOptions, [currentQ.id]: optionIdx });
  };

  const calculateScore = () => {
    let score = 0;
    QUIZ_QUESTIONS.forEach((q) => {
      if (selectedOptions[q.id] === q.correctIndex) {
        score++;
      }
    });
    return score;
  };

  const handleRestart = () => {
    setSelectedOptions({});
    setIsSubmitted(false);
    setCurrentIdx(0);
  };

  const score = calculateScore();

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center">
            <HelpCircle className="w-6 h-6 text-cyan-400 mr-2" /> Compiler Design Interactive Quiz
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Test your knowledge on FIRST/FOLLOW, LL(1), LR(0), SLR, and parsing table conflict resolution.
          </p>
        </div>

        {isSubmitted && (
          <div className="flex items-center space-x-2 bg-gradient-to-r from-cyan-950 to-indigo-950 px-4 py-2 rounded-xl border border-cyan-800">
            <Trophy className="w-5 h-5 text-amber-400" />
            <div className="text-xs">
              <div className="text-slate-400">Score:</div>
              <div className="font-bold text-cyan-300 text-sm">{score} / {QUIZ_QUESTIONS.length}</div>
            </div>
          </div>
        )}
      </div>

      {/* Quiz Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-2xl space-y-6">
        {/* Question Counter Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
            Question {currentIdx + 1} of {QUIZ_QUESTIONS.length} — [{currentQ.category}]
          </span>

          <div className="flex items-center space-x-1.5">
            {QUIZ_QUESTIONS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIdx(i)}
                className={`w-6 h-6 rounded-full text-[10px] font-bold transition-all ${
                  currentIdx === i
                    ? 'bg-cyan-600 text-white'
                    : selectedOptions[QUIZ_QUESTIONS[i].id] !== undefined
                    ? 'bg-slate-800 text-cyan-400 border border-cyan-800'
                    : 'bg-slate-950 text-slate-500'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Question Text */}
        <h3 className="text-base font-bold text-slate-100 leading-snug">{currentQ.question}</h3>

        {/* Options */}
        <div className="space-y-2.5">
          {currentQ.options.map((opt, optIdx) => {
            const isSelected = userChoice === optIdx;
            const isCorrect = optIdx === currentQ.correctIndex;

            let optionStyle = 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700';

            if (isSelected) {
              optionStyle = 'bg-cyan-950/80 border-cyan-500 text-cyan-200 shadow-md shadow-cyan-950';
            }

            if (isSubmitted) {
              if (isCorrect) {
                optionStyle = 'bg-emerald-950/90 border-emerald-500 text-emerald-200 font-semibold';
              } else if (isSelected && !isCorrect) {
                optionStyle = 'bg-rose-950/90 border-rose-500 text-rose-200';
              }
            }

            return (
              <div
                key={optIdx}
                onClick={() => handleSelect(optIdx)}
                className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${optionStyle}`}
              >
                <div className="flex items-center space-x-3">
                  <span className="w-5 h-5 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-[10px] font-mono text-slate-400">
                    {String.fromCharCode(65 + optIdx)}
                  </span>
                  <span>{opt}</span>
                </div>

                {isSubmitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                {isSubmitted && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
              </div>
            );
          })}
        </div>

        {/* Explanation Card when submitted */}
        {isSubmitted && (
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1 text-xs">
            <div className="font-bold text-cyan-400 flex items-center">
              <ArrowRight className="w-4 h-4 mr-1.5 text-cyan-400" /> Explanation:
            </div>
            <p className="text-slate-300 leading-relaxed">{currentQ.explanation}</p>
          </div>
        )}

        {/* Navigation & Submit Controls */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-4">
          <button
            disabled={currentIdx === 0}
            onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
            className="bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-semibold px-4 py-2 rounded-lg border border-slate-700"
          >
            Previous
          </button>

          {!isSubmitted ? (
            <button
              onClick={() => setIsSubmitted(true)}
              className="bg-gradient-to-r from-cyan-600 to-indigo-600 text-white text-xs font-semibold px-5 py-2 rounded-lg shadow-lg shadow-cyan-600/30"
            >
              Submit Quiz & Check Answers
            </button>
          ) : (
            <button
              onClick={handleRestart}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2 rounded-lg border border-slate-700 flex items-center space-x-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Retry Quiz</span>
            </button>
          )}

          <button
            disabled={currentIdx === QUIZ_QUESTIONS.length - 1}
            onClick={() => setCurrentIdx((i) => Math.min(QUIZ_QUESTIONS.length - 1, i + 1))}
            className="bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-semibold px-4 py-2 rounded-lg border border-slate-700"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

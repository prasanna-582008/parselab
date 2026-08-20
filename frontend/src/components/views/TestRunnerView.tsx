import React, { useState } from 'react';
import type { TestSuiteResponse } from '../../types';
import { CheckCheck, Play, Plus, Trash2, CheckCircle, AlertCircle, BarChart3 } from 'lucide-react';

interface TestRunnerViewProps {
  grammarText: string;
  testInputs: string[];
  setTestInputs: React.Dispatch<React.SetStateAction<string[]>>;
  onRunSuite: () => void;
  suiteResponse: TestSuiteResponse | null;
}

export const TestRunnerView: React.FC<TestRunnerViewProps> = ({
  testInputs,
  setTestInputs,
  onRunSuite,
  suiteResponse
}) => {
  const [newInput, setNewInput] = useState<string>('');

  const handleAddInput = () => {
    if (!newInput.trim()) return;
    if (!testInputs.includes(newInput.trim())) {
      setTestInputs([...testInputs, newInput.trim()]);
    }
    setNewInput('');
  };

  const handleRemoveInput = (index: number) => {
    setTestInputs(testInputs.filter((_, i) => i !== index));
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center">
            <CheckCheck className="w-6 h-6 text-emerald-400 mr-2" /> Automated Grammar Test Suite
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Batch process test input strings simultaneously against LL(1) and SLR(1) parsers.
          </p>
        </div>

        <button
          onClick={onRunSuite}
          className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Execute Test Suite ({testInputs.length} Tests)</span>
        </button>
      </div>

      {/* Input Management Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Manage Test Inputs</h3>

        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newInput}
            onChange={(e) => setNewInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddInput()}
            placeholder="Add new test string, e.g. (id + id) * id"
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 code-font text-xs text-cyan-300 focus:outline-none focus:border-cyan-500"
          />
          <button
            onClick={handleAddInput}
            className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium px-3 py-2 rounded-lg border border-slate-700"
          >
            <Plus className="w-4 h-4 text-cyan-400" />
            <span>Add String</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {testInputs.map((str, idx) => (
            <div
              key={idx}
              className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center space-x-2 font-mono text-xs text-cyan-300"
            >
              <span>{str}</span>
              <button onClick={() => handleRemoveInput(idx)} className="text-slate-500 hover:text-rose-400">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Statistics Card */}
      {suiteResponse && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl text-center">
              <div className="text-slate-500 text-[10px] uppercase font-semibold">Total Strings Tested</div>
              <div className="text-slate-100 font-bold text-2xl mt-1">{suiteResponse.total_tests}</div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl text-center">
              <div className="text-slate-500 text-[10px] uppercase font-semibold">LL(1) Accepted</div>
              <div className="text-cyan-400 font-bold text-2xl mt-1">{suiteResponse.ll1_passed} / {suiteResponse.total_tests}</div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl text-center">
              <div className="text-slate-500 text-[10px] uppercase font-semibold">SLR(1) Accepted</div>
              <div className="text-indigo-400 font-bold text-2xl mt-1">{suiteResponse.slr_passed} / {suiteResponse.total_tests}</div>
            </div>
          </div>

          {/* Test Results Matrix Table */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-slate-200 flex items-center">
              <BarChart3 className="w-4 h-4 text-emerald-400 mr-2" /> Detailed Test Suite Matrix
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <th className="py-2.5 px-3">Test Input String</th>
                    <th className="py-2.5 px-3">LL(1) Result</th>
                    <th className="py-2.5 px-3">LL(1) Steps</th>
                    <th className="py-2.5 px-3">SLR(1) Result</th>
                    <th className="py-2.5 px-3">SLR(1) Steps</th>
                    <th className="py-2.5 px-3">Match?</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {suiteResponse.results.map((res, idx) => (
                    <tr key={idx} className="hover:bg-slate-850">
                      <td className="py-2.5 px-3 font-bold text-cyan-300">{res.input_string}</td>
                      <td className="py-2.5 px-3">
                        {res.ll1_accepted ? (
                          <span className="text-emerald-400 font-bold flex items-center">
                            <CheckCircle className="w-3.5 h-3.5 mr-1" /> ACCEPT
                          </span>
                        ) : (
                          <span className="text-rose-400 font-bold flex items-center">
                            <AlertCircle className="w-3.5 h-3.5 mr-1" /> REJECT
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">{res.ll1_steps} steps</td>
                      <td className="py-2.5 px-3">
                        {res.slr_accepted ? (
                          <span className="text-emerald-400 font-bold flex items-center">
                            <CheckCircle className="w-3.5 h-3.5 mr-1" /> ACCEPT
                          </span>
                        ) : (
                          <span className="text-rose-400 font-bold flex items-center">
                            <AlertCircle className="w-3.5 h-3.5 mr-1" /> REJECT
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">{res.slr_steps} steps</td>
                      <td className="py-2.5 px-3">
                        {res.match ? (
                          <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded text-[10px]">
                            MATCH
                          </span>
                        ) : (
                          <span className="bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded text-[10px]">
                            MISMATCH
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

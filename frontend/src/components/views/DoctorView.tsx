import React from 'react';
import type { DoctorData, TransformData } from '../../types';
import { Stethoscope, AlertTriangle, CheckCircle2, ArrowRight, Wand2 } from 'lucide-react';

interface DoctorViewProps {
  doctorData: DoctorData | null;
  onTransformGrammar: () => void;
  transformData: TransformData | null;
}

export const DoctorView: React.FC<DoctorViewProps> = ({
  doctorData,
  onTransformGrammar,
  transformData
}) => {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center">
            <Stethoscope className="w-6 h-6 text-amber-400 mr-2" /> Grammar Doctor Diagnostics
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Automated compiler analysis detecting left recursion, useless non-terminals, duplicate rules, and LL(1)/SLR conflicts.
          </p>
        </div>

        <button
          onClick={onTransformGrammar}
          className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-lg shadow-purple-600/30 transition-all active:scale-95"
        >
          <Wand2 className="w-4 h-4" />
          <span>Auto-Fix Grammar (LL(1) Converter)</span>
        </button>
      </div>

      {/* Summary Status Card */}
      {doctorData ? (
        <div className={`p-4 rounded-xl border flex items-center justify-between ${
          doctorData.is_clean
            ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-300'
            : 'bg-amber-950/30 border-amber-800/50 text-amber-300'
        }`}>
          <div className="flex items-center space-x-3">
            {doctorData.is_clean ? (
              <CheckCircle2 className="w-7 h-7 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-7 h-7 text-amber-400 shrink-0" />
            )}
            <div>
              <h3 className="font-bold text-sm">
                {doctorData.is_clean
                  ? 'Grammar Healthy — No Major Parser Conflicts Detected'
                  : `Doctor Warning — ${doctorData.total_issues} Diagnostic Warning(s) Found`}
              </h3>
              <p className="text-xs opacity-90 mt-0.5">
                {doctorData.is_clean
                  ? 'The specified grammar rules pass structure and parsing checks.'
                  : 'Review the detailed analysis below for conflict resolution and grammar optimization.'}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-slate-500 text-xs italic">No diagnostic data available. Please analyze grammar first.</div>
      )}

      {/* Diagnostic Issues List */}
      {doctorData && doctorData.diagnostics.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Diagnostic Findings</h3>
          <div className="grid grid-cols-1 gap-4">
            {doctorData.diagnostics.map((diag, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border bg-slate-900/90 shadow-xl transition-all ${
                  diag.severity === 'error'
                    ? 'border-rose-900/60 hover:border-rose-700/80'
                    : diag.severity === 'warning'
                    ? 'border-amber-900/60 hover:border-amber-700/80'
                    : 'border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                        diag.severity === 'error'
                          ? 'bg-rose-950 text-rose-300 border-rose-800'
                          : diag.severity === 'warning'
                          ? 'bg-amber-950 text-amber-300 border-amber-800'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {diag.category}
                    </span>
                    <h4 className="font-bold text-sm text-slate-100">{diag.title}</h4>
                  </div>
                </div>

                <p className="text-xs text-slate-300 mt-2 leading-relaxed">{diag.description}</p>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-start space-x-2 text-xs">
                  <span className="text-cyan-400 font-semibold shrink-0">Doctor Suggestion:</span>
                  <span className="text-slate-400">{diag.suggestion}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transformation Result Card */}
      {transformData && (
        <div className="bg-slate-900/90 border border-purple-800/50 rounded-xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-purple-300 flex items-center">
              <Wand2 className="w-4 h-4 mr-2" /> Transformation Results (Original vs Transformed Grammar)
            </h3>
            <span className="text-xs bg-purple-950 text-purple-300 px-2.5 py-1 rounded border border-purple-800">
              Left Recursion Removed & Factored
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
              <div className="text-xs font-semibold text-slate-400 mb-2">Original Grammar</div>
              <pre className="code-font text-xs text-rose-300 whitespace-pre-wrap">{transformData.original_text}</pre>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
              <div className="text-xs font-semibold text-slate-400 mb-2">Transformed LL(1) Grammar</div>
              <pre className="code-font text-xs text-emerald-300 whitespace-pre-wrap">{transformData.transformed_text}</pre>
            </div>
          </div>

          {/* Transformation Step Logs */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-400">Applied Transformation Steps</div>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {transformData.transformations_log.map((log, i) => (
                <div key={i} className="text-xs bg-slate-950 p-2 rounded border border-slate-800 flex items-center text-slate-300">
                  <ArrowRight className="w-3.5 h-3.5 text-purple-400 mr-2 shrink-0" />
                  <span>{log.description}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import {
  BookOpen,
  Code2,
  FileDown,
  Play,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface NavbarProps {
  learningMode: boolean;
  setLearningMode: (mode: boolean) => void;
  grammarValid: boolean;
  onQuickRun: () => void;
  onExportPDF: () => void;
  activeProjectName: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  learningMode,
  setLearningMode,
  grammarValid,
  onQuickRun,
  onExportPDF,
  activeProjectName
}) => {
  return (
    <header className="h-14 border-b border-slate-800 bg-slate-900/90 backdrop-blur px-4 flex items-center justify-between sticky top-0 z-40">
      {/* Left Section: Logo & Brand */}
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 p-[1px] flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center">
            <Code2 className="w-5 h-5 text-cyan-400" />
          </div>
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-bold text-slate-100 text-sm tracking-wide">
              ParseLab <span className="text-xs text-cyan-400 font-normal px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40">IDE v2.0</span>
            </h1>
          </div>
          <p className="text-[10px] text-slate-400">Interactive LL(1) & SLR Parser Laboratory</p>
        </div>
      </div>

      {/* Center Section: Active Context Info */}
      <div className="hidden md:flex items-center space-x-4">
        <div className="flex items-center space-x-2 bg-slate-950/80 px-3 py-1 rounded-full border border-slate-800 text-xs">
          <span className="text-slate-400">Project:</span>
          <span className="font-semibold text-slate-200">{activeProjectName}</span>
        </div>

        <div className="flex items-center space-x-2 bg-slate-950/80 px-3 py-1 rounded-full border border-slate-800 text-xs">
          <span className="text-slate-400">Grammar Status:</span>
          {grammarValid ? (
            <span className="flex items-center text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Valid CFG
            </span>
          ) : (
            <span className="flex items-center text-rose-400 font-medium">
              <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Issues Found
            </span>
          )}
        </div>
      </div>

      {/* Right Section: Mode Toggles & Action Buttons */}
      <div className="flex items-center space-x-3">
        {/* Learning Mode Switch */}
        <button
          onClick={() => setLearningMode(!learningMode)}
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
            learningMode
              ? 'bg-purple-950/80 text-purple-300 border border-purple-700/50 shadow-sm shadow-purple-900/40'
              : 'bg-slate-800/70 text-slate-400 hover:text-slate-200 border border-slate-700/50'
          }`}
          title="Toggle Learning Mode for step-by-step explanatory insights"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>{learningMode ? 'Learning Mode' : 'Developer Mode'}</span>
        </button>

        {/* Quick Parse Run */}
        <button
          onClick={onQuickRun}
          className="flex items-center space-x-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-medium text-xs px-3 py-1.5 rounded-lg shadow-md shadow-cyan-900/30 transition-all active:scale-95"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Parse Test</span>
        </button>

        {/* PDF Export */}
        <button
          onClick={onExportPDF}
          className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-slate-700 transition-all"
          title="Export Full PDF Analysis Report"
        >
          <FileDown className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Export PDF</span>
        </button>
      </div>
    </header>
  );
};

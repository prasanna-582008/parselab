import React, { useState } from 'react';
import { Terminal, ChevronUp, ChevronDown, Trash2, CheckCircle, AlertCircle, Info } from 'lucide-react';

export interface ConsoleLog {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

interface ConsoleProps {
  logs: ConsoleLog[];
  onClear: () => void;
}

export const Console: React.FC<ConsoleProps> = ({ logs, onClear }) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);

  return (
    <div className="border-t border-slate-800 bg-slate-950 font-mono text-xs select-none">
      {/* Console Header Bar */}
      <div className="h-8 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold text-slate-300">Compiler Console Output</span>
          <span className="text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded-full">
            {logs.length} logs
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onClear}
            className="text-slate-400 hover:text-rose-400 transition-colors p-1"
            title="Clear Console Output"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-slate-400 hover:text-slate-200 transition-colors p-1"
          >
            {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Console Log Area */}
      {isOpen && (
        <div className="h-28 overflow-y-auto p-3 space-y-1 bg-slate-950 text-slate-300">
          {logs.length === 0 ? (
            <div className="text-slate-600 italic">No output. Run grammar analysis or parsing simulation...</div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="flex items-start space-x-2 text-[11px] leading-tight">
                <span className="text-slate-600 shrink-0">[{log.timestamp}]</span>
                {log.type === 'success' && <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />}
                {log.type === 'error' && <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />}
                {log.type === 'warning' && <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />}
                {log.type === 'info' && <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />}
                <span
                  className={
                    log.type === 'error'
                      ? 'text-rose-400'
                      : log.type === 'success'
                      ? 'text-emerald-300'
                      : log.type === 'warning'
                      ? 'text-amber-300'
                      : 'text-slate-300'
                  }
                >
                  {log.message}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

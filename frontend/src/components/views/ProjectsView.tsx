import React, { useState } from 'react';
import type { ProjectData } from '../../types';
import { FolderKanban, Save, Download, Trash2, CheckCircle2 } from 'lucide-react';

interface ProjectsViewProps {
  projects: ProjectData[];
  activeProjectId: string;
  onSaveProject: (name: string) => void;
  onLoadProject: (project: ProjectData) => void;
  onDeleteProject: (id: string) => void;
  currentGrammarText: string;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  activeProjectId,
  onSaveProject,
  onLoadProject,
  onDeleteProject
}) => {
  const [newProjectName, setNewProjectName] = useState<string>('');

  const handleCreate = () => {
    if (!newProjectName.trim()) return;
    onSaveProject(newProjectName.trim());
    setNewProjectName('');
  };

  const handleExportJSON = (p: ProjectData) => {
    const jsonStr = JSON.stringify(p, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${p.name.replace(/\s+/g, '_')}_parselab.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center">
          <FolderKanban className="w-6 h-6 text-cyan-400 mr-2" /> Compiler Project Manager
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Save, load, and export complete grammar projects, test input sets, and parser configurations.
        </p>
      </div>

      {/* Save Project Box */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Save Active Workspace to Project</h3>

        <div className="flex items-center space-x-3">
          <input
            type="text"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            placeholder="Enter project name, e.g. Expression_Parser_v1"
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 code-font text-xs text-cyan-300 focus:outline-none focus:border-cyan-500"
          />
          <button
            onClick={handleCreate}
            className="flex items-center space-x-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-lg shadow-cyan-600/30 transition-all active:scale-95 shrink-0"
          >
            <Save className="w-4 h-4" />
            <span>Save Project</span>
          </button>
        </div>
      </div>

      {/* Saved Projects List */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Saved Projects ({projects.length})</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((p) => {
            const isActive = p.id === activeProjectId;
            return (
              <div
                key={p.id}
                className={`bg-slate-900/90 border rounded-xl p-4 shadow-xl flex flex-col justify-between space-y-3 transition-all ${
                  isActive ? 'border-cyan-500/80 ring-1 ring-cyan-500/50' : 'border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-sm text-slate-100">{p.name}</h4>
                      {isActive && (
                        <span className="bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded text-[10px] font-semibold flex items-center">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Active Workspace
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">Saved on {p.createdAt}</p>
                  </div>

                  <button
                    onClick={() => onDeleteProject(p.id)}
                    className="text-slate-500 hover:text-rose-400 p-1"
                    title="Delete Project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Grammar Snippet */}
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold mb-1">Grammar Rules</div>
                  <pre className="code-font text-[11px] text-cyan-300 line-clamp-2">{p.grammar_text}</pre>
                </div>

                <div className="flex items-center space-x-2 pt-1 border-t border-slate-800/80">
                  <button
                    onClick={() => onLoadProject(p)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-1.5 rounded-lg border border-slate-700 transition-all text-center"
                  >
                    Load into Workspace
                  </button>
                  <button
                    onClick={() => handleExportJSON(p)}
                    className="p-1.5 bg-slate-950 hover:bg-slate-850 text-slate-400 hover:text-slate-200 rounded-lg border border-slate-800"
                    title="Export JSON"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

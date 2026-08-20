import React, { useState } from 'react';
import type { ParseTreeNode, ParseResult } from '../../types';
import { GitFork, ZoomIn, ZoomOut, Info } from 'lucide-react';

interface ParseTreeViewProps {
  parseResult: ParseResult | null;
  inputString: string;
}

export const ParseTreeView: React.FC<ParseTreeViewProps> = ({ parseResult, inputString }) => {
  const [speedMs, setSpeedMs] = useState<number>(800);
  const [selectedNode, setSelectedNode] = useState<ParseTreeNode | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const rootNode = parseResult?.parse_tree;

  // Render tree recursively as custom SVG / HTML Node Graph
  const renderTreeNode = (node: ParseTreeNode, depth: number = 0) => {
    const isLeaf = !node.children || node.children.length === 0;

    return (
      <div key={node.id} className="flex flex-col items-center my-2 select-none">
        {/* Node Pill */}
        <div
          onClick={() => setSelectedNode(node)}
          className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold cursor-pointer transition-all shadow-md ${
            isLeaf
              ? 'bg-emerald-950 text-emerald-300 border-emerald-700/60 hover:border-emerald-400 hover:scale-105'
              : 'bg-indigo-950 text-indigo-300 border-indigo-700/60 hover:border-indigo-400 hover:scale-105'
          }`}
        >
          {node.label}
        </div>

        {/* Children Nodes */}
        {node.children && node.children.length > 0 && (
          <div className="flex flex-col items-center mt-2">
            {/* Vertical connector line */}
            <div className="w-0.5 h-3 bg-slate-700"></div>

            {/* Horizontal connector line */}
            {node.children.length > 1 && (
              <div className="w-full h-0.5 bg-slate-700 my-0.5"></div>
            )}

            {/* Children container */}
            <div className="flex items-start space-x-6 pt-1">
              {node.children.map((child) => renderTreeNode(child, depth + 1))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!parseResult || !rootNode) {
    return (
      <div className="p-12 text-center text-slate-500 text-sm">
        No parse tree available. Run a successful parse simulation on LL(1) or SLR first.
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center">
            <GitFork className="w-6 h-6 text-purple-400 mr-2" /> Interactive Syntax Parse Tree Visualizer
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Hierarchical parse tree representation for input: <code className="text-cyan-300">'{inputString}'</code>
          </p>
        </div>

        {/* Playback Controls & Zoom */}
        <div className="flex items-center space-x-3 bg-slate-900/90 border border-slate-800 p-2 rounded-xl">
          <div className="flex items-center space-x-1 border-r border-slate-800 pr-3">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.1))}
              className="p-1.5 text-slate-400 hover:text-slate-200 rounded"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs text-slate-400 font-mono w-12 text-center">{Math.round(zoomLevel * 100)}%</span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.8, z + 0.1))}
              className="p-1.5 text-slate-400 hover:text-slate-200 rounded"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400">Speed:</span>
            <select
              value={speedMs}
              onChange={(e) => setSpeedMs(Number(e.target.value))}
              className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-300 text-xs focus:outline-none"
            >
              <option value={1200}>Slow (1.2s)</option>
              <option value={800}>Normal (0.8s)</option>
              <option value={400}>Fast (0.4s)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Canvas + Node Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visual Parse Tree Canvas */}
        <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-xl p-8 shadow-2xl overflow-auto min-h-[460px] flex items-center justify-center">
          <div
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
            className="transition-transform duration-200"
          >
            {renderTreeNode(rootNode)}
          </div>
        </div>

        {/* Node Detail Inspector */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-2xl space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center border-b border-slate-800 pb-2">
            <Info className="w-4 h-4 text-purple-400 mr-2" /> Tree Node Detail Inspector
          </h3>

          {selectedNode ? (
            <div className="space-y-3 font-mono text-xs">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div className="text-slate-500 text-[10px] uppercase">Node Label</div>
                <div className="text-purple-300 font-bold text-sm mt-0.5">{selectedNode.label}</div>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div className="text-slate-500 text-[10px] uppercase">Node Unique ID</div>
                <div className="text-slate-300 mt-0.5">#{selectedNode.id}</div>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div className="text-slate-500 text-[10px] uppercase">Children Subtrees ({selectedNode.children?.length || 0})</div>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {selectedNode.children && selectedNode.children.length > 0 ? (
                    selectedNode.children.map((c) => (
                      <span key={c.id} className="bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded text-xs font-semibold">
                        {c.label}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500 font-sans italic text-[11px]">Terminal Leaf Node</span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-slate-500 text-xs italic">Click any tree node in the diagram to inspect its subtrees.</div>
          )}
        </div>
      </div>
    </div>
  );
};

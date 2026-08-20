import React from 'react';
import {
  LayoutDashboard,
  FileCode2,
  Stethoscope,
  ListTree,
  Table,
  Layers,
  Network,
  GitFork,
  CheckCheck,
  FolderKanban,
  GraduationCap,
  HelpCircle
} from 'lucide-react';

export type TabType =
  | 'dashboard'
  | 'grammar'
  | 'doctor'
  | 'first_follow'
  | 'll1'
  | 'slr'
  | 'automaton'
  | 'parse_tree'
  | 'compare'
  | 'tests'
  | 'projects'
  | 'learning'
  | 'quiz';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  doctorIssueCount: number;
  hasLL1Conflict: boolean;
  hasSLRConflict: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  doctorIssueCount,
  hasLL1Conflict,
  hasSLRConflict
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'grammar', label: 'Grammar Editor', icon: FileCode2 },
    {
      id: 'doctor',
      label: 'Grammar Doctor',
      icon: Stethoscope,
      badge: doctorIssueCount > 0 ? doctorIssueCount : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    },
    { id: 'first_follow', label: 'FIRST / FOLLOW', icon: ListTree },
    {
      id: 'll1',
      label: 'LL(1) Generator',
      icon: Table,
      badge: hasLL1Conflict ? 'Conflict' : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
    },
    {
      id: 'slr',
      label: 'SLR Generator',
      icon: Layers,
      badge: hasSLRConflict ? 'Conflict' : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
    },
    { id: 'automaton', label: 'SLR Automaton', icon: Network },
    { id: 'parse_tree', label: 'Parse Tree', icon: GitFork },
    { id: 'compare', label: 'LL(1) vs SLR', icon: CheckCheck },
    { id: 'tests', label: 'Test Suite', icon: CheckCheck },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'learning', label: 'Learning Mode', icon: GraduationCap },
    { id: 'quiz', label: 'Quiz Mode', icon: HelpCircle }
  ];

  return (
    <aside className="w-56 bg-slate-900/95 border-r border-slate-800 flex flex-col justify-between select-none shrink-0">
      <div className="py-3 px-2 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
          Compiler Modules
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as TabType)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-950/80 to-slate-800 text-cyan-400 border border-cyan-800/40 shadow-inner'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="p-3 border-t border-slate-800 bg-slate-950/40">
        <div className="text-[11px] text-slate-400 flex items-center justify-between">
          <span>Engine Status</span>
          <span className="flex items-center text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" /> Ready
          </span>
        </div>
      </div>
    </aside>
  );
};

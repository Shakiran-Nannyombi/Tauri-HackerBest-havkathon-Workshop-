import React from 'react';
import {
  Database,
  ShieldCheck,
  Sparkles,
  Download,
  Layers,
  FolderGit2,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { SavedDatasetRecord } from '../types';

interface DesktopHeaderProps {
  savedDatasets: SavedDatasetRecord[];
  onOpenExport: () => void;
  activeProjectName: string;
  onChangeProjectName: (name: string) => void;
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

export const DesktopHeader: React.FC<DesktopHeaderProps> = ({
  savedDatasets,
  onOpenExport,
  activeProjectName,
  onChangeProjectName,
  isSidebarCollapsed,
  onToggleSidebar,
}) => {
  const avgTrustScore = savedDatasets.length
    ? Math.round(
        savedDatasets.reduce(
          (acc, d) =>
            acc + (d.trustRating || (d.trustScore === 'High' ? 90 : d.trustScore === 'Medium' ? 65 : 35)),
          0
        ) / savedDatasets.length
      )
    : null;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-6 py-3 flex items-center justify-between select-none">
      {/* Left: Window controls, Sidebar toggle & Brand */}
      <div className="flex items-center gap-4">
        {/* Modern desktop window indicators */}
        <div className="flex items-center gap-1.5 pr-2 border-r border-slate-200">
          <div className="w-3 h-3 rounded-full bg-slate-300 hover:bg-rose-400 transition-colors cursor-pointer" title="Window Control" />
          <div className="w-3 h-3 rounded-full bg-slate-300 hover:bg-amber-400 transition-colors cursor-pointer" title="Minimize" />
          <div className="w-3 h-3 rounded-full bg-slate-300 hover:bg-emerald-400 transition-colors cursor-pointer" title="Maximize" />
        </div>

        {/* Sidebar Collapse Toggle Button */}
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg text-slate-500 hover:text-[#0F172A] hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1 text-xs"
          title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen className="w-4 h-4 text-[#2563EB]" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
          <span className="hidden xl:inline text-slate-500 text-[11px]">
            {isSidebarCollapsed ? 'Show Sidebar' : 'Collapse'}
          </span>
        </button>

        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#2563EB] text-white flex items-center justify-center shadow-xs shrink-0 font-bold text-xs">
            <Database className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-tight text-[#0F172A]">
                ResearchBase
              </h1>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-[#2563EB] border border-blue-200/80 font-mono">
                v2.4
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Academic Dataset Engine
            </p>
          </div>
        </div>

        {/* Workspace selector */}
        <div className="hidden lg:flex items-center gap-2 ml-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
          <FolderGit2 className="w-3.5 h-3.5 text-[#2563EB]" />
          <span className="text-slate-400 text-[11px]">Study:</span>
          <input
            type="text"
            value={activeProjectName}
            onChange={(e) => onChangeProjectName(e.target.value)}
            className="font-medium text-[#0F172A] bg-transparent focus:outline-hidden hover:bg-white focus:bg-white px-1.5 py-0.5 rounded transition-colors"
            title="Click to rename research workspace"
          />
        </div>
      </div>

      {/* Center: System Status */}
      <div className="hidden md:flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-blue-50/80 border border-blue-100 text-xs text-[#1E40AF]">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2563EB]"></span>
        </span>
        <span className="font-medium flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-[#2563EB]" />
          Gemma 4 & Gemini 3.8 Flash • Real-Time Web Grounding
        </span>
      </div>

      {/* Right: Metrics & Action */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-700 bg-slate-100/90 px-3 py-1.5 rounded-lg border border-slate-200">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-bold text-[#0F172A]">{savedDatasets.length}</span>
            <span className="hidden sm:inline text-slate-500">Datasets</span>
          </div>

          {avgTrustScore !== null && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{avgTrustScore}%</span>
              <span className="text-emerald-700/70 text-[11px] hidden sm:inline">Trust</span>
            </div>
          )}
        </div>

        <button
          onClick={onOpenExport}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export Dossier</span>
        </button>
      </div>
    </header>
  );
};

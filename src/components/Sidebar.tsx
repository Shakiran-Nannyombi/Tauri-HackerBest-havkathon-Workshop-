import React from 'react';
import {
  Home,
  Compass,
  ShieldCheck,
  FolderTree,
  FileSpreadsheet,
  BotMessageSquare,
  BookMarked,
  GraduationCap,
  ExternalLink,
  HardDrive,
  Server,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { NavSection } from '../types';

interface SidebarProps {
  currentSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  savedCount: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentSection,
  onSelectSection,
  savedCount,
  isCollapsed,
  onToggleCollapse,
}) => {
  const navItems: Array<{
    id: NavSection;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
  }> = [
    {
      id: 'home',
      label: 'Home Dashboard',
      icon: Home,
    },
    {
      id: 'discover',
      label: 'Dataset Discovery',
      icon: Compass,
    },
    {
      id: 'verify',
      label: 'Source Verifier',
      icon: ShieldCheck,
    },
    {
      id: 'document',
      label: 'Documentation Gen',
      icon: FileSpreadsheet,
    },
    {
      id: 'organize',
      label: 'Folder Hierarchy',
      icon: FolderTree,
    },
    {
      id: 'assistant',
      label: 'Academic Copilot',
      icon: BotMessageSquare,
    },
    {
      id: 'library',
      label: 'Curated Dossier',
      icon: BookMarked,
      badge: savedCount > 0 ? savedCount : undefined,
    },
    {
      id: 'workspace',
      label: 'Google Workspace',
      icon: HardDrive,
    },
    {
      id: 'fastapi',
      label: 'FastAPI Backend',
      icon: Server,
    },
  ];

  return (
    <aside
      className={`bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 h-[calc(100vh-53px)] transition-all duration-300 select-none ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className={`space-y-4 ${isCollapsed ? 'p-2' : 'p-4'}`}>
        {/* Sidebar Header & Toggle Button */}
        <div className="flex items-center justify-between px-1">
          {!isCollapsed && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Navigation
            </span>
          )}
          <button
            onClick={onToggleCollapse}
            className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer ${
              isCollapsed ? 'mx-auto' : ''
            }`}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-[#2563EB]" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation items with generous padding */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectSection(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full rounded-xl transition-all cursor-pointer flex items-center ${
                  isCollapsed
                    ? 'justify-center p-3'
                    : 'px-3.5 py-2.5 gap-3 text-left'
                } ${
                  isActive
                    ? 'bg-blue-50 text-[#2563EB] shadow-xs font-semibold border border-blue-100/80'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-[#0F172A]'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-[#2563EB]' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                {!isCollapsed && (
                  <div className="flex-1 flex items-center justify-between min-w-0">
                    <span className="text-xs truncate">{item.label}</span>
                    {item.badge !== undefined && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Open Repositories Quick Links Guide (Expanded only) */}
        {!isCollapsed && (
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <span className="px-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Open Repositories</span>
              <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <a
                href="https://zenodo.org"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200/60 text-slate-700 hover:text-[#2563EB] flex items-center justify-between transition-colors"
              >
                <span className="font-medium truncate">Zenodo</span>
                <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
              </a>
              <a
                href="https://huggingface.co/datasets"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200/60 text-slate-700 hover:text-[#2563EB] flex items-center justify-between transition-colors"
              >
                <span className="font-medium truncate">HF Hub</span>
                <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
              </a>
              <a
                href="https://data.gov"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200/60 text-slate-700 hover:text-[#2563EB] flex items-center justify-between transition-colors"
              >
                <span className="font-medium truncate">Data.gov</span>
                <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
              </a>
              <a
                href="https://www.kaggle.com/datasets"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200/60 text-slate-700 hover:text-[#2563EB] flex items-center justify-between transition-colors"
              >
                <span className="font-medium truncate">Kaggle</span>
                <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Academic Protocol Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-slate-200 bg-slate-50/70 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700 mb-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Academic Rigor Protocol</span>
          </div>
          <p className="text-[10px] leading-tight text-slate-500">
            FAIR data principles: Findable, Accessible, Interoperable, and Reusable.
          </p>
        </div>
      )}
    </aside>
  );
};

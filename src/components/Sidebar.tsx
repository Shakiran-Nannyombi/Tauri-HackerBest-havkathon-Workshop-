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
} from 'lucide-react';
import { NavSection } from '../types';

interface SidebarProps {
  currentSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  savedCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentSection,
  onSelectSection,
  savedCount,
}) => {
  const navItems: Array<{
    id: NavSection;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
  }> = [
    {
      id: 'home',
      label: 'Home Dashboard',
      description: 'Split-view Gemma 4 copilot',
      icon: Home,
    },
    {
      id: 'discover',
      label: 'Dataset Discovery',
      description: 'Repository queries & acquisition',
      icon: Compass,
    },
    {
      id: 'verify',
      label: 'Source Verifier',
      description: 'Provenance, license & bias audit',
      icon: ShieldCheck,
    },
    {
      id: 'document',
      label: 'Documentation Generator',
      description: 'README & data dictionary',
      icon: FileSpreadsheet,
    },
    {
      id: 'organize',
      label: 'Organization Strategy',
      description: 'Directory blueprint & naming',
      icon: FolderTree,
    },
    {
      id: 'assistant',
      label: 'Academic Assistant',
      description: 'Grounded methodology chat',
      icon: BotMessageSquare,
    },
    {
      id: 'library',
      label: 'Project Library',
      description: 'Saved datasets & exports',
      icon: BookMarked,
      badge: savedCount > 0 ? savedCount : undefined,
    },
    {
      id: 'workspace',
      label: 'Google Workspace',
      description: 'Docs, Sheets, Forms & Drive',
      icon: HardDrive,
    },
    {
      id: 'fastapi',
      label: 'FastAPI & Gemma 4',
      description: 'Python backend service code',
      icon: Server,
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 h-[calc(100vh-53px)] overflow-y-auto">
      <div className="p-3 space-y-4">
        <div>
          <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Workflows
          </div>
          <nav className="space-y-1 mt-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectSection(item.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg flex items-start gap-3 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-50/90 text-[#2563EB] shadow-xs ring-1 ring-blue-500/20'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-[#0F172A]'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 mt-0.5 shrink-0 ${
                      isActive ? 'text-[#2563EB]' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold ${isActive ? 'text-[#1E40AF]' : 'text-[#0F172A]'}`}>
                        {item.label}
                      </span>
                      {item.badge !== undefined && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-700">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Repositories Quick Links Guide */}
        <div className="pt-2 border-t border-slate-100">
          <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Reputable Sources</span>
            <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="grid grid-cols-2 gap-1.5 mt-2 px-1">
            <a
              href="https://zenodo.org"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] font-medium text-slate-600 hover:text-[#2563EB] p-1.5 rounded hover:bg-slate-50 flex items-center justify-between border border-slate-100"
            >
              <span>Zenodo (CERN)</span>
              <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
            </a>
            <a
              href="https://data.gov"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] font-medium text-slate-600 hover:text-[#2563EB] p-1.5 rounded hover:bg-slate-50 flex items-center justify-between border border-slate-100"
            >
              <span>Data.gov</span>
              <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
            </a>
            <a
              href="https://huggingface.co/datasets"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] font-medium text-slate-600 hover:text-[#2563EB] p-1.5 rounded hover:bg-slate-50 flex items-center justify-between border border-slate-100"
            >
              <span>Hugging Face</span>
              <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
            </a>
            <a
              href="https://www.kaggle.com/datasets"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] font-medium text-slate-600 hover:text-[#2563EB] p-1.5 rounded hover:bg-slate-50 flex items-center justify-between border border-slate-100"
            >
              <span>Kaggle Data</span>
              <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Academic Protocol Footer */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/70 text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5 font-semibold text-slate-700 mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Academic Rigor Protocol
        </div>
        <p className="text-[10px] leading-tight text-slate-500">
          Enforces FAIR principles (Findable, Accessible, Interoperable, Reusable) and provenance verification.
        </p>
      </div>
    </aside>
  );
};

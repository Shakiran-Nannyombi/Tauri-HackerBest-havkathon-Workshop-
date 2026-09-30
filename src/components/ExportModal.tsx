import React, { useState } from 'react';
import { X, Download, Copy, Check, FileCode, FileText } from 'lucide-react';
import { SavedDatasetRecord } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  savedDatasets: SavedDatasetRecord[];
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  projectName,
  savedDatasets,
}) => {
  const [tab, setTab] = useState<'json' | 'markdown'>('json');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const exportJSONString = JSON.stringify(
    {
      app: 'ResearchBase Academic Engine v2.4',
      projectName,
      exportDate: new Date().toISOString(),
      standardsCompliance: ['FAIR Principles', 'OSF Data Standard', 'CC Licensing'],
      totalDatasets: savedDatasets.length,
      datasets: savedDatasets,
    },
    null,
    2
  );

  let exportMarkdownString = `# Research Dossier: ${projectName}\n\n`;
  exportMarkdownString += `**Application:** ResearchBase Academic Dataset Engine\n`;
  exportMarkdownString += `**Date:** ${new Date().toLocaleDateString()}\n`;
  exportMarkdownString += `**Total Curated Datasets:** ${savedDatasets.length}\n\n`;
  exportMarkdownString += `## 1. Executive Summary & Provenance Index\n\n`;

  savedDatasets.forEach((ds, i) => {
    exportMarkdownString += `### ${i + 1}. ${ds.title}\n`;
    exportMarkdownString += `- **Repository:** ${ds.repository}\n`;
    exportMarkdownString += `- **License:** ${ds.license}\n`;
    exportMarkdownString += `- **Trust Assessment Score:** ${ds.trustScore} (${ds.trustRating || 'N/A'}%)\n`;
    exportMarkdownString += `- **Description:** ${ds.description}\n`;
    if (ds.pythonSnippet) {
      exportMarkdownString += `\n\`\`\`python\n${ds.pythonSnippet}\n\`\`\`\n`;
    }
    if (ds.audit) {
      exportMarkdownString += `\n**Audit Verdict:** ${ds.audit.verdictHeadline}\n`;
      if (ds.audit.citations?.apa) {
        exportMarkdownString += `**APA Citation:** ${ds.audit.citations.apa}\n`;
      }
    }
    exportMarkdownString += `\n---\n\n`;
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(tab === 'json' ? exportJSONString : exportMarkdownString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const content = tab === 'json' ? exportJSONString : exportMarkdownString;
    const type = tab === 'json' ? 'application/json' : 'text/markdown';
    const extension = tab === 'json' ? 'json' : 'md';
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.toLowerCase().replace(/\s+/g, '_')}_dossier.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-slate-200 max-w-3xl w-full max-h-[85vh] flex flex-col shadow-xl">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#0F172A]">
              Export Research Project Dossier
            </h3>
            <p className="text-xs text-slate-500">
              {projectName} • {savedDatasets.length} Curated Datasets
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="inline-flex p-1 rounded-lg bg-slate-200/70 text-xs">
            <button
              onClick={() => setTab('json')}
              className={`px-3 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                tab === 'json'
                  ? 'bg-white text-[#2563EB] shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>JSON Schema</span>
            </button>
            <button
              onClick={() => setTab('markdown')}
              className={`px-3 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                tab === 'markdown'
                  ? 'bg-white text-[#2563EB] shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Markdown Dossier</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="text-xs px-2.5 py-1 rounded bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium flex items-center gap-1 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
            <button
              onClick={handleDownload}
              className="text-xs px-3 py-1 rounded bg-[#2563EB] hover:bg-blue-700 text-white font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </div>

        {/* Content Preview */}
        <div className="p-4 flex-1 overflow-y-auto">
          <pre className="p-4 bg-[#0F172A] text-slate-200 text-xs font-mono rounded-lg overflow-x-auto leading-relaxed border border-slate-800">
            {tab === 'json' ? exportJSONString : exportMarkdownString}
          </pre>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

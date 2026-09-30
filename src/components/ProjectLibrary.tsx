import React, { useState } from 'react';
import {
  BookMarked,
  ShieldCheck,
  ShieldAlert,
  Shield,
  Trash2,
  Download,
  FileCode,
  Copy,
  Check,
  ExternalLink,
  Layers,
  Sparkles,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { SavedDatasetRecord } from '../types';

interface ProjectLibraryProps {
  savedDatasets: SavedDatasetRecord[];
  onRemoveDataset: (id: string) => void;
  onSelectDatasetForAudit: (dataset: SavedDatasetRecord) => void;
  onSeedSampleDatasets: () => void;
  projectName: string;
}

export const ProjectLibrary: React.FC<ProjectLibraryProps> = ({
  savedDatasets,
  onRemoveDataset,
  onSelectDatasetForAudit,
  onSeedSampleDatasets,
  projectName,
}) => {
  const [filterScore, setFilterScore] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);

  const filteredDatasets = savedDatasets.filter((ds) => {
    const matchesScore = filterScore === 'All' || ds.trustScore === filterScore;
    const matchesSearch =
      ds.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ds.repository.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ds.license.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesScore && matchesSearch;
  });

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippetId(id);
    setTimeout(() => setCopiedSnippetId(null), 2000);
  };

  const handleExportJSON = () => {
    const exportBundle = {
      project: projectName,
      exportedAt: new Date().toISOString(),
      standards: 'ResearchBase Academic Governance v2.4',
      totalDatasets: savedDatasets.length,
      datasets: savedDatasets,
    };
    const blob = new Blob([JSON.stringify(exportBundle, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.toLowerCase().replace(/\s+/g, '_')}_dossier.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportMarkdown = () => {
    let md = `# Research Dossier: ${projectName}\n\n`;
    md += `*Generated via ResearchBase Academic Engine on ${new Date().toLocaleDateString()}*\n\n`;
    md += `## Curated Datasets Manifest (${savedDatasets.length})\n\n`;

    savedDatasets.forEach((ds, i) => {
      md += `### ${i + 1}. ${ds.title}\n`;
      md += `- **Repository:** ${ds.repository}\n`;
      md += `- **License:** ${ds.license}\n`;
      md += `- **Trust Assessment Score:** ${ds.trustScore} (${ds.trustRating || 'N/A'}%)\n`;
      md += `- **Description:** ${ds.description}\n`;
      if (ds.pythonSnippet) {
        md += `\n\`\`\`python\n${ds.pythonSnippet}\n\`\`\`\n`;
      }
      if (ds.audit) {
        md += `\n**Audit Verdict:** ${ds.audit.verdictHeadline}\n`;
        if (ds.audit.criticalRisks?.length) {
          md += `**Risks Flagged:**\n`;
          ds.audit.criticalRisks.forEach((r) => (md += `- ${r}\n`));
        }
      }
      md += `\n---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.toLowerCase().replace(/\s+/g, '_')}_dossier.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-[#2563EB] tracking-wide uppercase">
                Workspace Repository
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-medium">Curated Dataset Dossier</span>
            </div>
            <h2 className="text-xl font-bold text-[#0F172A] tracking-tight">
              Project Library: {projectName}
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Central catalog of verified datasets, Trust Audit reports, and acquisition scripts ready for export.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJSON}
              disabled={savedDatasets.length === 0}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-800 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileCode className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Export JSON Schema</span>
            </button>
            <button
              onClick={handleExportMarkdown}
              disabled={savedDatasets.length === 0}
              className="text-xs px-3.5 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Markdown Dossier</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by title, repository, or license..."
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#2563EB] rounded-lg text-xs text-[#0F172A] outline-hidden"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 font-medium">Trust Score:</span>
            {(['All', 'High', 'Medium', 'Low'] as const).map((sc) => (
              <button
                key={sc}
                onClick={() => setFilterScore(sc)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  filterScore === sc
                    ? 'bg-[#2563EB] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {sc}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Empty State */}
      {savedDatasets.length === 0 && (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-[#2563EB] flex items-center justify-center mx-auto">
            <BookMarked className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-sm font-bold text-[#0F172A]">
              No Datasets Curated in this Workspace
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Discover repositories in the Discovery tab, run a Trust Audit on custom data, or load verified academic test datasets.
            </p>
          </div>
          <div>
            <button
              onClick={onSeedSampleDatasets}
              className="px-4 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#1E40AF] text-xs font-bold flex items-center gap-2 mx-auto transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#2563EB]" />
              <span>Load 3 Verified Benchmark Datasets</span>
            </button>
          </div>
        </div>
      )}

      {/* Saved Datasets Grid */}
      {savedDatasets.length > 0 && (
        <div className="grid grid-cols-1 gap-4">
          {filteredDatasets.map((ds) => {
            const isHigh = ds.trustScore === 'High';
            const isMed = ds.trustScore === 'Medium';

            return (
              <div
                key={ds.id}
                className="bg-white rounded-xl border border-slate-200 hover:border-blue-300 transition-all p-5 shadow-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px] font-bold border border-slate-200">
                        {ds.repository}
                      </span>
                      <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200">
                        {ds.license}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-[11px] text-slate-500">
                        Saved: {new Date(ds.savedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[#0F172A] tracking-tight">
                      {ds.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${
                        isHigh
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : isMed
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}
                    >
                      {isHigh ? (
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      ) : isMed ? (
                        <Shield className="w-4 h-4 text-amber-600" />
                      ) : (
                        <ShieldAlert className="w-4 h-4 text-rose-600" />
                      )}
                      <span>{ds.trustScore} Trust</span>
                      {ds.trustRating && <span>({ds.trustRating}%)</span>}
                    </div>

                    <button
                      onClick={() => onRemoveDataset(ds.id)}
                      className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Remove from workspace"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed">{ds.description}</p>

                {ds.audit && (
                  <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-100 text-xs text-slate-800">
                    <span className="font-bold text-[#1E40AF]">Provenance Verdict: </span>
                    <span>{ds.audit.verdictHeadline}</span>
                  </div>
                )}

                {ds.pythonSnippet && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                      <span>Python Acquisition Code:</span>
                      <button
                        onClick={() => handleCopyCode(ds.id, ds.pythonSnippet!)}
                        className="text-slate-600 hover:text-[#2563EB] flex items-center gap-1 cursor-pointer"
                      >
                        {copiedSnippetId === ds.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Python</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-3 rounded-lg bg-[#0F172A] text-slate-100 text-xs font-mono overflow-x-auto leading-relaxed max-h-36">
                      {ds.pythonSnippet}
                    </pre>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => onSelectDatasetForAudit(ds)}
                    className="text-xs text-[#2563EB] hover:text-blue-700 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>View / Re-audit in Verification Engine</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

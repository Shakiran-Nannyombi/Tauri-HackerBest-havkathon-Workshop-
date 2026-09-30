import React, { useState } from 'react';
import {
  FolderTree,
  FolderPlus,
  Terminal,
  Copy,
  Check,
  Download,
  Sparkles,
  Layers,
  FileCode,
  Tag,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { OrganizationPlan, OrganizeResponse } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { getApiUrl } from '../services/apiConfig';

const PRESET_PROJECTS = [
  {
    title: 'Pediatric Asthma & Urban Air Quality Longitudinal Study',
    domain: 'Public Health & Environmental Epidemiology',
    dataTypes: 'Hourly Sensor Timeseries (CSV/Parquet), Geospatial Shapefiles, Demographics',
    stages: 'Raw (Immutable), Interim Imputed, Standardized Panel, Regression Models, Figures',
  },
  {
    title: 'Clinical NLP: Multi-Hospital EHR De-identification Pipeline',
    domain: 'Biomedical Informatics & Natural Language Processing',
    dataTypes: 'Raw Clinical Notes (JSONL), BioBERT Embeddings, Annotated Spans, Tokenized Corpora',
    stages: 'Raw EHR (PII Encrypted), De-identified Spans, Training Splits, Benchmarks',
  },
  {
    title: 'Renewable Microgrid Power Output Forecasting Benchmark',
    domain: 'Energy Systems & Machine Learning',
    dataTypes: 'Inverter SCADA Logs, Solar Irradiance GeoTIFFs, Weather Forecasts (NetCDF)',
    stages: 'Raw Telemetry, Resampled 15-Min Panels, Feature Store, PyTorch Checkpoints',
  },
];

export const OrganizationStrategy: React.FC = () => {
  const [projectTitle, setProjectTitle] = useState(
    'Pediatric Asthma & Urban Air Quality Longitudinal Study'
  );
  const [researchDomain, setResearchDomain] = useState(
    'Public Health & Environmental Epidemiology'
  );
  const [dataTypes, setDataTypes] = useState(
    'Hourly Sensor Timeseries (CSV/Parquet), Geospatial Shapefiles, Demographics'
  );
  const [pipelineStages, setPipelineStages] = useState(
    'Raw (Immutable), Interim Imputed, Standardized Panel, Regression Models, Figures'
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [organizeResult, setOrganizeResult] = useState<OrganizeResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'blueprint' | 'narrative'>('blueprint');
  const [copiedBash, setCopiedBash] = useState(false);
  const [copiedGitignore, setCopiedGitignore] = useState(false);

  const handleGenerate = async (preset?: typeof PRESET_PROJECTS[0]) => {
    const title = preset ? preset.title : projectTitle;
    const domain = preset ? preset.domain : researchDomain;
    const types = preset ? preset.dataTypes : dataTypes;
    const stages = preset ? preset.stages : pipelineStages;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(getApiUrl('/api/research/organize'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectTitle: title,
          researchDomain: domain,
          dataTypes: types,
          pipelineStages: stages,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Failed to generate organization plan`);
      }

      const data: OrganizeResponse = await res.json();
      setOrganizeResult(data);
      setActiveTab('blueprint');
    } catch (err: any) {
      setError(err?.message || 'Failed to generate organization strategy.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyBash = (script: string) => {
    navigator.clipboard.writeText(script);
    setCopiedBash(true);
    setTimeout(() => setCopiedBash(false), 2000);
  };

  const handleDownloadBash = (script: string) => {
    const blob = new Blob([script], { type: 'text/x-sh' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'setup_project.sh';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyGitignore = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedGitignore(true);
    setTimeout(() => setCopiedGitignore(false), 2000);
  };

  const plan = organizeResult?.plan;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-[#2563EB] tracking-wide uppercase">
                Stage 3 • Data Governance
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-medium">
                Reproducible Research Blueprint
              </span>
            </div>
            <h2 className="text-xl font-bold text-[#0F172A] tracking-tight">
              Organization Strategy & Hierarchy Blueprint
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Establish ISO-8601 standardized local directories, immutable raw storage, versioning schemas, and git governance.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-[#2563EB]" />
              Automated Shell Scaffolding
            </span>
          </div>
        </div>

        {/* Preset Projects */}
        <div className="mt-4">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Preset Research Workspaces
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {PRESET_PROJECTS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setProjectTitle(p.title);
                  setResearchDomain(p.domain);
                  setDataTypes(p.dataTypes);
                  setPipelineStages(p.stages);
                  handleGenerate(p);
                }}
                className="text-left p-2.5 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition-all cursor-pointer group"
              >
                <div className="text-[11px] font-semibold text-slate-500 truncate mb-1">
                  {p.domain}
                </div>
                <div className="text-xs font-bold text-[#0F172A] group-hover:text-[#2563EB] line-clamp-1">
                  {p.title}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Inputs */}
        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1">
                Project Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                placeholder="e.g. Pediatric Asthma & Urban Air Quality Longitudinal Study"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-[#0F172A] focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1">
                Scientific Domain / Methodological Discipline
              </label>
              <input
                type="text"
                value={researchDomain}
                onChange={(e) => setResearchDomain(e.target.value)}
                placeholder="e.g. Environmental Epidemiology, Econometrics, Deep Learning"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-[#0F172A] focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1">
                Data Modalities & File Extensions
              </label>
              <input
                type="text"
                value={dataTypes}
                onChange={(e) => setDataTypes(e.target.value)}
                placeholder="CSV, Parquet, GeoJSON, Audio .wav, DICOM, SQLite..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-[#0F172A] focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1">
                Pipeline Lifecycle Stages
              </label>
              <input
                type="text"
                value={pipelineStages}
                onChange={(e) => setPipelineStages(e.target.value)}
                placeholder="Raw, Interim, Processed, Feature Store, Figures, Publication Models..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-[#0F172A] focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 outline-hidden"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => handleGenerate()}
              disabled={loading}
              className="px-5 py-2.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-slate-300 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Synthesizing Architecture...</span>
                </>
              ) : (
                <>
                  <FolderPlus className="w-4 h-4" />
                  <span>Generate Organization Blueprint</span>
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-4 shadow-xs">
          <div className="inline-flex p-3 rounded-full bg-blue-50 text-[#2563EB] animate-pulse">
            <FolderTree className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-sm font-bold text-[#0F172A]">
              Structuring Reproducible Academic Directory Layout
            </h3>
            <p className="text-xs text-slate-500">
              Applying ISO-8601 timestamping, raw data immutability patterns, and DVC git exclusion rules...
            </p>
          </div>
        </div>
      )}

      {/* Blueprint Output */}
      {organizeResult && !loading && (
        <div className="space-y-5">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-xs font-bold text-[#0F172A] block">
                Standardized Research Layout Blueprint
              </span>
              <p className="text-xs text-slate-500">
                Formulated according to Open Science Framework (OSF) and cookiecutter-data-science standards.
              </p>
            </div>

            <div className="inline-flex p-1 rounded-lg bg-slate-100 border border-slate-200 text-xs">
              <button
                onClick={() => setActiveTab('blueprint')}
                className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  activeTab === 'blueprint'
                    ? 'bg-white text-[#2563EB] shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Blueprint & Shell Setup
              </button>
              <button
                onClick={() => setActiveTab('narrative')}
                className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  activeTab === 'narrative'
                    ? 'bg-white text-[#2563EB] shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Full Academic Guidelines
              </button>
            </div>
          </div>

          {activeTab === 'blueprint' && (
            <div className="space-y-5">
              {/* Directory Tree Card */}
              {plan?.hierarchyTree && (
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FolderTree className="w-4 h-4 text-[#2563EB]" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                        Recommended Folder Hierarchy (ASCII Map)
                      </h4>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      POSIX Compliant
                    </span>
                  </div>
                  <pre className="p-4 rounded-lg bg-[#0F172A] text-emerald-400 text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800">
                    {plan.hierarchyTree}
                  </pre>
                </div>
              )}

              {/* Naming Rules and Examples */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Naming Conventions */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#2563EB]" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                      Standardized File Naming Rules
                    </h4>
                  </div>
                  {plan?.namingRules && plan.namingRules.length > 0 ? (
                    <ul className="space-y-2">
                      {plan.namingRules.map((rule, idx) => (
                        <li
                          key={idx}
                          className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-2"
                        >
                          <span className="w-4 h-4 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-500">
                      Follow YYYYMMDD_source_metric_version.ext format without spaces.
                    </p>
                  )}

                  {plan?.namingExamples && plan.namingExamples.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 space-y-1.5">
                      <span className="text-[11px] font-bold uppercase text-slate-400">
                        Canonical Filename Examples:
                      </span>
                      {plan.namingExamples.map((ex, i) => (
                        <div
                          key={i}
                          className="p-2 rounded bg-blue-50/60 border border-blue-100 font-mono text-[11px] text-[#1E40AF]"
                        >
                          {ex}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tagging Taxonomy */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-[#2563EB]" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                      Metadata & Tagging Taxonomy
                    </h4>
                  </div>
                  {plan?.taggingTaxonomy && plan.taggingTaxonomy.length > 0 ? (
                    <div className="space-y-2">
                      {plan.taggingTaxonomy.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-start justify-between gap-3 text-xs"
                        >
                          <span className="font-mono font-bold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded border border-blue-200 shrink-0">
                            #{item.tag}
                          </span>
                          <span className="text-slate-600 text-right">{item.description}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">
                      Standard metadata tags: #stage/raw, #stage/clean, #pii/anonymized, #license/cc-by.
                    </p>
                  )}
                </div>
              </div>

              {/* Shell Scaffolding Script & Gitignore */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Bash Scaffold */}
                {plan?.bashScaffold && (
                  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-[#2563EB]" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                          1-Command Terminal Scaffolding
                        </h4>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleCopyBash(plan.bashScaffold)}
                          className="text-xs px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium flex items-center gap-1 cursor-pointer"
                        >
                          {copiedBash ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy Script</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleDownloadBash(plan.bashScaffold)}
                          className="text-xs px-2.5 py-1 rounded bg-[#2563EB] hover:bg-blue-700 text-white font-medium flex items-center gap-1 cursor-pointer"
                        >
                          <Download className="w-3 h-3" />
                          <span>Download .sh</span>
                        </button>
                      </div>
                    </div>

                    <pre className="p-3.5 rounded-lg bg-[#0F172A] text-slate-200 text-xs font-mono overflow-x-auto leading-relaxed max-h-56">
                      {plan.bashScaffold}
                    </pre>
                  </div>
                )}

                {/* Gitignore */}
                {plan?.gitignoreSnippet && (
                  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileCode className="w-4 h-4 text-[#2563EB]" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                          Academic Research .gitignore
                        </h4>
                      </div>
                      <button
                        onClick={() => handleCopyGitignore(plan.gitignoreSnippet)}
                        className="text-xs px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium flex items-center gap-1 cursor-pointer"
                      >
                        {copiedGitignore ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy .gitignore</span>
                          </>
                        )}
                      </button>
                    </div>

                    <pre className="p-3.5 rounded-lg bg-[#0F172A] text-slate-200 text-xs font-mono overflow-x-auto leading-relaxed max-h-56">
                      {plan.gitignoreSnippet}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'narrative' && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
              <MarkdownRenderer content={organizeResult.markdown} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

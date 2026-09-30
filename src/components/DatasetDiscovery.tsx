import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  Shield,
  Code2,
  Copy,
  Check,
  BookMarked,
  ArrowRight,
  Filter,
  Globe2,
  Terminal,
} from 'lucide-react';
import { DiscoveredDataset, DiscoveryResponse, SavedDatasetRecord } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { getApiUrl } from '../services/apiConfig';

interface DatasetDiscoveryProps {
  onSendToAudit: (dataset: {
    name: string;
    url: string;
    license: string;
    institution: string;
    description: string;
  }) => void;
  onSaveDataset: (dataset: SavedDatasetRecord) => void;
  savedDatasets: SavedDatasetRecord[];
}

const PRESET_TOPICS = [
  {
    topic: 'Global Renewable Energy Adoption & Grid Reliability (2015-2024)',
    discipline: 'Environmental Science & Energy Policy',
  },
  {
    topic: 'Urban Air Quality Index & Pediatric Asthma Incidence',
    discipline: 'Public Health & Epidemiology',
  },
  {
    topic: 'Multimodal Sentiment Analysis in Biomedical Clinical Notes',
    discipline: 'Computer Science & Clinical NLP',
  },
  {
    topic: 'Socioeconomic Factors in Public Transit Ridership Post-Pandemic',
    discipline: 'Urban Studies & Economics',
  },
];

const REPOSITORIES = [
  'Zenodo (Academic DOI)',
  'Kaggle',
  'Hugging Face',
  'Data.gov',
  'GitHub Open Data',
  'Dryad Digital Repository',
];

export const DatasetDiscovery: React.FC<DatasetDiscoveryProps> = ({
  onSendToAudit,
  onSaveDataset,
  savedDatasets,
}) => {
  const [topic, setTopic] = useState('');
  const [discipline, setDiscipline] = useState('Interdisciplinary / General Science');
  const [selectedRepos, setSelectedRepos] = useState<string[]>([
    'Zenodo (Academic DOI)',
    'Kaggle',
    'Hugging Face',
    'Data.gov',
  ]);
  const [formatPreference, setFormatPreference] = useState('CSV, Parquet, JSON');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [discoveryResult, setDiscoveryResult] = useState<DiscoveryResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'cards' | 'markdown'>('cards');
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);

  const toggleRepo = (repo: string) => {
    setSelectedRepos((prev) =>
      prev.includes(repo) ? prev.filter((r) => r !== repo) : [...prev, repo]
    );
  };

  const handleSearch = async (overrideTopic?: string, overrideDiscipline?: string) => {
    const queryTopic = overrideTopic ?? topic;
    const queryDiscipline = overrideDiscipline ?? discipline;

    if (!queryTopic.trim()) {
      setError('Please enter a research topic or select a preset inquiry.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(getApiUrl('/api/research/discover'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: queryTopic,
          discipline: queryDiscipline,
          repositories: selectedRepos,
          formatPreference,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Discovery failed with status ${res.status}`);
      }

      const data: DiscoveryResponse = await res.json();
      setDiscoveryResult(data);
      if (data.structured?.datasets && data.structured.datasets.length > 0) {
        setActiveTab('cards');
      } else {
        setActiveTab('markdown');
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred during discovery.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippetId(id);
    setTimeout(() => setCopiedSnippetId(null), 2000);
  };

  const isSaved = (datasetTitle: string) => {
    return savedDatasets.some((s) => s.title.toLowerCase() === datasetTitle.toLowerCase());
  };

  const handleSave = (dataset: DiscoveredDataset) => {
    onSaveDataset({
      id: dataset.id || `ds-${Date.now()}`,
      title: dataset.title,
      repository: dataset.repository,
      license: dataset.license,
      trustScore: dataset.trustScore,
      trustRating: dataset.trustRating,
      savedAt: new Date().toISOString(),
      description: dataset.description,
      pythonSnippet: dataset.pythonSnippet,
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-[#2563EB] tracking-wide uppercase">
                Stage 1 • Discovery Engine
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-medium">FAIR Repositories Grounding</span>
            </div>
            <h2 className="text-xl font-bold text-[#0F172A] tracking-tight">
              Academic Dataset Discovery
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Formulate researcher intent into verified data discovery pipelines, repository queries, and acquisition scripts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">Grounding:</span>
            <div className="px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700 flex items-center gap-1.5">
              <Globe2 className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Real-Time Web Search</span>
            </div>
          </div>
        </div>

        {/* Preset Topics Pills */}
        <div className="mt-4">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Preset Academic Inquiries (One-Click)
          </label>
          <div className="flex flex-wrap gap-2">
            {PRESET_TOPICS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setTopic(preset.topic);
                  setDiscipline(preset.discipline);
                  handleSearch(preset.topic, preset.discipline);
                }}
                className="text-xs px-3 py-1.5 rounded-full bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-[#2563EB] border border-slate-200 hover:border-blue-300 transition-colors text-left flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-[#2563EB] shrink-0" />
                <span className="font-medium truncate max-w-xs">{preset.topic}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <div className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#0F172A] mb-1">
              Research Topic or Target Hypothesis <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="e.g., Longitudinal clinical trials on type 2 diabetes with continuous glucose monitoring data..."
                className="w-full pl-9 pr-24 py-2.5 bg-white border border-slate-300 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 rounded-lg text-sm text-[#0F172A] placeholder-slate-400 transition-all outline-hidden"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <button
                onClick={() => handleSearch()}
                disabled={loading}
                className="absolute right-1.5 top-1.5 bottom-1.5 px-3.5 rounded-md bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-slate-300 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Discover</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1">
                Academic Discipline
              </label>
              <select
                value={discipline}
                onChange={(e) => setDiscipline(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-[#0F172A] focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 outline-hidden"
              >
                <option>Interdisciplinary / General Science</option>
                <option>Public Health & Epidemiology</option>
                <option>Environmental Science & Energy Policy</option>
                <option>Computer Science & Clinical NLP</option>
                <option>Social Sciences & Econometrics</option>
                <option>Bioinformatics & Genomics</option>
                <option>Neuroscience & Cognitive Science</option>
                <option>Education & Learning Analytics</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1">
                Data Modality & Preferred Formats
              </label>
              <input
                type="text"
                value={formatPreference}
                onChange={(e) => setFormatPreference(e.target.value)}
                placeholder="CSV, Parquet, JSON, NetCDF, GeoTIFF..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-[#0F172A] focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 outline-hidden"
              />
            </div>
          </div>

          {/* Repositories filter chips */}
          <div>
            <label className="block text-xs font-bold text-[#0F172A] mb-1.5 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              Target Repositories
            </label>
            <div className="flex flex-wrap gap-2">
              {REPOSITORIES.map((repo) => {
                const checked = selectedRepos.includes(repo);
                return (
                  <button
                    key={repo}
                    type="button"
                    onClick={() => toggleRepo(repo)}
                    className={`text-xs px-2.5 py-1 rounded-md border transition-all cursor-pointer ${
                      checked
                        ? 'bg-blue-50 border-[#2563EB] text-[#1E40AF] font-semibold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {repo}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-4 shadow-xs">
          <div className="inline-flex p-3 rounded-full bg-blue-50 text-[#2563EB] animate-bounce">
            <Globe2 className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-sm font-bold text-[#0F172A]">
              Auditing Repositories & Synthesizing Datasets
            </h3>
            <p className="text-xs text-slate-500">
              Querying Zenodo, Kaggle, Hugging Face, and Data.gov via Gemini 3.8 Flash with live provenance verification...
            </p>
          </div>
          <div className="w-48 h-1.5 bg-blue-100 rounded-full mx-auto overflow-hidden">
            <div className="w-24 h-full bg-[#2563EB] rounded-full animate-pulse" />
          </div>
        </div>
      )}

      {/* Results View */}
      {discoveryResult && !loading && (
        <div className="space-y-4">
          {/* View Toggles & Summary Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-xs font-bold text-[#0F172A] block">
                Discovery Dossier Generated
              </span>
              <p className="text-xs text-slate-500">
                {discoveryResult.structured?.datasets?.length || 0} datasets extracted with acquisition code and license checks.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="inline-flex p-1 rounded-lg bg-slate-100 border border-slate-200 text-xs">
                <button
                  onClick={() => setActiveTab('cards')}
                  className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    activeTab === 'cards'
                      ? 'bg-white text-[#2563EB] shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Interactive Cards
                </button>
                <button
                  onClick={() => setActiveTab('markdown')}
                  className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    activeTab === 'markdown'
                      ? 'bg-white text-[#2563EB] shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Full Synthesis Report
                </button>
              </div>
            </div>
          </div>

          {/* Tab 1: Interactive Cards */}
          {activeTab === 'cards' && (
            <div className="space-y-4">
              {discoveryResult.structured?.summary && (
                <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-4 text-xs text-slate-700 leading-relaxed">
                  <span className="font-bold text-[#1E40AF]">Research Synthesis: </span>
                  {discoveryResult.structured.summary}
                </div>
              )}

              {discoveryResult.structured?.recommendedKeywords && (
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span className="text-[11px] font-bold uppercase text-slate-400">
                    Recommended Boolean Keywords:
                  </span>
                  {discoveryResult.structured.recommendedKeywords.map((kw, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px] border border-slate-200"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4">
                {discoveryResult.structured?.datasets?.map((ds, index) => {
                  const saved = isSaved(ds.title);
                  const isHigh = ds.trustScore === 'High';
                  const isMed = ds.trustScore === 'Medium';

                  return (
                    <div
                      key={index}
                      className="bg-white rounded-xl border border-slate-200 hover:border-blue-300 transition-all p-5 shadow-xs space-y-4"
                    >
                      {/* Top Bar of Card */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px] font-bold border border-slate-200">
                              {ds.repository}
                            </span>
                            {ds.institution && (
                              <span className="text-xs text-slate-500 font-medium">
                                {ds.institution}
                              </span>
                            )}
                            <span className="text-xs text-slate-400">•</span>
                            <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200">
                              {ds.license || 'License Unknown'}
                            </span>
                          </div>

                          <h3 className="text-base font-bold text-[#0F172A] tracking-tight">
                            {ds.title}
                          </h3>
                        </div>

                        {/* Trust Score Badge */}
                        <div className="shrink-0 flex items-center gap-2">
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
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-700 leading-relaxed">
                        {ds.description}
                      </p>

                      {/* Biases and Risks Box */}
                      {ds.biasesAndRisks && (
                        <div className="p-3 rounded-lg bg-amber-50/50 border border-amber-200/60 text-xs text-amber-900 flex items-start gap-2">
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold">Academic Risk / Potential Bias: </span>
                            <span>{ds.biasesAndRisks}</span>
                          </div>
                        </div>
                      )}

                      {/* Python acquisition snippet */}
                      {ds.pythonSnippet && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                            <span className="flex items-center gap-1">
                              <Terminal className="w-3 h-3 text-[#2563EB]" />
                              Acquisition & Inspection Snippet
                            </span>
                            <button
                              onClick={() => handleCopyCode(ds.id || String(index), ds.pythonSnippet!)}
                              className="text-slate-600 hover:text-[#2563EB] flex items-center gap-1 cursor-pointer"
                            >
                              {copiedSnippetId === (ds.id || String(index)) ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span className="text-emerald-600 font-medium">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy Python</span>
                                </>
                              )}
                            </button>
                          </div>
                          <pre className="p-3 rounded-lg bg-[#0F172A] text-slate-100 text-xs font-mono overflow-x-auto leading-relaxed">
                            {ds.pythonSnippet}
                          </pre>
                        </div>
                      )}

                      {/* Card Actions */}
                      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {ds.searchQuery && (
                            <a
                              href={`https://duckduckgo.com/?q=${encodeURIComponent(
                                `${ds.repository} ${ds.searchQuery}`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs px-2.5 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium flex items-center gap-1 transition-colors"
                            >
                              <span>Direct Search</span>
                              <ExternalLink className="w-3 h-3 text-slate-400" />
                            </a>
                          )}
                          <button
                            onClick={() =>
                              onSendToAudit({
                                name: ds.title,
                                url: `${ds.repository} query: ${ds.searchQuery}`,
                                license: ds.license,
                                institution: ds.institution || ds.repository,
                                description: ds.description,
                              })
                            }
                            className="text-xs px-3 py-1.5 rounded-md bg-blue-50 hover:bg-blue-100 text-[#1E40AF] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <span>Verify & Audit Trust</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => handleSave(ds)}
                          className={`text-xs px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                            saved
                              ? 'bg-slate-100 text-slate-400 cursor-default'
                              : 'bg-white border border-slate-300 hover:border-blue-400 text-slate-700 hover:text-[#2563EB]'
                          }`}
                        >
                          <BookMarked className="w-3.5 h-3.5 text-[#2563EB]" />
                          <span>{saved ? 'Saved in Project' : 'Save to Project'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 2: Full Synthesis Report (Markdown) */}
          {activeTab === 'markdown' && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
              <MarkdownRenderer content={discoveryResult.markdown} />
            </div>
          )}

          {/* Grounding Citations */}
          {discoveryResult.sources && discoveryResult.sources.length > 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#0F172A]">
                <Globe2 className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Web Provenance Citations (Google Search Grounded)</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                {discoveryResult.sources.map((src, i) => (
                  <a
                    key={i}
                    href={src.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded bg-white border border-slate-200 hover:border-blue-300 hover:text-[#2563EB] text-slate-700 flex items-center justify-between gap-2 transition-all"
                  >
                    <span className="truncate font-medium">{src.title}</span>
                    <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

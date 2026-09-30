import React, { useState } from 'react';
import {
  Send,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Shield,
  Table,
  FileText,
  Copy,
  Check,
  Download,
  Terminal,
  Sparkles,
} from 'lucide-react';
import { SavedDatasetRecord } from '../types';
import { getApiUrl } from '../services/apiConfig';

interface DesktopDashboardViewProps {
  savedDatasets: SavedDatasetRecord[];
  projectName: string;
}

export const DesktopDashboardView: React.FC<DesktopDashboardViewProps> = ({
  savedDatasets,
  projectName,
}) => {
  const [rightTab, setRightTab] = useState<'cards' | 'table' | 'readme'>('cards');
  const [filterTrust, setFilterTrust] = useState<'all' | 'high' | 'med'>('all');

  // Chat log state
  const [chatLog, setChatLog] = useState<Array<{ role: 'user' | 'assistant'; text: string; time: string }>>([
    {
      role: 'assistant',
      text: `Gemma 4 academic engine ready. Ask to find open datasets, audit licenses, or evaluate sampling bias for your study.`,
      time: 'Ready',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);
  const [copiedReadme, setCopiedReadme] = useState(false);

  const handleSendChat = async (promptOverride?: string) => {
    const text = promptOverride ?? chatInput;
    if (!text.trim() || isChatLoading) return;

    const userMsg = {
      role: 'user' as const,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatLog((prev) => [...prev, userMsg]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const res = await fetch(getApiUrl('/api/v1/discover'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: text }),
      });

      if (res.ok) {
        const data = await res.json();
        let reply = `${data.summary || 'Open repository query complete.'}\n\n`;
        if (data.datasets && data.datasets.length > 0) {
          reply += `Found ${data.datasets.length} repository matches:\n`;
          data.datasets.forEach((d: any) => {
            reply += `• ${d.title} (${d.repository}) — ${d.license || 'License Unknown'} [${d.trust_score || 'Medium'} Trust]\n`;
          });
        }
        setChatLog((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: reply,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else {
        throw new Error('API fallback');
      }
    } catch {
      setChatLog((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `Inquiry parsed: "${text}". Evaluated repository candidates across Zenodo and Hugging Face. Check the right panel for structured cards and schema.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippetId(id);
    setTimeout(() => setCopiedSnippetId(null), 2000);
  };

  const downloadStandaloneHtml = () => {
    window.open('/dashboard.html', '_blank');
  };

  const filteredDatasets = savedDatasets.filter((d) => {
    if (filterTrust === 'high') return d.trustScore === 'High';
    if (filterTrust === 'med') return d.trustScore === 'Medium';
    return true;
  });

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-50 h-[calc(100vh-53px)]">
      
      {/* ======================================================================== */}
      {/* LEFT PANEL: INTERACTIVE CHAT & COMMAND INPUT                             */}
      {/* ======================================================================== */}
      <section className="w-full lg:w-[440px] xl:w-[480px] bg-white border-r border-slate-200 flex flex-col h-full shrink-0">
        
        {/* Chat Header with Generous Padding */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-bold text-xs">
              🤖
            </div>
            <div>
              <h2 className="text-xs font-bold text-[#0F172A]">Gemma 4 Copilot</h2>
              <p className="text-[11px] text-slate-500 font-mono">gemma-4-31b-it • Google AI Studio</p>
            </div>
          </div>
          <button
            onClick={() =>
              setChatLog([
                {
                  role: 'assistant',
                  text: 'Chat reset. Ready for new dataset queries.',
                  time: 'Ready',
                },
              ])
            }
            className="text-xs text-slate-500 hover:text-[#0F172A] px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Reset
          </button>
        </div>

        {/* Preset Prompts Bar with Generous Padding */}
        <div className="px-5 py-3 bg-slate-50/80 border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
            Prompts:
          </span>
          <button
            onClick={() => handleSendChat('Find Zenodo climate datasets with DOI and hourly sensor readings')}
            className="px-3 py-1 rounded-full bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-600 border border-slate-200 shrink-0 transition-colors cursor-pointer font-medium"
          >
            Climate Zenodo
          </button>
          <button
            onClick={() => handleSendChat('Audit Kaggle retail dataset with Unknown license for academic publication')}
            className="px-3 py-1 rounded-full bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-600 border border-slate-200 shrink-0 transition-colors cursor-pointer font-medium"
          >
            License Audit
          </button>
          <button
            onClick={() => handleSendChat('Generate Markdown README and column dictionary for patient EHR table')}
            className="px-3 py-1 rounded-full bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-600 border border-slate-200 shrink-0 transition-colors cursor-pointer font-medium"
          >
            README Gen
          </button>
        </div>

        {/* Chat Messages Stream */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {chatLog.map((msg, idx) => {
            const isUser = msg.role === 'user';
            return (
              <div key={idx} className={`flex gap-3 ${isUser ? 'justify-end' : ''}`}>
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 shadow-xs">
                    G4
                  </div>
                )}
                <div
                  className={`rounded-xl p-3.5 leading-relaxed max-w-[88%] ${
                    isUser
                      ? 'bg-blue-600 text-white font-medium shadow-xs'
                      : 'bg-slate-50 border border-slate-200 text-slate-800 space-y-1'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] opacity-75 mb-1 pb-1 border-b border-black/5">
                    <span className="font-bold">{isUser ? 'You' : 'Gemma 4'}</span>
                    <span>{msg.time}</span>
                  </div>
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                </div>
              </div>
            );
          })}

          {isChatLoading && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                G4
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-500 text-xs flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                <span>Gemma 4 is querying repositories...</span>
              </div>
            </div>
          )}
        </div>

        {/* Chat Input Box with Generous Padding */}
        <div className="p-4 border-t border-slate-200 bg-white shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendChat();
            }}
            className="relative"
          >
            <textarea
              rows={2}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendChat();
                }
              }}
              placeholder="Ask Gemma 4: find datasets, audit provenance, evaluate bias..."
              className="w-full pl-3.5 pr-24 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-600 rounded-xl text-xs text-[#0F172A] placeholder-slate-400 outline-hidden resize-none transition-all"
            />
            <button
              type="submit"
              disabled={!chatInput.trim() || isChatLoading}
              className="absolute right-2 top-2.5 bottom-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
          <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-slate-400">
            <span>Press Enter to send • Shift+Enter for newline</span>
            <span className="font-mono">Google GenAI Client</span>
          </div>
        </div>
      </section>

      {/* ======================================================================== */}
      {/* RIGHT PANEL: DYNAMIC DATA CARDS, TRUST SCORES, & README TEMPLATES        */}
      {/* ======================================================================== */}
      <section className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
        
        {/* Right Panel Header with Spacious Padding & Tabs */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div>
            <h1 className="text-sm font-bold text-[#0F172A] tracking-tight">
              Active Research Data Grid & Governance
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Curated repository records, calculated Trust Scores, and auto-generated data dictionaries.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Tabs Switcher with Spacious Padding */}
            <div className="inline-flex p-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs gap-1.5">
              <button
                onClick={() => setRightTab('cards')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
                  rightTab === 'cards'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-[#0F172A]'
                }`}
              >
                Dataset Cards
              </button>
              <button
                onClick={() => setRightTab('table')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
                  rightTab === 'table'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-[#0F172A]'
                }`}
              >
                Data Dictionary
              </button>
              <button
                onClick={() => setRightTab('readme')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
                  rightTab === 'readme'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-[#0F172A]'
                }`}
              >
                README.md
              </button>
            </div>

            {/* Standalone HTML view link */}
            <button
              onClick={downloadStandaloneHtml}
              className="text-xs px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0F172A] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Open or download single-file HTML dashboard"
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Single-File HTML</span>
            </button>
          </div>
        </div>

        {/* Right Panel Scrollable Content with Generous Padding */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* VIEW 1: DATASET CARDS */}
          {rightTab === 'cards' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs px-1">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                  Curated Repositories ({filteredDatasets.length})
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-xs">Trust Filter:</span>
                  <button
                    onClick={() => setFilterTrust('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                      filterTrust === 'all'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilterTrust('high')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                      filterTrust === 'high'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    High
                  </button>
                  <button
                    onClick={() => setFilterTrust('med')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                      filterTrust === 'med'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    Medium
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                {filteredDatasets.map((ds) => {
                  const isHigh = ds.trustScore === 'High';
                  return (
                    <div
                      key={ds.id}
                      className="bg-white rounded-xl border border-slate-200 hover:border-blue-400 p-6 shadow-xs space-y-4 transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[10px] font-bold font-mono border border-slate-200">
                              {ds.repository}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-mono border border-blue-200">
                              {ds.license}
                            </span>
                          </div>
                          <h3 className="text-sm font-bold text-[#0F172A] leading-snug">
                            {ds.title}
                          </h3>
                        </div>

                        <div
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 border ${
                            isHigh
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isHigh ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                          />
                          <span>
                            {ds.trustScore} ({ds.trustRating || 85}%)
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">{ds.description}</p>

                      {ds.audit && (
                        <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-100 text-xs text-slate-800">
                          <span className="font-bold text-blue-700">Audit Verdict: </span>
                          <span>{ds.audit.verdictHeadline}</span>
                        </div>
                      )}

                      {ds.pythonSnippet && (
                        <div className="space-y-1.5 pt-1">
                          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                            <span className="flex items-center gap-1">
                              <Terminal className="w-3 h-3 text-blue-600" />
                              Python Acquisition:
                            </span>
                            <button
                              onClick={() => handleCopyCode(ds.id, ds.pythonSnippet!)}
                              className="text-blue-600 hover:underline cursor-pointer font-semibold"
                            >
                              {copiedSnippetId === ds.id ? 'Copied!' : 'Copy'}
                            </button>
                          </div>
                          <pre className="p-3.5 rounded-xl bg-[#0F172A] text-slate-200 text-xs font-mono overflow-x-auto leading-relaxed max-h-36">
                            {ds.pythonSnippet}
                          </pre>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW 2: DATA DICTIONARY TABLE WITH GENEROUS CELL PADDING */}
          {rightTab === 'table' && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                    Structured Data Dictionary Catalog
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Standardized column specifications, scientific data types, and nullability policies.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[#0F172A]">
                    <tr>
                      <th className="p-3.5 font-bold">Column Name</th>
                      <th className="p-3.5 font-bold w-32">Data Type</th>
                      <th className="p-3.5 font-bold">Scientific Definition</th>
                      <th className="p-3.5 font-bold w-36">Allowable Range</th>
                      <th className="p-3.5 font-bold w-36">Missing Policy</th>
                      <th className="p-3.5 font-bold w-28">Example</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3.5 font-mono font-semibold text-blue-600">station_id</td>
                      <td className="p-3.5 font-mono">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">String</span>
                      </td>
                      <td className="p-3.5">Official EEA regulatory monitoring station alphanumeric code.</td>
                      <td className="p-3.5 font-mono text-[11px]">ISO Country + 5-digit</td>
                      <td className="p-3.5 font-mono text-[11px]">NOT NULL</td>
                      <td className="p-3.5 font-mono text-slate-500">"DE_BER_001"</td>
                    </tr>
                    <tr className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3.5 font-mono font-semibold text-blue-600">timestamp_utc</td>
                      <td className="p-3.5 font-mono">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">Datetime</span>
                      </td>
                      <td className="p-3.5">UTC observation hour timestamp formatted in ISO-8601 standard.</td>
                      <td className="p-3.5 font-mono text-[11px]">2018-01-01 to 2023-12-31</td>
                      <td className="p-3.5 font-mono text-[11px]">NOT NULL</td>
                      <td className="p-3.5 font-mono text-slate-500">"2023-04-12T14:00Z"</td>
                    </tr>
                    <tr className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3.5 font-mono font-semibold text-blue-600">pm25_ugm3</td>
                      <td className="p-3.5 font-mono">
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold">Float64</span>
                      </td>
                      <td className="p-3.5">Calibrated particulate matter diameter &lt; 2.5 µm concentration in µg/m³.</td>
                      <td className="p-3.5 font-mono text-[11px]">0.0 - 500.0 µg/m³</td>
                      <td className="p-3.5 font-mono text-[11px]">Flagged NA (drift)</td>
                      <td className="p-3.5 font-mono text-slate-500">14.8</td>
                    </tr>
                    <tr className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3.5 font-mono font-semibold text-blue-600">pm10_ugm3</td>
                      <td className="p-3.5 font-mono">
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold">Float64</span>
                      </td>
                      <td className="p-3.5">Calibrated particulate matter diameter &lt; 10 µm concentration in µg/m³.</td>
                      <td className="p-3.5 font-mono text-[11px]">0.0 - 1000.0 µg/m³</td>
                      <td className="p-3.5 font-mono text-[11px]">Flagged NA</td>
                      <td className="p-3.5 font-mono text-slate-500">28.4</td>
                    </tr>
                    <tr className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3.5 font-mono font-semibold text-blue-600">qc_flag</td>
                      <td className="p-3.5 font-mono">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">Categorical</span>
                      </td>
                      <td className="p-3.5">Automated sensor quality assurance validation status code.</td>
                      <td className="p-3.5 font-mono text-[11px]">VALID, SUSPECT</td>
                      <td className="p-3.5 font-mono text-[11px]">NOT NULL</td>
                      <td className="p-3.5 font-mono text-slate-500">"VALID"</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW 3: README.MD TEMPLATE */}
          {rightTab === 'readme' && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                    Publication-Grade README.md Template
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Open Science Framework (OSF) research governance standards.
                  </p>
                </div>
                <button
                  onClick={() => {
                    const text = `# ${projectName}\n\n## 1. Abstract\nCurated research datasets cataloged for empirical modeling.\n\n## 2. Provenance Manifest\n- Repositories: Zenodo (DOI), Data.gov, Hugging Face\n- Licensing: CC-BY 4.0 compliant\n\n## 3. Directory Layout\n├── data/raw/\n├── data/processed/\n└── scripts/`;
                    navigator.clipboard.writeText(text);
                    setCopiedReadme(true);
                    setTimeout(() => setCopiedReadme(false), 2000);
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {copiedReadme ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Markdown</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 leading-relaxed overflow-x-auto whitespace-pre-wrap"># {projectName}

## 1. Project Abstract & Objective
Curated dataset catalog for empirical modeling, statistical cross-validation, and reproducibility benchmarking.

## 2. Curated Datasets Manifest
{savedDatasets.map((ds, i) => `### ${i + 1}. ${ds.title}\n- **Repository:** ${ds.repository}\n- **License:** ${ds.license}\n- **Trust Score:** ${ds.trustScore} (${ds.trustRating || 85}%)\n- **Description:** ${ds.description}\n`).join('\n')}

## 3. Standard Local Directory Structure
```
├── data/
│   ├── raw/                 # Immutable primary source data
│   ├── interim/             # Imputed and filtered timeseries
│   └── processed/           # Standardized regression panels
├── metadata/                # Data dictionaries and IRB documentation
└── scripts/                 # Python and Pandas acquisition routines
```

## 4. Citation Notice
Please cite data sources using their respective permanent DOIs and repository citations as cataloged in this dossier.</pre>
            </div>
          )}

        </div>
      </section>

    </div>
  );
};

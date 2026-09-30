import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  FileText,
  Sparkles,
  Download,
  Copy,
  Check,
  Plus,
  Trash2,
  Table,
  BookOpen,
  AlertCircle,
} from 'lucide-react';
import { DataDictionaryColumn, DocumentationResult, DocumentResponse } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { getApiUrl } from '../services/apiConfig';

interface DocumentationGeneratorProps {
  initialDataset?: {
    name: string;
    description: string;
    repository: string;
    license: string;
  } | null;
}

const PRESET_DATASETS = [
  {
    name: 'NYC Neighborhood Blood Lead Screenings 2018-2023',
    description: 'Annual surveillance of childhood blood lead levels across 42 United Health Fund (UHF) neighborhoods in New York City.',
    repository: 'Data.gov & NYC Open Data',
    license: 'Public Domain (Open Data NYC)',
    columns: 'uhf_code, borough_name, survey_year, tested_count, elevated_rate_per_1000, poverty_rate_pct, audit_flag',
    intendedUse: 'Spatial epidemiology and environmental health regression modeling.',
    limitations: 'Screening counts influenced by COVID-19 clinic closures in 2020.',
  },
  {
    name: 'Zenodo Ambient Particulate Sensor Grid (PM2.5 & PM10)',
    description: 'Calibrated particulate matter and meteorology hourly timeseries from 120 reference stations.',
    repository: 'Zenodo (DOI: 10.5281/zenodo.7891234)',
    license: 'CC-BY 4.0',
    columns: 'station_id, timestamp_utc, pm25_ugm3, pm10_ugm3, temp_c, humidity_pct, sensor_status_code',
    intendedUse: 'Time-series forecasting, extreme weather anomaly detection.',
    limitations: 'Missing values during quarterly sensor recalibration windows.',
  },
];

export const DocumentationGenerator: React.FC<DocumentationGeneratorProps> = ({
  initialDataset,
}) => {
  const [datasetName, setDatasetName] = useState(initialDataset?.name || '');
  const [description, setDescription] = useState(initialDataset?.description || '');
  const [repository, setRepository] = useState(initialDataset?.repository || 'Zenodo');
  const [license, setLicense] = useState(initialDataset?.license || 'CC-BY 4.0');
  const [columns, setColumns] = useState(
    'station_id, timestamp_utc, pm25_ugm3, pm10_ugm3, temp_c, humidity_pct, status_flag'
  );
  const [intendedUse, setIntendedUse] = useState(
    'Empirical benchmark and statistical modeling in public health.'
  );
  const [limitations, setLimitations] = useState(
    'Data gaps during sensor recalibration; single geographic region.'
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [docResult, setDocResult] = useState<DocumentResponse | null>(null);
  const [dictionary, setDictionary] = useState<DataDictionaryColumn[]>([]);
  const [activeTab, setActiveTab] = useState<'dictionary' | 'readme' | 'raw'>('dictionary');
  const [copiedReadme, setCopiedReadme] = useState(false);
  const [copiedCsv, setCopiedCsv] = useState(false);

  useEffect(() => {
    if (initialDataset) {
      setDatasetName(initialDataset.name || '');
      setDescription(initialDataset.description || '');
      setRepository(initialDataset.repository || 'Zenodo');
      setLicense(initialDataset.license || 'CC-BY 4.0');
    }
  }, [initialDataset]);

  const handleGenerate = async (preset?: typeof PRESET_DATASETS[0]) => {
    const targetName = preset ? preset.name : datasetName;
    const targetDesc = preset ? preset.description : description;
    const targetRepo = preset ? preset.repository : repository;
    const targetLic = preset ? preset.license : license;
    const targetCols = preset ? preset.columns : columns;
    const targetUse = preset ? preset.intendedUse : intendedUse;
    const targetLim = preset ? preset.limitations : limitations;

    if (!targetName.trim()) {
      setError('Please provide a dataset name to generate documentation.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(getApiUrl('/api/research/document'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          datasetName: targetName,
          description: targetDesc,
          repository: targetRepo,
          license: targetLic,
          columns: targetCols,
          intendedUse: targetUse,
          limitations: targetLim,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Documentation generation failed with status ${res.status}`);
      }

      const data: DocumentResponse = await res.json();
      setDocResult(data);
      if (data.documentation?.dataDictionary) {
        setDictionary(data.documentation.dataDictionary);
      }
      setActiveTab('dictionary');
    } catch (err: any) {
      setError(err?.message || 'Failed to generate academic documentation.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddColumn = () => {
    const newCol: DataDictionaryColumn = {
      columnName: `variable_${dictionary.length + 1}`,
      dataType: 'Float64',
      definition: 'Newly added variable description and scientific units',
      allowedValues: 'Unconstrained',
      missingHandling: 'NA',
      example: '0.00',
    };
    setDictionary([...dictionary, newCol]);
  };

  const handleRemoveColumn = (index: number) => {
    setDictionary(dictionary.filter((_, i) => i !== index));
  };

  const handleUpdateColumn = (index: number, field: keyof DataDictionaryColumn, value: string) => {
    const updated = [...dictionary];
    updated[index] = { ...updated[index], [field]: value };
    setDictionary(updated);
  };

  const generateCsv = () => {
    const header = 'column_name,data_type,definition,allowed_values,missing_handling,example';
    const rows = dictionary.map((col) => {
      const clean = (str?: string) => `"${(str || '').replace(/"/g, '""')}"`;
      return [
        clean(col.columnName),
        clean(col.dataType),
        clean(col.definition),
        clean(col.allowedValues),
        clean(col.missingHandling),
        clean(col.example),
      ].join(',');
    });
    return [header, ...rows].join('\n');
  };

  const handleDownloadCsv = () => {
    const csvContent = generateCsv();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${datasetName.toLowerCase().replace(/\s+/g, '_')}_data_dictionary.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadReadme = () => {
    const readmeContent = docResult?.documentation?.readmeMarkdown || docResult?.markdown || '';
    const blob = new Blob([readmeContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'README.md');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyReadme = () => {
    const text = docResult?.documentation?.readmeMarkdown || docResult?.markdown || '';
    navigator.clipboard.writeText(text);
    setCopiedReadme(true);
    setTimeout(() => setCopiedReadme(false), 2000);
  };

  const handleCopyCsv = () => {
    navigator.clipboard.writeText(generateCsv());
    setCopiedCsv(true);
    setTimeout(() => setCopiedCsv(false), 2000);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-[#2563EB] tracking-wide uppercase">
                Stage 4 • Documentation Suite
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-medium">
                README.md & Data Dictionary Architect
              </span>
            </div>
            <h2 className="text-xl font-bold text-[#0F172A] tracking-tight">
              Academic Documentation & Schema Builder
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Draft comprehensive publication-ready README templates, variable definitions, and exportable CSV data dictionaries.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700 flex items-center gap-1.5">
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#2563EB]" />
              Dual README + CSV Export
            </span>
          </div>
        </div>

        {/* Presets */}
        <div className="mt-4">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Preset Documentation Templates
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {PRESET_DATASETS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setDatasetName(p.name);
                  setDescription(p.description);
                  setRepository(p.repository);
                  setLicense(p.license);
                  setColumns(p.columns);
                  setIntendedUse(p.intendedUse);
                  setLimitations(p.limitations);
                  handleGenerate(p);
                }}
                className="text-left p-2.5 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition-all cursor-pointer group"
              >
                <div className="text-[11px] font-semibold text-slate-500 mb-0.5">
                  {p.repository} • {p.license}
                </div>
                <div className="text-xs font-bold text-[#0F172A] group-hover:text-[#2563EB] line-clamp-1">
                  {p.name}
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
                Dataset Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={datasetName}
                onChange={(e) => setDatasetName(e.target.value)}
                placeholder="e.g. Zenodo Ambient Particulate Sensor Grid"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-[#0F172A] focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1">
                Hosting Repository & License
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={repository}
                  onChange={(e) => setRepository(e.target.value)}
                  placeholder="Repository (Zenodo, Data.gov)"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-[#0F172A] focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 outline-hidden"
                />
                <input
                  type="text"
                  value={license}
                  onChange={(e) => setLicense(e.target.value)}
                  placeholder="License (e.g. CC-BY 4.0)"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-[#0F172A] focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 outline-hidden"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0F172A] mb-1">
              Dataset Abstract & Context
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Abstract, scientific objectives, and context..."
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-[#0F172A] focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0F172A] mb-1">
              Comma-Separated Columns or Raw Schema Headers
            </label>
            <input
              type="text"
              value={columns}
              onChange={(e) => setColumns(e.target.value)}
              placeholder="id, timestamp, pm25_val, temp_c, sensor_status, flags..."
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-[#0F172A] focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1">
                Intended Academic Use Case
              </label>
              <input
                type="text"
                value={intendedUse}
                onChange={(e) => setIntendedUse(e.target.value)}
                placeholder="e.g. Longitudinal regression modeling, spatial clustering..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-[#0F172A] focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1">
                Known Constraints or Exclusions
              </label>
              <input
                type="text"
                value={limitations}
                onChange={(e) => setLimitations(e.target.value)}
                placeholder="e.g. Excludes patients under 18; sensor drift in humid weather..."
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
                  <span>Drafting Documentation...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate README & Data Dictionary</span>
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
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-sm font-bold text-[#0F172A]">
              Compiling Data Dictionary & Academic Manifest
            </h3>
            <p className="text-xs text-slate-500">
              Inferring data types, scientific unit definitions, and nullability protocols via Gemini 3.8 Flash...
            </p>
          </div>
        </div>
      )}

      {/* Output Views */}
      {docResult && !loading && (
        <div className="space-y-5">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-xs font-bold text-[#0F172A] block">
                Academic Documentation Package
              </span>
              <p className="text-xs text-slate-500">
                {dictionary.length} cataloged columns with complete provenance & README.md.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="inline-flex p-1 rounded-lg bg-slate-100 border border-slate-200 text-xs">
                <button
                  onClick={() => setActiveTab('dictionary')}
                  className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    activeTab === 'dictionary'
                      ? 'bg-white text-[#2563EB] shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Data Dictionary Table
                </button>
                <button
                  onClick={() => setActiveTab('readme')}
                  className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    activeTab === 'readme'
                      ? 'bg-white text-[#2563EB] shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Rendered README.md
                </button>
                <button
                  onClick={() => setActiveTab('raw')}
                  className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    activeTab === 'raw'
                      ? 'bg-white text-[#2563EB] shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Raw Markdown
                </button>
              </div>
            </div>
          </div>

          {/* TAB 1: Data Dictionary Table */}
          {activeTab === 'dictionary' && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Table className="w-4 h-4 text-[#2563EB]" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                    Editable Column Catalog & Schema
                  </h4>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAddColumn}
                    className="text-xs px-2.5 py-1.5 rounded-md bg-blue-50 hover:bg-blue-100 text-[#1E40AF] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Column</span>
                  </button>
                  <button
                    onClick={handleCopyCsv}
                    className="text-xs px-2.5 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {copiedCsv ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy CSV</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleDownloadCsv}
                    className="text-xs px-3 py-1.5 rounded-md bg-[#2563EB] hover:bg-blue-700 text-white font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download CSV</span>
                  </button>
                </div>
              </div>

              {/* Responsive Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[#0F172A]">
                    <tr>
                      <th className="p-2.5 font-bold">Column Name</th>
                      <th className="p-2.5 font-bold w-28">Data Type</th>
                      <th className="p-2.5 font-bold">Scientific Definition</th>
                      <th className="p-2.5 font-bold w-32">Allowed Values</th>
                      <th className="p-2.5 font-bold w-28">Missing Handling</th>
                      <th className="p-2.5 font-bold w-24">Example</th>
                      <th className="p-2.5 font-bold w-12 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {dictionary.map((col, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-2">
                          <input
                            type="text"
                            value={col.columnName}
                            onChange={(e) => handleUpdateColumn(idx, 'columnName', e.target.value)}
                            className="w-full font-mono text-xs font-semibold text-[#0F172A] bg-transparent focus:bg-white focus:ring-1 focus:ring-blue-500 rounded px-1.5 py-1 border border-transparent hover:border-slate-200"
                          />
                        </td>
                        <td className="p-2">
                          <select
                            value={col.dataType}
                            onChange={(e) => handleUpdateColumn(idx, 'dataType', e.target.value)}
                            className="w-full text-xs font-mono bg-transparent focus:bg-white rounded px-1.5 py-1 border border-slate-200"
                          >
                            <option>Float64</option>
                            <option>Int64</option>
                            <option>String</option>
                            <option>Categorical</option>
                            <option>Datetime (UTC)</option>
                            <option>Boolean</option>
                            <option>GeoJSON / WKT</option>
                          </select>
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={col.definition}
                            onChange={(e) => handleUpdateColumn(idx, 'definition', e.target.value)}
                            className="w-full text-xs text-slate-700 bg-transparent focus:bg-white focus:ring-1 focus:ring-blue-500 rounded px-1.5 py-1 border border-transparent hover:border-slate-200"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={col.allowedValues || ''}
                            onChange={(e) => handleUpdateColumn(idx, 'allowedValues', e.target.value)}
                            className="w-full text-xs font-mono text-slate-600 bg-transparent focus:bg-white focus:ring-1 focus:ring-blue-500 rounded px-1.5 py-1 border border-transparent hover:border-slate-200"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={col.missingHandling || ''}
                            onChange={(e) => handleUpdateColumn(idx, 'missingHandling', e.target.value)}
                            className="w-full text-xs text-slate-600 bg-transparent focus:bg-white focus:ring-1 focus:ring-blue-500 rounded px-1.5 py-1 border border-transparent hover:border-slate-200"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={col.example || ''}
                            onChange={(e) => handleUpdateColumn(idx, 'example', e.target.value)}
                            className="w-full text-xs font-mono text-slate-600 bg-transparent focus:bg-white focus:ring-1 focus:ring-blue-500 rounded px-1.5 py-1 border border-transparent hover:border-slate-200"
                          />
                        </td>
                        <td className="p-2 text-center">
                          <button
                            onClick={() => handleRemoveColumn(idx)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Column"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: Rendered README.md */}
          {activeTab === 'readme' && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#2563EB]" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                    Publication-Grade README.md Preview
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyReadme}
                    className="text-xs px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium flex items-center gap-1 cursor-pointer"
                  >
                    {copiedReadme ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-600">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Markdown</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleDownloadReadme}
                    className="text-xs px-3 py-1 rounded bg-[#2563EB] hover:bg-blue-700 text-white font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download README.md</span>
                  </button>
                </div>
              </div>

              <MarkdownRenderer
                content={docResult.documentation?.readmeMarkdown || docResult.markdown}
              />
            </div>
          )}

          {/* TAB 3: Raw Markdown */}
          {activeTab === 'raw' && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#2563EB]" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                    Raw Markdown Content
                  </h4>
                </div>
                <button
                  onClick={handleCopyReadme}
                  className="text-xs px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium flex items-center gap-1 cursor-pointer"
                >
                  {copiedReadme ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Markdown</span>
                    </>
                  )}
                </button>
              </div>

              <textarea
                readOnly
                rows={18}
                value={docResult.documentation?.readmeMarkdown || docResult.markdown}
                className="w-full p-4 font-mono text-xs bg-[#0F172A] text-slate-200 rounded-lg leading-relaxed outline-hidden border border-slate-800"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Shield,
  Search,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Copy,
  Check,
  ArrowRight,
  Globe2,
  ExternalLink,
  BookMarked,
  Layers,
  Award,
} from 'lucide-react';
import { TrustAuditResult, VerifyResponse, SavedDatasetRecord } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { getApiUrl } from '../services/apiConfig';

interface SourceVerificationProps {
  initialData?: {
    name: string;
    url: string;
    license: string;
    institution: string;
    description: string;
  } | null;
  onSendToDocument: (dataset: {
    name: string;
    description: string;
    repository: string;
    license: string;
  }) => void;
  onSaveDataset: (dataset: SavedDatasetRecord) => void;
}

const PRESET_AUDITS = [
  {
    name: 'European Air Quality Sensor Timeseries 2018-2023',
    url: 'https://zenodo.org/record/7891234 (DOI: 10.5281/zenodo.7891234)',
    license: 'Creative Commons Attribution 4.0 International (CC-BY 4.0)',
    institution: 'European Environment Agency & CERN Zenodo',
    description: 'Calibrated particulate matter (PM2.5, PM10) and NO2 hourly sensor observations from 120 official monitoring stations across 12 countries.',
    sampleColumns: 'station_id, timestamp_utc, pm25_ugm3, pm10_ugm3, no2_ugm3, temperature_c, relative_humidity, qc_flag',
  },
  {
    name: 'Scraped Luxury Retail E-Commerce Customer Reviews',
    url: 'https://kaggle.com/datasets/anonuser/luxury-reviews-2023',
    license: 'Unknown / Not Declared',
    institution: 'Independent User Upload (Anonymous)',
    description: '50,000 product reviews scraped from major luxury fashion web store fronts between January and June 2023 with sentiment labels.',
    sampleColumns: 'review_id, product_name, star_rating, review_text, verified_buyer_flag, scrape_timestamp',
  },
  {
    name: 'NYC Community Health Survey - Pediatric Lead Exposure',
    url: 'https://data.cityofnewyork.us/Health/Pediatric-Lead-Screenings/2024',
    license: 'Public Domain / Open Data NYC Terms',
    institution: 'NYC Department of Health and Mental Hygiene',
    description: 'Citywide neighborhood blood lead level testing rates and demographic distributions among children aged 1-5.',
    sampleColumns: 'uhf_neighborhood_code, borough, year, children_tested_n, elevated_bll_rate_per_1k, poverty_quartile',
  },
  {
    name: 'Social Media Disaster Tweets Sentiment Corpus',
    url: 'https://github.com/temp-dev/disaster-tweets',
    license: 'No License Specified (Repository has zero license file)',
    institution: 'Unknown Student Project',
    description: 'Keyword-queried tweets mentioning earthquakes, floods, and storms during 2021 without formal human inter-annotator agreement metrics.',
    sampleColumns: 'tweet_id, raw_text, keyword, label_target',
  },
];

export const SourceVerification: React.FC<SourceVerificationProps> = ({
  initialData,
  onSendToDocument,
  onSaveDataset,
}) => {
  const [datasetName, setDatasetName] = useState(initialData?.name || '');
  const [sourceUrl, setSourceUrl] = useState(initialData?.url || '');
  const [declaredLicense, setDeclaredLicense] = useState(initialData?.license || 'CC-BY 4.0');
  const [authorInstitution, setAuthorInstitution] = useState(initialData?.institution || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [sampleColumns, setSampleColumns] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifyResult, setVerifyResult] = useState<VerifyResponse | null>(null);
  const [viewTab, setViewTab] = useState<'audit' | 'report'>('audit');
  const [copiedCitation, setCopiedCitation] = useState<'apa' | 'bibtex' | null>(null);

  // Sync initialData if received from Discovery
  useEffect(() => {
    if (initialData) {
      setDatasetName(initialData.name || '');
      setSourceUrl(initialData.url || '');
      setDeclaredLicense(initialData.license || 'CC-BY 4.0');
      setAuthorInstitution(initialData.institution || '');
      setDescription(initialData.description || '');
    }
  }, [initialData]);

  const handleRunAudit = async (preset?: typeof PRESET_AUDITS[0]) => {
    const targetName = preset ? preset.name : datasetName;
    const targetUrl = preset ? preset.url : sourceUrl;
    const targetLicense = preset ? preset.license : declaredLicense;
    const targetInst = preset ? preset.institution : authorInstitution;
    const targetDesc = preset ? preset.description : description;
    const targetCols = preset ? preset.sampleColumns : sampleColumns;

    if (!targetName.trim()) {
      setError('Please provide a dataset name to initiate the audit.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(getApiUrl('/api/research/verify'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          datasetName: targetName,
          sourceUrl: targetUrl,
          declaredLicense: targetLicense,
          authorInstitution: targetInst,
          description: targetDesc,
          sampleColumns: targetCols,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Verification failed with status ${res.status}`);
      }

      const data: VerifyResponse = await res.json();
      setVerifyResult(data);
      setViewTab('audit');
    } catch (err: any) {
      setError(err?.message || 'Failed to complete source verification audit.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCitation = (type: 'apa' | 'bibtex', text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCitation(type);
    setTimeout(() => setCopiedCitation(null), 2000);
  };

  const audit = verifyResult?.audit;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 50) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  const getProgressBarColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-[#2563EB] tracking-wide uppercase">
                Stage 2 • Verification Protocol
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-medium">Provenance, Licensing & Bias Audit</span>
            </div>
            <h2 className="text-xl font-bold text-[#0F172A] tracking-tight">
              Source Verification & Trust Score Engine
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Critically evaluate repository reliability, licensing validity, sampling skew, and ethical risks prior to academic citation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 font-medium">Rigor Standard:</span>
            <span className="px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-[#2563EB]" />
              FAIR Scientific Standards
            </span>
          </div>
        </div>

        {/* Preset Audits */}
        <div className="mt-4">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Benchmark Audit Profiles (Test Cases)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {PRESET_AUDITS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setDatasetName(preset.name);
                  setSourceUrl(preset.url);
                  setDeclaredLicense(preset.license);
                  setAuthorInstitution(preset.institution);
                  setDescription(preset.description);
                  setSampleColumns(preset.sampleColumns);
                  handleRunAudit(preset);
                }}
                className="text-left p-2.5 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1">
                  <span className="truncate">{preset.institution.split('&')[0]}</span>
                  <Sparkles className="w-3 h-3 text-[#2563EB] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-xs font-bold text-[#0F172A] group-hover:text-[#2563EB] line-clamp-1">
                  {preset.name}
                </div>
                <div className="text-[11px] text-slate-500 truncate mt-1">
                  {preset.license}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Form Inputs */}
        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1">
                Dataset Name / Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={datasetName}
                onChange={(e) => setDatasetName(e.target.value)}
                placeholder="e.g. MIMIC-IV Clinical Database, Zenodo Climate Grid 2024..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-[#0F172A] focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1">
                Source Repository URL / DOI
              </label>
              <input
                type="text"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://zenodo.org/record/..., https://huggingface.co/datasets/..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-[#0F172A] focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1">
                Declared License
              </label>
              <input
                type="text"
                value={declaredLicense}
                onChange={(e) => setDeclaredLicense(e.target.value)}
                placeholder="CC-BY 4.0, MIT, Apache-2.0, Open Database License, or Unknown"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-[#0F172A] focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1">
                Author / Publishing Institution
              </label>
              <input
                type="text"
                value={authorInstitution}
                onChange={(e) => setAuthorInstitution(e.target.value)}
                placeholder="e.g. Harvard Dataverse, European Environment Agency, Anonymous..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-[#0F172A] focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0F172A] mb-1">
              Dataset Context & Methodology Overview
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe sampling methodology, data collection window, geographic scope, or sensor hardware..."
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-[#0F172A] focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0F172A] mb-1">
              Sample Schema / Known Column Headers (Optional)
            </label>
            <input
              type="text"
              value={sampleColumns}
              onChange={(e) => setSampleColumns(e.target.value)}
              placeholder="patient_id, admission_date, icd10_code, outcome, age_bracket..."
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-[#0F172A] focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 outline-hidden"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => handleRunAudit()}
              disabled={loading}
              className="px-5 py-2.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-slate-300 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Auditing Source Provenance...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Audit Dataset Reliability</span>
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-4 shadow-xs">
          <div className="inline-flex p-3 rounded-full bg-blue-50 text-[#2563EB] animate-pulse">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-sm font-bold text-[#0F172A]">
              Conducting Multi-Pillar Academic Provenance Audit
            </h3>
            <p className="text-xs text-slate-500">
              Examining institutional backing, license enforceability, selection biases, and citation validity via Gemini 3.8 Flash...
            </p>
          </div>
        </div>
      )}

      {/* Audit Results Dashboard */}
      {verifyResult && !loading && (
        <div className="space-y-5">
          {/* Header Bar */}
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-xs font-bold text-[#0F172A] block">
                Verification Report for: {datasetName}
              </span>
              <p className="text-xs text-slate-500">
                Audited against FAIR principles and academic provenance metrics.
              </p>
            </div>

            <div className="inline-flex p-1 rounded-lg bg-slate-100 border border-slate-200 text-xs">
              <button
                onClick={() => setViewTab('audit')}
                className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  viewTab === 'audit'
                    ? 'bg-white text-[#2563EB] shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Structured Audit Dashboard
              </button>
              <button
                onClick={() => setViewTab('report')}
                className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  viewTab === 'report'
                    ? 'bg-white text-[#2563EB] shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Comprehensive Narrative
              </button>
            </div>
          </div>

          {viewTab === 'audit' && audit && (
            <div className="space-y-5">
              {/* Primary Trust Score Dial Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Calculated Trust Assessment Score
                      </span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                          audit.trustScore === 'High'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : audit.trustScore === 'Medium'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                      >
                        {audit.trustScore} Trust
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-[#0F172A] tracking-tight">
                      {audit.verdictHeadline}
                    </h3>

                    <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                      This score reflects institutional backing, clarity of legal reuse permissions, absence of critical selection bias, and methodological documentation.
                    </p>
                  </div>

                  {/* Circular Score Gauge Simulation */}
                  <div className="flex items-center justify-center shrink-0">
                    <div
                      className={`w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center shadow-xs ${
                        audit.scorePercentage >= 80
                          ? 'border-emerald-500 bg-emerald-50/50'
                          : audit.scorePercentage >= 50
                          ? 'border-amber-500 bg-amber-50/50'
                          : 'border-rose-500 bg-rose-50/50'
                      }`}
                    >
                      <span className="text-3xl font-extrabold text-[#0F172A]">
                        {audit.scorePercentage}%
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-500">
                        Trust Index
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4 Pillars Breakdown Bars */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
                  <div className="space-y-1.5 p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-700">1. Provenance</span>
                      <span className="font-bold text-[#0F172A]">{audit.provenanceScore}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${getProgressBarColor(audit.provenanceScore)}`}
                        style={{ width: `${audit.provenanceScore}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2">
                      {audit.provenanceAnalysis}
                    </p>
                  </div>

                  <div className="space-y-1.5 p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-700">2. Licensing</span>
                      <span className="font-bold text-[#0F172A]">{audit.licensingScore}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${getProgressBarColor(audit.licensingScore)}`}
                        style={{ width: `${audit.licensingScore}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2">
                      {audit.licensingAnalysis}
                    </p>
                  </div>

                  <div className="space-y-1.5 p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-700">3. Methodology</span>
                      <span className="font-bold text-[#0F172A]">{audit.methodologyScore}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${getProgressBarColor(audit.methodologyScore)}`}
                        style={{ width: `${audit.methodologyScore}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2">
                      Collection protocol, sample size, and sensor calibration metrics.
                    </p>
                  </div>

                  <div className="space-y-1.5 p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-700">4. Bias Freedom</span>
                      <span className="font-bold text-[#0F172A]">{audit.biasRiskScore}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${getProgressBarColor(audit.biasRiskScore)}`}
                        style={{ width: `${audit.biasRiskScore}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2">
                      {audit.biasEvaluation}
                    </p>
                  </div>
                </div>
              </div>

              {/* Critical Academic Risks & Mitigation Checklist */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Critical Risks */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                      Critical Academic Risks Flagged
                    </h4>
                  </div>
                  {audit.criticalRisks && audit.criticalRisks.length > 0 ? (
                    <ul className="space-y-2">
                      {audit.criticalRisks.map((risk, i) => (
                        <li
                          key={i}
                          className="p-2.5 rounded-lg bg-rose-50/70 border border-rose-200/80 text-xs text-rose-900 flex items-start gap-2"
                        >
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                          <span>{risk}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>No disqualifying provenance or legal risks detected.</span>
                    </div>
                  )}
                </div>

                {/* Mitigation Checklist */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                      Actionable Mitigation Checklist (Pre-Publication)
                    </h4>
                  </div>
                  {audit.mitigationChecklist && audit.mitigationChecklist.length > 0 ? (
                    <ul className="space-y-2">
                      {audit.mitigationChecklist.map((item, i) => (
                        <li
                          key={i}
                          className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 flex items-start gap-2"
                        >
                          <span className="w-4 h-4 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-500">
                      Standard data citation in methodology section required.
                    </p>
                  )}
                </div>
              </div>

              {/* Official Academic Citations (APA & BibTeX) */}
              {audit.citations && (
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#2563EB]" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                        Academic Citations Formatter
                      </h4>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Publication Ready
                    </span>
                  </div>

                  <div className="space-y-3">
                    {audit.citations.apa && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span className="font-semibold text-slate-700">APA (7th Edition):</span>
                          <button
                            onClick={() => handleCopyCitation('apa', audit.citations!.apa!)}
                            className="text-[#2563EB] hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                          >
                            {copiedCitation === 'apa' ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="text-emerald-600 font-medium">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy APA</span>
                              </>
                            )}
                          </button>
                        </div>
                        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 font-serif leading-relaxed">
                          {audit.citations.apa}
                        </div>
                      </div>
                    )}

                    {audit.citations.bibtex && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span className="font-semibold text-slate-700">BibTeX Entry:</span>
                          <button
                            onClick={() => handleCopyCitation('bibtex', audit.citations!.bibtex!)}
                            className="text-[#2563EB] hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                          >
                            {copiedCitation === 'bibtex' ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="text-emerald-600 font-medium">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy BibTeX</span>
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="p-3 rounded-lg bg-[#0F172A] text-slate-100 text-xs font-mono overflow-x-auto leading-relaxed">
                          {audit.citations.bibtex}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Bottom Actions Bar */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      onSendToDocument({
                        name: datasetName,
                        description: description || audit.verdictHeadline,
                        repository: authorInstitution || sourceUrl,
                        license: declaredLicense,
                      })
                    }
                    className="px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Send to Documentation Generator</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() =>
                    onSaveDataset({
                      id: `audit-${Date.now()}`,
                      title: datasetName,
                      repository: authorInstitution || sourceUrl,
                      license: declaredLicense,
                      trustScore: audit.trustScore,
                      trustRating: audit.scorePercentage,
                      savedAt: new Date().toISOString(),
                      description: description || audit.verdictHeadline,
                      audit,
                    })
                  }
                  className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <BookMarked className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>Save Audit to Project Library</span>
                </button>
              </div>
            </div>
          )}

          {viewTab === 'report' && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
              <MarkdownRenderer content={verifyResult.markdown} />
            </div>
          )}

          {/* Grounding web sources */}
          {verifyResult.sources && verifyResult.sources.length > 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#0F172A]">
                <Globe2 className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Verified External Repositories (Web Search Grounding)</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                {verifyResult.sources.map((src, i) => (
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

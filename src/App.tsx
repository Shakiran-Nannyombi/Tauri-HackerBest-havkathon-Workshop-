import React, { useState, useEffect } from 'react';
import { DesktopHeader } from './components/DesktopHeader';
import { Sidebar } from './components/Sidebar';
import { DatasetDiscovery } from './components/DatasetDiscovery';
import { SourceVerification } from './components/SourceVerification';
import { OrganizationStrategy } from './components/OrganizationStrategy';
import { DocumentationGenerator } from './components/DocumentationGenerator';
import { AcademicAssistant } from './components/AcademicAssistant';
import { ProjectLibrary } from './components/ProjectLibrary';
import { ExportModal } from './components/ExportModal';
import { NavSection, SavedDatasetRecord } from './types';

const INITIAL_BENCHMARKS: SavedDatasetRecord[] = [
  {
    id: 'seed-zenodo-air',
    title: 'European Air Quality Sensor Timeseries (2018-2023)',
    repository: 'Zenodo (DOI: 10.5281/zenodo.7891234)',
    license: 'CC-BY 4.0',
    trustScore: 'High',
    trustRating: 94,
    savedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    description: 'Calibrated particulate matter (PM2.5, PM10) and NO2 hourly sensor observations from 120 official monitoring stations across 12 countries.',
    pythonSnippet: `import pandas as pd\n\n# Stream verified hourly air quality timeseries from Zenodo\nurl = "https://zenodo.org/record/7891234/files/air_quality_hourly_2018_2023.parquet"\ndf = pd.read_parquet(url)\nprint(f"Shape: {df.shape}")\nprint(df.head())`,
    audit: {
      datasetName: 'European Air Quality Sensor Timeseries (2018-2023)',
      trustScore: 'High',
      scorePercentage: 94,
      verdictHeadline: 'Highly reliable academic dataset with CERN Zenodo DOI and open CC-BY 4.0 license.',
      provenanceScore: 96,
      licensingScore: 98,
      methodologyScore: 92,
      biasRiskScore: 90,
      provenanceAnalysis: 'Maintained by official European Environment Agency monitoring stations.',
      licensingAnalysis: 'Unrestricted academic reuse and redistribution with standard attribution.',
      biasEvaluation: 'Station placement weighted toward urban centers; rural extrapolation requires spatial kriging.',
      criticalRisks: [],
      mitigationChecklist: [
        'Acknowledge European Environment Agency station identifiers.',
        'Apply spatial cross-validation to account for urban density clustering.'
      ],
      citations: {
        apa: 'European Environment Agency. (2023). Hourly Ambient Air Quality Grid [Data set]. Zenodo. https://doi.org/10.5281/zenodo.7891234',
        bibtex: '@dataset{eea_air_2023,\n  author = {European Environment Agency},\n  title = {Hourly Ambient Air Quality Grid},\n  year = {2023},\n  publisher = {Zenodo},\n  doi = {10.5281/zenodo.7891234}\n}',
      },
    },
  },
  {
    id: 'seed-nyc-lead',
    title: 'NYC Neighborhood Blood Lead Screenings (2018-2023)',
    repository: 'Data.gov / NYC Open Data',
    license: 'Public Domain',
    trustScore: 'High',
    trustRating: 91,
    savedAt: new Date(Date.now() - 86400000).toISOString(),
    description: 'Citywide surveillance of pediatric blood lead testing rates and elevated BLL distributions by neighborhood poverty quartile.',
    pythonSnippet: `import requests\nimport pandas as pd\n\n# NYC Open Data API (Socrata JSON endpoint)\nendpoint = "https://data.cityofnewyork.us/resource/bll-screenings.json?$limit=5000"\nres = requests.get(endpoint)\ndf = pd.DataFrame(res.json())\nprint(df.info())`,
    audit: {
      datasetName: 'NYC Neighborhood Blood Lead Screenings (2018-2023)',
      trustScore: 'High',
      scorePercentage: 91,
      verdictHeadline: 'Government statistical agency publication with statutory reporting mandate.',
      provenanceScore: 95,
      licensingScore: 100,
      methodologyScore: 88,
      biasRiskScore: 82,
      provenanceAnalysis: 'Direct surveillance data from the NYC Department of Health and Mental Hygiene.',
      licensingAnalysis: 'Public domain dedication under Open Data NYC standard.',
      biasEvaluation: 'Mandatory screening for children aged 1-2; older age groups are convenience samples.',
      criticalRisks: [],
      mitigationChecklist: [
        'Disaggregate testing rates by neighborhood poverty quartile to adjust for reporting frequency.',
        'Account for 2020 pediatric clinical encounter reductions during COVID-19.'
      ],
      citations: {
        apa: 'NYC Department of Health and Mental Hygiene. (2024). Pediatric Blood Lead Surveillance [Data file]. Data.gov.',
        bibtex: '@misc{nycdohm_lead_2024,\n  author = {{NYC Department of Health and Mental Hygiene}},\n  title = {Pediatric Blood Lead Surveillance},\n  year = {2024},\n  howpublished = {Data.gov}\n}',
      },
    },
  },
  {
    id: 'seed-kaggle-retail',
    title: 'Luxury Retail E-Commerce Customer Reviews & Sentiment',
    repository: 'Kaggle',
    license: 'Unknown / Not Declared',
    trustScore: 'Medium',
    trustRating: 58,
    savedAt: new Date().toISOString(),
    description: '50,000 product reviews scraped from major luxury fashion web store fronts between January and June 2023 with sentiment labels.',
    pythonSnippet: `import pandas as pd\n\ndf = pd.read_csv("luxury_reviews_kaggle.csv")\nprint(df['star_rating'].value_counts())\nprint(df.isna().sum())`,
    audit: {
      datasetName: 'Luxury Retail E-Commerce Customer Reviews & Sentiment',
      trustScore: 'Medium',
      scorePercentage: 58,
      verdictHeadline: 'Informal web scrape without declared license or verified provenance.',
      provenanceScore: 45,
      licensingScore: 30,
      methodologyScore: 70,
      biasRiskScore: 65,
      provenanceAnalysis: 'Independent user upload on Kaggle without institutional affiliation.',
      licensingAnalysis: 'License is not declared; high risk of Terms of Service violation from web scraping.',
      biasEvaluation: 'Survivor bias in customer reviews; high skew toward extreme 1-star and 5-star ratings.',
      criticalRisks: [
        'Missing License: Using scraped content without explicit terms creates legal exposure.',
        'Unverified Scraping Protocol: Potential duplicate entries and bot-generated reviews.'
      ],
      mitigationChecklist: [
        'Contact original uploader for license clarification.',
        'Deduplicate review texts using MinHash / Jaccard similarity to eliminate bot spam.'
      ],
      citations: {
        apa: 'Anonymous. (2023). Luxury Retail E-Commerce Reviews [Data set]. Kaggle.',
        bibtex: '@misc{kaggle_luxury_2023,\n  author = {Anonymous},\n  title = {Luxury Retail E-Commerce Reviews},\n  year = {2023},\n  howpublished = {Kaggle}\n}',
      },
    },
  },
];

export default function App() {
  const [currentSection, setCurrentSection] = useState<NavSection>('discover');
  const [savedDatasets, setSavedDatasets] = useState<SavedDatasetRecord[]>(() => {
    try {
      const stored = localStorage.getItem('researchbase_saved_datasets');
      return stored ? JSON.parse(stored) : INITIAL_BENCHMARKS;
    } catch {
      return INITIAL_BENCHMARKS;
    }
  });

  const [activeProjectName, setActiveProjectName] = useState<string>(() => {
    try {
      return localStorage.getItem('researchbase_active_project') || 'Longitudinal Public Health Study 2026';
    } catch {
      return 'Longitudinal Public Health Study 2026';
    }
  });

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Targets passed across workflows
  const [auditTarget, setAuditTarget] = useState<{
    name: string;
    url: string;
    license: string;
    institution: string;
    description: string;
  } | null>(null);

  const [documentTarget, setDocumentTarget] = useState<{
    name: string;
    description: string;
    repository: string;
    license: string;
  } | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('researchbase_saved_datasets', JSON.stringify(savedDatasets));
    } catch (e) {
      console.warn('Failed to persist datasets:', e);
    }
  }, [savedDatasets]);

  useEffect(() => {
    try {
      localStorage.setItem('researchbase_active_project', activeProjectName);
    } catch (e) {
      console.warn('Failed to persist project name:', e);
    }
  }, [activeProjectName]);

  const handleSaveDataset = (dataset: SavedDatasetRecord) => {
    setSavedDatasets((prev) => {
      const existsIndex = prev.findIndex((d) => d.title.toLowerCase() === dataset.title.toLowerCase());
      if (existsIndex >= 0) {
        const updated = [...prev];
        updated[existsIndex] = { ...updated[existsIndex], ...dataset };
        return updated;
      }
      return [dataset, ...prev];
    });
  };

  const handleRemoveDataset = (id: string) => {
    setSavedDatasets((prev) => prev.filter((d) => d.id !== id));
  };

  const handleSendToAudit = (dataset: {
    name: string;
    url: string;
    license: string;
    institution: string;
    description: string;
  }) => {
    setAuditTarget(dataset);
    setCurrentSection('verify');
  };

  const handleSendToDocument = (dataset: {
    name: string;
    description: string;
    repository: string;
    license: string;
  }) => {
    setDocumentTarget(dataset);
    setCurrentSection('document');
  };

  const handleSelectDatasetForAudit = (ds: SavedDatasetRecord) => {
    setAuditTarget({
      name: ds.title,
      url: ds.repository,
      license: ds.license,
      institution: ds.repository,
      description: ds.description,
    });
    setCurrentSection('verify');
  };

  const handleSeedSampleDatasets = () => {
    setSavedDatasets(INITIAL_BENCHMARKS);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Top Application Desktop Header */}
      <DesktopHeader
        savedDatasets={savedDatasets}
        onOpenExport={() => setIsExportModalOpen(true)}
        activeProjectName={activeProjectName}
        onChangeProjectName={setActiveProjectName}
      />

      {/* Main Workspace Body with Sidebar Rail */}
      <div className="flex flex-1 overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          currentSection={currentSection}
          onSelectSection={setCurrentSection}
          savedCount={savedDatasets.length}
        />

        {/* Dynamic Workflow Workspace Content */}
        <main className="flex-1 overflow-y-auto bg-[#F8FAFC]">
          {currentSection === 'discover' && (
            <DatasetDiscovery
              onSendToAudit={handleSendToAudit}
              onSaveDataset={handleSaveDataset}
              savedDatasets={savedDatasets}
            />
          )}

          {currentSection === 'verify' && (
            <SourceVerification
              initialData={auditTarget}
              onSendToDocument={handleSendToDocument}
              onSaveDataset={handleSaveDataset}
            />
          )}

          {currentSection === 'organize' && <OrganizationStrategy />}

          {currentSection === 'document' && (
            <DocumentationGenerator initialDataset={documentTarget} />
          )}

          {currentSection === 'assistant' && (
            <AcademicAssistant
              currentProjectContext={`Active Research Project: "${activeProjectName}". Total Curated Datasets: ${
                savedDatasets.length
              }. Datasets in Project: ${savedDatasets.map((d) => `${d.title} (${d.repository}, ${d.license})`).join('; ')}`}
            />
          )}

          {currentSection === 'library' && (
            <ProjectLibrary
              savedDatasets={savedDatasets}
              onRemoveDataset={handleRemoveDataset}
              onSelectDatasetForAudit={handleSelectDatasetForAudit}
              onSeedSampleDatasets={handleSeedSampleDatasets}
              projectName={activeProjectName}
            />
          )}
        </main>
      </div>

      {/* Export Project Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        projectName={activeProjectName}
        savedDatasets={savedDatasets}
      />
    </div>
  );
}

export type NavSection =
  | 'home'
  | 'discover'
  | 'verify'
  | 'organize'
  | 'document'
  | 'assistant'
  | 'library'
  | 'workspace'
  | 'fastapi';

export interface GroundingSource {
  title: string;
  url: string;
}

export interface DiscoveredDataset {
  id: string;
  title: string;
  institution?: string;
  repository: string;
  searchQuery: string;
  license: string;
  trustScore: 'High' | 'Medium' | 'Low';
  trustRating?: number;
  description: string;
  biasesAndRisks: string;
  pythonSnippet?: string;
  tags?: string[];
}

export interface DiscoveryResponse {
  markdown: string;
  structured?: {
    summary: string;
    recommendedKeywords: string[];
    datasets: DiscoveredDataset[];
  } | null;
  sources: GroundingSource[];
}

export interface TrustAuditResult {
  datasetName: string;
  trustScore: 'High' | 'Medium' | 'Low';
  scorePercentage: number;
  verdictHeadline: string;
  provenanceScore: number;
  licensingScore: number;
  methodologyScore: number;
  biasRiskScore: number;
  provenanceAnalysis: string;
  licensingAnalysis: string;
  biasEvaluation: string;
  criticalRisks: string[];
  mitigationChecklist: string[];
  citations?: {
    apa?: string;
    bibtex?: string;
  };
}

export interface VerifyResponse {
  markdown: string;
  audit?: TrustAuditResult | null;
  sources: GroundingSource[];
}

export interface OrganizationPlan {
  hierarchyTree: string;
  namingRules: string[];
  namingExamples: string[];
  taggingTaxonomy: Array<{ tag: string; description: string }>;
  bashScaffold: string;
  gitignoreSnippet: string;
}

export interface OrganizeResponse {
  markdown: string;
  plan?: OrganizationPlan | null;
}

export interface DataDictionaryColumn {
  columnName: string;
  dataType: string;
  definition: string;
  allowedValues?: string;
  missingHandling?: string;
  example?: string;
}

export interface DocumentationResult {
  readmeMarkdown: string;
  dataDictionary: DataDictionaryColumn[];
  csvRepresentation?: string;
}

export interface DocumentResponse {
  markdown: string;
  documentation?: DocumentationResult | null;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: GroundingSource[];
}

export interface SavedDatasetRecord {
  id: string;
  title: string;
  repository: string;
  license: string;
  trustScore: 'High' | 'Medium' | 'Low';
  trustRating?: number;
  savedAt: string;
  description: string;
  audit?: TrustAuditResult;
  pythonSnippet?: string;
  notes?: string;
}

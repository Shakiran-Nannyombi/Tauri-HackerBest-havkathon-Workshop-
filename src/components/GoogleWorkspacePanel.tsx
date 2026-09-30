import React, { useState, useEffect } from 'react';
import {
  FileText,
  Table,
  CheckSquare,
  HardDrive,
  ExternalLink,
  Sparkles,
  LogOut,
  Check,
  AlertCircle,
  FolderOpen,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { initAuth, googleSignIn, logout } from '../services/firebaseAuth';
import { GoogleWorkspaceService, DriveFileItem } from '../services/googleWorkspace';
import { SavedDatasetRecord } from '../types';

interface GoogleWorkspacePanelProps {
  projectName: string;
  savedDatasets: SavedDatasetRecord[];
}

export const GoogleWorkspacePanel: React.FC<GoogleWorkspacePanelProps> = ({
  projectName,
  savedDatasets,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Active workspace tab
  const [activeTab, setActiveTab] = useState<'docs' | 'sheets' | 'forms' | 'drive'>('docs');

  // Operation statuses
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<{ text: string; url?: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Drive files
  const [driveFiles, setDriveFiles] = useState<DriveFileItem[]>([]);
  const [loadingDrive, setLoadingDrive] = useState(false);

  // Form custom state
  const [docTitle, setDocTitle] = useState(`${projectName} - Academic Dataset Dossier`);
  const [sheetTitle, setSheetTitle] = useState(`${projectName} - Data Dictionary & Catalog`);
  const [formTitle, setFormTitle] = useState(`${projectName} - Data Quality & Participant Intake Survey`);

  // Confirmation modal state (MANDATORY per skill guidelines)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: async () => {},
  });

  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, currentToken) => {
        setUser(currentUser);
        setToken(currentToken);
      },
      () => {
        setUser(null);
        setToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Failed to authenticate with Google Workspace.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setToken(null);
    setDriveFiles([]);
  };

  const loadDriveFiles = async () => {
    if (!token) return;
    setLoadingDrive(true);
    setErrorMessage(null);
    try {
      const files = await GoogleWorkspaceService.listFiles();
      setDriveFiles(files);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to load Google Drive files.');
    } finally {
      setLoadingDrive(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'drive' && token) {
      loadDriveFiles();
    }
  }, [activeTab, token]);

  // 1. Google Docs Action with User Confirmation
  const triggerCreateDoc = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Create Google Doc in your Google Drive?',
      description: `This will create a new Google Document named "${docTitle}" containing the full project abstract, dataset provenance index, and academic README.`,
      onConfirm: async () => {
        setLoadingAction('doc');
        setErrorMessage(null);
        setSuccessMessage(null);
        try {
          let content = `RESEARCHBASE ACADEMIC DATASET DOSSIER\n`;
          content += `Project: ${projectName}\n`;
          content += `Generated: ${new Date().toLocaleDateString()}\n\n`;
          content += `1. EXECUTIVE PROVENANCE SUMMARY\n`;
          content += `Total Curated Datasets: ${savedDatasets.length}\n\n`;

          savedDatasets.forEach((ds, i) => {
            content += `[Dataset ${i + 1}] ${ds.title}\n`;
            content += `Repository: ${ds.repository} | License: ${ds.license}\n`;
            content += `Trust Assessment Score: ${ds.trustScore} (${ds.trustRating || 'N/A'}%)\n`;
            content += `Description: ${ds.description}\n`;
            if (ds.audit) {
              content += `Audit Verdict: ${ds.audit.verdictHeadline}\n`;
            }
            content += `\n`;
          });

          const doc = await GoogleWorkspaceService.createDocument(docTitle, content);
          setSuccessMessage({
            text: `Successfully created "${docTitle}" in your Google Drive!`,
            url: doc.url,
          });
        } catch (err: any) {
          setErrorMessage(err?.message || 'Failed to create Google Doc.');
        } finally {
          setLoadingAction(null);
        }
      },
    });
  };

  // 2. Google Sheets Action with User Confirmation
  const triggerCreateSheet = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Create Google Spreadsheet in your Google Drive?',
      description: `This will create a new Google Sheet named "${sheetTitle}" with columns for dataset names, repositories, declared licenses, trust scores, and risk flags.`,
      onConfirm: async () => {
        setLoadingAction('sheet');
        setErrorMessage(null);
        setSuccessMessage(null);
        try {
          const headers = [
            'Dataset Title',
            'Hosting Repository',
            'Declared License',
            'Trust Score',
            'Trust Index (%)',
            'Audit Verdict',
            'Critical Risks Flagged',
          ];

          const rows = savedDatasets.map((ds) => [
            ds.title,
            ds.repository,
            ds.license,
            ds.trustScore,
            String(ds.trustRating || ''),
            ds.audit?.verdictHeadline || '',
            ds.audit?.criticalRisks?.join('; ') || 'None flagged',
          ]);

          const sheet = await GoogleWorkspaceService.createSpreadsheet(sheetTitle, headers, rows);
          setSuccessMessage({
            text: `Successfully created "${sheetTitle}" in Google Sheets!`,
            url: sheet.url,
          });
        } catch (err: any) {
          setErrorMessage(err?.message || 'Failed to create Google Sheet.');
        } finally {
          setLoadingAction(null);
        }
      },
    });
  };

  // 3. Google Forms Action with User Confirmation
  const triggerCreateForm = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Create Google Form Questionnaire?',
      description: `This will create a structured research survey named "${formTitle}" in your Google Drive to evaluate dataset quality, consent, and licensing compliance.`,
      onConfirm: async () => {
        setLoadingAction('form');
        setErrorMessage(null);
        setSuccessMessage(null);
        try {
          const questions: Array<{ title: string; type: 'TEXT' | 'PARAGRAPH_TEXT' | 'CHOICE'; options?: string[] }> = [
            {
              title: 'Primary Research Hypothesis or Study Objective',
              type: 'PARAGRAPH_TEXT',
            },
            {
              title: 'Dataset Acquisition Source & Repository DOI',
              type: 'TEXT',
            },
            {
              title: 'Is this dataset licensed under open terms (e.g. CC-BY, Apache, Public Domain)?',
              type: 'CHOICE',
              options: ['Yes (CC-BY / Apache / Public Domain)', 'Restricted (Non-Commercial Only)', 'Unknown / Missing License'],
            },
            {
              title: 'Were any potential demographic or sensor selection biases detected?',
              type: 'CHOICE',
              options: ['No significant bias flagged', 'Minor sampling skew (documented)', 'Severe risk of survivor / scraping bias'],
            },
            {
              title: 'Data Collection Methodology & Hardware Calibration Details',
              type: 'PARAGRAPH_TEXT',
            },
          ];

          const form = await GoogleWorkspaceService.createForm(
            formTitle,
            `Surveillance and verification questionnaire generated via ResearchBase for ${projectName}.`,
            questions
          );

          setSuccessMessage({
            text: `Google Form created successfully!`,
            url: form.editUrl,
          });
        } catch (err: any) {
          setErrorMessage(err?.message || 'Failed to create Google Form.');
        } finally {
          setLoadingAction(null);
        }
      },
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-[#2563EB] tracking-wide uppercase">
                Productivity Ecosystem
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-medium">1P Google Workspace Integration</span>
            </div>
            <h2 className="text-xl font-bold text-[#0F172A] tracking-tight">
              Google Workspace Hub
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Export verified research dossiers to Google Docs, data dictionaries to Google Sheets, quality surveys to Google Forms, and manage files on Google Drive.
            </p>
          </div>

          {/* User Sign-In / Account status */}
          <div>
            {user ? (
              <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 border border-slate-200">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="w-8 h-8 rounded-full border border-slate-200" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-xs font-bold">
                    {user.displayName?.charAt(0) || 'U'}
                  </div>
                )}
                <div>
                  <div className="text-xs font-bold text-[#0F172A] line-clamp-1">
                    {user.displayName || 'Google Researcher'}
                  </div>
                  <div className="text-[11px] text-slate-500 line-clamp-1">{user.email}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-md hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors ml-1 cursor-pointer"
                  title="Sign out of Google"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* Official "Sign in with Google" Button per Skill Style */
              <button
                onClick={handleSignIn}
                disabled={isLoggingIn}
                className="gsi-material-button inline-flex items-center gap-2.5 px-4 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 text-slate-700 text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                <div className="w-4 h-4 shrink-0">
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                </div>
                <span>{isLoggingIn ? 'Connecting...' : 'Sign in with Google'}</span>
              </button>
            )}
          </div>
        </div>

        {authError && (
          <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{authError}</span>
          </div>
        )}

        {/* Workspace Navigation Tabs */}
        <div className="mt-5 flex flex-wrap gap-2 border-b border-slate-200 pb-3">
          {[
            { id: 'docs', label: 'Google Docs', icon: FileText, desc: 'README & Notes' },
            { id: 'sheets', label: 'Google Sheets', icon: Table, desc: 'Data Dictionary' },
            { id: 'forms', label: 'Google Forms', icon: CheckSquare, desc: 'Quality Survey' },
            { id: 'drive', label: 'Google Drive', icon: HardDrive, desc: 'File Browser' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#2563EB] text-white shadow-xs'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-[#0F172A] border border-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span className={`text-[10px] hidden sm:inline ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                  • {tab.desc}
                </span>
              </button>
            );
          })}
        </div>

        {/* Global Success / Error Notification */}
        {successMessage && (
          <div className="mt-4 p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage.text}</span>
            </div>
            {successMessage.url && (
              <a
                href={successMessage.url}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1 bg-white border border-emerald-300 rounded font-semibold text-emerald-700 hover:bg-emerald-100 text-xs flex items-center gap-1.5 shrink-0 transition-colors"
              >
                <span>Open in Google Workspace</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Non-Authenticated Prompt */}
        {!user && (
          <div className="mt-6 p-6 rounded-xl bg-blue-50/50 border border-blue-200/70 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center mx-auto">
              <HardDrive className="w-5 h-5" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-sm font-bold text-[#0F172A]">
                Sign in with Google to Access Workspace Features
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Connect your Google Account to export research files directly into Google Docs, Google Sheets, Google Forms, and Google Drive.
              </p>
            </div>
            <div>
              <button
                onClick={handleSignIn}
                disabled={isLoggingIn}
                className="px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold inline-flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <span>{isLoggingIn ? 'Connecting...' : 'Authorize Google Workspace'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Authenticated Workspace Views */}
        {user && (
          <div className="mt-6">
            {/* 1. GOOGLE DOCS */}
            {activeTab === 'docs' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#2563EB]" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                      Export Research Dossier to Google Docs
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600">
                    Draft a comprehensive Google Document with your research project abstract, curated dataset manifests, provenance ratings, and APA/BibTeX citations.
                  </p>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-[#0F172A]">Document Title</label>
                    <input
                      type="text"
                      value={docTitle}
                      onChange={(e) => setDocTitle(e.target.value)}
                      className="w-full max-w-lg px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-[#0F172A] focus:border-[#2563EB] outline-hidden"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={triggerCreateDoc}
                      disabled={loadingAction === 'doc'}
                      className="px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-slate-300 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                    >
                      {loadingAction === 'doc' ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Generating Document...</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          <span>Create Google Doc</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 2. GOOGLE SHEETS */}
            {activeTab === 'sheets' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2">
                    <Table className="w-4 h-4 text-[#2563EB]" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                      Export Data Dictionary & Catalog to Google Sheets
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600">
                    Create a synchronized Google Spreadsheet containing all {savedDatasets.length} curated datasets with column schemas, trust scores, and risk flags.
                  </p>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-[#0F172A]">Spreadsheet Title</label>
                    <input
                      type="text"
                      value={sheetTitle}
                      onChange={(e) => setSheetTitle(e.target.value)}
                      className="w-full max-w-lg px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-[#0F172A] focus:border-[#2563EB] outline-hidden"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={triggerCreateSheet}
                      disabled={loadingAction === 'sheet'}
                      className="px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-slate-300 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                    >
                      {loadingAction === 'sheet' ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Generating Spreadsheet...</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          <span>Create Google Sheet</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 3. GOOGLE FORMS */}
            {activeTab === 'forms' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-[#2563EB]" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                      Create Quality & Participant Survey in Google Forms
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600">
                    Scaffold an official questionnaire for research intake, participant consent, and dataset quality auditing with multiple question types.
                  </p>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-[#0F172A]">Form Title</label>
                    <input
                      type="text"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full max-w-lg px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-[#0F172A] focus:border-[#2563EB] outline-hidden"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={triggerCreateForm}
                      disabled={loadingAction === 'form'}
                      className="px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-slate-300 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                    >
                      {loadingAction === 'form' ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Building Form...</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          <span>Create Google Form</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 4. GOOGLE DRIVE BROWSER */}
            {activeTab === 'drive' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                      Recent Google Drive Research Files
                    </h3>
                    <p className="text-xs text-slate-500">
                      Files and documents in your Google Drive account.
                    </p>
                  </div>

                  <button
                    onClick={loadDriveFiles}
                    disabled={loadingDrive}
                    className="text-xs px-2.5 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingDrive ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                </div>

                {loadingDrive ? (
                  <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                    Loading Drive files...
                  </div>
                ) : driveFiles.length > 0 ? (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                    {driveFiles.map((file) => (
                      <div
                        key={file.id}
                        className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {file.iconLink ? (
                            <img src={file.iconLink} alt="" className="w-4 h-4 shrink-0" />
                          ) : (
                            <FolderOpen className="w-4 h-4 text-[#2563EB] shrink-0" />
                          )}
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-[#0F172A] truncate">
                              {file.name}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {file.modifiedTime ? new Date(file.modifiedTime).toLocaleDateString() : ''}
                            </div>
                          </div>
                        </div>

                        {file.webViewLink && (
                          <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs px-2.5 py-1 rounded bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-[#2563EB] font-medium flex items-center gap-1 transition-colors shrink-0"
                          >
                            <span>Open</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                    No recent files found. Create a Google Doc, Sheet, or Form above!
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mandatory User Confirmation Dialog */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-md w-full p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-slate-900">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#0F172A]">
                {confirmDialog.title}
              </h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {confirmDialog.description}
            </p>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                onClick={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
                className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
                  await confirmDialog.onConfirm();
                }}
                className="px-4 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Confirm & Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

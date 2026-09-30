import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  BotMessageSquare,
  User,
  Globe2,
  ExternalLink,
  RotateCcw,
  BookOpen,
  GraduationCap,
  Scale,
  Code2,
} from 'lucide-react';
import { ChatMessage, GroundingSource } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';

interface AcademicAssistantProps {
  currentProjectContext?: string;
}

const STARTER_PROMPTS = [
  {
    label: 'Licensing & Publication Risk',
    prompt: 'Can I publish a peer-reviewed research paper using a Kaggle dataset with an "Unknown" or missing license? What are the legal and ethical risks?',
    icon: Scale,
  },
  {
    label: 'Detecting Selection Bias',
    prompt: 'What are typical demographic, geographic, and survival selection biases in electronic health record (EHR) datasets, and how can I adjust for them statistically?',
    icon: GraduationCap,
  },
  {
    label: 'Python Data Quality Audit',
    prompt: 'Write a Python function using pandas and numpy that audits an incoming tabular dataset for missingness, checks schema types, and flags statistical outliers using IQR and Z-scores.',
    icon: Code2,
  },
  {
    label: 'FAIR Data Principles',
    prompt: 'Explain how a beginner researcher can make their newly curated dataset fully compliant with FAIR principles (Findable, Accessible, Interoperable, Reusable).',
    icon: BookOpen,
  },
];

export const AcademicAssistant: React.FC<AcademicAssistantProps> = ({
  currentProjectContext,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `### Welcome to ResearchBase Copilot

I am the academic core logic engine of **ResearchBase**. I provide meticulous, objective, and encouraging guidance to help you discover, verify, organize, and document research datasets.

**How I can assist your investigation:**
- **Repository Strategy:** Formulating search queries for Zenodo, Data.gov, Hugging Face, and Kaggle.
- **Provenance & Trust Audits:** Evaluating licensing ambiguities (e.g., CC-BY vs CC-BY-NC), institutional backing, and ethical IRB considerations.
- **Selection Bias Analysis:** Identifying survivorship, demographic, or sensor drift biases.
- **Reproducible Pipelines:** Structuring folder hierarchies, DVC tracking, and data dictionary definitions.

*Select a standard inquiry below or describe your research challenge directly.*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = textToSend ?? input;
    if (!messageContent.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: messageContent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Build conversation history
      const history = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/research/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history,
          context: currentProjectContext,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed with status ${res.status}`);
      }

      const data = await res.json();

      const assistantMessage: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: data.sources || [],
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `**Academic Advisory Notice:** Failed to process query. ${err?.message || 'Please check your connection and retry.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearSession = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: `**Research session reset.** Ready for new inquiries regarding dataset provenance, methodology validation, or licensing audits.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto flex flex-col h-[calc(100vh-100px)]">
      {/* Top Bar */}
      <div className="bg-white rounded-t-xl border border-slate-200 p-4 border-b-0 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center border border-blue-200">
            <BotMessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0F172A] tracking-tight">
              ResearchBase Academic Copilot
            </h3>
            <p className="text-[11px] text-slate-500">
              Grounded with real-time web search for verified repository citations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClearSession}
            className="text-xs px-2.5 py-1.5 rounded-md hover:bg-slate-100 text-slate-600 flex items-center gap-1 transition-colors cursor-pointer"
            title="Reset conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Session</span>
          </button>
        </div>
      </div>

      {/* Messages Stream Container */}
      <div className="flex-1 bg-white border-x border-slate-200 overflow-y-auto p-5 space-y-5">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-[#0F172A] text-white'
                    : 'bg-[#2563EB] text-white shadow-xs'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-3.5 h-3.5" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`rounded-xl p-4 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-[#2563EB] text-white font-medium max-w-xl'
                    : 'bg-slate-50/80 border border-slate-200 text-slate-800 w-full'
                }`}
              >
                <div className="flex items-center justify-between mb-1 pb-1 border-b border-black/5 text-[10px] opacity-75">
                  <span className="font-semibold">
                    {isUser ? 'Researcher' : 'ResearchBase Engine'}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>

                {isUser ? (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <MarkdownRenderer content={msg.content} />
                )}

                {/* Grounding Web Citations if present */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200 space-y-1.5">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600">
                      <Globe2 className="w-3 h-3 text-[#2563EB]" />
                      <span>Web Grounding Citations:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.sources.map((src, idx) => (
                        <a
                          key={idx}
                          href={src.url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-0.5 rounded bg-white hover:bg-blue-50 border border-slate-200 text-[11px] text-[#2563EB] flex items-center gap-1 transition-colors"
                        >
                          <span className="max-w-[200px] truncate">{src.title}</span>
                          <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 max-w-xl">
            <div className="w-7 h-7 rounded-lg bg-[#2563EB] text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
            </div>
            <div className="rounded-xl p-4 bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-ping" />
              <span>Analyzing academic methodology and querying repositories...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Starter Prompts Pills */}
      <div className="bg-slate-50 border-x border-slate-200 px-4 py-2 border-t border-slate-100 flex items-center gap-2 overflow-x-auto">
        <span className="text-[10px] font-bold uppercase text-slate-400 shrink-0">
          Inquiries:
        </span>
        {STARTER_PROMPTS.map((starter, i) => {
          const Icon = starter.icon;
          return (
            <button
              key={i}
              onClick={() => handleSendMessage(starter.prompt)}
              className="text-[11px] px-2.5 py-1 rounded-full bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-[#2563EB] shrink-0 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Icon className="w-3 h-3 text-[#2563EB]" />
              <span>{starter.label}</span>
            </button>
          );
        })}
      </div>

      {/* Input Box */}
      <div className="bg-white rounded-b-xl border border-slate-200 p-4 border-t-0 shadow-xs">
        <div className="relative">
          <textarea
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Ask about dataset provenance, repository comparison, Python inspection code, or bias mitigation..."
            className="w-full pl-3 pr-20 py-2.5 bg-white border border-slate-300 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 rounded-lg text-xs text-[#0F172A] placeholder-slate-400 outline-hidden resize-none"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || loading}
            className="absolute right-2 top-2.5 bottom-2.5 px-3 rounded-md bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-slate-300 text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Inquire</span>
          </button>
        </div>
      </div>
    </div>
  );
};

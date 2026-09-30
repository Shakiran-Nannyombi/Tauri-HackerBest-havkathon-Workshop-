import React, { useMemo, useState } from 'react';
import { marked } from 'marked';
import { Copy, Check } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  const [copied, setCopied] = useState(false);

  // Configure marked safely
  const htmlContent = useMemo(() => {
    if (!content) return '';
    try {
      marked.setOptions({
        gfm: true,
        breaks: true,
      });
      return marked.parse(content) as string;
    } catch (e) {
      console.error('Failed to parse markdown:', e);
      return `<p>${content}</p>`;
    }
  }, [content]);

  const handleCopyRaw = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`relative group ${className}`}>
      <button
        onClick={handleCopyRaw}
        title="Copy raw markdown"
        className="absolute top-2 right-2 p-1.5 rounded-md bg-white/90 border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-all opacity-0 group-hover:opacity-100 shadow-xs z-10 flex items-center gap-1 text-xs"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-emerald-700 font-medium">Copied</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Raw</span>
          </>
        )}
      </button>

      <div
        className="prose prose-slate max-w-none text-[#0F172A] leading-relaxed
          prose-headings:text-[#0F172A] prose-headings:font-semibold prose-headings:tracking-tight
          prose-h1:text-2xl prose-h1:border-b prose-h1:border-slate-200 prose-h1:pb-2 prose-h1:mb-4
          prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-3 prose-h2:text-[#0F172A]
          prose-h3:text-lg prose-h3:mt-4 prose-h3:mb-2 prose-h3:text-[#1E293B]
          prose-p:text-slate-700 prose-p:my-2
          prose-ul:my-2 prose-ul:list-disc prose-ul:pl-5
          prose-ol:my-2 prose-ol:list-decimal prose-ol:pl-5
          prose-li:text-slate-700 prose-li:my-1
          prose-code:text-[#2563EB] prose-code:bg-blue-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-[13px] prose-code:font-mono
          prose-pre:bg-[#0F172A] prose-pre:text-slate-100 prose-pre:rounded-lg prose-pre:p-4 prose-pre:shadow-sm prose-pre:overflow-x-auto
          prose-blockquote:border-l-4 prose-blockquote:border-[#2563EB] prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-slate-600 prose-blockquote:bg-blue-50/40 prose-blockquote:py-1
          prose-table:border-collapse prose-table:w-full prose-table:my-4 prose-table:border prose-table:border-slate-200
          prose-th:border prose-th:border-slate-200 prose-th:bg-slate-100 prose-th:p-2 prose-th:text-xs prose-th:font-semibold prose-th:text-[#0F172A]
          prose-td:border prose-td:border-slate-200 prose-td:p-2 prose-td:text-xs prose-td:text-slate-700
          prose-a:text-[#2563EB] prose-a:underline hover:prose-a:text-blue-700"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  );
};

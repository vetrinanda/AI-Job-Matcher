import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const SECTION_LABELS = [
  { key: 'professional_summary', label: 'Professional Summary' },
  { key: 'skills', label: 'Skills' },
  { key: 'experience', label: 'Work Experience' },
  { key: 'projects', label: 'Projects' },
  { key: 'education', label: 'Education' },
  { key: 'additional_tips', label: 'Additional Tips' },
];

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className={`cursor-pointer text-xs font-semibold transition-all duration-300 ${
        copied
          ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
          : 'border-indigo-500/25 bg-indigo-500/10 text-indigo-400 hover:border-indigo-400/40 hover:bg-indigo-500/20 hover:shadow-[0_0_12px_rgba(99,102,241,0.2)]'
      }`}
    >
      {copied ? 'Copied!' : 'Copy'}
    </Button>
  );
}

export default function RewriteView({ rewriteData, onBack }) {
  if (!rewriteData) return null;

  const { rewritten_resume, original_score, message } = rewriteData;

  const handleCopyAll = async () => {
    const allText = SECTION_LABELS
      .map(({ key, label }) => {
        const content = rewritten_resume[key];
        return content ? `=== ${label} ===\n${content}` : '';
      })
      .filter(Boolean)
      .join('\n\n');
    await navigator.clipboard.writeText(allText);
  };

  return (
    <div className="animate-fade-in-up space-y-5">
      {/* Back Button */}
      <Button
        variant="outline"
        onClick={onBack}
        className="cursor-pointer border-white/[0.1] bg-white/[0.04] text-sm font-medium text-foreground transition-all duration-300 hover:border-indigo-500/30 hover:bg-indigo-500/10 hover:text-indigo-300 hover:shadow-[0_0_15px_rgba(99,102,241,0.15)]"
      >
        ← Back to Results
      </Button>

      {/* Header */}
      <div className="text-center">
        <h2 className="mb-2 bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent">
          Resume Rewritten
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {message}
        </p>
      </div>

      {/* Rewritten Sections */}
      <div className="space-y-3">
        {SECTION_LABELS.map(({ key, label, icon }, index) => {
          const content = rewritten_resume[key];
          if (!content) return null;

          return (
            <Card
              key={key}
              className="animate-fade-in-up border-white/[0.06] bg-white/[0.03] transition-all duration-300 hover:border-white/[0.1]"
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              <CardHeader className="flex flex-row items-center justify-between border-b border-white/[0.06] pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  {icon} {label}
                </CardTitle>
                <CopyButton text={content} />
              </CardHeader>
              <CardContent className="pt-4">
                <div className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                  {content}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Copy All Button */}
      <div className="text-center">
        <Button
          onClick={handleCopyAll}
          className="cursor-pointer border-0 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 px-10 text-sm font-bold tracking-wide text-white shadow-[0_0_25px_rgba(16,185,129,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_35px_rgba(20,184,166,0.45)] active:translate-y-0"
          size="lg"
        >
          Copy Entire Resume
        </Button>
      </div>
    </div>
  );
}

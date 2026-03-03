import React, { useState } from 'react';

const SECTION_LABELS = [
  { key: 'professional_summary', label: 'Professional Summary', icon: '📝' },
  { key: 'skills', label: 'Skills', icon: '🛠️' },
  { key: 'experience', label: 'Work Experience', icon: '💼' },
  { key: 'projects', label: 'Projects', icon: '🚀' },
  { key: 'education', label: 'Education', icon: '🎓' },
  { key: 'additional_tips', label: 'Additional Tips', icon: '💡' },
];

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      style={{
        background: copied ? 'rgba(34,197,94,0.15)' : 'rgba(79,125,249,0.12)',
        border: `1px solid ${copied ? 'rgba(34,197,94,0.3)' : 'rgba(79,125,249,0.2)'}`,
        color: copied ? '#22c55e' : '#4f7df9',
        padding: '0.35rem 0.75rem',
        borderRadius: '6px',
        cursor: 'pointer',
        fontFamily: 'Inter, sans-serif',
        fontSize: '0.75rem',
        fontWeight: 600,
        transition: 'all 0.2s ease',
      }}
    >
      {copied ? '✅ Copied!' : '📋 Copy'}
    </button>
  );
}

export default function RewriteView({ rewriteData, onBack }) {
  if (!rewriteData) return null;

  const { rewritten_resume, original_score, message } = rewriteData;

  return (
    <div style={{ animation: 'fadeInUp 0.6s ease-out' }}>
      <button className="back-btn" onClick={onBack}>
        ← Back to Results
      </button>

      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '2rem',
      }}>
        <h2 style={{
          fontSize: '1.75rem',
          fontWeight: 800,
          background: 'linear-gradient(135deg, #22c55e, #22d3ee)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '0.75rem',
        }}>
          ✨ Resume Rewritten
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
          {message}
        </p>
      </div>

      {/* Rewritten Sections */}
      {SECTION_LABELS.map(({ key, label, icon }) => {
        const content = rewritten_resume[key];
        if (!content) return null;

        return (
          <div key={key} style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '1rem',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
          }}>
            {/* Section Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem 1.25rem',
              borderBottom: '1px solid var(--border-subtle)',
            }}>
              <h3 style={{
                fontSize: '1rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}>
                {icon} {label}
              </h3>
              <CopyButton text={content} />
            </div>

            {/* Section Content */}
            <div style={{
              padding: '1.25rem',
              color: 'var(--text-secondary)',
              fontSize: '0.9rem',
              lineHeight: 1.8,
              whiteSpace: 'pre-wrap',
            }}>
              {content}
            </div>
          </div>
        );
      })}

      {/* Copy All Button */}
      <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
        <button
          onClick={async () => {
            const allText = SECTION_LABELS
              .map(({ key, label }) => {
                const content = rewritten_resume[key];
                return content ? `=== ${label} ===\n${content}` : '';
              })
              .filter(Boolean)
              .join('\n\n');
            await navigator.clipboard.writeText(allText);
          }}
          style={{
            background: 'var(--gradient-success)',
            border: 'none',
            color: '#fff',
            padding: '0.75rem 2rem',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.95rem',
            fontWeight: 600,
            transition: 'all 0.3s ease',
            boxShadow: '0 0 20px rgba(34, 197, 94, 0.2)',
          }}
        >
          📋 Copy Entire Resume
        </button>
      </div>
    </div>
  );
}

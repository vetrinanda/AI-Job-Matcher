import React, { useState } from 'react';

function SuggestionCard({ suggestion }) {
  const [isOpen, setIsOpen] = useState(false);

  const getSectionIcon = (name) => {
    const lower = name.toLowerCase();
    if (lower.includes('summary')) return '📝';
    if (lower.includes('skill')) return '🛠️';
    if (lower.includes('experience')) return '💼';
    if (lower.includes('project')) return '🚀';
    if (lower.includes('education')) return '🎓';
    if (lower.includes('keyword')) return '🔑';
    return '💡';
  };

  return (
    <div className="suggestion-card">
      <div
        className="suggestion-card__header"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="suggestion-card__section-name">
          {getSectionIcon(suggestion.section_name)} {suggestion.section_name}
        </span>
        <span className={`suggestion-card__toggle ${isOpen ? 'suggestion-card__toggle--open' : ''}`}>
          ▼
        </span>
      </div>

      {isOpen && (
        <div className="suggestion-card__body">
          {/* Current Assessment */}
          <div className="suggestion-card__assessment">
            <strong>Current Issue:</strong> {suggestion.current_assessment}
          </div>

          {/* Suggestion */}
          <p className="suggestion-card__suggestion-text">
            💡 <strong>Suggestion:</strong> {suggestion.suggestion}
          </p>

          {/* Keywords to Add */}
          {suggestion.keywords_to_add?.length > 0 && (
            <div className="suggestion-card__keywords">
              <span className="suggestion-card__keywords-label">🔑 Keywords to Add</span>
              {suggestion.keywords_to_add.map((kw, i) => (
                <span className="keyword-add" key={i}>{kw}</span>
              ))}
            </div>
          )}

          {/* Example Text */}
          {suggestion.example_text && (
            <div className="suggestion-card__example">
              <div className="suggestion-card__example-label">✨ Example Rewrite</div>
              <div className="suggestion-card__example-text">{suggestion.example_text}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Suggestions({ suggestions }) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="suggestions">
      <h2 className="suggestions__title">
        💡 Improvement Suggestions
      </h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
        Your ATS score is below 75. Here are AI-powered suggestions to improve each section of your resume:
      </p>
      {suggestions.map((suggestion, index) => (
        <SuggestionCard key={index} suggestion={suggestion} />
      ))}
    </div>
  );
}

import React from 'react';

export default function ScoreBreakdown({ sectionScores }) {
  const getBarColor = (score) => {
    if (score >= 75) return 'linear-gradient(90deg, #22c55e, #22d3ee)';
    if (score >= 50) return 'linear-gradient(90deg, #f59e0b, #fb923c)';
    return 'linear-gradient(90deg, #ef4444, #f97316)';
  };

  const getScoreColor = (score) => {
    if (score >= 75) return '#22c55e';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="breakdown">
      <h2 className="breakdown__title">
        📊 Section Breakdown
      </h2>
      <div className="breakdown__grid">
        {sectionScores.map((section, index) => (
          <div className="breakdown-card" key={index}>
            <div className="breakdown-card__header">
              <span className="breakdown-card__name">
                {section.section_name}
              </span>
              <span
                className="breakdown-card__score"
                style={{ color: getScoreColor(section.score) }}
              >
                {section.score}%
                <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.75rem' }}>
                  {' '}(weight: {section.max_weight}%)
                </span>
              </span>
            </div>

            <div className="breakdown-card__bar-bg">
              <div
                className="breakdown-card__bar-fill"
                style={{
                  width: `${section.score}%`,
                  background: getBarColor(section.score),
                }}
              />
            </div>

            {section.matched_keywords?.length > 0 && (
              <div className="breakdown-card__keywords">
                <span className="breakdown-card__keywords-label">✅ Matched</span>
                {section.matched_keywords.slice(0, 8).map((kw, i) => (
                  <span className="keyword-tag keyword-tag--matched" key={i}>{kw}</span>
                ))}
              </div>
            )}

            {section.missing_keywords?.length > 0 && (
              <div className="breakdown-card__keywords" style={{ marginTop: '0.5rem' }}>
                <span className="breakdown-card__keywords-label">❌ Missing</span>
                {section.missing_keywords.slice(0, 8).map((kw, i) => (
                  <span className="keyword-tag keyword-tag--missing" key={i}>{kw}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

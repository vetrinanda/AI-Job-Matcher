import React, { useEffect, useState } from 'react';

export default function ScoreGauge({ score, status, summary }) {
  const [animatedScore, setAnimatedScore] = useState(0);

  const radius = 80;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    // Animate score from 0 to actual value
    const duration = 1500;
    const start = performance.now();

    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(score * eased));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [score]);

  const dashOffset = circumference - (animatedScore / 100) * circumference;

  const getScoreColor = () => {
    if (score >= 80) return '#22c55e';     // Green
    if (score >= 65) return '#22d3ee';     // Cyan
    if (score >= 45) return '#f59e0b';     // Amber
    return '#ef4444';                       // Red
  };

  const getStatusClass = () => {
    if (score >= 80) return 'score-status--excellent';
    if (score >= 65) return 'score-status--good';
    if (score >= 45) return 'score-status--needs-improvement';
    return 'score-status--poor';
  };

  const color = getScoreColor();

  return (
    <div className="score-section">
      <div className="score-gauge">
        <svg className="score-gauge__svg" viewBox="0 0 200 200">
          <circle
            className="score-gauge__bg"
            cx="100"
            cy="100"
            r={radius}
          />
          <circle
            className="score-gauge__fill"
            cx="100"
            cy="100"
            r={radius}
            stroke={color}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <div className="score-gauge__value" style={{ color }}>
          {animatedScore}
        </div>
        <div className="score-gauge__label">ATS Score</div>
      </div>

      <div className={`score-status ${getStatusClass()}`}>
        {status}
      </div>
      <p className="score-summary">{summary}</p>
    </div>
  );
}

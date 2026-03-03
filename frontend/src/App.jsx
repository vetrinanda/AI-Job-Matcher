import React, { useState, useCallback, useRef } from 'react';
import Header from './components/Header';
import UploadForm from './components/UploadForm';
import ScoreGauge from './components/ScoreGauge';
import ScoreBreakdown from './components/ScoreBreakdown';
import Suggestions from './components/Suggestions';
import RewriteView from './components/RewriteView';

const API_URL = 'http://localhost:8000';

export default function App() {
  const [state, setState] = useState('upload'); // 'upload' | 'loading' | 'results' | 'rewriting' | 'rewrite-view'
  const [result, setResult] = useState(null);
  const [rewriteData, setRewriteData] = useState(null);
  const [error, setError] = useState(null);

  // Store the file + JD so we can re-use them for the rewrite call
  const lastFileRef = useRef(null);
  const lastJDRef = useRef('');

  const handleAnalyze = useCallback(async (file, jobDescription) => {
    setState('loading');
    setError(null);
    lastFileRef.current = file;
    lastJDRef.current = jobDescription;

    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('job_description', jobDescription);

      const response = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server error: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
      setState('results');
    } catch (err) {
      setError(err.message || 'Failed to analyze resume. Please try again.');
      setState('upload');
    }
  }, []);

  const handleRewrite = useCallback(async () => {
    if (!lastFileRef.current || !lastJDRef.current) return;

    setState('rewriting');
    setError(null);

    try {
      const formData = new FormData();
      formData.append('resume', lastFileRef.current);
      formData.append('job_description', lastJDRef.current);

      const response = await fetch(`${API_URL}/api/rewrite`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server error: ${response.status}`);
      }

      const data = await response.json();
      setRewriteData(data);
      setState('rewrite-view');
    } catch (err) {
      setError(err.message || 'Failed to rewrite resume. Please try again.');
      setState('results');
    }
  }, []);

  const handleBack = useCallback(() => {
    setState('upload');
    setResult(null);
    setRewriteData(null);
    setError(null);
  }, []);

  const handleBackToResults = useCallback(() => {
    setState('results');
    setRewriteData(null);
  }, []);

  return (
    <div>
      <Header />
      <main className="main">
        {state === 'upload' && (
          <>
            <h1 className="main__title">Match Your Resume to Any Job</h1>
            <p className="main__description">
              Upload your resume and paste the job description to get an instant ATS compatibility score
              with AI-powered suggestions to boost your chances.
            </p>

            {error && (
              <div className="error">
                <span className="error__icon">⚠️</span>
                <span className="error__text">{error}</span>
              </div>
            )}

            <UploadForm onAnalyze={handleAnalyze} isLoading={false} />
          </>
        )}

        {state === 'loading' && (
          <div className="loading">
            <div className="loading__spinner" />
            <div className="loading__text">Analyzing your resume...</div>
            <div className="loading__subtext">
              Comparing keywords, scoring sections, and generating AI suggestions
            </div>
          </div>
        )}

        {state === 'rewriting' && (
          <div className="loading">
            <div className="loading__spinner" />
            <div className="loading__text">Rewriting your resume...</div>
            <div className="loading__subtext">
              AI is crafting an optimized version of your resume tailored to this job description
            </div>
          </div>
        )}

        {state === 'results' && result && (
          <>
            <button className="back-btn" onClick={handleBack}>
              ← Analyze Another Resume
            </button>

            {error && (
              <div className="error">
                <span className="error__icon">⚠️</span>
                <span className="error__text">{error}</span>
              </div>
            )}

            <ScoreGauge
              score={result.overall_score}
              status={result.status}
              summary={result.summary}
            />

            {/* Rewrite Resume Button — shown when score < 75 */}
            {result.overall_score < 75 && (
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <button
                  className="analyze-btn"
                  onClick={handleRewrite}
                  style={{
                    maxWidth: '400px',
                    background: 'linear-gradient(135deg, #22c55e, #22d3ee)',
                    boxShadow: '0 0 30px rgba(34, 197, 94, 0.2)',
                  }}
                >
                  ✨ Rewrite My Resume with AI
                </button>
                <p style={{
                  color: 'var(--text-muted)',
                  fontSize: '0.8rem',
                  marginTop: '0.5rem',
                }}>
                  AI will rewrite your entire resume to match this job description
                </p>
              </div>
            )}

            <ScoreBreakdown sectionScores={result.section_scores} />

            {result.suggestions && result.suggestions.length > 0 && (
              <Suggestions suggestions={result.suggestions} />
            )}
          </>
        )}

        {state === 'rewrite-view' && rewriteData && (
          <RewriteView
            rewriteData={rewriteData}
            onBack={handleBackToResults}
          />
        )}
      </main>
    </div>
  );
}

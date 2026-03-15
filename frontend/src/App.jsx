import React, { useState, useCallback, useRef } from 'react';
import Header from './components/Header';
import UploadForm from './components/UploadForm';
import ScoreGauge from './components/ScoreGauge';
import ScoreBreakdown from './components/ScoreBreakdown';
import Suggestions from './components/Suggestions';
import RewriteView from './components/RewriteView';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const API_URL = 'http://localhost:8000';

export default function App() {
  const [state, setState] = useState('upload');
  const [result, setResult] = useState(null);
  const [rewriteData, setRewriteData] = useState(null);
  const [error, setError] = useState(null);

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
    <div className="min-h-screen">
      <Header />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* Upload State */}
        {state === 'upload' && (
          <div className="animate-fade-in-up">
            {/* Hero */}
            <div className="mb-10 text-center">
              <h1 className="mb-3 bg-gradient-to-b from-white to-white/60 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent sm:text-4xl lg:text-5xl">
                Match Your Resume to
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Any Job
                </span>
              </h1>
              <p className="mx-auto max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                Upload your resume and paste the job description to get an instant ATS
                compatibility score with AI-powered suggestions to boost your chances.
              </p>
            </div>

            {/* Error */}
            {error && (
              <Alert variant="destructive" className="mb-6 border-red-500/20 bg-red-500/5">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <UploadForm onAnalyze={handleAnalyze} isLoading={false} />
          </div>
        )}

        {/* Loading State */}
        {state === 'loading' && (
          <div className="animate-fade-in flex flex-col items-center justify-center gap-5 py-20">
            <div className="loading-spinner" />
            <div className="text-center">
              <div className="text-base font-medium text-foreground">
                Analyzing your resume...
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                Comparing keywords, scoring sections, and generating AI suggestions
              </div>
            </div>
          </div>
        )}

        {/* Rewriting State */}
        {state === 'rewriting' && (
          <div className="animate-fade-in flex flex-col items-center justify-center gap-5 py-20">
            <div className="loading-spinner" />
            <div className="text-center">
              <div className="text-base font-medium text-foreground">
                Rewriting your resume...
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                AI is crafting an optimized version of your resume tailored to this job description
              </div>
            </div>
          </div>
        )}

        {/* Results State */}
        {state === 'results' && result && (
          <div className="animate-fade-in-up">
            <Button
              variant="outline"
              onClick={handleBack}
              className="mb-6 cursor-pointer border-white/[0.1] bg-white/[0.04] text-sm font-medium text-foreground transition-all duration-300 hover:border-indigo-500/30 hover:bg-indigo-500/10 hover:text-indigo-300 hover:shadow-[0_0_15px_rgba(99,102,241,0.15)]"
            >
              Analyze Another Resume
            </Button>

            {error && (
              <Alert variant="destructive" className="mb-6 border-red-500/20 bg-red-500/5">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <ScoreGauge
              score={result.overall_score}
              status={result.status}
              summary={result.summary}
            />

            {/* Rewrite Button */}
            {result.overall_score < 75 && (
              <div className="mb-8 text-center">
                <Button
                  onClick={handleRewrite}
                  className="cursor-pointer border-0 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 px-10 text-base font-bold tracking-wide text-white shadow-[0_0_30px_rgba(16,185,129,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_40px_rgba(20,184,166,0.5)] active:translate-y-0"
                  size="lg"
                >
                  Rewrite My Resume with AI
                </Button>
                <p className="mt-2 text-xs text-muted-foreground">
                  AI will rewrite your entire resume to match this job description
                </p>
              </div>
            )}

            <ScoreBreakdown sectionScores={result.section_scores} />

            {result.suggestions && result.suggestions.length > 0 && (
              <Suggestions suggestions={result.suggestions} />
            )}
          </div>
        )}

        {/* Rewrite View State */}
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

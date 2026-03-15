import React, { useRef, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export default function UploadForm({ onAnalyze, isLoading }) {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith('.pdf') || droppedFile.name.endsWith('.docx'))) {
      setFile(droppedFile);
    }
  }, []);

  const handleFileSelect = useCallback((e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  }, []);

  const handleRemoveFile = useCallback((e) => {
    e.stopPropagation();
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleSubmit = useCallback(() => {
    if (file && jobDescription.trim().length >= 20) {
      onAnalyze(file, jobDescription);
    }
  }, [file, jobDescription, onAnalyze]);

  const isReady = file && jobDescription.trim().length >= 20;

  return (
    <div className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        {/* Resume Upload Card */}
        <Card className="glass-card border-white/[0.06] bg-white/[0.03] transition-all duration-300 hover:border-white/[0.1] hover:bg-white/[0.05]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Upload Resume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`
                group relative cursor-pointer rounded-xl border-2 border-dashed p-8 text-center
                transition-all duration-300
                ${isDragging
                  ? 'border-blue-500 bg-blue-500/5 shadow-[inset_0_0_20px_rgba(79,125,249,0.08)]'
                  : file
                    ? 'border-green-500/50 bg-green-500/5'
                    : 'border-white/[0.08] hover:border-blue-500/40 hover:bg-blue-500/[0.03]'
                }
              `}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileSelect}
                className="hidden"
              />
              {file ? (
                <div className="flex items-center justify-center gap-2">
                  <span className="font-semibold text-green-400">{file.name}</span>
                  <button
                    onClick={handleRemoveFile}
                    className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500/15 text-xs text-red-400 transition-colors hover:bg-red-500/30"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <>
                  <span className="mb-3 block transition-transform duration-300 group-hover:scale-110">
                    <svg className="mx-auto h-10 w-10 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
                  </span>
                  <div className="text-sm text-muted-foreground">
                    <strong className="text-blue-400">Click to upload</strong> or drag & drop
                  </div>
                  <div className="mt-1.5 text-xs text-muted-foreground/60">
                    PDF or DOCX • Max 10MB
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Job Description Card */}
        <Card className="glass-card border-white/[0.06] bg-white/[0.03] transition-all duration-300 hover:border-white/[0.1] hover:bg-white/[0.05]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              Job Description
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder={"Paste the job description here...\n\nInclude the full job posting with responsibilities, requirements, and qualifications for the most accurate analysis."}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="min-h-[200px] resize-y border-white/[0.08] bg-transparent text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/50 focus-visible:border-blue-500/50 focus-visible:ring-blue-500/20"
            />
          </CardContent>
        </Card>
      </div>

      {/* Analyze Button */}
      <Button
        onClick={handleSubmit}
        disabled={!isReady || isLoading}
        className="h-13 w-full cursor-pointer rounded-xl border-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-base font-bold tracking-wide text-white shadow-[0_0_30px_rgba(99,102,241,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_40px_rgba(139,92,246,0.5)] active:translate-y-0 disabled:opacity-40 disabled:shadow-none"
        size="lg"
      >
        {isLoading ? (
          <>Analyzing...</>
        ) : (
          <>Analyze Resume</>
        )}
      </Button>
    </div>
  );
}

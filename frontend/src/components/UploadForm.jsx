import React, { useRef, useState, useCallback } from 'react';

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
    <div>
      <div className="upload-form">
        {/* Resume Upload */}
        <div className="upload-card">
          <h3 className="upload-card__title">
            <span className="upload-card__title-icon">📄</span>
            Upload Resume
          </h3>
          <div
            className={`dropzone ${isDragging ? 'dropzone--active' : ''} ${file ? 'dropzone--has-file' : ''}`}
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
              style={{ display: 'none' }}
            />
            {file ? (
              <div className="dropzone__file-name">
                ✅ {file.name}
                <button className="dropzone__file-remove" onClick={handleRemoveFile}>✕</button>
              </div>
            ) : (
              <>
                <span className="dropzone__icon">📁</span>
                <div className="dropzone__text">
                  <strong>Click to upload</strong> or drag & drop
                </div>
                <div className="dropzone__formats">PDF or DOCX • Max 10MB</div>
              </>
            )}
          </div>
        </div>

        {/* Job Description */}
        <div className="upload-card">
          <h3 className="upload-card__title">
            <span className="upload-card__title-icon">💼</span>
            Job Description
          </h3>
          <textarea
            className="jd-textarea"
            placeholder="Paste the job description here... &#10;&#10;Include the full job posting with responsibilities, requirements, and qualifications for the most accurate analysis."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
        </div>
      </div>

      <button
        className="analyze-btn"
        onClick={handleSubmit}
        disabled={!isReady || isLoading}
      >
        {isLoading ? (
          <>⏳ Analyzing...</>
        ) : (
          <>🔍 Analyze Resume</>
        )}
      </button>
    </div>
  );
}

import React from 'react';

export default function Header() {
  return (
    <header className="header">
      <div className="header__logo">
        <div className="header__icon">🎯</div>
        <div>
          <div className="header__title">AI Job Matcher</div>
          <div className="header__subtitle">ATS Resume Analyzer</div>
        </div>
      </div>
    </header>
  );
}

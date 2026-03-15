import React from 'react';
import { Badge } from '@/components/ui/badge';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-background/60 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          {/* Logo icon */}
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/20">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          </div>
          <div>
            <h1 className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-lg font-bold tracking-tight text-transparent">
              AI Job Matcher
            </h1>
            <p className="text-[0.65rem] font-medium tracking-wider text-muted-foreground uppercase">
              ATS Resume Analyzer
            </p>
          </div>
        </div>

        <Badge variant="outline" className="hidden border-purple-500/30 text-purple-400 sm:inline-flex">
          AI-Powered
        </Badge>
      </div>
    </header>
  );
}

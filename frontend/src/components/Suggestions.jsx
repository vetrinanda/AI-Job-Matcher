import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';

function SuggestionCard({ suggestion, index }) {
  const [isOpen, setIsOpen] = useState(false);

  const getSectionIcon = () => {
    return null;
  };

  return (
    <Card
      className={`animate-fade-in-up border-white/[0.06] bg-white/[0.03] transition-all duration-300 hover:border-white/[0.1]`}
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <button className="flex w-full cursor-pointer items-center justify-between p-4 text-left transition-colors hover:bg-white/[0.03]">
            <span className="flex items-center gap-2 text-sm font-semibold">
              {suggestion.section_name}
            </span>
            <span
              className={`text-xs text-muted-foreground transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
            >
              ▼
            </span>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="border-t border-white/[0.06] pt-4">
            {/* Current Assessment */}
            <div className="mb-4 rounded-lg border-l-3 border-amber-500/60 bg-amber-500/5 px-4 py-3">
              <p className="text-sm leading-relaxed text-muted-foreground">
                <strong className="text-amber-400">Current Issue: </strong>
                {suggestion.current_assessment}
              </p>
            </div>

            {/* Suggestion */}
            <p className="mb-4 text-sm leading-relaxed text-foreground">
              <strong>Suggestion:</strong> {suggestion.suggestion}
            </p>

            {/* Keywords to Add */}
            {suggestion.keywords_to_add?.length > 0 && (
              <div className="mb-4">
                <span className="mb-2 block text-xs font-semibold text-muted-foreground">
                  Keywords to Add
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {suggestion.keywords_to_add.map((kw, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className="border-blue-500/20 bg-blue-500/10 text-xs text-blue-400"
                    >
                      {kw}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Example Text */}
            {suggestion.example_text && (
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
                <div className="mb-2 text-[0.65rem] font-bold tracking-wider text-purple-400 uppercase">
                  Example Rewrite
                </div>
                <div className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                  {suggestion.example_text}
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

export default function Suggestions({ suggestions }) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="animate-fade-in-up delay-400">
      <h2 className="mb-2 flex items-center gap-2 text-lg font-bold">
        Improvement Suggestions
      </h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Your ATS score is below 75. Here are AI-powered suggestions to improve each section of your resume:
      </p>
      <div className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <SuggestionCard key={index} suggestion={suggestion} index={index} />
        ))}
      </div>
    </div>
  );
}

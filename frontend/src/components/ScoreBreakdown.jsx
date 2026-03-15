import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ScoreBreakdown({ sectionScores }) {
  const getBarColor = (score) => {
    if (score >= 75) return 'from-green-500 to-cyan-400';
    if (score >= 50) return 'from-amber-500 to-orange-400';
    return 'from-red-500 to-orange-500';
  };

  const getScoreColor = (score) => {
    if (score >= 75) return 'text-green-400';
    if (score >= 50) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <div className="animate-fade-in-up delay-200 mb-8">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
        Section Breakdown
      </h2>

      <div className="grid gap-3 sm:grid-cols-2">
        {sectionScores.map((section, index) => (
          <Card
            key={index}
            className="border-white/[0.06] bg-white/[0.03] transition-all duration-300 hover:border-white/[0.1] hover:bg-white/[0.05]"
          >
            <CardContent className="p-4">
              {/* Header */}
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold">{section.section_name}</span>
                <span className={`text-sm font-bold ${getScoreColor(section.score)}`}>
                  {section.score}%
                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                    (wt: {section.max_weight}%)
                  </span>
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className={`h-full rounded-full bg-gradient-to-r transition-all duration-1000 ease-out ${getBarColor(section.score)}`}
                  style={{ width: `${section.score}%` }}
                />
              </div>

              {/* Keywords */}
              {section.matched_keywords?.length > 0 && (
                <div className="mb-2">
                  <span className="mb-1 block text-[0.65rem] font-semibold tracking-wider text-muted-foreground/60 uppercase">
                    Matched
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {section.matched_keywords.slice(0, 8).map((kw, i) => (
                      <Badge
                        key={i}
                        variant="outline"
                        className="border-green-500/20 bg-green-500/10 text-[0.65rem] text-green-400"
                      >
                        {kw}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {section.missing_keywords?.length > 0 && (
                <div>
                  <span className="mb-1 block text-[0.65rem] font-semibold tracking-wider text-muted-foreground/60 uppercase">
                    Missing
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {section.missing_keywords.slice(0, 8).map((kw, i) => (
                      <Badge
                        key={i}
                        variant="outline"
                        className="border-red-500/15 bg-red-500/10 text-[0.65rem] text-red-400"
                      >
                        {kw}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

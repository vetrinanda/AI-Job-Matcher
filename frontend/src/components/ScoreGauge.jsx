import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ScoreGauge({ score, status, summary }) {
  const [animatedScore, setAnimatedScore] = useState(0);

  const radius = 80;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const duration = 1500;
    const start = performance.now();

    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
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
    if (score >= 80) return '#22c55e';
    if (score >= 65) return '#22d3ee';
    if (score >= 45) return '#f59e0b';
    return '#ef4444';
  };

  const getStatusStyle = () => {
    if (score >= 80) return 'border-green-500/30 bg-green-500/10 text-green-400';
    if (score >= 65) return 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400';
    if (score >= 45) return 'border-amber-500/30 bg-amber-500/10 text-amber-400';
    return 'border-red-500/30 bg-red-500/10 text-red-400';
  };

  const color = getScoreColor();

  return (
    <div className="animate-fade-in-up mb-8 text-center">
      <Card className="mx-auto max-w-md border-white/[0.06] bg-white/[0.02]">
        <CardContent className="flex flex-col items-center py-8">
          {/* SVG Gauge */}
          <div className="relative mb-6 h-[200px] w-[200px]">
            <svg
              className="h-[200px] w-[200px] -rotate-90"
              viewBox="0 0 200 200"
            >
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
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl font-extrabold tracking-tight"
              style={{ color }}
            >
              {animatedScore}
            </div>
            <div className="absolute top-[62%] left-1/2 -translate-x-1/2 text-[0.7rem] font-semibold tracking-widest text-muted-foreground uppercase">
              ATS Score
            </div>
          </div>

          {/* Status Badge */}
          <Badge
            variant="outline"
            className={`mb-3 px-4 py-1 text-sm font-bold ${getStatusStyle()}`}
          >
            {status}
          </Badge>

          {/* Summary */}
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            {summary}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

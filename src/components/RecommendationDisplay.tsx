'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Lightbulb, Shirt } from 'lucide-react';

interface RecommendationDisplayProps {
  recommendation: string | null;
  isLoading: boolean;
}

const RecommendationDisplay: React.FC<RecommendationDisplayProps> = ({ recommendation, isLoading }) => {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Lightbulb className="text-primary" /> Outfit Recommendation
        </CardTitle>
        <CardDescription>Here's what we suggest based on your input.</CardDescription>
      </CardHeader>
      <CardContent className="min-h-[100px]">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ) : recommendation ? (
          <p className="text-foreground whitespace-pre-wrap leading-relaxed">{recommendation}</p>
        ) : (
          <div className="flex flex-col items-center justify-center text-muted-foreground italic py-6 space-y-2">
            <Shirt size={32} />
            <p>Your outfit recommendation will appear here once generated.</p>
            <p className="text-xs">Make sure you've added clothes, set your mood, and selected the weather.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecommendationDisplay;

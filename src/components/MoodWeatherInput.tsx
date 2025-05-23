'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { WeatherOption } from '@/lib/definitions';
import { Smile, Cloud } from 'lucide-react';

interface MoodWeatherInputProps {
  mood: string;
  onMoodChange: (mood: string) => void;
  selectedWeather: string;
  onWeatherChange: (weather: string) => void;
  weatherOptions: WeatherOption[];
}

const MoodWeatherInput: React.FC<MoodWeatherInputProps> = ({
  mood,
  onMoodChange,
  selectedWeather,
  onWeatherChange,
  weatherOptions,
}) => {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl">Set Your Context</CardTitle>
        <CardDescription>Tell us your mood and the current weather to get the best outfit recommendations.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="mood-input" className="flex items-center gap-2 font-medium">
            <Smile size={18} className="text-primary" />
            Your Current Mood
          </Label>
          <Input
            id="mood-input"
            type="text"
            placeholder="e.g., Relaxed, Energetic, Formal"
            value={mood}
            onChange={(e) => onMoodChange(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">Enter a few keywords describing your mood.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="weather-select" className="flex items-center gap-2 font-medium">
            <Cloud size={18} className="text-primary" />
            Current Weather
          </Label>
          <Select value={selectedWeather} onValueChange={onWeatherChange}>
            <SelectTrigger id="weather-select" className="w-full">
              <SelectValue placeholder="Select weather condition" />
            </SelectTrigger>
            <SelectContent>
              {weatherOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    {option.icon && React.createElement(option.icon, { size: 16, className: "text-muted-foreground" })}
                    {option.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">Select the weather that best describes current conditions.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MoodWeatherInput;

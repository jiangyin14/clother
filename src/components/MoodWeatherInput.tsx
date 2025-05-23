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
        <CardTitle className="text-xl">设置你的场景</CardTitle>
        <CardDescription>告诉我们你的心情和当前天气，以获取最佳服装推荐。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="mood-input" className="flex items-center gap-2 font-medium">
            <Smile size={18} className="text-primary" />
            你当前的心情
          </Label>
          <Input
            id="mood-input"
            type="text"
            placeholder="例如：轻松、活力、正式"
            value={mood}
            onChange={(e) => onMoodChange(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">输入几个描述你心情的关键词。</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="weather-select" className="flex items-center gap-2 font-medium">
            <Cloud size={18} className="text-primary" />
            当前天气
          </Label>
          <Select value={selectedWeather} onValueChange={onWeatherChange}>
            <SelectTrigger id="weather-select" className="w-full">
              <SelectValue placeholder="选择天气状况" />
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
          <p className="text-xs text-muted-foreground">选择最能描述当前状况的天气。</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MoodWeatherInput;

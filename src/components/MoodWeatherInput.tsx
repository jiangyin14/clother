'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { WeatherOption, MoodOption } from '@/lib/definitions';
import { Cloud } from 'lucide-react'; // Smile icon removed as individual mood icons are used

interface MoodWeatherInputProps {
  selectedMoods: string[];
  onMoodSelectionChange: (moods: string[]) => void;
  selectedWeather: string;
  onWeatherChange: (weather: string) => void;
  weatherOptions: WeatherOption[];
  moodOptions: MoodOption[];
}

const MoodWeatherInput: React.FC<MoodWeatherInputProps> = ({
  selectedMoods,
  onMoodSelectionChange,
  selectedWeather,
  onWeatherChange,
  weatherOptions,
  moodOptions,
}) => {
  const handleMoodButtonClick = (moodValue: string) => {
    const newSelectedMoods = selectedMoods.includes(moodValue)
      ? selectedMoods.filter((m) => m !== moodValue)
      : [...selectedMoods, moodValue];
    onMoodSelectionChange(newSelectedMoods);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl">设置你的场景</CardTitle>
        <CardDescription>告诉我们你的心情和当前天气，以获取最佳服装推荐。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label className="flex items-center gap-2 font-medium">
            {/* Using a generic mood icon or removing it as specific icons are on buttons */}
            {/* <Smile size={18} className="text-primary" /> */}
            你当前的心情
          </Label>
          <div className="flex flex-wrap gap-2 pt-1">
            {moodOptions.map((option) => (
              <Button
                key={option.value}
                variant={selectedMoods.includes(option.value) ? 'default' : 'outline'}
                onClick={() => handleMoodButtonClick(option.value)}
                size="sm"
                className="capitalize"
              >
                {option.icon && React.createElement(option.icon, { size: 16, className: "mr-1.5" })}
                {option.label}
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">选择一个或多个描述你心情的关键词。</p>
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

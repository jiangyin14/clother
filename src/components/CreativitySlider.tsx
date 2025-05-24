
"use client";

import React from 'react';
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WandSparkles } from 'lucide-react';

interface CreativitySliderProps {
  value: number;
  onValueChange: (value: number) => void;
  disabled?: boolean;
}

const CreativitySlider: React.FC<CreativitySliderProps> = ({ value, onValueChange, disabled }) => {
  return (
    <Card className="shadow-lg rounded-xl">
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <WandSparkles className="mr-2 h-5 w-5 text-primary" />
          创意与开放程度
        </CardTitle>
        <CardDescription>
          调整滑块来设定推荐的创意水平。1表示非常保守，10表示非常大胆和新颖。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center mb-2">
            <Label htmlFor="creativity-slider" className="text-sm font-medium">
              当前选择: <span className="font-bold text-primary">{value}</span> / 10
            </Label>
            <span className="text-xs text-muted-foreground">(提示: AI将基于1-15的范围理解此值)</span>
          </div>
          <Slider
            id="creativity-slider"
            min={1}
            max={10}
            step={1}
            value={[value]}
            onValueChange={(newValue) => onValueChange(newValue[0])}
            disabled={disabled}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>保守</span>
            <span>平衡</span>
            <span>大胆</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreativitySlider;

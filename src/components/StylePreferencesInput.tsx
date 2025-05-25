
"use client";

import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { STYLE_PREFERENCES_OPTIONS } from '@/lib/constants';
import type { StylePreferenceOption } from '@/lib/definitions';

interface StylePreferencesInputProps {
  selectedPreferences: string[];
  onPreferenceChange: (preferenceId: string, checked: boolean) => void;
  disabled?: boolean;
}

const StylePreferencesInput: React.FC<StylePreferencesInputProps> = ({
  selectedPreferences,
  onPreferenceChange,
  disabled,
}) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">穿衣偏好 (可多选)</Label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
        {STYLE_PREFERENCES_OPTIONS.map((option: StylePreferenceOption) => (
          <div key={option.id} className="flex items-center space-x-2">
            <Checkbox
              id={`style-${option.id}`}
              name="stylePreferences"
              value={option.id}
              checked={selectedPreferences.includes(option.id)}
              onCheckedChange={(checked) => onPreferenceChange(option.id, !!checked)}
              disabled={disabled}
            />
            <Label htmlFor={`style-${option.id}`} className="font-normal cursor-pointer text-sm sm:text-base">
              {option.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StylePreferencesInput;

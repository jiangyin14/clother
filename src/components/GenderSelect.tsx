
"use client";

import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GENDER_OPTIONS } from '@/lib/constants';
import type { GenderOption } from '@/lib/definitions';

interface GenderSelectProps {
  value?: string | null;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

const GenderSelect: React.FC<GenderSelectProps> = ({ value, onValueChange, disabled }) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="gender">性别</Label>
      <Select
        name="gender"
        value={value || ""}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectTrigger id="gender">
          <SelectValue placeholder="请选择您的性别" />
        </SelectTrigger>
        <SelectContent>
          {GENDER_OPTIONS.map((option: GenderOption) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default GenderSelect;


"use client";

import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface AgeInputProps {
  value?: number | string | null; // Allow string for form input
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  error?: string;
}

const AgeInput: React.FC<AgeInputProps> = ({ value, onChange, disabled, error }) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="age">年龄</Label>
      <Input
        id="age"
        name="age"
        type="number"
        placeholder="请输入您的年龄"
        value={value === null || value === undefined ? '' : String(value)}
        onChange={onChange}
        disabled={disabled}
        min="1"
        max="120"
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};

export default AgeInput;

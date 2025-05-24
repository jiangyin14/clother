
export interface User {
  id: number;
  username: string;
  gender?: string | null;
  age?: number | null;
  style_preferences?: string[] | null;
  skinTone?: string | null; // 新增：肤色
  weight?: number | null;   // 新增：体重 (kg)
  oobe_completed?: boolean;
}

export interface ClothingItem {
  id: string; 
  name: string;
  imageUrl: string; 
  attributes: string[];
  isDefault?: boolean;
  user_id?: number; 
  created_at?: string; 
}

export interface WeatherOption {
  value: string;
  label: string;
  icon?: React.ElementType;
}

export interface MoodOption {
  value: string;
  label: string;
  icon?: React.ElementType; 
}

export interface ExplorableItem {
  id: string;
  name: string;
  description: string;
  category: string; 
}

export type AuthFormState = {
  message?: string;
  errors?: {
    username?: string[];
    password?: string[];
    confirmPassword?: string[]; 
    captchaToken?: string[];
  };
  success?: boolean;
};

export type ProfileFormState = {
  message?: string;
  errors?: {
    gender?: string[];
    age?: string[];
    stylePreferences?: string[];
    skinTone?: string[]; // 新增
    weight?: string[];   // 新增
    general?: string[]; 
  };
  success?: boolean;
  user?: User | null; 
};

export interface GenderOption {
  value: string;
  label: string;
}

export interface StylePreferenceOption {
  id: string;
  label: string;
}

// AI Flow related types
export interface RecommendClothingOutput {
  recommendedOutfit: string;
  imagePromptDetails?: string; 
}

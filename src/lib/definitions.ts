
export interface User {
  id: number;
  username: string;
  gender?: string | null;
  age?: number | null;
  style_preferences?: string[] | null;
  skinTone?: string | null;
  weight?: number | null;
  height?: number | null;
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
  oobe_completed?: boolean; // Added for login success state
};

export type ProfileFormState = {
  message?: string;
  errors?: {
    gender?: string[];
    age?: string[];
    stylePreferences?: string[];
    skinTone?: string[];
    weight?: string[];
    height?: string[];
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
  error?: string; // Added to handle cases like empty closet
}

export interface SharedOutfit {
  id: number;
  user_id: number;
  username: string;
  user_gender: string | null;
  user_age: number | null;
  mood_keywords: string | null;       // 新增
  weather_information: string | null; // 新增
  outfit_description: string;
  image_data_uri: string;
  created_at: string;
}

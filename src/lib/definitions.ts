
export interface User {
  id: number;
  username: string;
  gender?: string | null;
  age?: number | null;
  style_preferences?: string[] | null;
  oobe_completed?: boolean;
  // password_hash should not be exposed to client
}

export interface ClothingItem {
  id: string; // client-generated or from DB
  name: string;
  imageUrl: string; // Can be data URI for uploaded, or URL for default/stored
  attributes: string[];
  isDefault?: boolean;
  user_id?: number; // Foreign key to users table
  created_at?: string; // Or Date
}

export interface WeatherOption {
  value: string;
  label: string;
  icon?: React.ElementType;
}

export interface MoodOption {
  value: string;
  label: string;
  icon?: React.ElementType; // Optional icon for moods
}

export interface ExplorableItem {
  id: string;
  name: string;
  description: string;
  category: string; // e.g., 'Top', 'Accessory', 'Outerwear'
}

// For server actions, it's good to define expected shapes for form data
export type AuthFormState = {
  message?: string;
  errors?: {
    username?: string[];
    password?: string[];
    confirmPassword?: string[]; // For registration
    turnstileToken?: string[];
  };
  success?: boolean;
};

export type ProfileFormState = {
  message?: string;
  errors?: {
    gender?: string[];
    age?: string[];
    stylePreferences?: string[];
    general?: string[]; // For general form errors
  };
  success?: boolean;
  user?: User | null; // To pass back updated user info if needed
};

export interface GenderOption {
  value: string;
  label: string;
}

export interface StylePreferenceOption {
  id: string;
  label: string;
}

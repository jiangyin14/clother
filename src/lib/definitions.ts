
export interface User {
  id: number;
  username: string;
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
  };
  success?: boolean;
};

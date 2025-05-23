export interface ClothingItem {
  id: string;
  imageUrl: string; // Can be data URI for uploaded, or URL for default
  attributes: string[];
  name: string; // e.g., "Blue T-shirt", "Default Jeans"
  isDefault?: boolean;
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

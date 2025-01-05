// Sorting options
export type SortOption = 'title' | 'artist' | 'bpm' | 'releaseYear' | 'genre' | 'mood' | 'duration' | 'popularity';
export type SortDirection = 'asc' | 'desc';

// Filter options
export interface FilterOptions {
  genre?: string;
  mood?: string;
  key?: string;
  bpmRange?: [number, number];
  releaseYearRange?: [number, number];
  difficultyLevel?: number;
  instrument?: string;
  vocalTechnique?: string;
  themes?: string[];
  isCover?: boolean;
  isInstrumental?: boolean;
}

// Search suggestion interface
export interface SearchSuggestion {
  query: string;
  type: 'song' | 'artist' | 'album';
  id: string;
} 
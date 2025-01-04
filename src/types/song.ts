export type Song = {
  id: string
  title: string
  artist: string
  coverUrl: string
  bpm: number
  key: string
  genre: string
  mood: string
  duration: string
  releaseYear: number
}

export type SortOption = 'title' | 'artist' | 'bpm' | 'releaseYear'
export type SortDirection = 'asc' | 'desc'

export type FilterOptions = {
  genre?: string
  mood?: string
  key?: string
}
export type MediaType = 'movie' | 'tv';

export interface Genre {
  id: number;
  name: string;
}

export interface MediaItem {
  id: number;
  title: string; // Movie title or TV name
  name?: string; // TV name fallback
  overview: string;
  poster_path: string;
  backdrop_path: string;
  media_type: MediaType;
  release_date?: string; // Movie release date
  first_air_date?: string; // TV first air date
  vote_average: number;
  vote_count: number;
  genres?: Genre[];
  runtime?: number; // Movie runtime
  episode_run_time?: number[]; // TV episode runtimes
  number_of_seasons?: number;
  number_of_episodes?: number;
  tagline?: string;
}

export interface Episode {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  season_number: number;
  still_path: string;
  air_date?: string;
  vote_average?: number;
}

export interface SeasonDetails {
  id: number;
  name: string;
  overview: string;
  season_number: number;
  poster_path: string;
  episodes: Episode[];
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface VideoItem {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
}

export interface MediaDetailsResponse {
  info: MediaItem;
  cast: CastMember[];
  videos: VideoItem[];
  recommendations: MediaItem[];
}

export interface WatchProgress {
  id: number;
  media_type: MediaType;
  title: string;
  poster_path: string;
  season?: number;
  episode?: number;
  episodeName?: string;
  updatedAt: string;
}

export interface UserBookmark {
  id: number;
  media_type: MediaType;
  title: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  addedAt: string;
}

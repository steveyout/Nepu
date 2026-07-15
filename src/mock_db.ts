import { MediaItem, CastMember, VideoItem, Episode, SeasonDetails } from './types';

export const mockMovies: MediaItem[] = [
  {
    id: 693134,
    title: "Dune: Part Two",
    overview: "Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the known universe, he endeavors to prevent a terrible future only he can foresee.",
    poster_path: "https://image.tmdb.org/t/p/w500/czemb60Ggsci6gXgYcc9Yg76oIz.jpg",
    backdrop_path: "https://image.tmdb.org/t/p/original/xOM4Z660vS7uPK6gL92g60YJ26A.jpg",
    media_type: "movie",
    release_date: "2024-02-27",
    vote_average: 8.3,
    vote_count: 4850,
    tagline: "Long live the fighters.",
    genres: [
      { id: 12, name: "Adventure" },
      { id: 878, name: "Science Fiction" }
    ],
    runtime: 166
  },
  {
    id: 1022789,
    title: "Inside Out 2",
    overview: "Teenager Riley's mind headquarters is undergoing a sudden demolition to make room for something entirely unexpected: new Emotions! Joy, Sadness, Anger, Fear and Disgust, who’ve long been running a successful operation by all accounts, aren’t sure how to feel when Anxiety shows up. And it looks like she’s not alone.",
    poster_path: "https://image.tmdb.org/t/p/w500/vpnVM9B6m6X7gZ64oA0htZPLrst.jpg",
    backdrop_path: "https://image.tmdb.org/t/p/original/stKGOmXhjR46SVg8367zSsuIuSI.jpg",
    media_type: "movie",
    release_date: "2024-06-11",
    vote_average: 7.6,
    vote_count: 2320,
    tagline: "Make room for new emotions.",
    genres: [
      { id: 16, name: "Animation" },
      { id: 10751, name: "Family" },
      { id: 18, name: "Drama" },
      { id: 35, name: "Comedy" }
    ],
    runtime: 96
  },
  {
    id: 533535,
    title: "Deadpool & Wolverine",
    overview: "A listless Wade Wilson toils in civilian life with his days as the morally flexible mercenary, Deadpool, behind him. But when his homeworld faces an existential threat, he must reluctantly suit-up again with an even more reluctant... wolverine-ier... Wolverine.",
    poster_path: "https://image.tmdb.org/t/p/w500/8cdWv6Z789g76Y6gST8v6C6gWst.jpg",
    backdrop_path: "https://image.tmdb.org/t/p/original/yD19S8as86C6gSgAxg27mQ776Yv.jpg",
    media_type: "movie",
    release_date: "2024-07-24",
    vote_average: 7.8,
    vote_count: 3100,
    tagline: "LFG.",
    genres: [
      { id: 28, name: "Action" },
      { id: 35, name: "Comedy" },
      { id: 878, name: "Sci-Fi" }
    ],
    runtime: 127
  },
  {
    id: 872585,
    title: "Oppenheimer",
    overview: "The story of J. Robert Oppenheimer's role in the development of the atomic bomb during World War II.",
    poster_path: "https://image.tmdb.org/t/p/w500/8Gxv8gS681966VDgK7XTrjTYN8M.jpg",
    backdrop_path: "https://image.tmdb.org/t/p/original/m8bS07vY64UNv7Y76p9v7g60YJz.jpg",
    media_type: "movie",
    release_date: "2023-07-19",
    vote_average: 8.1,
    vote_count: 8400,
    tagline: "The world forever changes.",
    genres: [
      { id: 18, name: "Drama" },
      { id: 36, name: "History" }
    ],
    runtime: 180
  },
  {
    id: 157336,
    title: "Interstellar",
    overview: "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.",
    poster_path: "https://image.tmdb.org/t/p/w500/gEU2Qv6g6gXgYcc9Yg76oIz1E5b.jpg",
    backdrop_path: "https://image.tmdb.org/t/p/original/xJHok76v76v76v76v76v76v76v.jpg",
    media_type: "movie",
    release_date: "2014-11-05",
    vote_average: 8.4,
    vote_count: 32000,
    tagline: "Mankind was born on Earth. It was never meant to die here.",
    genres: [
      { id: 12, name: "Adventure" },
      { id: 18, name: "Drama" },
      { id: 878, name: "Science Fiction" }
    ],
    runtime: 169
  },
  {
    id: 27205,
    title: "Inception",
    overview: "Cobb, a skilled thief who is absolute best in the dangerous art of extraction, steals valuable secrets from deep within the subconscious during the dream state, when the mind is at its most vulnerable. Cobb's rare ability has made him a coveted player in this treacherous new world of corporate espionage, but it has also made him an international fugitive.",
    poster_path: "https://image.tmdb.org/t/p/w500/l946uID789g76Y6gST8v6C6gWst.jpg",
    backdrop_path: "https://image.tmdb.org/t/p/original/s3TBrRGB19g76Y6gST8v6C6gWst.jpg",
    media_type: "movie",
    release_date: "2010-07-14",
    vote_average: 8.3,
    vote_count: 34000,
    tagline: "Your mind is the scene of the crime.",
    genres: [
      { id: 28, name: "Action" },
      { id: 878, name: "Science Fiction" },
      { id: 12, name: "Adventure" }
    ],
    runtime: 148
  }
];

export const mockShows: MediaItem[] = [
  {
    id: 1396,
    title: "Breaking Bad",
    name: "Breaking Bad",
    overview: "Walter White, a New Mexico chemistry teacher, diagnosed with Stage III cancer and given a prognosis of only two years left to live. He becomes filled with a sense of fearlessness and an unrelenting desire to secure his family's financial future at any cost as he enters the dangerous world of drugs and crime.",
    poster_path: "https://image.tmdb.org/t/p/w500/ztkUQv6g6gXgYcc9Yg76oIz1E5b.jpg",
    backdrop_path: "https://image.tmdb.org/t/p/original/tsRy63Mu06g8667u7560gIz1E5b.jpg",
    media_type: "tv",
    first_air_date: "2008-01-20",
    vote_average: 8.9,
    vote_count: 13000,
    tagline: "Change the equation.",
    genres: [
      { id: 18, name: "Drama" },
      { id: 80, name: "Crime" }
    ],
    number_of_seasons: 5,
    number_of_episodes: 62
  },
  {
    id: 94605,
    title: "Arcane",
    name: "Arcane",
    overview: "Amidst the escalating discord between the rich, utopian city of Piltover and the seedy, oppressed underground of Zaun, sisters Vi and Powder find themselves on opposing sides of a war over twisted technologies and clashing convictions.",
    poster_path: "https://image.tmdb.org/t/p/w500/fqld7QCCasXgYcc9Yg76oIz1E5b.jpg",
    backdrop_path: "https://image.tmdb.org/t/p/original/4Y667u7560gIz1E5bztkUQv6g6gXg.jpg",
    media_type: "tv",
    first_air_date: "2021-11-06",
    vote_average: 8.7,
    vote_count: 3800,
    tagline: "Every legend has a beginning.",
    genres: [
      { id: 16, name: "Animation" },
      { id: 10765, name: "Sci-Fi & Fantasy" },
      { id: 28, name: "Action" }
    ],
    number_of_seasons: 2,
    number_of_episodes: 18
  },
  {
    id: 66732,
    title: "Stranger Things",
    name: "Stranger Things",
    overview: "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.",
    poster_path: "https://image.tmdb.org/t/p/w500/49W046v76v76v76v76v76v76v76v.jpg",
    backdrop_path: "https://image.tmdb.org/t/p/original/56SsuIuSIstKGOmXhjR46SVg8367z.jpg",
    media_type: "tv",
    first_air_date: "2016-07-15",
    vote_average: 8.6,
    vote_count: 16500,
    tagline: "One summer can change everything.",
    genres: [
      { id: 10765, name: "Sci-Fi & Fantasy" },
      { id: 18, name: "Drama" }
    ],
    number_of_seasons: 4,
    number_of_episodes: 34
  },
  {
    id: 100088,
    title: "The Last of Us",
    name: "The Last of Us",
    overview: "Twenty years after modern civilization has been destroyed, Joel, a hardened survivor, is hired to smuggle Ellie, a 14-year-old girl, out of an oppressive quarantine zone. What starts as a small job soon becomes a brutal, heartbreaking journey, as they both must traverse the U.S. and depend on each other for survival.",
    poster_path: "https://image.tmdb.org/t/p/w500/uKVKSf6g6gXgYcc9Yg76oIz1E5b.jpg",
    backdrop_path: "https://image.tmdb.org/t/p/original/9i760gIz1E5bztkUQv6g6gXgYcc9.jpg",
    media_type: "tv",
    first_air_date: "2023-01-15",
    vote_average: 8.6,
    vote_count: 4500,
    tagline: "When you're lost in the darkness, look for the light.",
    genres: [
      { id: 18, name: "Drama" },
      { id: 10759, name: "Action & Adventure" }
    ],
    number_of_seasons: 1,
    number_of_episodes: 9
  }
];

export const mockAll: MediaItem[] = [...mockMovies, ...mockShows];

export const getMockCast = (id: number): CastMember[] => {
  return [
    { id: 1, name: "Timothée Chalamet", character: "Paul Atreides", profile_path: "https://image.tmdb.org/t/p/w185/8gS681966VDgK7XTrjTYN8M8Gxv.jpg" },
    { id: 2, name: "Zendaya", character: "Chani", profile_path: "https://image.tmdb.org/t/p/w185/681966VDgK7XTrjTYN8M8Gxv8Gxv.jpg" },
    { id: 3, name: "Rebecca Ferguson", character: "Lady Jessica Atreides", profile_path: "https://image.tmdb.org/t/p/w185/Ferguson8Gxv8gS681966VDgK7XTrj.jpg" },
    { id: 4, name: "Austin Butler", character: "Feyd-Rautha Harkonnen", profile_path: "https://image.tmdb.org/t/p/w185/Butler681966VDgK7XTrjTYN8M8Gxv.jpg" },
    { id: 5, name: "Florence Pugh", character: "Princess Irulan", profile_path: "https://image.tmdb.org/t/p/w185/Pugh681966VDgK7XTrjTYN8M8Gxv8Gxv.jpg" }
  ];
};

export const getMockVideos = (id: number): VideoItem[] => {
  return [
    { id: "1", key: "Way9Dexny3o", name: "Official Trailer", site: "YouTube", type: "Trailer" },
    { id: "2", key: "U2Qv6g6gXgY", name: "Teaser Trailer", site: "YouTube", type: "Teaser" }
  ];
};

export const getMockEpisodes = (showId: number, seasonNumber: number): Episode[] => {
  const episodes: Episode[] = [];
  const limit = showId === 1396 ? 7 : (showId === 94605 ? 9 : 8);
  for (let i = 1; i <= limit; i++) {
    episodes.push({
      id: showId * 1000 + seasonNumber * 100 + i,
      name: `Episode ${i}: The Journey Begins`,
      overview: `This is the detailed overview of episode ${i} of season ${seasonNumber}. Characters face major turning points as tension reaches its peak in this critical episode.`,
      episode_number: i,
      season_number: seasonNumber,
      still_path: "https://image.tmdb.org/t/p/w500/stKGOmXhjR46SVg8367zSsuIuSI.jpg",
      vote_average: 8.5 + (i * 0.1) > 10 ? 9.8 : 8.5 + (i * 0.1)
    });
  }
  return episodes;
};

export const getMockSeasonDetails = (showId: number, seasonNumber: number): SeasonDetails => {
  return {
    id: showId * 10 + seasonNumber,
    name: `Season ${seasonNumber}`,
    overview: `Season ${seasonNumber} continues the story with higher stakes, brand new challenges, and incredible characters driving the plot.`,
    season_number: seasonNumber,
    poster_path: "https://image.tmdb.org/t/p/w500/ztkUQv6g6gXgYcc9Yg76oIz1E5b.jpg",
    episodes: getMockEpisodes(showId, seasonNumber)
  };
};

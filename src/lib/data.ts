export interface Pairing {
  id: string;
  image_url: string;
  additional_images?: string[]; // Multiple photos for one fit
  image_credit: string | null;
  song_title: string;
  artist: string;
  spotify_url: string | null;
  preview_url: string | null;
  vibe: string;
  energy: number; // 0-1 (Y)
  tempo: number; // 0-1 (X)
  ghost_index: string;
  featured?: boolean;
}

export const MOCK_PAIRINGS: Pairing[] = [
  {
    id: "1",
    image_url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop",
    image_credit: "Unsplash",
    song_title: "Pink + White",
    artist: "Frank Ocean",
    spotify_url: "https://open.spotify.com/track/3AhXZa6o1vS99SstS6ZshY",
    preview_url: null,
    vibe: "cathedral light",
    energy: 0.2,
    tempo: 0.2,
    ghost_index: "01",
  },
  {
    id: "2",
    image_url: "https://images.unsplash.com/photo-1539109132314-34a77bc70fe2?q=80&w=1000&auto=format&fit=crop",
    image_credit: "Unsplash",
    song_title: "Bando",
    artist: "Anna",
    spotify_url: null,
    preview_url: null,
    vibe: "4am, still awake",
    energy: 0.8,
    tempo: 0.8,
    ghost_index: "02",
  },
  {
    id: "3",
    image_url: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000&auto=format&fit=crop",
    image_credit: "Unsplash",
    song_title: "Self Control",
    artist: "Frank Ocean",
    spotify_url: null,
    preview_url: null,
    vibe: "sunday, still",
    energy: 0.1,
    tempo: 0.3,
    ghost_index: "03",
  },
  {
    id: "4",
    image_url: "https://images.unsplash.com/photo-1529139513466-42040470554c?q=80&w=1000&auto=format&fit=crop",
    image_credit: "Unsplash",
    song_title: "HUMBLE.",
    artist: "Kendrick Lamar",
    spotify_url: null,
    preview_url: null,
    vibe: "borrowed jacket",
    energy: 0.9,
    tempo: 0.6,
    ghost_index: "04",
  },
];

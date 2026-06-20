export const SOCIAL_LINKS = {
  behance: "https://www.behance.net/lunagcezar",
  github: "https://github.com/lunagcezar",
  linkedin: "https://linkedin.com/in/lunagcezar/",
  bluesky: "https://bsky.app/profile/lunagcezar.bsky.social/",
  instagram: "https://instagram.com/lunagcezar/",
  artstation: "https://www.artstation.com/lunagcezar",
} as const satisfies Record<string, string>;

export const SOCIAL_LINK_TYPES = {
  behance: "social",
  github: "social",
  linkedin: "social",
  bluesky: "social",
  instagram: "social",
  artstation: "social",
} as const satisfies Record<string, string>;

export const SOCIAL_LINK_LABELS = {
  behance: "Behance",
  github: "GitHub",
  linkedin: "LinkedIn",
  bluesky: "Bluesky",
  instagram: "Instagram",
  artstation: "ArtStation",
} as const satisfies Record<string, string>;

export const SAME_AS_URLS = Object.values(SOCIAL_LINKS);

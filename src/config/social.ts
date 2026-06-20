export const SOCIAL_LINKS = [
  {
    id: "instagram",
    url: "https://instagram.com/lunagcezar/",
    label: "Instagram",
  },
  { id: "github", url: "https://github.com/lunagcezar", label: "GitHub" },
  {
    id: "linkedin",
    url: "https://linkedin.com/in/lunagcezar/",
    label: "LinkedIn",
  },
  {
    id: "bluesky",
    url: "https://bsky.app/profile/lunagcezar.bsky.social/",
    label: "Bluesky",
  },

  {
    id: "behance",
    url: "https://www.behance.net/lunagcezar",
    label: "Behance",
  },
  {
    id: "artstation",
    url: "https://www.artstation.com/lunagcezar",
    label: "ArtStation",
  },
] as const;

export const SAME_AS_URLS: string[] = SOCIAL_LINKS.map((s) => s.url);

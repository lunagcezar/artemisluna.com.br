export const SUPPORTED_LOCALES = ["en", "pt", "eo"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const translations: Record<string, Record<string, string>> = {
  en: {
    home: "Home",
    search: "Search",
    resume: "Resume",
    light: "Light",
    dark: "Dark",
    previous: "Previous",
    next: "Next",
    more: "More",
    latest: "Latest",
    art: "Art",
    blog: "Blog",
    wiki: "Wiki",
    writing: "Writing",
    page: "Page",
  },
  pt: {
    home: "Início",
    search: "Pesquisar",
    previous: "Anterior",
    next: "Próxima",
    more: "Mais",
    latest: "Últimos",
    blog: "Blog",
    wiki: "Wiki",
    art: "Arte",
    traditional: "Tradicional",
    digital: "Digital",
    "digital-painting": "Pintura digital",
    "urban-sketching": "Esboço urbano",
    "fictional-cityscapes": "Paisagens fictícias",
    "mixed-media": "Mídia mista",
    other: "Outro",
    "ui-design": "Design de UI",
    illustration: "Ilustração",
    painting: "Pintura",
    drawing: "Desenho",
    gouache: "Guache",
    "oil-pastel": "Pastel de óleo",
    ink: "Tinta",
    pencil: "Lápis",
    cityscape: "Paisagem urbana",
    desert: "Deserto",
    landscape: "Paisagem",
    portrait: "Retrato",
    sunset: "Pôr do sol",
    monochrome: "Monocromático",
    color: "Cor",
    colour: "Cor",
    line: "Linha",
    fictional: "Ficcional",
    sketchbook: "Esboçário",
    "still-life": "Natureza-morta",
    tutorial: "Tutorial",
    testing: "Testes",
    performance: "Desempenho",
    production: "Produção",
    productivity: "Produtividade",
    debugging: "Depuração",
    beginners: "Iniciantes",
    challenge: "Desafio",
    texture: "Textura",
    theming: "Tematização",
    "dark-mode": "Modo escuro",
    "container-queries": "Consultas de contêiner",
    responsive: "Responsivo",
    workflow: "Fluxo de trabalho",
    process: "Processo",
    "build-system": "Sistema de compilação",
    tooling: "Ferramentas",
    monorepo: "Monorrepositório",
    watercolour: "Aquarela",
    "front-end": "Front-end",
    frontend: "Frontend",
    "content-collections": "Coleções de conteúdo",
    ssg: "SSG",
    "ruby-on-rails": "Ruby on Rails",
    "ui-ux-design": "UI/UX Design",
    encryption: "Criptografia",
    networking: "Redes",
    programming: "Programação",
    linux: "Linux",
    ubuntu: "Ubuntu",
    windows: "Windows",
    cmake: "CMake",
    dll: "DLL",
    wifi: "Wi-Fi",
    tpm: "TPM",
    page: "Página",
    resume: "Currículo",
    light: "Claro",
    dark: "Escuro",
    writing: "Escritos",
    "social-networks": "Redes sociais",
  },
  eo: {
    home: "Hejmo",
    search: "Serĉi",
    previous: "Antaŭa",
    next: "Sekva",
    more: "Pli",
    latest: "Lastaj",
    blog: "Blog",
    wiki: "Vikio",
    page: "Paĝo",
    art: "Arto",
    traditional: "Tradicia",
    digital: "Cifereca",
    "digital-painting": "Cifereca pentrado",
    "urban-sketching": "Urba skizo",
    "fictional-cityscapes": "Fikciaj urbopejzaĝoj",
    "mixed-media": "Miksita amaskomunikilaro",
    other: "Alia",
    "ui-design": "UI-dezajno",
    illustration: "Ilustraĵo",
    painting: "Pentrado",
    drawing: "Desegno",
    gouache: "Guŝo",
    "oil-pastel": "Olepaŝtelo",
    ink: "Inko",
    pencil: "Krajono",
    cityscape: "Urbopejzaĝo",
    desert: "Dezerto",
    landscape: "Pejzaĝo",
    portrait: "Portreto",
    sunset: "Sunsubiro",
    monochrome: "Monokromata",
    color: "Koloro",
    colour: "Koloro",
    line: "Linio",
    fictional: "Fikcia",
    sketchbook: "Skizlibro",
    "still-life": "Naturo morta",
    tutorial: "Lernilo",
    testing: "Testado",
    performance: "Rendimento",
    production: "Produktado",
    productivity: "Produktiveco",
    debugging: "Senararigado",
    beginners: "Komencantoj",
    challenge: "Defio",
    texture: "Teksturo",
    theming: "Temigo",
    "dark-mode": "Malhela reĝimo",
    "container-queries": "Ujdemandoj",
    responsive: "Respondema",
    workflow: "Laborfluo",
    process: "Procezo",
    "build-system": "Konstrua sistemo",
    tooling: "Iloj",
    monorepo: "Monorepozitorio",
    watercolour: "Akvarelo",
    "front-end": "Front-end",
    frontend: "Frontend",
    "content-collections": "Enhavkolektoj",
    ssg: "SSG",
    "ruby-on-rails": "Ruby on Rails",
    "ui-ux-design": "UI/UX Design",
    encryption: "Ĉifrado",
    networking: "Retoj",
    programming: "Programado",
    linux: "Linukso",
    ubuntu: "Ubuntu",
    windows: "Vindozo",
    cmake: "CMake",
    dll: "DLL",
    wifi: "Wi-Fi",
    tpm: "TPM",
    resume: "Resumo",
    light: "Lumo",
    dark: "Malhela",
    writing: "Verkado",
    "social-networks": "Sociaj retoj",
  },
};

export function formatSegment(segment: string): string {
  return segment
    .replace(/-/g, " ")
    .replace(/\b[a-zA-Z]/g, (char) => char.toUpperCase());
}

export type TranslateLabel = (segment: string) => Record<string, string>;

export function createTranslateLabel(): TranslateLabel {
  return (segment: string) => {
    const labels: Record<string, string> = {};
    for (const locale of SUPPORTED_LOCALES) {
      labels[locale] =
        locale === "en"
          ? formatSegment(segment)
          : (translations[locale]?.[segment] ?? formatSegment(segment));
    }
    return labels;
  };
}

export function getCookieLocale(): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(/(?:^|;\s*)locale=([^;]*)/);
  return match?.[1];
}

export function getLocale(fallback: string = "en"): string {
  const saved = getCookieLocale();
  if (saved) return saved;
  if (typeof navigator === "undefined") return fallback;
  const lang = navigator.language.slice(0, 2);
  return lang;
}

export function applyLocale(locale: string): void {
  document.documentElement.lang = locale;
  document.querySelectorAll("[data-locales]").forEach((el) => {
    try {
      const labels = JSON.parse(el.getAttribute("data-locales") ?? "{}");
      if (labels[locale]) el.textContent = labels[locale];
    } catch {
      /* ignore parse errors */
    }
  });
  document.querySelectorAll("[data-locale-value]").forEach((el) => {
    el.textContent = locale.toUpperCase();
  });
  document.querySelectorAll("[data-content-locale]").forEach((el) => {
    if (el.getAttribute("data-content-locale") !== locale) {
      el.setAttribute("hidden", "");
    } else {
      el.removeAttribute("hidden");
    }
  });
}

export function t(key: string): string {
  return translations[getLocale()]?.[key] ?? translations.en?.[key] ?? key;
}

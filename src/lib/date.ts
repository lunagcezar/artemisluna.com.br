import { SUPPORTED_LOCALES } from "@i18n/labels";

const LOCALE_MAP: Record<string, string> = {
  en: "en-US",
  pt: "pt-BR",
  eo: "eo",
};

function isTimeZero(date: Date): boolean {
  return (
    date.getUTCHours() === 0 &&
    date.getUTCMinutes() === 0 &&
    date.getUTCSeconds() === 0 &&
    date.getUTCMilliseconds() === 0
  );
}

export function formatDateForLocales(date: Date): Record<string, string> {
  const hasTime = !isTimeZero(date);
  const opts: Intl.DateTimeFormatOptions = hasTime ? {} : { timeZone: "UTC" };
  const labels: Record<string, string> = {};
  for (const locale of SUPPORTED_LOCALES) {
    const localeStr = LOCALE_MAP[locale] ?? locale;
    labels[locale] = date.toLocaleDateString(localeStr, opts);
  }
  return labels;
}

import { formatSegment, type SidebarNode } from "./collections";
import {
  createTranslateLabel,
  translations,
  SUPPORTED_LOCALES,
} from "@i18n/labels";

export interface SidebarHelpers {
  getNodeLabels: (node: SidebarNode) => Record<string, string>;
  nodeIsActive: (node: SidebarNode) => boolean;
  nodeHasActiveDescendant: (node: SidebarNode) => boolean;
}

export function createSidebarHelpers(
  currentPath: string,
  collectionNames: string[],
): SidebarHelpers {
  const translate: Record<string, ReturnType<typeof createTranslateLabel>> = {};
  for (const name of collectionNames) {
    translate[name] = createTranslateLabel(name);
  }

  function getNodeLabels(node: SidebarNode): Record<string, string> {
    if (node.href === "/") {
      return { en: "Home", pt: translations.pt?.home ?? "Home" };
    }

    const firstSegment = node.href.split("/")[1];
    const isRoot =
      firstSegment === node.name && collectionNames.includes(node.name);

    if (isRoot) {
      const labels: Record<string, string> = {
        en: formatSegment(node.name),
      };
      for (const locale of SUPPORTED_LOCALES) {
        if (locale !== "en") {
          labels[locale] =
            translations[locale]?.[node.name] ?? formatSegment(node.name);
        }
      }
      return labels;
    }

    const t = translate[firstSegment];
    if (t) return t(node.name);

    return { en: formatSegment(node.name), pt: formatSegment(node.name) };
  }

  function nodeIsActive(node: SidebarNode): boolean {
    if (node.href === "/") return currentPath === "/";
    return currentPath.startsWith(node.href);
  }

  function nodeHasActiveDescendant(node: SidebarNode): boolean {
    return nodeIsActive(node) || node.children.some(nodeHasActiveDescendant);
  }

  return { getNodeLabels, nodeIsActive, nodeHasActiveDescendant };
}

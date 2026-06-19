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
    translate[name] = createTranslateLabel();
  }

  function getNodeLabels(node: SidebarNode): Record<string, string> {
    const labels: Record<string, string> = {};

    for (const locale of SUPPORTED_LOCALES) {
      if (node.href === "/") {
        labels[locale] = translations[locale]?.home ?? "Home";
      } else {
        const firstSegment = node.href.split("/")[1];
        const isRoot =
          firstSegment === node.name && collectionNames.includes(node.name);

        if (isRoot) {
          labels[locale] =
            translations[locale]?.[node.name] ?? formatSegment(node.name);
        } else {
          const t = translate[firstSegment];
          labels[locale] = t
            ? t(node.name)[locale]
            : (translations[locale]?.[node.name] ?? formatSegment(node.name));
        }
      }
    }

    return labels;
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

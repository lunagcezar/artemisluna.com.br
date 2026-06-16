export interface SelectMenuConfig {
  rootSelector: string;
  optionAttr: string;
  valueSelector?: string;
  initialValue: string;
  onSelect: (value: string) => void;
}

function openMenu(
  trigger: HTMLElement,
  content: HTMLElement,
  options: HTMLElement[],
): void {
  const rect = trigger.getBoundingClientRect();
  content.style.top = rect.bottom + 4 + "px";
  content.style.right = window.innerWidth - rect.right + "px";
  content.classList.remove("hidden");
  trigger.setAttribute("aria-expanded", "true");
  options[0]?.focus();
}

function closeMenu(trigger: HTMLElement, content: HTMLElement): void {
  content.classList.add("hidden");
  trigger.setAttribute("aria-expanded", "false");
  trigger.focus();
}

function selectOption(
  el: HTMLElement,
  optionAttr: string,
  options: HTMLElement[],
  trigger: HTMLElement,
  content: HTMLElement,
  onSelect: (value: string) => void,
  valueEl?: HTMLElement | null,
): void {
  const value = el.getAttribute(optionAttr)!;
  onSelect(value);
  if (valueEl) valueEl.textContent = value.toUpperCase();
  options.forEach((o) =>
    o.classList.toggle("font-bold", o.getAttribute(optionAttr) === value),
  );
  closeMenu(trigger, content);
}

function getActiveIndex(content: HTMLElement, options: HTMLElement[]): number {
  const active = content.querySelector(".font-bold") as HTMLElement | null;
  return active ? options.indexOf(active) : -1;
}

function focusAdjacent(
  direction: 1 | -1,
  content: HTMLElement,
  options: HTMLElement[],
): void {
  const idx = getActiveIndex(content, options);
  const next =
    direction === 1
      ? idx < options.length - 1
        ? idx + 1
        : 0
      : idx > 0
        ? idx - 1
        : options.length - 1;
  options[next]?.focus();
  options.forEach((o) => o.classList.remove("font-bold"));
  options[next]?.classList.add("font-bold");
}

export function initSelectMenus(config: SelectMenuConfig): void {
  document.querySelectorAll(config.rootSelector).forEach((root) => {
    const trigger = root.querySelector(":scope > button") as HTMLElement | null;
    const content = root.querySelector(
      ":scope > [role=menu]",
    ) as HTMLElement | null;
    const valueEl = config.valueSelector
      ? (root.querySelector(config.valueSelector) as HTMLElement | null)
      : null;
    if (!trigger || !content) return;

    const options = Array.from(
      content.querySelectorAll(`[${config.optionAttr}]`),
    ) as HTMLElement[];

    trigger.addEventListener("click", () => {
      if (content.classList.contains("hidden")) {
        openMenu(trigger, content, options);
      } else {
        closeMenu(trigger, content);
      }
    });

    trigger.addEventListener("keydown", (e: KeyboardEvent) => {
      if (
        e.key === "ArrowDown" ||
        e.key === "ArrowUp" ||
        e.key === "Enter" ||
        e.key === " "
      ) {
        e.preventDefault();
        openMenu(trigger, content, options);
      }
    });

    content.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        focusAdjacent(1, content, options);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        focusAdjacent(-1, content, options);
      } else if (e.key === "Escape") {
        closeMenu(trigger, content);
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const active = content.querySelector(
          ".font-bold",
        ) as HTMLElement | null;
        if (active) {
          selectOption(
            active,
            config.optionAttr,
            options,
            trigger,
            content,
            config.onSelect,
            valueEl,
          );
        }
      }
    });

    options.forEach((el) => {
      el.addEventListener("click", () =>
        selectOption(
          el,
          config.optionAttr,
          options,
          trigger,
          content,
          config.onSelect,
          valueEl,
        ),
      );
      el.addEventListener("mouseenter", () => {
        options.forEach((o) => o.classList.remove("font-bold"));
        el.classList.add("font-bold");
      });
    });

    document.addEventListener("click", (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (target && !root.contains(target)) {
        closeMenu(trigger, content);
      }
    });

    options.forEach((el) =>
      el.classList.toggle(
        "font-bold",
        el.getAttribute(config.optionAttr) === config.initialValue,
      ),
    );
  });
}

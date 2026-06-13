export function getPaginationRange(
  currentPage: number,
  totalPages: number,
  siblingCount = 1,
): Array<number | "ellipsis"> {
  const pages: number[] = [];

  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - siblingCount && i <= currentPage + siblingCount)
    ) {
      pages.push(i);
    }
  }

  const range: Array<number | "ellipsis"> = [];
  let previous: number | null = null;

  for (const page of pages) {
    if (previous !== null && page - previous > 1) {
      range.push("ellipsis");
    }
    range.push(page);
    previous = page;
  }

  return range;
}

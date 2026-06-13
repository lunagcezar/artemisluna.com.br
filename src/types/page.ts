export type PaginatedPage<T> = {
  data: T[];
  currentPage: number;
  lastPage: number;
  total: number;
  start: number;
  end: number;
  size: number;
};

export function killEvent(e: React.MouseEvent<unknown> | React.SyntheticEvent<HTMLElement, Event> | undefined): void {
  e?.preventDefault();
  e?.stopPropagation();
}

/**
 * Page size choices for a paginated table: the default sizes plus the current one, without duplicates,
 * in ascending order. A plain sort() would compare the numbers as strings (10, 100, 15, 30, 5).
 */
export function getPageSizeOptions(defaultSizes: number[], currentSize: number): number[] {
  return [...new Set([...defaultSizes, currentSize])].sort((a, b) => a - b);
}

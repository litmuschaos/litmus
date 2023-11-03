export function killEvent(e: React.MouseEvent<unknown> | React.SyntheticEvent<HTMLElement, Event> | undefined): void {
  e?.preventDefault();
  e?.stopPropagation();
}

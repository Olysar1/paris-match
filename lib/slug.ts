export function deriveSlug(link: string): string {
  const pathname = new URL(link).pathname;
  const lastSegment = pathname.split("/").filter(Boolean).pop() ?? "";
  const withoutExtension = lastSegment.replace(/\.html?$/i, "");
  const match = withoutExtension.match(/^(.*?)_(\d+)_\d+$/);
  if (match) {
    const [, text, id] = match;
    return `${text}-${id}`;
  }
  return withoutExtension;
}

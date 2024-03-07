export function cleanDomain(url: string): string {
  return url
    .replace(/^(?:https?:\/\/)?(?:www\.)?/, "") // Remove protocol and www
    .replace(/\/.*$/, ""); // Remove everything after the first slash
}

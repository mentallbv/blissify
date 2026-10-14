/** URL-safe slug, shared by the server (saving) and the course form (live address preview). */
export function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 70) || 'opleiding'
  )
}

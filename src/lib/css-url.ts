/**
 * Safe CSS `url()` for user-uploaded files. Filenames can contain spaces,
 * brackets or quotes ("Foto (1920px).jpg"); an unquoted url(...) ends at the
 * first ")" and the image silently fails to load.
 */
export function cssUrl(src: string): string {
  return `url("${src.replace(/["\\\n]/g, (c) => encodeURIComponent(c))}")`
}

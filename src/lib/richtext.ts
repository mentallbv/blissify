import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'
import { htmlToLexical as parseHtml } from '@/lib/richtext-html'

/** Tags the dashboard editor is allowed to produce. Everything else is stripped. */
const ALLOWED = /^(p|br|strong|b|em|i|u|h2|h3|h4|ul|ol|li|a|blockquote)$/i

/**
 * Removes anything the toolbar cannot produce. Pasted markup reaches this too,
 * so scripts, embeds and event handlers are dropped explicitly rather than
 * relying on the parser to ignore them.
 *
 * String-based on purpose: this runs in the serverless runtime, where a DOM
 * implementation cannot be loaded (see richtext-html.ts).
 */
function sanitize(html: string): string {
  return (html || '')
    // Drop dangerous elements together with their content.
    .replace(/<(script|style|iframe|object|embed|form|input)\b[\s\S]*?<\/\1\s*>/gi, '')
    .replace(/<(script|style|iframe|object|embed|form|input)\b[^>]*\/?>/gi, '')
    // Unwrap any tag outside the allowlist, keeping its text.
    .replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)((?:\s+[^<>]*?)?)\/?>/g, (match, tag: string, attrs: string) => {
      if (!ALLOWED.test(tag)) return ''
      if (match.startsWith('</')) return `</${tag.toLowerCase()}>`
      // Only <a href> survives; every other attribute is discarded.
      if (tag.toLowerCase() === 'a') {
        const href = /href\s*=\s*("([^"]*)"|'([^']*)')/i.exec(attrs || '')
        const url = (href?.[2] ?? href?.[3] ?? '').trim()
        return /^\s*javascript:/i.test(url) || !url ? '<a>' : `<a href="${url.replace(/"/g, '&quot;')}">`
      }
      return `<${tag.toLowerCase()}>`
    })
}

/** Dashboard HTML -> Lexical, preserving formatting instead of flattening to text. */
export function htmlToLexical(html: string) {
  return parseHtml(sanitize(html))
}

/**
 * Lexical -> HTML, to load existing content into the dashboard editor and to
 * render provider copy on public pages.
 */
export function lexicalToHtml(data: unknown): string {
  if (!data || typeof data !== 'object') return ''
  try {
    // The converter wraps output in <div class="payload-richtext">; drop it so
    // the editor's contenteditable holds only the content itself.
    return convertLexicalToHTML({ data: data as never }).replace(/^<div class="payload-richtext">([\s\S]*)<\/div>$/, '$1')
  } catch {
    return ''
  }
}

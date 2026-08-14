import { JSDOM } from 'jsdom'
import { convertHTMLToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'
import config from '@/payload.config'

/** Tags the dashboard editor is allowed to produce. Everything else is stripped. */
const ALLOWED = /^(p|br|strong|b|em|i|u|h2|h3|h4|ul|ol|li|a|blockquote)$/i

/**
 * Strips anything the toolbar cannot produce before conversion. convertHTMLToLexical
 * already drops nodes it has no mapping for, but pasted markup reaches this
 * function too, so scripts and event handlers are removed explicitly rather
 * than relying on that.
 */
function sanitize(html: string): string {
  const dom = new JSDOM(`<body>${html}</body>`)
  const { document } = dom.window

  document.body.querySelectorAll('script, style, iframe, object, embed, form, input').forEach((el) => el.remove())

  // Scoped to body: querySelectorAll('*') on the document would also match
  // html/head/body, which cannot be unwrapped.
  document.body.querySelectorAll('*').forEach((el) => {
    for (const attr of [...el.attributes]) {
      const name = attr.name.toLowerCase()
      const isSafeLink = el.tagName.toLowerCase() === 'a' && name === 'href' && !/^\s*javascript:/i.test(attr.value)
      if (!isSafeLink) el.removeAttribute(attr.name)
    }
    if (!ALLOWED.test(el.tagName)) {
      // Keep the text, drop the wrapper.
      el.replaceWith(...el.childNodes)
    }
  })

  return document.body.innerHTML
}

/** Dashboard HTML -> Lexical, preserving formatting instead of flattening to text. */
export async function htmlToLexical(html: string) {
  const editorConfig = await editorConfigFactory.default({ config: await config })
  return convertHTMLToLexical({ editorConfig, html: sanitize(html), JSDOM })
}

/** Lexical -> HTML, to load existing content into the dashboard editor. */
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

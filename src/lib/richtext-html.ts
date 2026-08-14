/**
 * HTML -> Lexical for the dashboard editor, with no DOM dependency.
 *
 * Payload ships convertHTMLToLexical, but it requires a JSDOM instance, and
 * jsdom cannot be loaded in the Vercel serverless runtime: it pulls an ESM-only
 * dependency that the runtime require()s, which throws ERR_REQUIRE_ESM. Since
 * RichTextEditor emits a small, known tag set, parsing it directly is both
 * safer to deploy and cheaper than shipping a DOM implementation.
 *
 * Anything outside the allowlist is unwrapped to its text content, so pasted
 * or hand-crafted markup cannot introduce nodes the editor never produces.
 */

type LexNode = Record<string, unknown>

// Lexical text format bitmask.
const BOLD = 1
const ITALIC = 2
const UNDERLINE = 8

const INLINE_FORMAT: Record<string, number> = {
  strong: BOLD,
  b: BOLD,
  em: ITALIC,
  i: ITALIC,
  u: UNDERLINE,
}

const BLOCK_TAGS = new Set(['p', 'h2', 'h3', 'h4', 'ul', 'ol', 'blockquote'])

type Token =
  | { kind: 'open'; tag: string; attrs: Record<string, string>; selfClosing: boolean }
  | { kind: 'close'; tag: string }
  | { kind: 'text'; text: string }

const VOID_TAGS = new Set(['br', 'img', 'hr', 'input', 'meta', 'link'])

function decodeEntities(text: string): string {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
}

function tokenize(html: string): Token[] {
  const tokens: Token[] = []
  const pattern = /<\/?([a-zA-Z][a-zA-Z0-9]*)((?:\s+[^<>]*?)?)\/?>/g
  let index = 0
  let match: RegExpExecArray | null

  while ((match = pattern.exec(html))) {
    if (match.index > index) tokens.push({ kind: 'text', text: html.slice(index, match.index) })
    const tag = match[1].toLowerCase()
    if (match[0].startsWith('</')) {
      tokens.push({ kind: 'close', tag })
    } else {
      const attrs: Record<string, string> = {}
      const attrPattern = /([a-zA-Z-]+)\s*=\s*"([^"]*)"|([a-zA-Z-]+)\s*=\s*'([^']*)'/g
      let attrMatch: RegExpExecArray | null
      while ((attrMatch = attrPattern.exec(match[2] || ''))) {
        attrs[(attrMatch[1] || attrMatch[3]).toLowerCase()] = attrMatch[2] ?? attrMatch[4] ?? ''
      }
      tokens.push({ kind: 'open', tag, attrs, selfClosing: VOID_TAGS.has(tag) || match[0].endsWith('/>') })
    }
    index = pattern.lastIndex
  }
  if (index < html.length) tokens.push({ kind: 'text', text: html.slice(index) })
  return tokens
}

const textNode = (text: string, format: number): LexNode => ({
  detail: 0,
  format,
  mode: 'normal',
  style: '',
  text,
  type: 'text',
  version: 1,
})

const block = (type: string, children: LexNode[], extra: LexNode = {}): LexNode => ({
  children,
  direction: 'ltr',
  format: '',
  indent: 0,
  type,
  version: 1,
  ...extra,
})

/** Converts the dashboard editor's HTML into a Lexical editor state. */
export function htmlToLexical(html: string): { root: LexNode } {
  const tokens = tokenize(html || '')

  const blocks: LexNode[] = []
  let current: { type: string; extra: LexNode; children: LexNode[] } | null = null
  let listItem: LexNode[] | null = null
  const listStack: { node: LexNode; items: LexNode[] }[] = []
  let format = 0
  let link: { url: string; children: LexNode[] } | null = null

  const openBlock = (type: string, extra: LexNode = {}) => {
    flushBlock()
    current = { type, extra, children: [] }
  }

  function flushBlock() {
    if (current && current.children.length) blocks.push(block(current.type, current.children, current.extra))
    current = null
  }

  const pushInline = (node: LexNode) => {
    if (link) link.children.push(node)
    else if (listItem) listItem.push(node)
    else {
      if (!current) current = { type: 'paragraph', extra: { textFormat: 0 }, children: [] }
      current.children.push(node)
    }
  }

  for (const token of tokens) {
    if (token.kind === 'text') {
      const text = decodeEntities(token.text).replace(/\s+/g, ' ')
      if (!text.trim() && !text.includes(' ')) continue
      if (!text.trim() && !current && !listItem && !link) continue
      pushInline(textNode(text, format))
      continue
    }

    if (token.kind === 'open') {
      const { tag } = token
      if (tag === 'br') {
        pushInline({ type: 'linebreak', version: 1 })
      } else if (INLINE_FORMAT[tag]) {
        format |= INLINE_FORMAT[tag]
      } else if (tag === 'a') {
        link = { url: token.attrs.href || '', children: [] }
      } else if (tag === 'ul' || tag === 'ol') {
        flushBlock()
        const node = block('list', [], { listType: tag === 'ul' ? 'bullet' : 'number', start: 1, tag })
        listStack.push({ node, items: node.children as LexNode[] })
      } else if (tag === 'li') {
        listItem = []
      } else if (BLOCK_TAGS.has(tag)) {
        openBlock(tag === 'blockquote' ? 'quote' : tag === 'p' ? 'paragraph' : 'heading', tag.startsWith('h') ? { tag } : tag === 'p' ? { textFormat: 0 } : {})
      }
      continue
    }

    // close
    const { tag } = token
    if (INLINE_FORMAT[tag]) {
      format &= ~INLINE_FORMAT[tag]
    } else if (tag === 'a') {
      if (link && link.children.length) {
        const node = block('link', link.children, {
          version: 3,
          fields: { linkType: 'custom', newTab: false, url: link.url },
        })
        link = null
        pushInline(node)
      } else {
        link = null
      }
    } else if (tag === 'li') {
      const stack = listStack[listStack.length - 1]
      if (stack && listItem && listItem.length) {
        stack.items.push(block('listitem', listItem, { value: stack.items.length + 1 }))
      }
      listItem = null
    } else if (tag === 'ul' || tag === 'ol') {
      const stack = listStack.pop()
      if (stack && stack.items.length) blocks.push(stack.node)
    } else if (BLOCK_TAGS.has(tag)) {
      flushBlock()
    }
  }

  flushBlock()
  // An empty document still needs one paragraph, or Payload renders nothing.
  if (!blocks.length) blocks.push(block('paragraph', [], { textFormat: 0 }))

  return { root: block('root', blocks) as { root: LexNode } & LexNode }
}

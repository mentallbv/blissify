import React from 'react'
import { lexicalToHtml } from '@/lib/richtext'

/**
 * Renders a Lexical rich-text field as prose. Content comes from the admin
 * panel or from the dashboard editor, which sanitizes on write - it is provider
 * copy, never visitor input.
 *
 * Returns null when empty so callers can decide what to show instead, rather
 * than falling back to invented copy.
 */
export function RichTextContent({ data, maxWidth = 620 }: { data: unknown; maxWidth?: number }) {
  const html = lexicalToHtml(data)
  if (!html.replace(/<[^>]*>/g, '').trim()) return null

  return (
    <div
      className="bl-richtext"
      style={{
        fontFamily: 'var(--font-ui)',
        fontSize: 16,
        lineHeight: 1.7,
        color: 'var(--text-body)',
        maxWidth,
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

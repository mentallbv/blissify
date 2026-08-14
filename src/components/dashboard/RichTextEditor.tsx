'use client'

import React from 'react'

type Command = { label: string; icon: string; command: string; value?: string; title: string }

const COMMANDS: Command[] = [
  { label: 'Vet', icon: 'ti-bold', command: 'bold', title: 'Vet (Ctrl+B)' },
  { label: 'Cursief', icon: 'ti-italic', command: 'italic', title: 'Cursief (Ctrl+I)' },
  { label: 'Tussenkop', icon: 'ti-h-2', command: 'formatBlock', value: 'h2', title: 'Tussenkop' },
  { label: 'Subkop', icon: 'ti-h-3', command: 'formatBlock', value: 'h3', title: 'Subkop' },
  { label: 'Opsomming', icon: 'ti-list', command: 'insertUnorderedList', title: 'Opsomming' },
  { label: 'Genummerd', icon: 'ti-list-numbers', command: 'insertOrderedList', title: 'Genummerde lijst' },
  { label: 'Paragraaf', icon: 'ti-pilcrow', command: 'formatBlock', value: 'p', title: 'Gewone tekst' },
]

/**
 * Formatting editor for dashboard users. Emits HTML, which the server converts
 * to Lexical - the same format the admin panel writes, so content stays
 * interchangeable between the two.
 *
 * Uses document.execCommand: deprecated, but still universally implemented and
 * far smaller than pulling a full editor framework into the frontend bundle.
 */
export function RichTextEditor({
  value,
  onChange,
  placeholder,
  minHeight = 200,
}: {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: number
}) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [focused, setFocused] = React.useState(false)

  // Only write into the DOM when the incoming value differs, so the caret does
  // not jump to the start on every keystroke.
  React.useEffect(() => {
    const el = ref.current
    if (el && el.innerHTML !== value) el.innerHTML = value || ''
  }, [value])

  function exec(command: Command) {
    ref.current?.focus()
    document.execCommand(command.command, false, command.value)
    onChange(ref.current?.innerHTML || '')
  }

  function addLink() {
    const url = prompt('Link naar welke URL?')
    if (!url) return
    ref.current?.focus()
    document.execCommand('createLink', false, url)
    onChange(ref.current?.innerHTML || '')
  }

  const isEmpty = !value || value === '<br>' || value === '<p></p>'

  return (
    <div
      style={{
        border: '0.5px solid ' + (focused ? 'var(--blissify-forest)' : 'var(--neutral-200)'),
        borderRadius: 'var(--radius-sm)',
        background: 'var(--surface-card)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          padding: 6,
          borderBottom: '0.5px solid var(--border-hairline)',
        }}
      >
        {COMMANDS.map((command) => (
          <button
            key={command.label}
            type="button"
            title={command.title}
            aria-label={command.label}
            // onMouseDown, not onClick: prevents the editor losing its selection.
            onMouseDown={(e) => {
              e.preventDefault()
              exec(command)
            }}
            style={toolbarButtonStyle}
          >
            <i className={`ti ${command.icon}`} />
          </button>
        ))}
        <button type="button" title="Link toevoegen" aria-label="Link" onMouseDown={(e) => { e.preventDefault(); addLink() }} style={toolbarButtonStyle}>
          <i className="ti ti-link" />
        </button>
      </div>

      <div style={{ position: 'relative' }}>
        {isEmpty && placeholder ? (
          <span
            aria-hidden
            style={{
              position: 'absolute',
              top: 12,
              left: 16,
              pointerEvents: 'none',
              fontFamily: 'var(--font-ui)',
              fontSize: 14,
              color: 'var(--text-meta)',
            }}
          >
            {placeholder}
          </span>
        ) : null}
        <div
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          onInput={() => onChange(ref.current?.innerHTML || '')}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          // Paste as plain text: pasted Word/web markup would be stripped by the
          // server anyway, so never show the user formatting that won't survive.
          onPaste={(e) => {
            e.preventDefault()
            const text = e.clipboardData.getData('text/plain')
            document.execCommand('insertText', false, text)
            onChange(ref.current?.innerHTML || '')
          }}
          style={{
            minHeight,
            padding: '12px 16px',
            outline: 'none',
            fontFamily: 'var(--font-ui)',
            fontSize: 14,
            lineHeight: 1.6,
            color: 'var(--text-strong)',
          }}
        />
      </div>
    </div>
  )
}

const toolbarButtonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 30,
  height: 30,
  border: 0,
  borderRadius: 'var(--radius-sm)',
  background: 'transparent',
  cursor: 'pointer',
  color: 'var(--text-body)',
  fontSize: 16,
}

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

type MarkdownRendererProps = {
  content: string
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // Split content into code blocks and normal blocks
  const parts = content.split(/(```[\s\S]*?```)/g)

  return (
    <div className="space-y-2.5 text-xs text-zinc-200 leading-relaxed font-sans">
      {parts.map((part, index) => {
        if (part.startsWith('```')) {
          // It's a code block!
          const lines = part.split('\n')
          const firstLine = lines[0].replace('```', '').trim()
          const language = firstLine || 'code'
          const code = lines.slice(1, lines.length - 1).join('\n')

          return (
            <CodeBlock key={index} code={code} language={language} />
          )
        } else {
          // It's normal text blocks
          return (
            <div key={index} className="space-y-1.5">
              {part.split('\n\n').map((paragraph, pIdx) => {
                if (!paragraph.trim()) return null
                return <ParagraphRenderer key={pIdx} text={paragraph} />
              })}
            </div>
          )
        }
      })}
    </div>
  )
}

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy code:', err)
    }
  }

  return (
    <div className="border border-white/[0.08] rounded-xl overflow-hidden bg-[#0d0d12] my-3 shadow-lg max-w-full">
      {/* Code Header */}
      <div className="flex justify-between items-center px-4 py-2 bg-white/[0.03] border-b border-white/[0.06] text-[10px] text-zinc-400 font-mono select-none">
        <span>{language.toLowerCase()}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-zinc-200 transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check size={11} className="text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Tersalin!</span>
            </>
          ) : (
            <>
              <Copy size={11} />
              <span>Salin</span>
            </>
          )}
        </button>
      </div>
      
      {/* Code Body */}
      <pre className="p-4 overflow-x-auto text-[11px] font-mono text-zinc-300 bg-[#08080c] leading-relaxed scrollbar-thin max-w-full">
        <code>{code}</code>
      </pre>
    </div>
  )
}

function ParagraphRenderer({ text }: { text: string }) {
  // Check if it's a heading
  if (text.startsWith('# ')) {
    return <h1 className="text-sm font-bold text-white mt-3.5 mb-1.5 select-text">{renderInline(text.slice(2))}</h1>
  }
  if (text.startsWith('## ')) {
    return <h2 className="text-xs font-bold text-white mt-3 mb-1 select-text">{renderInline(text.slice(3))}</h2>
  }
  if (text.startsWith('### ')) {
    return <h3 className="text-[11px] font-semibold text-white mt-2.5 mb-1 select-text">{renderInline(text.slice(4))}</h3>
  }

  const lines = text.split('\n')
  const elements: React.ReactNode[] = []

  let listItems: React.ReactNode[] = []
  let listType: 'bullet' | 'number' | null = null

  const flushList = (key: string | number) => {
    if (listItems.length > 0) {
      if (listType === 'bullet') {
        elements.push(
          <ul key={`ul-${key}`} className="list-disc pl-5 space-y-1 my-1.5 select-text">
            {listItems}
          </ul>
        )
      } else {
        elements.push(
          <ol key={`ol-${key}`} className="list-decimal pl-5 space-y-1 my-1.5 select-text">
            {listItems}
          </ol>
        )
      }
      listItems = []
      listType = null
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    // Match Bullet Lists
    const bulletMatch = line.match(/^(\s*)[-*+]\s+(.*)/)
    // Match Numbered Lists
    const numberMatch = line.match(/^(\s*)\d+\.\s+(.*)/)

    if (bulletMatch) {
      if (listType !== 'bullet') {
        flushList(i)
        listType = 'bullet'
      }
      listItems.push(<li key={`li-${i}`}>{renderInline(bulletMatch[2])}</li>)
    } else if (numberMatch) {
      if (listType !== 'number') {
        flushList(i)
        listType = 'number'
      }
      listItems.push(<li key={`li-${i}`}>{renderInline(numberMatch[2])}</li>)
    } else {
      flushList(i)
      if (trimmed) {
        elements.push(
          <p key={`p-${i}`} className="mb-1.5 last:mb-0 select-text">
            {renderInline(line)}
          </p>
        )
      }
    }
  }
  flushList('end')

  return <>{elements}</>
}

function renderInline(text: string): React.ReactNode[] {
  // Split inline tokens: bold (`**text**`), inline code (`` `code` ``)
  const tokens = text.split(/(\*\*.*?\*\*|`.*?`)/g)
  
  return tokens.map((token, index) => {
    if (token.startsWith('**') && token.endsWith('**')) {
      return (
        <strong key={index} className="font-bold text-white select-text">
          {token.slice(2, -2)}
        </strong>
      )
    }
    if (token.startsWith('`') && token.endsWith('`')) {
      return (
        <code
          key={index}
          className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.04] text-amber-300 font-mono text-[10px] select-text"
        >
          {token.slice(1, -1)}
        </code>
      )
    }
    return token
  })
}

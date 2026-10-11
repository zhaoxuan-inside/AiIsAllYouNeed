import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchKnowledge } from '@/backend/knowledge-service'

/** 全局搜索浮层：中文 bigram 索引，回车跳第一个结果 */
export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  const [text, setText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setText('')
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const hits = useMemo(() => searchKnowledge(text, 8), [text])

  if (!open) return null

  const go = (id: string) => {
    onClose()
    navigate(`/point/${id}`)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]" style={{ background: 'var(--overlay)' }} onClick={onClose}>
      <div
        className="w-full max-w-xl rounded-[var(--radius-card)] border border-edge bg-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="搜索知识"
      >
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && hits[0]) go(hits[0].id)
          }}
          placeholder="搜索知识点：注意力 / Transformer / 梯度下降…"
          className="w-full bg-transparent px-5 py-4 text-base text-star outline-none placeholder:text-dim/60"
        />
        <div className="border-t border-edge">
          {text.trim() === '' && (
            <div className="px-5 py-4 text-xs text-dim">试试：注意力机制、LSTM、扩散模型、规模法则（回车跳第一个结果）</div>
          )}
          {text.trim() !== '' && hits.length === 0 && (
            <div className="px-5 py-4 text-sm text-dim">
              未找到相关知识点，试试：<button className="text-accent underline underline-offset-2" onClick={() => setText('Transformer')}>Transformer</button>
            </div>
          )}
          {hits.map((hit) => (
            <button
              key={hit.id}
              onClick={() => go(hit.id)}
              className="flex w-full items-baseline justify-between gap-4 border-t border-edge px-5 py-3 text-left first:border-t-0 hover:bg-void/40"
            >
              <span>
                <span className="text-sm" style={{ color: hit.categoryColor }}>
                  ●{' '}
                </span>
                <span className="text-sm text-star">{hit.title}</span>
                <span className="ml-2 text-xs text-dim">{hit.snippet}</span>
              </span>
              <span className="shrink-0 font-mono text-xs text-dim">{hit.year}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * 内联 SVG 图标（1.5 描边 · currentColor · 16px 默认）。
 * 只收录「跨端 Unicode 字形渲染不可控」的图标；文字流内的符号（★/→/●）保持文字。
 * 视觉语言：iA 式细线，与 Quattro 字重匹配。
 */

interface IconProps {
  className?: string
}

function svg(className?: string, children: React.ReactNode = null) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? 'h-4 w-4'}
      aria-hidden
    >
      {children}
    </svg>
  )
}

export function SearchIcon({ className }: IconProps) {
  return svg(
    className,
    <>
      <circle cx={11} cy={11} r={7} />
      <path d="m20 20-3.5-3.5" />
    </>,
  )
}

export function MoonIcon({ className }: IconProps) {
  return svg(className, <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z" />)
}

export function SunIcon({ className }: IconProps) {
  return svg(
    className,
    <>
      <circle cx={12} cy={12} r={4} />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>,
  )
}

export function MinusIcon({ className }: IconProps) {
  return svg(className, <path d="M5 12h14" />)
}

export function PlusIcon({ className }: IconProps) {
  return svg(className, <path d="M12 5v14M5 12h14" />)
}

/** 重置缩放：对角双箭头 */
export function MaximizeIcon({ className }: IconProps) {
  return svg(
    className,
    <>
      <path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7" />
    </>,
  )
}

/** 关闭 */
export function CloseIcon({ className }: IconProps) {
  return svg(className, <path d="M6 6l12 12M18 6 6 18" />)
}

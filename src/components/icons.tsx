// 自绘天文制图图标族（DESIGN.md：线+节点语汇；线宽 1.6，圆角端点）
import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 18, ...rest }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    ...rest,
  };
}

/** 罗盘 = 搜索 */
export function IconCompass(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.6-3.6" />
      <path d="M11 8v6M8 11h6" />
    </svg>
  );
}

/** 台灯 = 主题 */
export function IconLamp(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6 3h12M6 6h12M7 6v5a4 4 0 0 0 4 4h2a4 4 0 0 0 4-4V6" />
      <path d="M12 15v3M9 21h6" />
      <path d="M12 18l-1.5 3M12 18l1.5 3" />
    </svg>
  );
}

/** 书 = 档案 */
export function IconBook(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 5.5C9.8 4 6.5 4 4 5v13c2.5-1 5.8-1 8 .5 2.2-1.5 5.5-1.5 8-.5V5c-2.5-1-5.8-1-8 .5z" />
      <path d="M12 5.5V18.5" />
    </svg>
  );
}

/** 星 = 知识点 / 收藏 */
export function IconStar(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 4l2.2 4.6 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5L4.8 9.3l5-.7z" />
    </svg>
  );
}

/** 书签 = 收藏 */
export function IconBookmark(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6 4h9l4 4v12H6zM15 4v5h4" />
    </svg>
  );
}

/** 勾 = 已读 */
export function IconCheck(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

/** 铅笔 = 笔记 */
export function IconPen(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 20l4-1L19 8l-3-3L5 16z" />
      <path d="M14 6l3 3" />
    </svg>
  );
}

/** 箭头 = 前进 */
export function IconArrow(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  );
}

/** 透镜 = 图谱 */
export function IconLens(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 4v3M12 17v3M4 12h3M17 12h3" />
    </svg>
  );
}

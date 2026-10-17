// 公式渲染（KaTeX；FEAT-007 数学支持）
import katex from 'katex';
import 'katex/dist/katex.min.css';

export function renderMath(tex: string, display: boolean): string {
  return katex.renderToString(tex, { throwOnError: false, displayMode: display });
}

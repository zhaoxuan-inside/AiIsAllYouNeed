import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App';
import { repo } from './data/repo';
import { searchIndex } from './search';
import type { KnowledgeBundle } from './data/types';
import './styles/tokens.css';

// 运行时代码零网络：知识数据为构建期打包的静态 JSON（DESIGN.md §0）
async function bootstrap() {
  const [points, domains, roadmap] = await Promise.all([
    fetch('data/points.json').then((r) => r.json()),
    fetch('data/domains.json').then((r) => r.json()),
    fetch('data/roadmap.json').then((r) => r.json()),
  ]);
  const bundle: KnowledgeBundle = { points, domains, roadmap };
  repo.load(bundle);
  searchIndex.build(bundle.points);
  document.documentElement.dataset.ready = 'true';
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

bootstrap().catch((err) => {
  console.error('[atlas] 数据损坏或加载失败', err);
  document.getElementById('root')!.innerHTML =
    '<div style="padding:48px;text-align:center;color:var(--ink-2)"><h1 style="font-family:var(--font-serif)">数据损坏</h1><p>知识数据未能加载。请检查构建产物或重新运行内容管线。</p></div>';
});

// 全局鼠标光（弱化小台灯）：常驻跟随 + 静止缓慢变暗（DESIGN.md §4）
const cl = document.createElement('div');
cl.id = 'cursorlight';
document.body.appendChild(cl);
let lightTimer: ReturnType<typeof setTimeout> | undefined;
window.addEventListener(
  'pointermove',
  (e) => {
    cl.style.transform = `translate(${e.clientX}px,${e.clientY}px) translate(-50%,-50%)`;
    cl.classList.remove('is-idle');
    cl.classList.add('active');
    clearTimeout(lightTimer);
    lightTimer = setTimeout(() => {
      cl.classList.remove('active');
      cl.classList.add('is-idle');
    }, 1400);
    const el = (e.target as Element | null)?.closest?.('.glass,.paper,.row,.drow,.lane,.chip,.seg,.btn,.icon-btn') as HTMLElement | null;
    if (el) {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
      el.style.setProperty('--my', `${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`);
    }
  },
  { passive: true },
);
document.addEventListener('mouseleave', () => {
  cl.style.opacity = '0';
  clearTimeout(lightTimer);
});

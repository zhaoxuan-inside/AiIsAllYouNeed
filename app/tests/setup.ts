import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// jsdom 缺失的浏览器 API polyfill
if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as never
}

if (!('requestAnimationFrame' in window)) {
  ;(window as never as { requestAnimationFrame: (cb: FrameRequestCallback) => number }).requestAnimationFrame = (cb) =>
    setTimeout(() => cb(performance.now()), 16) as unknown as number
}

// canvas 2d 空实现（jsdom 的 getContext 未装 canvas 包时返回 null，星域画布在测试中不真正绘制）
{
  const noop = () => {}
  HTMLCanvasElement.prototype.getContext = vi.fn(() =>
    new Proxy(
      {},
      {
        get: () => noop,
        set: () => true,
      },
    ),
  ) as never
}

import '@testing-library/jest-dom';
import React from 'react';
import { vi } from 'vitest';

// Mock ResizeObserver
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserverMock;

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: vi.fn(),
});

Object.defineProperty(navigator, 'clipboard', {
  configurable: true,
  value: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
});

global.requestAnimationFrame = vi.fn((callback: FrameRequestCallback) =>
  window.setTimeout(() => callback(performance.now()), 16),
) as unknown as typeof requestAnimationFrame;

global.cancelAnimationFrame = vi.fn((id: number) => {
  clearTimeout(id);
}) as unknown as typeof cancelAnimationFrame;

const canvasContext = {
  arc: vi.fn(),
  beginPath: vi.fn(),
  clearRect: vi.fn(),
  closePath: vi.fn(),
  fill: vi.fn(),
  fillRect: vi.fn(),
  fillText: vi.fn(),
  lineTo: vi.fn(),
  moveTo: vi.fn(),
  restore: vi.fn(),
  save: vi.fn(),
  scale: vi.fn(),
  setLineDash: vi.fn(),
  setTransform: vi.fn(),
  stroke: vi.fn(),
  translate: vi.fn(),
  set fillStyle(_value: string | CanvasGradient | CanvasPattern) {},
  set font(_value: string) {},
  set globalAlpha(_value: number) {},
  set lineWidth(_value: number) {},
  set shadowBlur(_value: number) {},
  set shadowColor(_value: string) {},
  set strokeStyle(_value: string | CanvasGradient | CanvasPattern) {},
};

Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  configurable: true,
  value: vi.fn(() => canvasContext as unknown as CanvasRenderingContext2D),
});

Element.prototype.getBoundingClientRect = vi.fn(() => ({
  x: 0,
  y: 0,
  width: 640,
  height: 420,
  top: 0,
  right: 640,
  bottom: 420,
  left: 0,
  toJSON: () => {},
}));

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) =>
    React.createElement('a', { href, ...props }, children),
}));

vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
  usePathname: vi.fn(() => '/'),
}));

// Mock SVG elements prototype methods that JSDOM lacks
if (typeof window !== 'undefined') {
  window.SVGSVGElement.prototype.createSVGPoint = function() {
    return {
      x: 0,
      y: 0,
      matrixTransform: function() {
        return this;
      }
    } as unknown as DOMPoint;
  };

  window.SVGSVGElement.prototype.getScreenCTM = function() {
    return {
      a: 1, b: 0, c: 0, d: 1, e: 0, f: 0,
      inverse: function() { return this; },
      multiply: function() { return this; }
    } as unknown as DOMMatrix;
  };

  Object.defineProperty(window.SVGElement.prototype, 'getBBox', {
    configurable: true,
    value: function() {
      return {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        bottom: 0,
        top: 0,
        left: 0,
        right: 0,
        toJSON: () => {}
      };
    },
  });
}

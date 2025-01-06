import '@testing-library/jest-dom'
import React from 'react'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
    }
  },
  usePathname() {
    return ''
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock Next/Image
jest.mock('next/image', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => null)
}))

// Mock Request and Response for Next.js API tests
global.Request = class Request {
  headers: Headers
  method: string
  url: string

  constructor(input: string | URL, init?: RequestInit) {
    this.headers = new Headers(init?.headers)
    this.method = init?.method || 'GET'
    this.url = input.toString()
  }
} as unknown as typeof Request

global.Response = class Response {
  status: number
  statusText: string
  headers: Headers
  body: any

  constructor(body?: any, init?: ResponseInit) {
    this.status = init?.status || 200
    this.statusText = init?.statusText || 'OK'
    this.headers = new Headers(init?.headers)
    this.body = body
  }

  json() {
    return Promise.resolve(this.body)
  }
} as unknown as typeof Response

// Suppress specific console errors during tests
const originalError = console.error
console.error = (...args) => {
  if (args[0]?.includes?.('Warning: ReactDOM.render is no longer supported')) {
    return
  }
  if (args[0]?.includes?.('Error: Uncaught [Error: expected]')) {
    return
  }
  originalError.call(console, ...args)
}

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
    ok: true,
    status: 200,
  })
) as jest.Mock

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock Firebase
jest.mock('@/firebase/firebase', () => ({
  app: {
    name: '[DEFAULT]',
    options: {},
  },
  analytics: null,
  db: {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(),
        set: jest.fn(),
        update: jest.fn(),
      })),
    })),
  },
})) 
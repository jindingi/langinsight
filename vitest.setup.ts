import { vi } from 'vitest'

// 设置通用的 mock
vi.stubGlobal('storage', {
  get: vi.fn(),
  set: vi.fn(),
  remove: vi.fn(),
})

// 条件性设置 TextEncoder（只在需要时）
if (typeof window !== 'undefined') {
  // jsdom 环境
  try {
    const { TextEncoder, TextDecoder } = require('util')
    
    // 使用 vi.stubGlobal 来设置
    vi.stubGlobal('TextEncoder', TextEncoder)
    vi.stubGlobal('TextDecoder', TextDecoder)
  } catch (error) {
    console.warn('Failed to set up TextEncoder/TextDecoder:', error)
  }
}
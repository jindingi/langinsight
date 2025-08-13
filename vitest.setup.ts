import { vi } from 'vitest'

// 设置通用的 mock
vi.stubGlobal('storage', {
  get: vi.fn(),
  set: vi.fn(),
  remove: vi.fn(),
})
// vitest.setup.ts
import { TextEncoder, TextDecoder } from 'util';

// 将 Node.js 的 TextEncoder 和 TextDecoder 挂载到 jsdom 的全局对象上
// 这样可以确保 esbuild 和其他工具使用统一的实现
Object.assign(global, { TextDecoder, TextEncoder });
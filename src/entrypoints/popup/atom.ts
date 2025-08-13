import { atomWithStorage } from 'jotai/utils'
import { wxtStorageAdapter } from '@/lib/storage'

/**
 * Atom for storing OpenAI API key
 * Uses WXT Storage adapter for persistence
 */
export const apiKeyAtom = atomWithStorage(
  'openai-api-key',
  '',
  wxtStorageAdapter
)

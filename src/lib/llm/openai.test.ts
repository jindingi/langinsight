/**
 * @vitest-environment node
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getDefaultStore } from 'jotai'
import { apiKeyAtom } from '@/entrypoints/popup/atom'
import { openAIManager, getOpenAIClient, testConnection } from './openai'
import OpenAI from 'openai'

// Mock OpenAI
vi.mock('openai', () => {
  const OpenAIMock = vi.fn()
  OpenAIMock.prototype.chat = {
    completions: {
      create: vi.fn()
    }
  }
  return { default: OpenAIMock }
})

describe('OpenAIManager', () => {
  const mockApiKey = 'test-api-key'
  const store = getDefaultStore()

  beforeEach(() => {
    // Reset OpenAI mock
    vi.clearAllMocks()
    // Reset manager state
    openAIManager.reset()
    // Reset atom state
    store.set(apiKeyAtom, '')
  })

  describe('Client Management', () => {
    it('should create client only when API key is set', async () => {
      // No API key set
      await expect(getOpenAIClient()).rejects.toThrow('OpenAI API key not found')

      // Set API key
      await store.set(apiKeyAtom, mockApiKey)
      const client = await getOpenAIClient()
      expect(client).toBeDefined()
      expect(OpenAI).toHaveBeenCalledTimes(1)
      expect(OpenAI).toHaveBeenCalledWith({
        baseURL: 'https://api.deepseek.com',
        apiKey: mockApiKey
      })
    })

    it('should reuse existing client if API key has not changed', async () => {
      // Set API key and create first client
      await store.set(apiKeyAtom, mockApiKey)
      const client1 = await getOpenAIClient()
      const client2 = await getOpenAIClient()

      expect(client1).toBe(client2)
      expect(OpenAI).toHaveBeenCalledTimes(1)
    })

    it('should create new client if API key changes', async () => {
      // First client
      await store.set(apiKeyAtom, mockApiKey)
      const client1 = await getOpenAIClient()

      // Second client with new API key
      await store.set(apiKeyAtom, 'new-api-key')
      const client2 = await getOpenAIClient()

      expect(client1).not.toBe(client2)
      expect(OpenAI).toHaveBeenCalledTimes(2)
      expect(OpenAI).toHaveBeenLastCalledWith({
        baseURL: 'https://api.deepseek.com',
        apiKey: 'new-api-key'
      })
    })
  })

  describe('Connection Testing', () => {
    it('should return false when no API key is set', async () => {
      const result = await testConnection()
      expect(result).toBe(false)
    })

    it('should test connection successfully', async () => {
      // Mock successful response
      const mockCreate = vi.fn().mockResolvedValue({
        choices: [{ message: { content: 'Hello!' } }]
      })
      vi.mocked(OpenAI).mockImplementation(() => ({
        chat: {
          // @ts-ignore
          completions: {
            create: mockCreate
          }
        }
      }))

      await store.set(apiKeyAtom, mockApiKey)
      const result = await testConnection()

      expect(result).toBe(true)
      expect(mockCreate).toHaveBeenCalledWith({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: 'Say hello to me. Do not say anything else.' }]
      })
    })

    it('should handle failed connection test', async () => {
      // Mock failed response
      const mockCreate = vi.fn().mockResolvedValue({
        choices: []
      })
      vi.mocked(OpenAI).mockImplementation(() => ({
        chat: {
          // @ts-ignore
          completions: {
            create: mockCreate
          }
        }
      }))

      await store.set(apiKeyAtom, mockApiKey)
      const result = await testConnection()

      expect(result).toBe(false)
    })

    it('should handle connection errors', async () => {
      // Mock error
      const mockCreate = vi.fn().mockRejectedValue(new Error('API Error'))
      vi.mocked(OpenAI).mockImplementation(() => ({
        chat: {
          // @ts-ignore
          completions: {
            create: mockCreate
          }
        }
      }))

      await store.set(apiKeyAtom, mockApiKey)
      await expect(testConnection()).rejects.toThrow('API Error')
    })
  })

  describe('Reset Functionality', () => {
    it('should clear client when reset is called', async () => {
      // Create initial client
      await store.set(apiKeyAtom, mockApiKey)
      const client1 = await getOpenAIClient()

      // Reset and create new client
      openAIManager.reset()
      const client2 = await getOpenAIClient()

      expect(client1).not.toBe(client2)
      expect(OpenAI).toHaveBeenCalledTimes(2)
    })
  })
})
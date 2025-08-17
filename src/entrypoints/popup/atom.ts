import { DEFAULT_CONFIG } from '@/config/config'
import { Config } from '@/config/type'
import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { wxtStorageAdapter } from '@/lib/storage'


const configAtom= atomWithStorage('config', DEFAULT_CONFIG, wxtStorageAdapter)

type Keys = keyof Config

function getConfigFieldAtom<K extends Keys>(key: K) {
  return atom(
    async get => {
      const value = await get(configAtom)
      return value[key]
    },
    (get, set, newVal: Partial<Config[K]>) => {
      logger.info(`Setting ${key} to configAtom`)
      set(configAtom, { ...get(configAtom), [key]: newVal })
    }
  )
}

function buildConfigFields(cfg: Config) {
  type ValidKey = Extract<keyof Config, keyof Config>
  type Map = { [K in ValidKey]: ReturnType<typeof getConfigFieldAtom<K>> }

  const res = {} as Map

  const add = <K extends ValidKey>(key: K) => {
    res[key] = getConfigFieldAtom(key)
  };

  (Object.keys(cfg) as ValidKey[]).forEach(add)
  return res
}

export const configFields = buildConfigFields(DEFAULT_CONFIG)
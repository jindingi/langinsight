import { CONFIG_STORAGE_KEY, getConfig } from '@/config/config'
import { Config } from '@/config/type'
import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { wxtStorageAdapter } from '@/lib/storage'
import { logger } from '@/utils/logger'

let configAtom = atomWithStorage<Config | null>(
    CONFIG_STORAGE_KEY,
    null,
    wxtStorageAdapter,
)

type Keys = keyof Config

function getConfigFieldAtom<K extends Keys>(key: K) {
    return atom(
        async get => {
            const value = await get(configAtom)
            if (value == null) {
                return null
            }
            return value[key]
        },
        (get, set, newVal: Partial<Config[K]>) => {
            logger.info(`Setting ${key} to configAtom`)
            const currentValue = get(configAtom)
            if (currentValue == null) {
                return
            }
            set(configAtom, { ...currentValue, [key]: newVal })
        },
    )
}

type ValidKey = Extract<keyof Config, keyof Config>

type Map = { [K in ValidKey]: ReturnType<typeof getConfigFieldAtom<K>> }

function buildConfigFields(cfg: Config): Map {
    const res = {} as Map

    logger.info('Building config fields', cfg)

    const add = (key: ValidKey) => {
        res[key] = getConfigFieldAtom(key)
    }

    ;(Object.keys(cfg) as ValidKey[]).forEach(add)
    return res
}

export let configFields: Map

export async function initConfigFields() {
    const config = await getConfig()
    configAtom = atomWithStorage<Config | null>(
        CONFIG_STORAGE_KEY,
        config,
        wxtStorageAdapter,
    )
    configFields = buildConfigFields(config)
}

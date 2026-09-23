import type { InjectionKey } from 'vue'

export type TInjectOption = {
    from?: string | symbol | InjectionKey<unknown>
    default?: unknown
}

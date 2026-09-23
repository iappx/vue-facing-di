import type { ComponentPublicInstance } from 'vue'
import { ConstructionContext } from './di/ConstructionContext'
import type { TVm } from './types/TVm'

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging -- gives the class the public instance type Vue proxies it with at runtime
export interface VueBase extends ComponentPublicInstance {}

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class VueBase {
    constructor() {
        const construction = ConstructionContext.current()
        if (!construction || construction.cons !== new.target) {
            return
        }
        const vm = construction.vm as TVm
        const inherited = [...Object.keys(vm.$props), ...Object.keys(vm.$options.methods ?? {})]
        for (const key of inherited) {
            Object.defineProperty(this, key, {
                value: vm[key],
                writable: true,
                configurable: true,
                enumerable: false,
            })
        }
    }
}

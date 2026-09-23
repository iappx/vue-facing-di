import type { ComponentPublicInstance } from 'vue'
import { ComponentInstantiator } from '../di/ComponentInstantiator'
import { DiPlugin } from '../di/DiPlugin'
import { MetadataRegistry } from '../metadata/MetadataRegistry'
import type { TVm } from '../types/TVm'
import type { TVueConstructor } from '../types/TVueConstructor'

export class DataBuilder {
    public static build(cons: TVueConstructor) {
        return function (this: TVm): Record<string, unknown> {
            if (DataBuilder.isBuiltBySubclass(cons, this)) {
                return {}
            }
            const { instance, dependencies } = new ComponentInstantiator(DiPlugin.current()).instantiate(cons, this)
            const data: Record<string, unknown> = {}
            for (const [key, value] of Object.entries(instance)) {
                if (MetadataRegistry.isReservedInHierarchy(cons.prototype, key)) {
                    continue
                }
                if (dependencies.has(value)) {
                    this[key] = value
                    continue
                }
                data[key] = value
            }
            return data
        }
    }

    private static isBuiltBySubclass(cons: TVueConstructor, vm: ComponentPublicInstance): boolean {
        const leaf = MetadataRegistry.constructorOf(vm.$.type)
        return leaf !== undefined && leaf !== cons && leaf.prototype instanceof cons
    }
}

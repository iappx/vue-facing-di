import type { ComponentMetadata } from '../metadata/ComponentMetadata'
import type { TAccessorInstaller } from '../types/TAccessorInstaller'
import { PrototypeMembers } from './PrototypeMembers'

export class AccessorInstallerBuilder {
    public static build(prototypes: object[], metadata: ComponentMetadata): TAccessorInstaller | undefined {
        const vanillaAccessors = PrototypeMembers.entries(prototypes)
            .filter(([key, descriptor]) => metadata.vanillas.has(key) && PrototypeMembers.isAccessor(descriptor))

        if (metadata.refs.size === 0 && vanillaAccessors.length === 0) {
            return undefined
        }

        return vm => {
            for (const [key, refKey] of metadata.refs) {
                Object.defineProperty(vm, key, {
                    get: () => vm.$refs[refKey],
                    configurable: true,
                })
            }
            for (const [key, descriptor] of vanillaAccessors) {
                Object.defineProperty(vm, key, {
                    get: descriptor.get?.bind(vm),
                    set: descriptor.set?.bind(vm),
                    configurable: true,
                })
            }
        }
    }
}

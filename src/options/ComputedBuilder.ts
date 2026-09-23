import type { ComponentMetadata } from '../metadata/ComponentMetadata'
import type { TComputedMap } from '../types/TComputedMap'
import type { TVm } from '../types/TVm'
import { PrototypeMembers } from './PrototypeMembers'

export class ComputedBuilder {
    public static build(prototypes: object[], metadata: ComponentMetadata): TComputedMap {
        const computed: TComputedMap = {}

        for (const [key, propName] of metadata.vModels) {
            computed[key] = {
                get(this: TVm) {
                    return this[propName]
                },
                set(this: TVm, value: unknown) {
                    this.$emit(`update:${propName}`, value)
                },
            }
        }

        for (const [key, descriptor] of PrototypeMembers.entries(prototypes)) {
            if (PrototypeMembers.isAccessor(descriptor) && !metadata.vanillas.has(key)) {
                computed[key] = { get: descriptor.get!, set: descriptor.set! }
            }
        }

        return computed
    }
}

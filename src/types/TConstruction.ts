import type { ComponentPublicInstance } from 'vue'
import type { TVueConstructor } from './TVueConstructor'

export type TConstruction = {
    cons: TVueConstructor
    vm: ComponentPublicInstance
}

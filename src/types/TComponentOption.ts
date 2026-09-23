import type { ComponentCustomOptions, ComponentPublicInstance } from 'vue'
import type { TRawComponentOptions } from './TRawComponentOptions'
import type { TSetupFunction } from './TSetupFunction'
import type { TSetupState } from './TSetupState'

export type TComponentOption = {
    name?: string
    emits?: string[]
    provide?: Record<PropertyKey, unknown> | ((this: ComponentPublicInstance) => Record<PropertyKey, unknown>)
    components?: Record<string, unknown>
    directives?: Record<string, unknown>
    inheritAttrs?: boolean
    expose?: string[]
    render?: (...args: any[]) => unknown
    template?: string
    mixins?: unknown[]
    setup?: TSetupFunction<TSetupState>
    options?: ComponentCustomOptions & Record<string, unknown>
    modifier?: (options: TRawComponentOptions) => void
}

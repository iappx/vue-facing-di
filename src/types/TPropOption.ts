import type { PropType } from 'vue'

export type TPropOption = {
    type?: PropType<any> | true | null
    required?: boolean
    default?: unknown
    validator?(value: unknown, props: Record<string, unknown>): boolean
}

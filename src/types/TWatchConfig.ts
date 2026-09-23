import type { TWatchOption } from './TWatchOption'

export type TWatchConfig = TWatchOption & {
    source: string
    handler: string
}

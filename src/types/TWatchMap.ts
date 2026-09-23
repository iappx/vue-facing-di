import type { TWatchConfig } from './TWatchConfig'

export type TWatchMap = Record<string, Omit<TWatchConfig, 'source'>[]>

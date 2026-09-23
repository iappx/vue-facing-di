import type { VueBase } from '../VueBase'

export type TVueConstructor<T = object> = abstract new (...args: any[]) => VueBase & T

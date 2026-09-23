import type { VueBase } from '../VueBase'

export type TMixinsConstructor<T> = new (...args: any[]) => VueBase & T

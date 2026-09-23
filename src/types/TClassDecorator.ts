import type { TVueConstructor } from './TVueConstructor'

export type TClassDecorator = <T extends TVueConstructor>(cons: T) => T

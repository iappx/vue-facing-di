import type { TUnionToIntersection } from './TUnionToIntersection'
import type { TVueConstructor } from './TVueConstructor'

export type TMixedInstance<T extends TVueConstructor[]> = TUnionToIntersection<InstanceType<T[number]>>

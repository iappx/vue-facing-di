import type { TRawComponentOptions } from './TRawComponentOptions'

export type TCustomDecoratorCreator = (options: TRawComponentOptions, key: string) => void

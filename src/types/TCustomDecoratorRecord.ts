import type { TCustomDecoratorCreator } from './TCustomDecoratorCreator'

export type TCustomDecoratorRecord = {
    key: string
    creator: TCustomDecoratorCreator
    preserve: boolean
}

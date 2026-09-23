import type { TClassDecorator } from './TClassDecorator'
import type { TComponentOption } from './TComponentOption'
import type { TVueConstructor } from './TVueConstructor'

export type TComponentDecorator = {
    <T extends TVueConstructor>(cons: T): T
    (option?: TComponentOption): TClassDecorator
}

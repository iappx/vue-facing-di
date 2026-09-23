import { ClassComponent } from '../component/ClassComponent'
import type { TComponentDecorator } from '../types/TComponentDecorator'
import type { TComponentOption } from '../types/TComponentOption'
import type { TVueConstructor } from '../types/TVueConstructor'

export const Component = ((consOrOption?: TVueConstructor | TComponentOption) => typeof consOrOption === 'function'
    ? ClassComponent.define(consOrOption, {})
    : (cons: TVueConstructor) => ClassComponent.define(cons, consOrOption ?? {})) as TComponentDecorator

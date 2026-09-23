import type { TMemberDecorator } from './TMemberDecorator'

export type TOptionalArgDecorator<TOption> = {
    (option?: TOption): TMemberDecorator
    (target: object, key: string, descriptor?: PropertyDescriptor): void
}

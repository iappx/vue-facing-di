import type { TMemberDecorator } from '../types/TMemberDecorator'
import type { TOptionalArgDecorator } from '../types/TOptionalArgDecorator'

export class OptionalArgDecorator {
    public static create<TOption>(
        apply: (prototype: object, key: string, option: TOption | undefined) => void,
    ): TOptionalArgDecorator<TOption> {
        return ((optionOrTarget?: TOption | object, key?: string): TMemberDecorator | undefined => {
            if (typeof key === 'string') {
                apply(optionOrTarget as object, key, undefined)
                return undefined
            }
            return (target: object, name: string) => apply(target, name, optionOrTarget as TOption | undefined)
        }) as TOptionalArgDecorator<TOption>
    }
}

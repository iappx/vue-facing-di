import type { TPropOption } from '../types/TPropOption'

export class PropTypeInference {
    public static apply(prototype: object, key: string, option: TPropOption): TPropOption {
        if (option.type !== undefined || PropTypeInference.designTypeOf(prototype, key) !== Boolean) {
            return option
        }
        return { ...option, type: Boolean }
    }

    private static designTypeOf(prototype: object, key: string): unknown {
        const reflect = Reflect as typeof Reflect & { getMetadata?: (metadataKey: string, target: object, property: string) => unknown }
        return reflect.getMetadata?.('design:type', prototype, key)
    }
}

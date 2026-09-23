import { MetadataRegistry } from '../metadata/MetadataRegistry'
import type { TCustomDecoratorCreator } from '../types/TCustomDecoratorCreator'
import type { TCustomDecoratorOption } from '../types/TCustomDecoratorOption'
import type { TMemberDecorator } from '../types/TMemberDecorator'

export class CustomDecorator {
    public static create(creator: TCustomDecoratorCreator, option?: TCustomDecoratorOption): TMemberDecorator {
        return (prototype, key) => {
            MetadataRegistry.obtain(prototype).addCustomDecorator(key, { key, creator, preserve: option?.preserve ?? false })
        }
    }
}

import { MetadataRegistry } from '../metadata/MetadataRegistry'
import { OptionalArgDecorator } from './OptionalArgDecorator'

export const Emit = OptionalArgDecorator.create<string>((prototype, key, event) => {
    MetadataRegistry.obtain(prototype).emitters.set(key, event ?? key)
})

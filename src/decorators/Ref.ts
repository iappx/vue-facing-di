import { MetadataRegistry } from '../metadata/MetadataRegistry'
import { OptionalArgDecorator } from './OptionalArgDecorator'

export const Ref = OptionalArgDecorator.create<string>((prototype, key, refKey) => {
    MetadataRegistry.obtain(prototype).refs.set(key, refKey ?? key)
})

import { MetadataRegistry } from '../metadata/MetadataRegistry'
import { OptionalArgDecorator } from './OptionalArgDecorator'

export const Provide = OptionalArgDecorator.create<string | symbol>((prototype, key, provideKey) => {
    MetadataRegistry.obtain(prototype).provides.set(key, provideKey ?? key)
})

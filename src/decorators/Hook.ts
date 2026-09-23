import { MetadataRegistry } from '../metadata/MetadataRegistry'
import { OptionalArgDecorator } from './OptionalArgDecorator'

export const Hook = OptionalArgDecorator.create<undefined>((prototype, key) => {
    MetadataRegistry.obtain(prototype).hooks.add(key)
})

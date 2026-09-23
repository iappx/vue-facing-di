import { MetadataRegistry } from '../metadata/MetadataRegistry'
import { OptionalArgDecorator } from './OptionalArgDecorator'

export const Vanilla = OptionalArgDecorator.create<undefined>((prototype, key) => {
    MetadataRegistry.obtain(prototype).vanillas.add(key)
})

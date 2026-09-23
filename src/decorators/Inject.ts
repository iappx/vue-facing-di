import { MetadataRegistry } from '../metadata/MetadataRegistry'
import type { TInjectOption } from '../types/TInjectOption'
import { OptionalArgDecorator } from './OptionalArgDecorator'

export const Inject = OptionalArgDecorator.create<TInjectOption>((prototype, key, option) => {
    MetadataRegistry.obtain(prototype).injects.set(key, { ...option })
})

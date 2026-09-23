import { MetadataRegistry } from '../metadata/MetadataRegistry'
import { PropTypeInference } from '../metadata/PropTypeInference'
import type { TPropOption } from '../types/TPropOption'
import { OptionalArgDecorator } from './OptionalArgDecorator'

export const Prop = OptionalArgDecorator.create<TPropOption>((prototype, key, option) => {
    MetadataRegistry.obtain(prototype).props.set(key, PropTypeInference.apply(prototype, key, { ...option }))
})

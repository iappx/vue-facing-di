import { MetadataRegistry } from '../metadata/MetadataRegistry'
import { PropTypeInference } from '../metadata/PropTypeInference'
import type { TVModelOption } from '../types/TVModelOption'
import { VueFacingDiError } from '../VueFacingDiError'
import { OptionalArgDecorator } from './OptionalArgDecorator'

export const VModel = OptionalArgDecorator.create<TVModelOption>((prototype, key, option) => {
    const { name = 'modelValue', ...propOption } = option ?? {}
    if (name === key) {
        throw new VueFacingDiError(`@VModel member "${key}" is named after its own model prop; rename the member or pass another { name }`)
    }
    const metadata = MetadataRegistry.obtain(prototype)
    metadata.props.set(name, PropTypeInference.apply(prototype, key, propOption))
    metadata.vModels.set(key, name)
})

export const Model = VModel

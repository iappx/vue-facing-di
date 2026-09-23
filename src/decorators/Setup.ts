import { MetadataRegistry } from '../metadata/MetadataRegistry'
import type { TMemberDecorator } from '../types/TMemberDecorator'
import type { TSetupFunction } from '../types/TSetupFunction'

export const Setup = (setup: TSetupFunction): TMemberDecorator => (prototype, key) => {
    MetadataRegistry.obtain(prototype).setups.set(key, setup)
}

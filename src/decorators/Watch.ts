import { MetadataRegistry } from '../metadata/MetadataRegistry'
import type { TMemberDecorator } from '../types/TMemberDecorator'
import type { TWatchOption } from '../types/TWatchOption'

export const Watch = (source: string, option?: TWatchOption): TMemberDecorator => (prototype, key) => {
    MetadataRegistry.obtain(prototype).addWatcher(key, { ...option, source, handler: key })
}

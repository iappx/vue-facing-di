import type { ComponentMetadata } from '../metadata/ComponentMetadata'
import type { TComponentOption } from '../types/TComponentOption'
import type { TProvided } from '../types/TProvided'
import type { TVm } from '../types/TVm'

export class ProvideBuilder {
    public static build(metadata: ComponentMetadata, provide: TComponentOption['provide']) {
        return function (this: TVm): TProvided {
            const provided: TProvided = {}
            for (const [key, provideKey] of metadata.provides) {
                provided[provideKey] = this[key]
            }
            const extra = typeof provide === 'function' ? provide.call(this) : provide
            return { ...provided, ...extra }
        }
    }
}

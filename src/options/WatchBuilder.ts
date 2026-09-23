import type { ComponentMetadata } from '../metadata/ComponentMetadata'
import type { TWatchMap } from '../types/TWatchMap'

export class WatchBuilder {
    public static build(metadata: ComponentMetadata): TWatchMap {
        const watch: TWatchMap = {}
        for (const configs of metadata.watchers.values()) {
            for (const { source, ...config } of configs) {
                (watch[source] ??= []).push(config)
            }
        }
        return watch
    }
}

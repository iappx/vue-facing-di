import type { DefineComponent } from 'vue'
import type { TCustomDecoratorRecord } from '../types/TCustomDecoratorRecord'
import type { TInjectOption } from '../types/TInjectOption'
import type { TPropOption } from '../types/TPropOption'
import type { TSetupFunction } from '../types/TSetupFunction'
import type { TWatchConfig } from '../types/TWatchConfig'

export class ComponentMetadata {
    public readonly props = new Map<string, TPropOption>()
    public readonly vModels = new Map<string, string>()
    public readonly emitters = new Map<string, string>()
    public readonly watchers = new Map<string, TWatchConfig[]>()
    public readonly refs = new Map<string, string>()
    public readonly provides = new Map<string, string | symbol>()
    public readonly injects = new Map<string, TInjectOption>()
    public readonly setups = new Map<string, TSetupFunction>()
    public readonly hooks = new Set<string>()
    public readonly vanillas = new Set<string>()
    public readonly customDecorators = new Map<string, TCustomDecoratorRecord[]>()
    public component: DefineComponent | null = null

    public addWatcher(key: string, config: TWatchConfig): void {
        const configs = this.watchers.get(key) ?? []
        configs.push(config)
        this.watchers.set(key, configs)
    }

    public addCustomDecorator(key: string, record: TCustomDecoratorRecord): void {
        const records = this.customDecorators.get(key) ?? []
        records.push(record)
        this.customDecorators.set(key, records)
    }

    public reserves(key: string): boolean {
        return this.props.has(key)
            || this.vModels.has(key)
            || this.emitters.has(key)
            || this.refs.has(key)
            || this.injects.has(key)
            || this.setups.has(key)
            || this.vanillas.has(key)
            || (this.customDecorators.get(key)?.every(record => !record.preserve) ?? false)
    }
}

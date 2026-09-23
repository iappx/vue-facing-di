import type { ComponentPublicInstance, DefineComponent } from 'vue'
import type { ComponentMetadata } from '../metadata/ComponentMetadata'
import { MetadataRegistry } from '../metadata/MetadataRegistry'
import type { TAccessorInstaller } from '../types/TAccessorInstaller'
import type { TComponentOption } from '../types/TComponentOption'
import type { TFunctionMap } from '../types/TFunctionMap'
import type { TRawComponentOptions } from '../types/TRawComponentOptions'
import type { TVueConstructor } from '../types/TVueConstructor'
import { AccessorInstallerBuilder } from './AccessorInstallerBuilder'
import { ComputedBuilder } from './ComputedBuilder'
import { DataBuilder } from './DataBuilder'
import { MethodsBuilder } from './MethodsBuilder'
import { ProvideBuilder } from './ProvideBuilder'
import { SetupBuilder } from './SetupBuilder'
import { WatchBuilder } from './WatchBuilder'

export class ComponentOptionsBuilder {
    private static readonly MERGED_OPTION_KEYS = new Set<string>(['options', 'modifier', 'emits', 'setup', 'provide'])

    public static build(
        cons: TVueConstructor,
        metadata: ComponentMetadata,
        option: TComponentOption,
        parent: DefineComponent | undefined,
    ): TRawComponentOptions {
        const prototypes = MetadataRegistry.ownPrototypes(cons.prototype)
        const { methods, hooks } = MethodsBuilder.build(cons.prototype, prototypes, metadata)

        const options: TRawComponentOptions = {
            name: cons.name,
            props: Object.fromEntries(metadata.props),
            emits: ComponentOptionsBuilder.collectEmits(metadata, option.emits),
            computed: ComputedBuilder.build(prototypes, metadata),
            methods,
            watch: WatchBuilder.build(metadata),
            inject: Object.fromEntries(metadata.injects),
            provide: ProvideBuilder.build(metadata, option.provide),
            setup: SetupBuilder.build(metadata, option.setup),
            data: DataBuilder.build(cons),
            extends: parent,
            ...ComponentOptionsBuilder.withAccessors(hooks, AccessorInstallerBuilder.build(prototypes, metadata)),
        }

        for (const [key, value] of Object.entries(option)) {
            if (!ComponentOptionsBuilder.MERGED_OPTION_KEYS.has(key)) {
                options[key] = value
            }
        }

        for (const records of metadata.customDecorators.values()) {
            for (const record of records) {
                record.creator(options, record.key)
            }
        }

        Object.assign(options, option.options)
        option.modifier?.(options)

        return options
    }

    private static collectEmits(metadata: ComponentMetadata, emits: string[] | undefined): string[] {
        return [...new Set([
            ...metadata.emitters.values(),
            ...[...metadata.vModels.values()].map(propName => `update:${propName}`),
            ...emits ?? [],
        ])]
    }

    private static withAccessors(hooks: TFunctionMap, install: TAccessorInstaller | undefined): TFunctionMap {
        if (!install) {
            return hooks
        }
        const beforeCreate = hooks.beforeCreate
        return {
            ...hooks,
            beforeCreate(this: ComponentPublicInstance, ...args: unknown[]) {
                install(this)
                beforeCreate?.apply(this, args)
            },
        }
    }
}

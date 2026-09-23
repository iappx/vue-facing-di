import type { ComponentPublicInstance } from 'vue'
import type { ComponentMetadata } from '../metadata/ComponentMetadata'
import { MetadataRegistry } from '../metadata/MetadataRegistry'
import type { TFunctionMap } from '../types/TFunctionMap'
import type { TMethodsAndHooks } from '../types/TMethodsAndHooks'
import { PrototypeMembers } from './PrototypeMembers'

export class MethodsBuilder {
    private static readonly HOOK_NAMES = new Set([
        'beforeCreate',
        'created',
        'beforeMount',
        'mounted',
        'beforeUpdate',
        'updated',
        'activated',
        'deactivated',
        'beforeDestroy',
        'beforeUnmount',
        'destroyed',
        'unmounted',
        'renderTracked',
        'renderTriggered',
        'errorCaptured',
        'serverPrefetch',
        'render',
    ])

    public static build(prototype: object, prototypes: object[], metadata: ComponentMetadata): TMethodsAndHooks {
        const methods: TFunctionMap = {}
        const hooks: TFunctionMap = {}

        for (const [key, descriptor] of PrototypeMembers.entries(prototypes)) {
            if (key === 'constructor' || typeof descriptor.value !== 'function' || MetadataRegistry.isReservedInHierarchy(prototype, key)) {
                continue
            }
            const target = MethodsBuilder.HOOK_NAMES.has(key) || metadata.hooks.has(key) ? hooks : methods
            target[key] = descriptor.value
        }

        for (const [key, event] of metadata.emitters) {
            methods[key] = MethodsBuilder.createEmitter((prototype as TFunctionMap)[key], event)
        }

        return { methods, hooks }
    }

    private static createEmitter(method: (...args: unknown[]) => unknown, event: string) {
        return function (this: ComponentPublicInstance, ...args: unknown[]) {
            const result = method.apply(this, args)
            if (result instanceof Promise) {
                return result.then(value => {
                    this.$emit(event, value)
                    return value
                })
            }
            this.$emit(event, result)
            return result
        }
    }
}

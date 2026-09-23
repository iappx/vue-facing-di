import type { DefineComponent } from 'vue'
import type { TVueConstructor } from '../types/TVueConstructor'
import { VueBase } from '../VueBase'
import { ComponentMetadata } from './ComponentMetadata'

export class MetadataRegistry {
    private static readonly metadataByPrototype = new WeakMap<object, ComponentMetadata>()
    // Kept on the options object itself: tooling such as @vue/test-utils mounts a shallow copy of it.
    private static readonly CONSTRUCTOR_KEY = Symbol('vue-facing-di:constructor')

    public static get(prototype: object): ComponentMetadata | undefined {
        return MetadataRegistry.metadataByPrototype.get(prototype)
    }

    public static obtain(prototype: object): ComponentMetadata {
        let metadata = MetadataRegistry.metadataByPrototype.get(prototype)
        if (!metadata) {
            metadata = new ComponentMetadata()
            MetadataRegistry.metadataByPrototype.set(prototype, metadata)
        }
        return metadata
    }

    public static registerComponent(component: DefineComponent, cons: TVueConstructor): void {
        Object.defineProperty(component, MetadataRegistry.CONSTRUCTOR_KEY, { value: cons, enumerable: true })
    }

    public static constructorOf(component: object): TVueConstructor | undefined {
        return (component as Record<symbol, TVueConstructor | undefined>)[MetadataRegistry.CONSTRUCTOR_KEY]
    }

    public static parentOf(prototype: object): ComponentMetadata | undefined {
        for (const ancestor of MetadataRegistry.ancestorsOf(prototype)) {
            const metadata = MetadataRegistry.metadataByPrototype.get(ancestor)
            if (metadata) {
                return metadata
            }
        }
        return undefined
    }

    public static ownPrototypes(prototype: object): object[] {
        const prototypes = [prototype]
        for (const ancestor of MetadataRegistry.ancestorsOf(prototype)) {
            if (MetadataRegistry.metadataByPrototype.has(ancestor)) {
                break
            }
            prototypes.unshift(ancestor)
        }
        return prototypes
    }

    public static isReservedInHierarchy(prototype: object, key: string): boolean {
        return [prototype, ...MetadataRegistry.ancestorsOf(prototype)]
            .some(current => MetadataRegistry.metadataByPrototype.get(current)?.reserves(key))
    }

    private static* ancestorsOf(prototype: object): Generator<object> {
        let current: object | null = Object.getPrototypeOf(prototype)
        while (current && current !== VueBase.prototype && current !== Object.prototype) {
            yield current
            current = Object.getPrototypeOf(current)
        }
    }
}

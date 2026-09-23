import type { ComponentPublicInstance } from 'vue'
import type { DependencyContainer, InjectionToken } from 'tsyringe'
import type { TInstantiation } from '../types/TInstantiation'
import type { TVueConstructor } from '../types/TVueConstructor'
import type { VueBase } from '../VueBase'
import { ConstructionContext } from './ConstructionContext'

export class ComponentInstantiator {
    private static readonly RESOLVE_METHODS = ['resolve', 'resolveAll'] as const

    constructor(private readonly container: DependencyContainer) {}

    public instantiate(cons: TVueConstructor, vm: ComponentPublicInstance): TInstantiation<VueBase> {
        const dependencies = new Set<unknown>()
        const restore = this.recordConstructorArguments(dependencies)
        try {
            const instance = ConstructionContext.run({ cons, vm }, () => this.container.resolve(cons as unknown as InjectionToken<VueBase>))
            return { instance, dependencies }
        } finally {
            restore()
        }
    }

    // tsyringe does not expose the arguments it passes to a constructor; the container's own
    // resolve calls one level below the component are the only place they can be observed.
    private recordConstructorArguments(sink: Set<unknown>): () => void {
        const target = this.container as unknown as Record<string, (...args: unknown[]) => unknown>
        const methods = ComponentInstantiator.RESOLVE_METHODS
        const ownDescriptors = methods.map(method => Object.getOwnPropertyDescriptor(target, method))
        let depth = 0

        for (const method of methods) {
            const original = target[method]
            target[method] = function (this: unknown, ...args: unknown[]) {
                depth++
                try {
                    const result = original.apply(this, args)
                    if (depth === 2 && ComponentInstantiator.isObjectLike(result)) {
                        sink.add(result)
                    }
                    return result
                } finally {
                    depth--
                }
            }
        }

        return () => {
            methods.forEach((method, index) => {
                const descriptor = ownDescriptors[index]
                if (descriptor) {
                    Object.defineProperty(target, method, descriptor)
                } else {
                    delete target[method]
                }
            })
        }
    }

    private static isObjectLike(value: unknown): boolean {
        return (typeof value === 'object' && value !== null) || typeof value === 'function'
    }
}

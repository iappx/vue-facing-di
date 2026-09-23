import { type DefineComponent, defineComponent } from 'vue'
import { injectable } from 'tsyringe'
import { MetadataRegistry } from '../metadata/MetadataRegistry'
import { ComponentOptionsBuilder } from '../options/ComponentOptionsBuilder'
import type { TComponentOption } from '../types/TComponentOption'
import type { TMixedInstance } from '../types/TMixedInstance'
import type { TMixinsConstructor } from '../types/TMixinsConstructor'
import type { TVueConstructor } from '../types/TVueConstructor'
import { VueBase } from '../VueBase'
import { VueFacingDiError } from '../VueFacingDiError'

export class ClassComponent {
    public static define<T extends TVueConstructor>(cons: T, option: TComponentOption): T {
        injectable()(cons as unknown as new (...args: any[]) => unknown)
        const metadata = MetadataRegistry.obtain(cons.prototype)
        const parent = MetadataRegistry.parentOf(cons.prototype)
        if (parent && !parent.component) {
            throw new VueFacingDiError(`${cons.name} extends a class that uses member decorators but is not decorated with @Component`)
        }
        const options = ComponentOptionsBuilder.build(cons, metadata, option, parent?.component ?? undefined)
        const component = defineComponent(options) as DefineComponent
        metadata.component = component
        MetadataRegistry.registerComponent(component, cons)
        Object.defineProperty(cons, '__vccOpts', { value: component, configurable: true })
        return cons
    }

    public static toNative<T extends TVueConstructor>(cons: T): T {
        const component = MetadataRegistry.get(cons.prototype)?.component
        if (!component) {
            throw new VueFacingDiError(`${cons.name} is not decorated with @Component`)
        }
        return component as unknown as T
    }

    public static mixins<T extends TVueConstructor[]>(...conses: T): TMixinsConstructor<TMixedInstance<T>> {
        const mixed = ClassComponent.define(class extends VueBase {}, {
            mixins: conses.map(cons => ClassComponent.toNative(cons)),
        })
        return mixed as unknown as TMixinsConstructor<TMixedInstance<T>>
    }
}

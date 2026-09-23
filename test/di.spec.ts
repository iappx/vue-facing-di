import { mount } from '@vue/test-utils'
import { isReactive, isRef, ref } from 'vue'
import { container, inject, injectable, singleton } from 'tsyringe'
import { ClassComponent, Component, DiPlugin, Inject, Provide, VueBase } from '../src'

@singleton()
class CounterService {
    public readonly counter = ref(1)
    public calls = 0

    public next(): number {
        return ++this.calls
    }
}

@injectable()
class Greeter {
    public greeting = 'hello'

    public static saying(greeting: string): Greeter {
        return Object.assign(new Greeter(), { greeting })
    }
}

describe('dependency injection', () => {
    it('injects constructor dependencies without making them reactive', () => {
        @Component({ template: '<div>{{ service.counter.value }}</div>' })
        class UsesService extends VueBase {
            public local = 0

            constructor(@inject(CounterService) public readonly service: CounterService) {
                super()
            }
        }

        const wrapper = mount(ClassComponent.toNative(UsesService))
        const vm = wrapper.vm as unknown as UsesService

        expect(vm.service).toBe(container.resolve(CounterService))
        expect(isReactive(vm.service)).toBe(false)
        expect(isRef(vm.service.counter)).toBe(true)
        expect(wrapper.vm.$data).toEqual({ local: 0 })
        expect(wrapper.text()).toBe('1')
    })

    it('keeps primitive injections as data', () => {
        const token = 'apiUrl'
        const child = container.createChildContainer()
        child.register(token, { useValue: 'https://api' })

        @Component({ template: '<div>{{ url }}</div>' })
        class UsesPrimitive extends VueBase {
            constructor(@inject(token) public readonly url: string) {
                super()
            }
        }

        const wrapper = mount(ClassComponent.toNative(UsesPrimitive), { global: { plugins: [new DiPlugin(child)] } })

        expect(wrapper.text()).toBe('https://api')
        expect(wrapper.vm.$data).toEqual({ url: 'https://api' })
    })

    it('resolves through the container given to DiPlugin', () => {
        const child = container.createChildContainer()
        child.register(Greeter, { useValue: Greeter.saying('hi from child') })

        @Component({ template: '<div>{{ greeter.greeting }}</div>' })
        class Greeting extends VueBase {
            constructor(@inject(Greeter) public readonly greeter: Greeter) {
                super()
            }
        }

        expect(mount(ClassComponent.toNative(Greeting)).text()).toBe('hello')
        expect(mount(ClassComponent.toNative(Greeting), { global: { plugins: [new DiPlugin(child)] } }).text()).toBe('hi from child')
    })

    it('lets a subtree provide its own container', () => {
        const child = container.createChildContainer()
        child.register(Greeter, { useValue: Greeter.saying('subtree') })

        @Component({ template: '<div>{{ greeter.greeting }}</div>' })
        class Leaf extends VueBase {
            constructor(@inject(Greeter) public readonly greeter: Greeter) {
                super()
            }
        }

        @Component({ template: '<leaf />', components: { Leaf }, provide: { [DiPlugin.containerKey]: child } })
        class Scope extends VueBase {}

        expect(mount(ClassComponent.toNative(Scope)).text()).toBe('subtree')
    })

    it('provides an injected dependency through @Provide', () => {
        @Component({ template: '<div>{{ provided === expected }}</div>' })
        class Receiver extends VueBase {
            @Inject({ from: 'counterService' })
            public readonly provided!: CounterService

            public get expected(): CounterService {
                return container.resolve(CounterService)
            }
        }

        @Component({ template: '<receiver />', components: { Receiver } })
        class Sender extends VueBase {
            @Provide('counterService')
            public readonly service: CounterService

            constructor(@inject(CounterService) service: CounterService) {
                super()
                this.service = service
            }
        }

        expect(mount(ClassComponent.toNative(Sender)).text()).toBe('true')
    })

    it('runs the constructor once per component instance', () => {
        let constructed = 0

        @Component({ template: '<div />' })
        class Base extends VueBase {
            constructor() {
                super()
                constructed++
            }
        }

        @Component({ template: '<div />' })
        class Derived extends Base {}

        mount(ClassComponent.toNative(Derived))

        expect(constructed).toBe(1)
    })

    it('leaves the container untouched after resolving a component', () => {
        const child = container.createChildContainer()

        @Component({ template: '<div />' })
        class Plain extends VueBase {
            constructor(@inject(CounterService) public readonly service: CounterService) {
                super()
            }
        }

        mount(ClassComponent.toNative(Plain), { global: { plugins: [new DiPlugin(child)] } })

        expect(Object.prototype.hasOwnProperty.call(child, 'resolve')).toBe(false)
        expect(Object.prototype.hasOwnProperty.call(child, 'resolveAll')).toBe(false)
    })
})

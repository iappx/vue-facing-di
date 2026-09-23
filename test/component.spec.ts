import { mount } from '@vue/test-utils'
import { Component, ClassComponent, Hook, Prop, Setup, VueBase, VueFacingDiError } from '../src'

describe('component', () => {
    let warn: jest.SpyInstance

    beforeEach(() => {
        warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined)
    })

    afterEach(() => {
        warn.mockRestore()
    })

    it('turns fields into reactive data and methods into methods', async () => {
        @Component({ template: '<button @click="increment">{{ count }}</button>' })
        class Counter extends VueBase {
            public count = 1

            public increment(): void {
                this.count++
            }
        }

        const wrapper = mount(ClassComponent.toNative(Counter))
        await wrapper.get('button').trigger('click')

        expect(wrapper.text()).toBe('2')
        expect(wrapper.vm.$data).toEqual({ count: 2 })
        expect(warn).not.toHaveBeenCalled()
    })

    it('exposes props and methods to field initializers', () => {
        @Component({ template: '<div>{{ label }}</div>' })
        class Doubler extends VueBase {
            @Prop({ required: true })
            public readonly start!: number

            public doubled = this.start * 2

            public label = this.format(this.doubled)

            public format(value: number): string {
                return `value=${value}`
            }
        }

        const wrapper = mount(ClassComponent.toNative(Doubler), { props: { start: 3 } })

        expect(wrapper.text()).toBe('value=6')
        expect(Object.keys(wrapper.vm.$data)).toEqual(['doubled', 'label'])
        expect(warn).not.toHaveBeenCalled()
    })

    it('turns getters and setters into computed properties', async () => {
        @Component({ template: '<div>{{ full }}</div>' })
        class Name extends VueBase {
            public first = 'Ada'
            public last = 'Lovelace'

            public get full(): string {
                return `${this.first} ${this.last}`
            }

            public set full(value: string) {
                [this.first, this.last] = value.split(' ')
            }
        }

        const wrapper = mount(ClassComponent.toNative(Name))
        const vm = wrapper.vm as unknown as Name
        vm.full = 'Grace Hopper'
        await wrapper.vm.$nextTick()

        expect(vm.first).toBe('Grace')
        expect(wrapper.text()).toBe('Grace Hopper')
    })

    it('registers lifecycle hooks and @Hook methods as hooks, not methods', () => {
        @Component({ template: '<div />' })
        class Hooks extends VueBase {
            public mountedCalls = 0

            public mounted(): void {
                this.mountedCalls++
            }

            @Hook
            public beforeRouteEnter(): void {
                return undefined
            }
        }

        const native = ClassComponent.toNative(Hooks) as unknown as Record<string, any>
        const wrapper = mount(native)

        expect((wrapper.vm as unknown as Hooks).mountedCalls).toBe(1)
        expect(native.beforeRouteEnter).toBeInstanceOf(Function)
        expect(native.methods.beforeRouteEnter).toBeUndefined()
        expect(native.methods.mounted).toBeUndefined()
    })

    it('infers a Boolean prop type from the property type so the shorthand attribute is true', () => {
        @Component({ template: '<div>{{ disabled }}</div>' })
        class Toggle extends VueBase {
            @Prop()
            public readonly disabled!: boolean
        }

        expect(mount(ClassComponent.toNative(Toggle), { attrs: { disabled: '' } }).text()).toBe('true')
        expect(mount(ClassComponent.toNative(Toggle)).text()).toBe('false')
    })

    it('keeps an explicit prop type', () => {
        @Component({ template: '<div />' })
        class Explicit extends VueBase {
            @Prop({ type: [Boolean, String] })
            public readonly value!: boolean | string
        }

        const native = ClassComponent.toNative(Explicit) as unknown as { props: Record<string, { type: unknown }> }

        expect(native.props.value.type).toEqual([Boolean, String])
    })

    it('applies component options, merged emits, options and the modifier', () => {
        @Component({ template: '<span />' })
        class Child extends VueBase {}

        @Component({
            name: 'Custom',
            components: { Child },
            template: '<child />',
            inheritAttrs: false,
            emits: ['done'],
            options: { customFlag: true },
            modifier: options => {
                options.modified = true
            },
        })
        class WithOptions extends VueBase {}

        const native = ClassComponent.toNative(WithOptions) as unknown as Record<string, any>

        expect(native.name).toBe('Custom')
        expect(native.inheritAttrs).toBe(false)
        expect(native.emits).toEqual(['done'])
        expect(native.customFlag).toBe(true)
        expect(native.modified).toBe(true)
        expect(mount(native).find('span').exists()).toBe(true)
    })

    it('merges the setup option with @Setup members', () => {
        @Component({
            template: '<div>{{ fromOption }}-{{ fromDecorator }}</div>',
            setup: () => ({ fromOption: 'a' }),
        })
        class WithSetup extends VueBase {
            @Setup(() => 'b')
            public readonly fromDecorator!: string
        }

        expect(mount(ClassComponent.toNative(WithSetup)).text()).toBe('a-b')
    })

    it('accepts the bare decorator form', () => {
        @Component
        class Bare extends VueBase {
            public render(): string {
                return 'bare'
            }
        }

        expect(mount(ClassComponent.toNative(Bare)).text()).toBe('bare')
    })

    it('rejects toNative for a class that is not a component', () => {
        class Plain extends VueBase {}

        expect(() => ClassComponent.toNative(Plain)).toThrow(VueFacingDiError)
    })
})

import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import {
    ClassComponent,
    Component,
    CustomDecorator,
    Emit,
    Inject,
    Provide,
    Ref,
    VModel,
    Vanilla,
    VueBase,
    VueFacingDiError,
    Watch,
} from '../src'

describe('decorators', () => {
    it('@Watch calls the method on change, supports several watchers and immediate', async () => {
        @Component({ template: '<div />' })
        class Watcher extends VueBase {
            public value = 1
            public seen: string[] = []

            @Watch('value')
            @Watch('value', { immediate: true })
            public onValue(next: number): void {
                this.seen.push(`value:${next}`)
            }
        }

        const vm = mount(ClassComponent.toNative(Watcher)).vm as unknown as Watcher
        vm.value = 2
        await vm.$nextTick()

        expect(vm.seen).toEqual(['value:1', 'value:2', 'value:2'])
    })

    it('@Emit emits the return value and keeps returning it', async () => {
        @Component({ template: '<div />' })
        class Emitter extends VueBase {
            @Emit()
            public select(id: number): number {
                return id * 10
            }

            @Emit('saved')
            public async save(): Promise<string> {
                return 'ok'
            }
        }

        const wrapper = mount(ClassComponent.toNative(Emitter))
        const vm = wrapper.vm as unknown as Emitter

        expect(vm.select(4)).toBe(40)
        await expect(vm.save()).resolves.toBe('ok')
        expect(wrapper.emitted('select')).toEqual([[40]])
        expect(wrapper.emitted('saved')).toEqual([['ok']])
        expect((ClassComponent.toNative(Emitter) as unknown as { emits: string[] }).emits).toEqual(['select', 'saved'])
    })

    it('@VModel reads the model prop and emits update on assignment', () => {
        @Component({ template: '<div />' })
        class Input extends VueBase {
            @VModel()
            public text!: string

            @VModel({ name: 'page' })
            public current!: number
        }

        const wrapper = mount(ClassComponent.toNative(Input), { props: { modelValue: 'a', page: 1 } })
        const vm = wrapper.vm as unknown as Input
        vm.text = 'b'
        vm.current = 2

        expect(wrapper.emitted('update:modelValue')).toEqual([['b']])
        expect(wrapper.emitted('update:page')).toEqual([[2]])
        expect(vm.text).toBe('a')
    })

    it('@VModel rejects a member named after its own model prop', () => {
        expect(() => {
            @Component({ template: '<div />' })
            class Recursive extends VueBase {
                @VModel()
                public modelValue!: string
            }
            return Recursive
        }).toThrow(VueFacingDiError)
    })

    it('@Ref resolves template refs lazily', () => {
        @Component({ template: '<input ref="field"><span ref="label" />' })
        class WithRefs extends VueBase {
            @Ref()
            public readonly field!: HTMLInputElement

            @Ref('label')
            public readonly caption!: HTMLSpanElement
        }

        const vm = mount(ClassComponent.toNative(WithRefs)).vm as unknown as WithRefs

        expect(vm.field.tagName).toBe('INPUT')
        expect(vm.caption.tagName).toBe('SPAN')
    })

    it('@Provide and @Inject pass values down the tree', () => {
        const themeKey = Symbol('theme')

        @Component({ template: '<div>{{ size }}-{{ theme }}-{{ missing }}</div>' })
        class Consumer extends VueBase {
            @Inject()
            public readonly size!: number

            @Inject({ from: themeKey })
            public readonly theme!: string

            @Inject({ default: 'fallback' })
            public readonly missing!: string
        }

        @Component({ template: '<consumer />', components: { Consumer } })
        class Producer extends VueBase {
            @Provide()
            public size = 3

            @Provide(themeKey)
            public themeName = 'dark'
        }

        const wrapper = mount(ClassComponent.toNative(Producer))

        expect(wrapper.text()).toBe('3-dark-fallback')
        expect((wrapper.vm as unknown as Producer).size).toBe(3)
    })

    it('@Vanilla keeps an accessor as a plain, uncached property', () => {
        let reads = 0

        @Component({ template: '<div />' })
        class WithVanilla extends VueBase {
            @Vanilla
            public get stamp(): number {
                return ++reads
            }
        }

        const native = ClassComponent.toNative(WithVanilla) as unknown as { computed: Record<string, unknown> }
        const vm = mount(native).vm as unknown as WithVanilla

        expect(native.computed.stamp).toBeUndefined()
        expect(vm.stamp).toBe(1)
        expect(vm.stamp).toBe(2)
    })

    it('CustomDecorator hands the options to the creator and hides the member unless preserved', () => {
        const Track = CustomDecorator.create((options, key) => {
            options.methods = { ...options.methods, [`track_${key}`]: () => key }
        })
        const Kept = CustomDecorator.create(() => undefined, { preserve: true })

        @Component({ template: '<div />' })
        class Decorated extends VueBase {
            @Track
            public hidden = 1

            @Kept
            public kept = 2
        }

        const vm = mount(ClassComponent.toNative(Decorated)).vm as unknown as Record<string, any>

        expect(vm.track_hidden()).toBe('hidden')
        expect(vm.$data).toEqual({ kept: 2 })
    })

    it('a native component can render a class component', () => {
        @Component({ template: '<b>class</b>' })
        class Inner extends VueBase {}

        const Outer = defineComponent({ render: () => h(Inner) })

        expect(mount(Outer).html()).toBe('<b>class</b>')
    })
})

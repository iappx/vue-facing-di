import { mount } from '@vue/test-utils'
import { ClassComponent, Component, Prop, VModel, VueBase, VueFacingDiError, Watch } from '../src'

describe('inheritance', () => {
    it('supports an abstract base component whose watcher calls methods implemented by the child', async () => {
        type TValue = { raw: string }

        @Component({})
        abstract class ItemBase<T> extends VueBase {
            @Prop({ required: false, default: false })
            public readonly disabled!: boolean

            @VModel()
            public value!: TValue

            public rawValue: T | null = null

            protected abstract formatValue(value: string): T

            protected abstract valueToString(value: T): string

            @Watch('rawValue')
            public rawValueChanged(value: T): void {
                this.value.raw = this.valueToString(value)
            }

            public created(): void {
                this.rawValue = this.formatValue(this.value.raw)
            }
        }

        @Component({ template: '<div>{{ rawValue }}-{{ disabled }}</div>' })
        class BoolItem extends ItemBase<boolean> {
            protected formatValue(value: string): boolean {
                return value === 'true'
            }

            protected valueToString(value: boolean): string {
                return value ? 'true' : 'false'
            }
        }

        const model = { raw: 'true' }
        const wrapper = mount(ClassComponent.toNative(BoolItem), { props: { modelValue: model } })
        const vm = wrapper.vm as unknown as BoolItem

        expect(wrapper.text()).toBe('true-false')
        vm.rawValue = false
        await vm.$nextTick()
        expect(model.raw).toBe('false')
    })

    it('resolves a watcher to the overriding method of the child', async () => {
        @Component({ template: '<div />' })
        class Parent extends VueBase {
            public value = 1
            public log: string[] = []

            @Watch('value')
            public onValue(): void {
                this.log.push('parent')
            }
        }

        @Component({ template: '<div />' })
        class Child extends Parent {
            public override onValue(): void {
                this.log.push('child')
            }
        }

        const vm = mount(ClassComponent.toNative(Child)).vm as unknown as Child
        vm.value = 2
        await vm.$nextTick()

        expect(vm.log).toEqual(['child'])
    })

    it('collects methods from undecorated intermediate classes', () => {
        class Helpers extends VueBase {
            public shout(value: string): string {
                return value.toUpperCase()
            }
        }

        @Component({ template: '<div>{{ shout("hi") }}</div>' })
        class Loud extends Helpers {}

        expect(mount(ClassComponent.toNative(Loud)).text()).toBe('HI')
    })

    it('rejects a parent that uses member decorators without @Component', () => {
        class Undecorated extends VueBase {
            @Prop()
            public readonly label!: string
        }

        expect(() => Component({})(class Broken extends Undecorated {})).toThrow(VueFacingDiError)
    })

    it('mixes several components in', () => {
        @Component({})
        class Named extends VueBase {
            public name = 'mixed'
        }

        @Component({})
        class Greets extends VueBase {
            public greet(value: string): string {
                return `hello ${value}`
            }
        }

        @Component({ template: '<div>{{ greet(name) }}</div>' })
        class Mixed extends ClassComponent.mixins(Named, Greets) {}

        expect(mount(ClassComponent.toNative(Mixed)).text()).toBe('hello mixed')
    })
})

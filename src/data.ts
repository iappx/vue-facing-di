import type { Cons } from './component'
import type { OptionBuilder } from 'vue-facing-decorator/src/optionBuilder'
import { excludeNames, getValidNames, makeObject, obtainSlot } from 'vue-facing-decorator/src/utils'
import { container } from 'tsyringe'
import { VueBase } from './VueBase'

export function build(cons: Cons, optionBuilder: OptionBuilder, vueInstance: any) {
    optionBuilder.data ??= {}
    const sample = container.resolve(cons) as VueBase
    sample.$_initComponent(optionBuilder, vueInstance)
    let names = getValidNames(sample, (des) => {
        return !!des.enumerable
    })
    const slot = obtainSlot(cons.prototype)
    names = excludeNames(names, slot)
    Object.assign(optionBuilder.data, makeObject(names, sample))
}
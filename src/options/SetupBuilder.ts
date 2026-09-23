import type { SetupContext } from 'vue'
import type { ComponentMetadata } from '../metadata/ComponentMetadata'
import type { TSetupFunction } from '../types/TSetupFunction'
import type { TSetupState } from '../types/TSetupState'

export class SetupBuilder {
    public static build(
        metadata: ComponentMetadata,
        setup: TSetupFunction<TSetupState> | undefined,
    ): TSetupFunction<TSetupState> | undefined {
        if (metadata.setups.size === 0) {
            return setup
        }
        return (props, ctx) => {
            const extra = setup?.(props, ctx) ?? {}
            const own = SetupBuilder.runDecorated(metadata.setups, props, ctx)
            if (extra instanceof Promise || own instanceof Promise) {
                return Promise.all([extra, own]).then(([extraState, ownState]) => ({ ...extraState, ...ownState }))
            }
            return { ...extra, ...own }
        }
    }

    private static runDecorated(
        setups: Map<string, TSetupFunction>,
        props: Readonly<Record<string, unknown>>,
        ctx: SetupContext<any>,
    ): TSetupState | Promise<TSetupState> {
        const state: TSetupState = {}
        const pending: Promise<void>[] = []
        for (const [key, setup] of setups) {
            const value = setup(props, ctx)
            if (value instanceof Promise) {
                pending.push(value.then(resolved => {
                    state[key] = resolved
                }))
            } else {
                state[key] = value
            }
        }
        return pending.length > 0 ? Promise.all(pending).then(() => state) : state
    }
}

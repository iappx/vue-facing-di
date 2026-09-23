import type { SetupContext } from 'vue'

export type TSetupFunction<T = unknown> = (this: void, props: Readonly<Record<string, any>>, ctx: SetupContext<any>) => T | Promise<T>

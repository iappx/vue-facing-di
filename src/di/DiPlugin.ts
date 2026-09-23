import { type App, type InjectionKey, inject } from 'vue'
import { type DependencyContainer, container as globalContainer } from 'tsyringe'

export class DiPlugin {
    public static readonly containerKey: InjectionKey<DependencyContainer> = Symbol('vue-facing-di:container')

    constructor(private readonly container: DependencyContainer = globalContainer) {}

    public static current(): DependencyContainer {
        return inject(DiPlugin.containerKey, globalContainer)
    }

    public install(app: App): void {
        app.provide(DiPlugin.containerKey, this.container)
    }
}

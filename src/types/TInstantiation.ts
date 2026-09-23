export type TInstantiation<T> = {
    instance: T
    dependencies: ReadonlySet<unknown>
}

export class PrototypeMembers {
    public static entries(prototypes: object[]): [string, PropertyDescriptor][] {
        return prototypes.flatMap(prototype => Object.entries(Object.getOwnPropertyDescriptors(prototype)))
    }

    public static isAccessor(descriptor: PropertyDescriptor): boolean {
        return typeof descriptor.get === 'function' || typeof descriptor.set === 'function'
    }
}

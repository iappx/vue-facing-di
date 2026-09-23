import type { TConstruction } from '../types/TConstruction'

export class ConstructionContext {
    private static readonly constructions: TConstruction[] = []

    public static run<T>(construction: TConstruction, create: () => T): T {
        ConstructionContext.constructions.push(construction)
        try {
            return create()
        } finally {
            ConstructionContext.constructions.pop()
        }
    }

    public static current(): TConstruction | undefined {
        return ConstructionContext.constructions[ConstructionContext.constructions.length - 1]
    }
}

# Architecture — how a class becomes a component

## Pipeline

```
member decorators ──► ComponentMetadata (per prototype, MetadataRegistry)
@Component ─────────► ClassComponent.define
                        ├─ injectable()(cons)                      tsyringe registration
                        ├─ ComponentOptionsBuilder.build           options object
                        ├─ defineComponent(options)
                        └─ cons.__vccOpts = component              Vue treats the class as a component
Vue creates instance ─► data()  = DataBuilder      → ComponentInstantiator → container.resolve(cons)
                        provide() = ProvideBuilder → reads the live instance
```

## Metadata

- Member decorators run before the class decorator and write into the `ComponentMetadata` of the
  **prototype they decorate** (`MetadataRegistry.obtain`). The registry is a `WeakMap` keyed by
  prototype, so metadata is own-only by construction.
- `ComponentMetadata.reserves(key)` names the members that must be neither `data` nor `methods`
  (props, v-models, emitters, refs, injects, setups, vanillas, non-preserved custom decorators).
  `MetadataRegistry.isReservedInHierarchy` checks the whole prototype chain, because a parent's
  `@Prop` field still shows up as an own field of the child instance.
- The prototype walk stops at `VueBase.prototype` / `Object.prototype`; otherwise
  `Object.prototype` methods would be collected as component methods.

## Inheritance

- A parent class with metadata must itself be a component (`ClassComponent.define` throws
  otherwise). The child's options get `extends: parentComponent`, and Vue merges the rest.
- Methods and accessors are collected from the class's **own prototypes**: its prototype plus
  undecorated intermediate classes up to the nearest decorated ancestor
  (`MetadataRegistry.ownPrototypes`). The ancestor's members come through `extends`.
- `data()` of every level would construct the class again. `DataBuilder` skips a level when the
  mounted leaf class (read from the component options under a symbol key) is a subclass of it —
  the leaf instance already carries every field, so a constructor runs once per component. The
  constructor reference lives on the options object rather than in a `WeakMap` because
  `@vue/test-utils` (and possibly other tooling) mounts a shallow copy of the options.
- `@Watch` stores the handler as a **method name**; Vue resolves it on the instance, so a subclass
  override is the one called.

## Instance construction (`ComponentInstantiator`)

1. `ConstructionContext.run({ cons, vm }, …)` makes the Vue instance visible to `VueBase`'s
   constructor. `VueBase` copies props and (already bound) methods onto the instance as
   **non-enumerable** properties — available to field initializers, invisible to the data scan.
   It only does so when `new.target === cons`, so a stray `VueBase` subclass built during
   resolution is left alone.
2. The container resolves the class. tsyringe does not expose the arguments it passes to the
   constructor, so `resolve` / `resolveAll` are wrapped for the duration of the call and every
   object resolved **one level below the component** is recorded. The originals are restored in
   `finally`.
3. `DataBuilder` scans own enumerable fields: reserved names are skipped, recorded dependencies are
   assigned to the Vue instance (`this[key] = value` lands on the non-reactive render context), and
   everything else becomes `data`.

Primitive injections cannot be told apart by identity and simply become data.

## Container selection

`DiPlugin.current()` is `inject(DiPlugin.containerKey, globalContainer)`, called inside `data()`
where the component instance is current. `app.use(new DiPlugin(c))` sets it app-wide; providing
`DiPlugin.containerKey` from a component switches it for a subtree.

## Props

`PropTypeInference` adds `type: Boolean` when `type` is absent and `design:type` is `Boolean`.
Without `emitDecoratorMetadata` (esbuild/Vite) there is no `design:type` and nothing is inferred.

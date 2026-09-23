# Vue Facing DI

[![npm version](https://img.shields.io/npm/v/@iappx/vue-facing-di.svg)](https://www.npmjs.com/package/@iappx/vue-facing-di)
[![license](https://img.shields.io/npm/l/@iappx/vue-facing-di.svg)](./LICENSE)

Class-based Vue 3 components with **constructor dependency injection** powered by
[tsyringe](https://github.com/microsoft/tsyringe).

Write a component as a class, declare its services as constructor parameters, and the
tsyringe container builds it. No other runtime dependency: the class-to-options compiler is
part of this package.

```vue
<template>
  <button @click="refresh">{{ user?.name ?? '…' }}</button>
</template>

<script lang="ts">
import { Component, Prop, VueBase } from '@iappx/vue-facing-di'
import { inject } from 'tsyringe'
import { UserService, type User } from './UserService'

@Component({})
export default class UserCard extends VueBase {
  @Prop({ required: true })
  public readonly userId: number

  public user: User | null = null

  constructor(@inject(UserService) private readonly users: UserService) {
    super()
  }

  public async mounted(): Promise<void> {
    await this.refresh()
  }

  public async refresh(): Promise<void> {
    this.user = await this.users.load(this.userId)
  }
}
</script>
```

## Installation

```bash
npm install @iappx/vue-facing-di tsyringe reflect-metadata
```

`vue` (3.3+), `tsyringe` and `reflect-metadata` are peer dependencies. Import the polyfill once,
before anything that touches tsyringe:

```ts
import 'reflect-metadata'
```

### TypeScript configuration

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "useDefineForClassFields": false
  }
}
```

- `experimentalDecorators` — the package implements the legacy (TypeScript) decorator protocol,
  which is also the one tsyringe uses.
- `useDefineForClassFields: false` — with the standard define semantics a decorated field such as
  `@Prop() title: string` is re-defined as `undefined` on the instance after `super()` returns, so
  field initializers can no longer read props.
- `emitDecoratorMetadata` is optional. esbuild (and therefore Vite) does not emit it, so annotate
  every constructor parameter with `@inject(Token)`; that works with or without metadata.

## How it works

`@Component` compiles the class into a Vue options object and marks it `@injectable()`. When Vue
creates the component, its `data()` resolves the class **through the tsyringe container**:

- enumerable fields become reactive `data`;
- props and methods are already on the instance while the constructor runs, so field initializers
  can use them (`doubled = this.count * 2`);
- dependencies the container passed to the constructor are attached to the component as plain,
  **non-reactive** properties. `this.service` is the very instance the container holds, not a
  reactive proxy of it, so a `Ref` inside a service stays a `Ref`;
- the constructor runs once per component instance, also for a component that extends another one.

## Decorators

| Decorator | Purpose |
| --- | --- |
| `@Component(options?)` | Compiles the class into a component and registers it as injectable. Also usable bare: `@Component`. |
| `@Prop(options?)` | Declares a prop. `{ type, required, default, validator }`. |
| `@VModel(options?)` / `@Model` | A settable computed backed by the `modelValue` prop (or `{ name }`); assigning emits `update:<name>`. The member must be named differently from the model. |
| `@Watch(source, options?)` | Watches `source` with the decorated method. `{ deep, immediate, flush }`. Can be stacked. |
| `@Emit(event?)` | Emits the method's return value (awaited for promises) and still returns it. |
| `@Ref(key?)` | A getter for `this.$refs[key ?? member]`. |
| `@Provide(key?)` | Provides the member's value to descendants. |
| `@Inject(options?)` | Vue `inject` (not DI): `{ from, default }`. Distinct from tsyringe's `inject`. |
| `@Setup(fn)` | Stores the result of a composition-API `setup` function in the member. |
| `@Hook` | Treats a method as a lifecycle hook (standard hook names are detected automatically). |
| `@Vanilla` | Keeps an accessor as a plain property instead of a cached computed. |

Getters and setters become computed properties; the other methods become methods.

### Boolean props

A prop declared with `type: Boolean` accepts the attribute shorthand (`<ui-input disabled />`)
and defaults to `false`. Declare the type explicitly:

```ts
@Prop({ type: Boolean })
public readonly disabled: boolean
```

When the build emits decorator metadata (tsc, swc), a prop whose TypeScript type is `boolean`
gets `type: Boolean` automatically.

## API

| Export | Description |
| --- | --- |
| `VueBase` | The base class every component extends. |
| `ClassComponent.toNative(Cls)` | The Vue options object compiled from a component class. |
| `ClassComponent.mixins(A, B, …)` | A base class that mixes several components in: `class C extends ClassComponent.mixins(A, B) {}`. |
| `CustomDecorator.create(creator, { preserve? })` | Builds a member decorator whose `creator(options, key)` edits the compiled options. |
| `DiPlugin` | A Vue plugin choosing the container components are resolved from. |
| `VueFacingDiError` | Thrown on invalid declarations. |

### Choosing the container

Components are resolved from tsyringe's global `container` by default. To use another one for the
whole app:

```ts
app.use(new DiPlugin(container.createChildContainer()))
```

A subtree can switch containers by providing `DiPlugin.containerKey`, and `DiPlugin.current()`
returns the container of the current component (useful inside `@Setup`).

## Migrating from 3.x

- `vue-facing-decorator` is no longer a dependency. Import everything from `@iappx/vue-facing-di`.
- `toNative(X)` → `ClassComponent.toNative(X)`; `mixins(A, B)` → `ClassComponent.mixins(A, B)`;
  `createDecorator(fn)` → `CustomDecorator.create(fn)`.
- `DiComponentBase`, `BaseTypeIdentify` and the `Cons` / `OptionSetupFunction` /
  `ComponentSetupFunction` types are removed; use `Component`, `TVueConstructor` and
  `TSetupFunction`.
- Injected dependencies are no longer part of `$data` and are no longer reactive proxies. Code that
  wrapped services in `markRaw` to avoid `Ref` unwrapping keeps working and can drop the workaround.
  The flip side: a template that renders a **plain field of a non-reactive service**
  (`{{ service.items }}`) used to update because the component reached the service through a
  reactive proxy; it no longer does. Keep such state reactive in the service itself (`ref`,
  `reactive`, a store) or copy it into a component field.
- `@Emit` methods return the method's result instead of `Promise<void>`.
- `@Watch` resolves its handler by name, so a subclass that overrides the method is the one called.
- `@VModel` on a member named like its model prop now throws instead of recursing at runtime.
- `@Provide` reads the value from the live component instead of constructing the class a second
  time without its dependencies.
- Stage 3 (TC39) decorators are not supported; tsyringe requires legacy decorators anyway.

## Development

```bash
npm install
npm run typecheck
npm run lint
npm test
npm run build      # tsup → lib/ (ESM + CJS + d.ts)
```

## License

[MIT](./LICENSE)

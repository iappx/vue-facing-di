# Vue Facing DI

[![npm version](https://img.shields.io/npm/v/@iappx/vue-facing-di.svg)](https://www.npmjs.com/package/@iappx/vue-facing-di)
[![license](https://img.shields.io/npm/l/@iappx/vue-facing-di.svg)](./LICENSE)

A thin wrapper around [vue-facing-decorator](https://github.com/facing-dev/vue-facing-decorator)
that brings **dependency injection** into Vue class components, powered by
[tsyringe](https://github.com/microsoft/tsyringe).

Write your Vue components as classes exactly like you do with `vue-facing-decorator`, but
declare constructor dependencies and let the tsyringe container resolve them for you.

## How it works

`vue-facing-decorator` turns a decorated class into a Vue component by reading its
properties, methods, computeds, watchers, props, etc. and assembling a Vue options object.

This library extends that pipeline: instead of instantiating the component class with `new`,
it resolves the instance **through the tsyringe container** (`container.resolve(cons)`).
Every class decorated with `@Component` is automatically registered as `@injectable()`, so
its constructor dependencies are injected before the component's reactive `data` is derived
from the instance.

The only thing you change in your components is the base class: use `VueBase` instead of the
original `Vue`.

## Installation

```bash
npm install @iappx/vue-facing-di tsyringe reflect-metadata
```

`vue`, `tsyringe` and `reflect-metadata` are peer requirements. tsyringe relies on decorator
metadata, so make sure `reflect-metadata` is imported once at your application entry point:

```ts
import 'reflect-metadata'
```

### TypeScript configuration

Decorator metadata must be enabled in your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

## Usage

Usage is identical to `vue-facing-decorator`, except the base class is `VueBase` instead of
the original `Vue`.

### Basic component

```vue
<template>
  <div>{{ greeting }}</div>
</template>

<script lang="ts">
import { Component, VueBase } from '@iappx/vue-facing-di'

@Component({})
export default class MyComponent extends VueBase {
  greeting = 'Hello world'
}
</script>
```

### Injecting a dependency

Declare a service, register it in the container, and request it in the component
constructor. Every constructor parameter **must** be annotated with tsyringe's
`@inject(...)` decorator so the container knows what to resolve.

```ts
import { singleton } from 'tsyringe'

@singleton()
export class UserService {
  getName() {
    return 'Ada Lovelace'
  }
}
```

```vue
<template>
  <div>{{ userName }}</div>
</template>

<script lang="ts">
import { Component, VueBase } from '@iappx/vue-facing-di'
import { inject } from 'tsyringe'
import { UserService } from './UserService'

@Component({})
export default class UserCard extends VueBase {
  userName = ''

  constructor(@inject(UserService) private readonly userService: UserService) {
    super()
  }

  mounted() {
    this.userName = this.userService.getName()
  }
}
</script>
```

> **Note:** always mark constructor parameters with `@inject(Token)`. `@Component` applies
> tsyringe's `@injectable()`, so the class and all of its explicitly injected dependencies
> participate in the container's resolution graph. Import `inject` from `tsyringe` — it is
> distinct from the `Inject` decorator (Vue `provide`/`inject`) re-exported by this package.

## API

The library re-exports the full decorator surface of `vue-facing-decorator`, so you can import
everything from a single package:

```ts
import {
  Component,        // class decorator — builds the Vue component and registers it as injectable
  VueBase,          // base class to extend instead of `Vue`
  Setup, Ref, Watch, Prop, Provide, Inject, Emit, VModel, Model,
  Vanilla, Hook, BaseTypeIdentify, toNative,
} from '@iappx/vue-facing-di'
```

| Export | Description |
| --- | --- |
| `Component` | Class decorator that assembles the Vue component and marks the class `@injectable()`. |
| `VueBase` | Base class that wires the component instance into the DI-aware build pipeline. Extend it instead of `Vue`. |
| `DiComponentBase` | The underlying decorator factory behind `Component` (exported for advanced use). |
| Re-exported decorators | `Setup`, `Ref`, `Watch`, `Prop`, `Provide`, `Inject`, `Emit`, `VModel`, `Model`, `Vanilla`, `Hook`, `BaseTypeIdentify`, `toNative` — behave exactly as in `vue-facing-decorator`. |

For the semantics of the individual decorators, refer to the
[vue-facing-decorator documentation](https://github.com/facing-dev/vue-facing-decorator).

## Development

```bash
npm install       # install dependencies
npm run build     # compile TypeScript to ./lib
npm test          # run the Jest test suite
```

## License

[MIT](./LICENSE)

import { defineConfig } from 'tsup'

export default defineConfig({
    entry: ['src/index.ts'],
    outDir: 'lib',
    tsconfig: 'tsconfig.build.json',
    format: ['esm', 'cjs'],
    target: 'es2020',
    dts: true,
    sourcemap: true,
    clean: true,
    treeshake: true,
})

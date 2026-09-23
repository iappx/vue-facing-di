import js from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
    { ignores: ['lib', 'node_modules', 'coverage'] },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-empty-object-type': ['error', { allowInterfaces: 'with-single-extends' }],
            'no-restricted-syntax': ['error', {
                selector: 'ExportNamedDeclaration > FunctionDeclaration',
                message: 'Exported functions are forbidden: put the logic on a class (decorators are exported as constants).',
            }],
        },
    },
    {
        files: ['test/**/*.ts'],
        rules: {
            '@typescript-eslint/no-unused-vars': 'off',
        },
    },
)

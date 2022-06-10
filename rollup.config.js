import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import dts from "rollup-plugin-dts";
import pkg from './package.json';

export default [
    // Browser-friendly UMD build.
    {
        input: 'src/lib.ts',
        output: {
            name: 'howLongUntilLunch',
            file: pkg.browser,
            format: 'umd',
        },
        plugins: [
            resolve(),
            commonjs(),
            typescript(),
        ],
    },
    // CommonJS (for Node) and ES module (for bundlers) build.
    {
        input: 'src/lib.ts',
        external: ['big-integer'],
        plugins: [
            typescript(),
        ],
        output: [
            { file: pkg.main, format: 'cjs' },
            { file: pkg.module, format: 'es' },
        ],
    },
    // TypeScript type definitions.
    {
        input: 'src/lib.ts',
        output: [
            { file: pkg.types, format: 'es' },
        ],
        plugins: [
            dts(),
        ],
    },
];

import babel from 'rollup-plugin-babel';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace';
import { sizeSnapshot } from 'rollup-plugin-size-snapshot';
import { uglify } from 'rollup-plugin-uglify';

import pkg from './package.json';

const input = './modules/index.js';
const globalName = 'History';
const packageName = 'history'

function external(id) {
  return !id.startsWith('.') && !id.startsWith('/');
}

const cjs = [
  {
    input,
    output: { file: `cjs/${packageName}.js`, format: 'cjs' },
    external,
    plugins: [
      babel({ exclude: /node_modules/ }),
      replace({ 'process.env.NODE_ENV': JSON.stringify('development') })
    ]
  },
  {
    input,
    output: { file: `cjs/${packageName}.min.js`, format: 'cjs' },
    external,
    plugins: [
      babel({ exclude: /node_modules/ }),
      replace({ 'process.env.NODE_ENV': JSON.stringify('production') }),
      uglify()
    ]
  }
];

const esm = [
  {
    input,
    output: { file: `esm/${packageName}.js`, format: 'esm' },
    external,
    plugins: [
      babel({
        exclude: /node_modules/,
        runtimeHelpers: true,
        plugins: [['@babel/transform-runtime', { useESModules: true }]]
      }),
      sizeSnapshot()
    ]
  }
];

const umd = [
  {
    input,
    output: { file: `umd/${packageName}.js`, format: 'umd', name: globalName },
    plugins: [
      babel({
        exclude: /node_modules/,
        runtimeHelpers: true,
        plugins: [['@babel/transform-runtime', { useESModules: true }]]
      }),
      nodeResolve(),
      commonjs({ include: /node_modules/ }),
      replace({ 'process.env.NODE_ENV': JSON.stringify('development') }),
      sizeSnapshot()
    ]
  },
  {
    input,
    output: { file: `umd/${packageName}.min.js`, format: 'umd', name: globalName },
    plugins: [
      babel({
        exclude: /node_modules/,
        runtimeHelpers: true,
        plugins: [['@babel/transform-runtime', { useESModules: true }]]
      }),
      nodeResolve(),
      commonjs({ include: /node_modules/ }),
      replace({ 'process.env.NODE_ENV': JSON.stringify('production') }),
      sizeSnapshot(),
      uglify()
    ]
  }
];

let config;
switch (process.env.BUILD_ENV) {
  case 'cjs':
    config = cjs;
    break;
  case 'esm':
    config = esm;
    break;
  case 'umd':
    config = umd;
    break;
  default:
    config = cjs.concat(esm).concat(umd);
}

export default config;

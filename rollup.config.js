//import nodeResolve from 'rollup-plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'
import typescript from 'rollup-plugin-typescript2'
import replace from 'rollup-plugin-re'

import pkg from './package.json'

const plugins = [
  replace({
    defines: {
      TEST: false
    }
  }),
  typescript()
]
const pluginsWithDeclaration = [
  replace({
    defines: {
      TEST: false
    }
  }),
  typescript({
    tsconfigOverride: {
      compilerOptions: { declaration: true }
    }
  })
]
const pluginsWithTerser = plugins.concat(
  terser({
    compress: {
      pure_getters: true,
      unsafe: true,
      unsafe_comps: true,
      warnings: false
    }
  })
)

const input = 'src/index.ts'

export default [
  // CommonJS
  {
    input,
    output: { file: 'build/frappe.js', format: 'cjs', indent: false },
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {})
    ],
    plugins: pluginsWithDeclaration
  },

  // ES
  {
    input,
    output: { file: 'build/es/frappe.js', format: 'es', indent: false },
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {})
    ],
    plugins
  },

  // ES for Browsers
  {
    input,
    output: { file: 'build/es/frappe.mjs', format: 'es', indent: false },
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {})
    ],
    plugins: pluginsWithTerser
  },

  // UMD Development
  {
    input,
    output: {
      file: 'build/umd/frappe.js',
      format: 'umd',
      name: 'Frappe',
      indent: false
    },
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {})
    ],
    plugins
  },

  // UMD Production
  {
    input,
    output: {
      file: 'build/umd/frappe.min.js',
      format: 'umd',
      name: 'Frappe',
      indent: false
    },
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {})
    ],
    plugins: pluginsWithTerser
  }
]

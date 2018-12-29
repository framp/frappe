module.exports = {
  mode: 'file',
  out: 'docs',
  theme: 'minimal',
  ignoreCompilerErrors: true,
  excludePrivate: true,
  excludeNotExported: true,
  excludeExternals: true,
  preserveConstEnums: true,
  stripInternal: true,
  suppressExcessPropertyErrors: true,
  suppressImplicitAnyIndexErrors: true,
  hideGenerator: true,
  readme: 'README.md',
  exclude: [
    'src/index.ts',
    'src/test.ts',
  ],
};
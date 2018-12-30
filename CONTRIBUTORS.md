# Frappe

## Contributors Guidelines

### General

We use [TypeScript](https://www.typescriptlang.org/) and compile to ES6.

We provide type annotations when defining parameters.

We don't use classes unless absolutely necessary.

We bump versions following [Semantic Versioning](https://semver.org/).

We strive to limit the number of our tool dependencies.

We strive to not have dependencies and we carefully vet them if we really need them.

Before finishing a PR, please remember to run `npm run prepare-pr`.

### Test

Tests are written immediately after the function you're writing.

```javascript
import test from './test' // <test>
export const time = fn((val, time) => time)
// <test
{
  const assert = test('time')
  assert.stringEqual(run(time, [1, 2, 3, 4], [3, 5, 6, 10]), [3, 5, 6, 10])
}
// test>
```

Adding a `// <test>` comment will cause the [build script](https://github.com/framp/frappe/blob/master/strip-test.js) to strip the line.

Adding matching comments `// <test` and `// test>`, will cause all the lines between them to be stripped.

Don't write tests if they don't add value.

The command for testing is `npm test`.

No output means everything went fine.

### Code convention

We use [prettier](https://prettier.io/) and [tslint](https://www.npmjs.com/package/tslint) with a [StandardJS](https://standardjs.com) inspired configuration.

The command for fixing style is `npm run pretty`.

### Documentation

We use [typedoc](http://typedoc.org/) to generate documentation.

Typescript's type annotation will be picked up completely.

We write documentation before the designated function, using [typedoc](http://typedoc.org/) syntax.

```javascript
/**
 * It accepts an event `targetEvent` and returns a `Straw` that will emit it.
 *
 * @param targetEvent an event to emit
 * @returns a `Straw` that will emit `targetEvent`
 */
export const emit = (targetEvent: any) =>
  fn((val, time, event, emit) => emit(targetEvent)({}))
```

The command for generating documentation is `npm run docs`.
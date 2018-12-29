export default (description: string) => {
  const fail = (message: string = 'Failed') => {
    throw new Error(`Test ${description}: ${message}`)
  }
  const equal = (a: any, b: any) => {
    if (a !== b) {
      console.error('A:', a)
      console.error('B:', b)
      fail('Values are not equal')
    }
  }
  const stringEqual = (a: any, b: any) =>
    equal(JSON.stringify(a), JSON.stringify(b))
  const assert = (a: any) => !a && fail('Value is not truthy')
  return Object.assign(assert, {
    stringEqual,
    equal,
    fail
  })
}

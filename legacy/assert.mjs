export const deepEqual = (a, b) => {
  if (JSON.stringify(a) !== JSON.stringify(b))
   throw "AssertionError [ERR_ASSERTION]: Failed"
}
export const fail = () => { throw "AssertionError [ERR_ASSERTION]: Failed" };
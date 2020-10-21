/**
 *
 * Helper functions
 */

const F = () => false

const I = (a) => a

const K = (a) => () => a

const pipe = (f, ...fns) => fns.reduce((a, b) => (...c) => b(a(...c)), f)

const partial = (fn, ...a) => (...b) => fn.apply(null, [...a, ...b])

const flip = (fn) => (a, b) => fn(b, a)

const negate = (fn) => (...args) => !fn(...args)

const both = (fn, fn2) => (value) => fn(value) && fn2(value)

const ifElse = (fn, istrue, isfalse) => (value) =>
  fn(value) ? istrue(value) : isfalse(value)

const unless = (fn, isfalse) => ifElse(fn, I, isfalse)

const when = (fn, istrue) => ifElse(fn, istrue, I)

const eq = (a, b) => a === b

const isUndefined = eq.bind(null, undefined)

const isDefined = negate(isUndefined)

const gt = (a, b) =>
  typeof a === 'number' && typeof b === 'number' ? a > b : undefined

const len = (ctx) =>
  typeof ctx === 'string' || typeof ctx === 'function' || Array.isArray(ctx)
    ? ctx.length
    : undefined

const isString = (value) => typeof value === 'string'

const isValidString = both(isString, pipe(len, partial(flip(gt), 0)))

const split = (delimiter, str) =>
  isDefined(delimiter) && typeof str === 'string'
    ? str.split(delimiter)
    : undefined

const join = (delimiter, ctx) =>
  isDefined(delimiter) && Array.isArray(ctx) ? ctx.join(delimiter) : undefined

const filter = (fn, ctx) =>
  typeof fn === 'function' && Array.isArray(ctx) ? ctx.filter(fn) : undefined

const nth = (pos, ctx) =>
  typeof pos === 'number' && Array.isArray(ctx) ? ctx[pos] : undefined

module.exports = {
  isValidString,
  ifElse,
  nth,
  eq,
  F,
  unless,
  K,
  pipe,
  split,
  filter,
  join,
  partial,
  when,
  negate,
}

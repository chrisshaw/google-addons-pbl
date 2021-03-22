/**
 * Turns two properties in an object into an entry/tuple that looks like `[prop, value]`
 * @param {String} keyProp - key to pull a name value from an object with
 * @param {String} valueProp - key to pull the associated value for the prior keyProp with
 */
export function makeObjectToEntryMapper (keyProp, valueProp) {
  return (object) => [object[keyProp], object[valueProp]]
}

/**
 * Creates a big object from an array of objects by mapping `keyProp` and `valueProp` against
 * object keys and using the values of each to construct properties in a new object that
 * looks like `{ keyPropValue: valuePropValue }`
 * @param {String} keyProp - object key that stores the name of a new property
 * @param {String} valueProp - object key that stores the value for the associated new property
 */
export function objectArrayToObjectMaker (keyProp, valueProp) {
  return (objArr) => {
    const newObject = objArr.reduce((finalObj, obj) => ({ ...finalObj, [obj[keyProp]]: obj[valueProp] }), {})
    return newObject
  }
}

/**
 * Naive camel-casing utility function.
 *
 * This simply lowercases everything, splits on spaces, and then uppercases first characters. Will build on more edge cases as they're needed.
 *
 * This could be much done much faster if I were willing to learn what's going on in the solution on StackOverflow.
 * @see https://stackoverflow.com/a/2970667
 *
 * @param {String} str Sentence case or other string to camelCase
 */
export function camelize (str) {
  const camelCase = str
    .toLowerCase()
    .split(' ')
    .map((word, index) => `${index === 0 ? word.charAt(0) : word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join('')
  return camelCase
}

/**
 * Naive kebab-casing utility function. Currently this just replaces spaces with hyphens.
 *
 * @param {String} str Sentence case or "normal" string to kebab case
 */
export function kebabize (str) {
  const kebabCase = str.toLocaleLowerCase().replace(' ', '-')
  return kebabCase
}

/**
 * Groups an array of objects by the given key, where the rows get put into arrays per value of the key
 * @param {Array} grid array of objects, where the objects are we we want to group
 * @param {String} key object key we want to group on
 */
export function groupBy (grid, key) {
  return grid.reduce((groupedObject, row) => {
    (groupedObject[row[key]] = groupedObject[row[key]] || []).push(row)
    return groupedObject
  }, {})
}

export const getArrayLength = (array) => {
  if (Array.isArray(array)) {
    return array.length
  } else {
    throw new TypeError('The provided array is not an array!')
  }
}

const joinByDelimiter = (array, delimiter) => array.join(delimiter)
const makeJoinByDelimiter = (delimiter) => (array) => joinByDelimiter(array, delimiter)

export const joinByComma = makeJoinByDelimiter(', ')

export const dateFormats = {
  main: {
    timeZone: 'UTC',
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  },
  dateOnly: {
    timeZone: 'UTC',
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }
}

function getTimestamp () {
  const now = new Date(Number(Date.now()))
  const dateTimeFormat = Intl.DateTimeFormat('en-US', dateFormats.main)

  return dateTimeFormat.format(now).replace(',', '')
}

export function addTimestampsToRows (grid) {
  const timestamp = getTimestamp()
  return grid.map((row) => ([timestamp, ...row]))
}

export function chunkNumberInArray (number, chunkSize) {
  const numGroups = Math.floor(number / chunkSize)
  const remainder = number % chunkSize
  return [
    ...Array.from({ length: numGroups }, (v, i) => chunkSize),
    remainder
  ]
}

export function makePercent (ratio) {
  return ratio.toLocaleString('en-US', { style: 'percent' })
}

export function filterBy (filterFn, array) {
  return array.filter(filterFn)
}

export function getObjectEntries (obj) {
  return Object.entries(obj)
}

export function getObjectValues (obj) {
  return Object.values(obj)
}

export function getObjectKeys (obj) {
  return Object.keys(obj)
}

export const makePlaceholderArrayOfItems = (number) => (item) => {
  const array = Array.from({ length: number }, (v) => item)
  return array
}

export const toNumIfPossible = (value) => {
  const numVal = +value
  return (Number.isNaN(numVal) && value) || numVal
}

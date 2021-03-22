/*********************
 * FUNCTIONAL UTILITIES & MORE
 *
 */
export const curryPipe = (...fns) => (x) => fns.reduce((y, f) => f(y), x)
export const tracer = (log) => (label) => (value) => {
  if (log) {
    console.log(label, value)
  }
  return value
}

/**
 * Accesses one of the arrays of records pulled from a spreadsheet
 * @param {Object} sheetData Collection of spreadsheet data, with the keys as the names of the "tables" and the value the array of rows
 * @param {String} itemKey key that exists in the `sheetData` object, referring to one array of records from a "table"
 */
export const getItems = (sheetData, itemKey) => {
  const items = sheetData[itemKey]
  if (items) {
    return items
  } else {
    // If items is not defined, then return an empty array. After all, you tried to get items and there were no items to get.
    return []
  }
}
export const filterOnRecordKey = (key, comparisonValue, data) => data.filter((item) => item[key] === comparisonValue)
export const isEqualTo = (comparisonValue) => (value) => value === comparisonValue

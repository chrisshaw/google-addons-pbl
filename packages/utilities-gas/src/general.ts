import { filterBy } from "../../utilities-ts/functional-programming";
import { connectToGSuiteFolder } from "../../evidence-tracker-gas/src/connectors/g-suite";
import { zip } from "../../utilities-ts/general";

export function formatDate(date, format = 'yyyyMMdd') {
  return Utilities.formatDate(date, "GMT-5", format)
}

export function encodeImageFromBlob(imageBlob: GoogleAppsScript.Base.Blob) {
    return Utilities.base64EncodeWebSafe(imageBlob.getBytes())
}

export function replaceSpaceAndCase(text) {
    const pattern = /\W/g
    return text.replace(pattern, '-').toLowerCase()
}

export function getDate() {
    return new Date()
}

export function getTimestamp() {
    return Date.now()
}

export function getFormattedTimestamp(format = "MM/dd/yyyy HH:mm:ss") {
    return formatDate(getDate(), format)
}

export function makeArrayAMatrix(array) {
    return array.map( (el) => [el] )
}

export function getIdFromKeyAndKeymap(key, keymap) {
    try {
        const id = keymap[key]
        if (!id) throw new Error('No matching key in the keymap was found')
        if (!id.length) throw new Error('The associated id is empty.')
        return id
    } catch (err) {
        console.error('There were errors getting the id.', err)
        return err
    }
}

export function getIdsWithKeysFromKeyIdMap(keyArray, keyIdMap) {
    return keyArray.reduce( (idArray, key) => {
        const id = keyIdMap[key]
        if (id && id.length) {
            return [ ...idArray, id ]
        } else {
            return idArray
        }
    }, [] )
}

export function dropHeaders(array) {
    array.shift()
    return array
}

export function transformArrayToObject(gridArray, filterKeys?) {
    return gridArray.reduce( function (gridObject, currentRow) {
        const [ key, ...values ] = currentRow
        // if it's a key-value pair, just return the value. If there are multiple values, stick them in an array.
        const value = values.length === 1 ? values[0] : values
        
        if (!filterKeys || filterKeys.indexOf(key) >= 0) {
            gridObject[key] = value
        }
        
        return gridObject
    }, {} )
}

export function transformArrayToObjectHorizontal( gridArray ) {
    return transformArrayToObject(transposeMatrix(gridArray))
}

export function transformArrayToObjectWithKeys(arr: any[], orderedKeys: string[]) {
    return zip(orderedKeys, arr)
}

export function transformRowsToObjects( matrix ) {
    const data = matrix.slice()
    const keys = data.shift()
    return data.map( (row) => transformArrayToObjectWithKeys(row, keys) )
}

export function transposeMatrix( matrix ) {
    /*
        INPUT:
        [
            [ 'header', 'hey', 'ho' ]
            [ 'val1, 'val2, 'val3' ]
        ]

        OUTPUT:
        [

        ]
    */

    return matrix[0].map( (column, colIndex) => matrix.map( (row) => row[colIndex] ) )
}

/**
 * Transforms an array of objects into an array of arrays.
 * @param {Array} keyMap keys in the order you want them to appear in the matrix, optionally with formatters for each key
 * @param {Boolean} keepHeaders include the keys as the headers in the returned matrix
 * @param {Array} objArray array of objects you want to turn into a grid
 * @returns {Array} A matrix (an array of arrays)
 */
export function transformObjectArrayToMatrix(keyMap, keepHeaders, objArray) {
    const matrix = objArray.map( (obj) => {
        const values = keyMap.map( (keyObj) => {
            if (keyObj === null) return keyObj
            const key = keyObj.key || keyObj
            const formatter = keyObj.formatter
            const value = obj[key]
            const formattedValue = formatter ? formatter(value) : value
            return formattedValue
        } )
        return values
    })

    if (keepHeaders) {
        return [ keyMap, ...matrix ]
    } else {
        return matrix
    }
}

/**
 * Takes an array and returns a new array with only the unique values.
 * 
 * This works by splitting the work between primitives and objects, so we can take advantage of hashes for performance improvements.
 * 
 * - Primitives fill up a hash that gets checked for each element in the array.
 * - For other types, it simply does another loop through existing objects to see if the current item is already in there.
 *   - This takes advantage of the fact that objects are stored by reference.
 * 
 * @param arr array to make unique
 * @see https://stackoverflow.com/questions/9229645/remove-duplicate-values-from-js-array/9229821#9229821
 */
export function getUnique(arr) {
    const primitives = {"boolean":{}, "number":{}, "string":{}}, objs = [];

    return arr.filter( (item) => {
        const type = typeof item;
        if (type in primitives) {
            /**
             * `primitives[type].hasOwnProperty(item)` is essentially just "does it exist already?"
             * `? false` says "great, then skip it"
             * `: (primitives[type][item] = true)` is an operation which always yield true, so this adds the item to the hash and then returns true
             */
            return primitives[type].hasOwnProperty(item) ? false : (primitives[type][item] = true);
        } else {
            return objs.indexOf(item) >= 0 ? false : objs.push(item);
        }
    });
}


/**
 * Takes a string key and combines complex objects in an array to return an array of objects that are unique based on the key
 * 
 * Sort of like Lodash's _.unionBy()
 * 
 * @param uniquePropKey property to use to check uniqueness
 * @param mergeKeys heaers that should be merged rather than overwritten
 * @param items array of objects to combine
 * @returns {Array} Array with values where only one element has a given value for the target key
 */
export function getUniqueByKey(uniquePropKey, mergeKeys, items) {
    return items.reduce((unique, item, i, arr) => {
        const uniqueProp = item[uniquePropKey];
        const alreadyMerged = unique.some( (uniqueItem) => uniqueItem[uniquePropKey] === uniqueProp);
        if (alreadyMerged) {
            return unique;
        }
        else {
            const filteredItems = filterBy((item) => item[uniquePropKey] === uniqueProp, arr);
            const mergedItem = mergeOnKeys(mergeKeys, true, ...filteredItems);
            return [...unique, mergedItem];
        }
    }, []);
}

/**
 * Takes multiple objects and creates one big object, where multiple values for mergeKeys are turned into arrays for that key
 * @param keysArray key in the objects within the array of objects
 * @param overwrite whether to overwrite earlier properties with later properties
 * @param objects array of objects to merge
 */
export function mergeOnKeys(keysArray, overwrite = true, ...objects) {
    const mergedObject = objects.reduce( (finalObj, obj) => {
        Object.entries(obj).forEach( ([key, value]) => {
            /**
             * If the current key shows up in the keys we want to merge, then we create an array of the merged values
             */
            if (keysArray.includes(key)) {
                const currentPropValue = finalObj[key]
                let mergedPropValue = []
                if (Array.isArray(currentPropValue)) {
                    mergedPropValue = getUnique([ ...currentPropValue, value ])
                } else {
                    mergedPropValue = getUnique([ currentPropValue, value ])
                }

                finalObj[key] = mergedPropValue
            }
            /**
             * Any time the property doesn't already exist we just go ahead and add the later object's value.             
             * 
             * Otherwise, if the property exists, we need to decide which value takes preference. If overwrite is true, the later object's value wins.
             * This is the default behavior because this is what Object.assign() does.
             * 
             * If overwrite is false, prefer the current value. I.e., do nothing. This should only happen with the property exists and overwrite = false.
             */
            else if (
                !finalObj.hasOwnProperty(key)
                || finalObj.hasOwnProperty(key) && overwrite
            ) {
                finalObj[key] = value
            }
        } )
        
        return finalObj
    }, {})

    return mergedObject
}


/**
 * Creates an error with a message that includes the supported types
 * @param supportedTypes - array of supported types
 */
export function makeTypeSupportError(typesOrMessage: string | string[]) {
    if (Array.isArray(typesOrMessage)) {
        return new TypeError(`You must selected a supported type: ${typesOrMessage.slice(0, -1).join(', ')} or ${typesOrMessage.pop()}`)
    } else {
        return new TypeError(typesOrMessage)
    }
}
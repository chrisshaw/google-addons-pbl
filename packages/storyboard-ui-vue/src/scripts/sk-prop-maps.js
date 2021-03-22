import { camelize, dateFormats, getObjectEntries, kebabize, toNumIfPossible } from './utilities.js'

export function makeItemWithPropMap (propMap, filterMatches = false) {
  const appendEntryAsObjectProperty = makeEntryToPropertyAppender(propMap, filterMatches)
  return (listItemData) => {
    const listItemEntries = getObjectEntries(listItemData)
    const listItemObject = reduceEntriesToObject(appendEntryAsObjectProperty, listItemEntries)
    return listItemObject
  }
}

export function reduceEntriesToObject (reduceFunction, entryData) {
  const listItemObject = entryData.reduce(reduceFunction, {})
  return listItemObject
}

function makeEntryToPropertyAppender (propMap, filterMatches) {
  const transformKeyValueEntry = makeKeyValueTransformer(propMap)
  return (listItem, oldEntry) => {
    const newEntry = transformKeyValueEntry(oldEntry)
    if (newEntry) {
      return appendEntryAsObjectProperty(listItem, newEntry)
    } else if (filterMatches) {
      return listItem
    } else {
      return appendEntryAsObjectProperty(listItem, oldEntry)
    }
  }
}

function appendEntryAsObjectProperty (object, [key, value]) {
  return { ...object, [key]: value }
}

/**
 * Takes a property map and returns a function that looks at a target object and transforms its keys and values
 * based on what is specified in the property map.
 *
 * A property map's keys should match the target object. A property map's values will specify how to transform
 * that target object's keys and values.
 *
 * - If the value is a string, it will "rename" the key of the target object to the new value. E.g., Name: value to name: value.
 * - The value can also be a setting object with the following properties:
 *   1. `key`: the new key for this property
 *   2. `keyFormatter`: a function wih signature `(oldValue, oldKey)` that takes the current **key** and returns a new, transformed **key**.
 *   3. `formatter`: a function with signature `(oldValue, oldKey, newKey)` that takes the current value and returns a new, transformed value.
 *
 * The property map may also have a special `otherPropertyHandler`.
 * Its value is a function that handles properties whose keys don't match any
 * of the property map's keys.
 *
 * @param {Object} propMap - Object whose keys match a target object and whose values specify how to transform that target object's values
 * @returns {Array} key-value entry if a handler is found
 * @returns {undefined} if not
 *
 * @todo It'd be nice if formatters could reference the parent object or parent object's parent.
 */
export function makeKeyValueTransformer (propMap) {
  return ([oldKey, oldValue]) => {
    const newProp = propMap[oldKey] || propMap.otherPropertyHandler
    if (newProp) {
      const { key, keyFormatter, formatter } = newProp
      const newKey = key || (keyFormatter && keyFormatter(oldValue, oldKey)) || newProp
      const newValue = formatter ? formatter(oldValue, oldKey, newKey) : oldValue
      return [newKey, newValue]
    } else {
      /**
       * This is sort of redundant. This is default behavior for a function.
       * But since we expect parent functions to build logic off this let's be explicit.
       */
      return undefined
    }
  }
}

export const itemPropMap = {
  Name: 'name',
  Competency: 'competency',
  'Displayed Description': 'description',
  ID: 'id',
  'Resource Type': 'type',
  Icon: 'iconLink',
  Thumbnail: 'nodeGraphicUrl',
  'View URL': 'previewUrl',
  'Download URL': 'downloadUrl',
  Definition: 'details',
  'Image Link': 'nodeGraphicUrl'
}

export const typeLabelPropMap = {
  'image/jpeg': 'Image',
  'image/png': 'Image',
  'application/pdf': 'PDF',
  'application/vnd.google-apps.document': 'Google Docs',
  'application/vnd.google-apps.spreadsheet': 'Google Sheets',
  'application/msword': 'Microsoft Word',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Microsoft Word',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Microsoft Excel',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'Microsoft PowerPoint',
  'video/webm': 'Video',
  'video/mp4': 'Video',
  'text/csv': 'CSV',
  'text/x-url': 'Text'
}

export const compPropMap = {
  'Evidence Slots': {
    key: 'outOf',
    formatter: (value) => parseInt(value, 10)
  },
  'Evidence Needed': {
    key: 'outOf',
    formatter: (value) => parseInt(value, 10)
  },
  Levels: {
    key: 'levels',
    formatter: (value) => parseInt(value, 10)
  }
}

export const metaDataPropMap = {
  type: 'type',
  iconLink: 'iconLink'
}

export const actionPropMap = {
  previewUrl: {
    key: 'previewUrl',
    formatter: (value) => ({
      label: 'View Resource',
      href: value,
      target: '_blank',
      order: 1,
      show: value.length > 0,
      analyticsHeader: 'View Clicks'
    })
  },
  downloadUrl: {
    key: 'downloadUrl',
    formatter: (value) => ({
      label: 'Download Resource',
      href: value,
      /**
             * This should be _top so that it doesn't cause a new empty top to open.
             * But for now to make the click logger work, let's make it _blank
             * I think the redirect in the current window is cutting off other requests
             * (namely, the click logger). So we may need a better download solution
             * altogether.
             *
             * @see {@link ../components/SkCardActions.vue}
             */

      target: '_blank', // _top keeps it from opening a new blank tab.
      order: 2,
      show: value.length > 0,
      analyticsHeader: 'Download Clicks'
    })
  }
}

export const evidencePropMap = {
  Timestamp: {
    key: 'timestamp',
    formatter: (value) => {
      const date = new Date(value)
      const dateFormatObj = dateFormats.dateOnly
      const dateTimeFormat = Intl.DateTimeFormat('en-US', dateFormatObj)
      const timestamp = dateTimeFormat.format(date)
      return timestamp
    }
  },
  Reporter: 'reporter',
  Student: 'studentFirstLast',
  'Student ID': 'studentId',
  'Student Email': 'studentEmail',
  'Associated Item': 'competency',
  'Associated Item ID': 'competencyId',
  Value: {
    key: 'value',
    formatter: (value) => parseInt(value, 10)
  },
  Notes: 'notes',
  'Source Url': 'sourceUrl',
  'Source Name': 'sourceName'
}

export const attendancePropMap = {
  'Student Number': 'studentId',
  'Student First Name': 'firstName',
  'Student Last Name': 'lastName',
  Percent: {
    key: 'percent',
    formatter: (value) => Math.round(value * 100)
  },
  Quarter: 'quarter'
}

export const rosterPropMap = {
  id: 'personId',
  'First name': 'firstName',
  'Last name': 'lastName',
  Email: 'email',
  Alias: 'alias',
  Role: 'role',
  'Allowed Email 1': 'allowedEmail1',
  'Allowed Email 2': 'allowedEmail2',
  'Allowed Email 3': 'allowedEmail3',
  'Allowed Email 4': 'allowedEmail4',
  'Allowed Email 5': 'allowedEmail5'
}

const camelizeKey = (value, key) => camelize(key)

export const creditPropMap = {
  'Student ID': {
    key: 'personId',
    formatter: (value) => {
      return value
    }
  },
  'Last name': 'lastName',
  'First name': 'firstName',
  Alias: 'alias',
  otherPropertyHandler: {
    keyFormatter: camelizeKey,
    formatter: (value, oldKey, newKey) => {
      const newVal = toNumIfPossible(value)
      return newVal
    }
  }
}

export const settingPropMap = {
  Setting: 'setting',
  Value: {
    key: 'value',
    formatter: toNumIfPossible
  }
}

export const creditSettingPropMap = {
  otherPropertyHandler: {
    keyFormatter: camelizeKey,
    formatter: (value, oldKey) => ({
      name: oldKey,
      cssClass: kebabize(oldKey),
      outOf: value
    })
  }
}

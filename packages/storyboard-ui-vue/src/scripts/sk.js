import {
  itemPropMap,
  metaDataPropMap,
  compPropMap,
  evidencePropMap,
  actionPropMap,
  attendancePropMap,
  rosterPropMap,
  makeItemWithPropMap,
  settingPropMap,
  creditPropMap,
  creditSettingPropMap,
  makeKeyValueTransformer
} from './sk-prop-maps.js'
import { getArrayLength, getObjectEntries, makeObjectToEntryMapper } from './utilities.js'
import { getItems, curryPipe, filterOnRecordKey, tracer } from './functional-utilities'

/***********************
 * LIST ITEM FILTERS
 */

/**
 * #TODO: Update this description. It's sort of wrong.
 * #TODO: The nested reduce depends on comparing primitives. I should optimize
 *        this performance by taking advantage of hashing like this function
 *        @see @module core/utilities-gas/src/general.ts#getUnique}
 *
 * Creates a unique set of primitive values from a set of arrays
 * that you get from a provided selector
 *
 * @param {Function} selectorFn Selector function to find the array of values you're looking for
 */
export const getFilters = (selectorFn) => (items) => {
  const values = items.flatMap((item) => selectorFn(item))
  const unique = [...new Set(values)]
  const uniqueObjs = unique.map((val) => ({ id: val, label: val }))
  return uniqueObjs
}

export const getSelectedLabels = (options) => options.reduce((labels, { label, selected }) => {
  if (selected) {
    return [...labels, label]
  } else {
    return labels
  }
}, [])

/**
 * Takes a string key and returns a function that checks whether any item
 * in an array matches any label in the array of filter labels
 * @param {String} key - name of property in the filter object
 * @returns {Function}
 */
export const keyIsInFilter = (key) => (filterLabels, selectedItems) => {
  return filterLabels.length === 0 || (selectedItems && selectedItems.some((label) => filterLabels.includes(label[key])))
}

export const includedInLabels = keyIsInFilter('name')

export const itemHasFilteredCategoriesOrSubCategories = ({ metadata: { categories, subcategories } }) => {
  const hasCategory = includedInLabels([])
}

/**
 * Receives an emit function then returns a function that emits an event with the provided arguments
 * @param {Function} emit - Vue $emit function bound to the desired Vue instance
 */
export const emitOptions = (emit) => (options) => emit('selected', { value: options })

/**
 * Takes a filter option and returns a handler for a selected option
 * that sets the `selected` property on the option
 * @param {Object} filterOption - an object with a `id` and `label` property
 */
export const setSelected = (selectedId) => (filterOption) => {
  return filterOption.id === selectedId ? { ...filterOption, selected: !filterOption.selected } : filterOption
}

export const setFaded = (filteredItems = []) => (filterOptions = []) =>
  filterOptions.map((option) => {
    const { label } = option
    const hasMatch = filteredItems.some(({ metadata: { categories, subcategories } }) =>
      [categories, subcategories].some((filterCategoryLabelArray) =>
        includedInLabels([label], filterCategoryLabelArray)
      )
    )
    return { ...option, faded: !hasMatch }
  })

/************************
 * USERS
*/

export const getSpreadsheetId = (userData) => userData.spreadsheetId
export const getUserEmail = (userData) => userData.userEmail

/**************************
 * ROSTER
 */
const PERSON_ID_KEY = 'personId'
const PERSON_ROLE_KEY = 'role'

export const getRoster = (sheetData) => {
  const rosterItems = getItems(sheetData, 'roster')
  const makePerson = makeItemWithPropMap(rosterPropMap)
  const people = rosterItems.map(makePerson)
  return people
}
export const makeEmailObject = (email) => ({ email })
export const makeIdObject = (id) => ({ [PERSON_ID_KEY]: id })

const getPersonId = (person) => person.personId
const getPersonEmail = (person) => {
  return person.email
}
const getPersonFirstName = (person) => person.firstName
const getPersonLastName = (person) => person.lastName
const getPersonAlias = (person) => {
  const alias = person.alias
  /**
     * This will fail for Object-wrapped strings, for which we'd want something like `alias instanceof String` or `alias.constructor === String`.
     *
     * These values come from the propMap, which should create primitive strings.
     *
     * @see rosterPropMap
     */
  if ((typeof alias === 'string') && alias.length > 0) {
    return alias
  } else {
    return getPersonFirstName(person)
  }
}
const getPersonRole = (person) => person.role
const getPersonAllowedEmails = (person) => {
  const personId = getPersonId(person)
  const viewAsSelf = makeWhitelistObject(getPersonEmail(person), personId)
  const entries = getObjectEntries(person)
  const allowedEmails = entries.reduce((emails, [key, value]) => {
    if (key.startsWith('allowed') && !!value) {
      return [...emails, makeWhitelistObject(value, personId)]
    } else {
      return emails
    }
  }, [viewAsSelf])
  return allowedEmails
}

const getPersonFromEmail = (roster, email) => {
  const person = roster.find((rosterPerson) => getPersonEmail(rosterPerson) === email)
  return person
}

export function makeWhitelistObject(email, id) {
  return { [email]: id }
}

export const getWhitelistFromRoster = (roster) => roster.reduce((whitelist, person) => [...whitelist, ...getPersonAllowedEmails(person)], [])

export const getWhitelist = curryPipe(getRoster, getWhitelistFromRoster)

export const getWhitelistedIdsFromEmail = (whitelist, email) => {
  const allowedIds = whitelist.reduce((ids, whitelistObject) => whitelistObject.hasOwnProperty(email) ? [...ids, whitelistObject[email]] : ids, [])
  return allowedIds
}

/**
 * USED FOR GUARDIANS (allowed emails)
 *
 * Looks up all the student ids that the current user is allowed to look at and returns them
 * @param {String} email User's email address
 * @param {Object} sheetData Object holding all the data from the sheet
 */
export const findWhitelistedIdsFromEmail = (email, sheetData) => {
  const whitelist = getWhitelist(sheetData)
  const allowedIds = getWhitelistedIdsFromEmail(whitelist, email)
  return allowedIds
}

/**************************
 * STUDENTS
 * ***********************/
const STUDENT_ROLE = 'Student'
const EDUCATOR_ROLE = 'Educator'
const GUARDIAN_ROLE = 'Guardian'

export const getStudentId = getPersonId
export const getStudentIds = (students) => students.map(getStudentId)
export const getStudentFirstName = getPersonFirstName
export const getStudentLastName = getPersonLastName
export const getStudentEmail = getPersonEmail
export const getStudentById = (studentId, students) => {
  const student = students.find((student) => getStudentId(student) === studentId)
  return student
}
export const getStudentsById = (displayNameFn, studentIds, students) => studentIds.map((studentId) => displayNameFn(getStudentById(studentId, students)))
export const getStudentByEmail = (studentEmail, students) => {
  const filteredStudents = students.filter((student) => studentEmail === getStudentEmail(student))
  const numStudents = filteredStudents.length
  if (numStudents === 1) {
    return student.pop()
  } else if (numStudents > 1) {
    throw new Error('More than one student has the selected email address. Email addresses must be unique to each student.')
  } else {
    /**
         * There is no student that matches the given email address.
         */
    return {}
  }
}
export const getStudentFullName = (student) => `${getPersonFirstName(student)} ${getPersonLastName(student)}`
export const getStudentFullNameAndAlias = (student) => {
  const alias = getPersonAlias(student)
  const firstName = getPersonFirstName(student)
  const lastName = getPersonLastName(student)
  if (alias === firstName) {
    return `${firstName} ${lastName}`
  } else {
    return `${alias} (${firstName}) ${lastName}`
  }
}
export const selectNameFnByRole = (role) => {
  switch (role) {
    case STUDENT_ROLE:
      return getPersonAlias
    case EDUCATOR_ROLE:
      return getStudentFullNameAndAlias
    default:
      return getStudentFullName
  }
}
export const getStudentDisplayName = (student) => student.displayName
export const getStudentDisplayNames = (students) => students.map(getStudentDisplayName)
export const getStudentIdByEmail = (studentEmail, students) => getStudentId(getStudentByEmail(studentEmail, students))
export const getFirstStudentEmail = (sheetData) => getStudentEmail(getStudents(sheetData)[0])

export const getStudentsFromRoster = (roster) => {
  const students = filterOnRecordKey(PERSON_ROLE_KEY, STUDENT_ROLE, roster)
  return students
}
export const getStudents = (sheetData) => {
  const roster = getRoster(sheetData)
  const students = getStudentsFromRoster(roster)
  return students
}

const makeAllowedStudentsResult = (role, studentsArray) => ({ role, allowedStudents: Array.isArray(studentsArray) ? studentsArray : [studentsArray] })
const getAllowedStudentsForUser = (userData, sheetData) => {
  const userEmail = getUserEmail(userData)
  if (userEmail) {
    const roster = getRoster(sheetData)
    const students = getStudentsFromRoster(roster)
    const person = getPersonFromEmail(roster, userEmail)
    const role = person && getPersonRole(person) || GUARDIAN_ROLE
    switch (role) {
      case STUDENT_ROLE:
        return makeAllowedStudentsResult(role, person)
      case EDUCATOR_ROLE:
        return makeAllowedStudentsResult(role, students)
      case GUARDIAN_ROLE:
        const whitelist = getWhitelistFromRoster(roster)
        const allowedIds = getWhitelistedIdsFromEmail(whitelist, userEmail)
        const allowedStudents = getStudentsById(allowedIds, students)
        return makeAllowedStudentsResult(role, allowedStudents)
      default:
        throw new Error(`The user has an unsupported role. (getPersonRole() -> ${role})`)
    }
  } else {
    return []
  }
}

const appendDisplayName = (displayName, person) => ({ ...person, displayName })
const appendDisplayNames = (nameFn, people) => {
  const namedPeople = people.map((person) => {
    const displayName = nameFn(person)
    const namedPerson = appendDisplayName(displayName, person)
    return namedPerson
  })
  return namedPeople
}

export const getStudentsByUser = (userData, sheetData) => {
  const { role, allowedStudents } = getAllowedStudentsForUser(userData, sheetData)
  const displayNameFn = selectNameFnByRole(role)
  const namedStudents = appendDisplayNames(displayNameFn, allowedStudents)
  return namedStudents
}

/**************************
 * COMPETENCIES/LIST ITEMS
 * ***********************/
const DEBUG_TRACE_SWITCH = 0
const trace = tracer(DEBUG_TRACE_SWITCH)

export const getListItemName = (listItem) => listItem.name
export const getListItemId = (listItem) => listItem.id

export const getListItems = (studentId, listKey, data, { hasEvidence, hasScore, propMapHooks }) => {
  const itemData = getItems(data, listKey)
  const metadata = propMapHooks && propMapHooks.metadata || {}
  let buildItemPipeline = [
    trace('makeListItem() -> listItem'),
    makeItemWithPropMap(itemPropMap),
    trace('appendCompetency() -> mappedItem'),
    makeItemWithPropMap(compPropMap),
    trace('appendMetadata() -> competency'),
    appendNestedData('metadata', metadata ? { ...metaDataPropMap, ...metadata } : metaDataPropMap),
    trace('appendActions() -> comptencyWithMetadata'),
    appendNestedData('actions', actionPropMap),
    trace('next() -> competencyWithActions'),
    addAnalyticsToActions,
    trace('next() -> competencyWithActionsWithAnalytics')
  ]

  if (hasEvidence) {
    const studentEvidenceData = getStudentEvidence(studentId, data)
    buildItemPipeline = [
      ...buildItemPipeline,
      trace('appendEvidence()'),
      appendEvidence(evidencePropMap, studentEvidenceData),
      trace('next() -> competencyWithEvidence')
    ]
  }

  if (hasScore) {
    const appendScore = countAppenderMaker('completed', 'evidence')
    buildItemPipeline = [
      ...buildItemPipeline,
      trace('appendScore()'),
      appendScore,
      trace('>>> DONE >>> -> competencyWithScore')
    ]
  }

  const buildItem = curryPipe(...buildItemPipeline)

  const listItems = itemData.map(buildItem)

  return listItems
}

/**
 * Compares to objects' metadata properties together to return which one should come first in a sort.
 *
 * Used as a predicate for Array.sort(). Used as the sort function for resource lists.
 * @param {Object} param0 - Comparison Object A with a metadata property
 * @param {Object} param1 - Comparison Objct B with a metadata property
 */
export const byCategoryThenSubcategory = ({ metadata: { categories: cat1, subcategories: sub1 } }, { metadata: { categories: cat2, subcategories: sub2 } }) => {
  const firstCat = getComparisonCategory(cat1)
  const secondCat = getComparisonCategory(cat2)
  if (firstCat < secondCat) {
    return -1
  } else if (firstCat > secondCat) {
    return 1
  } else {
    const firstSub = getComparisonCategory(sub1)
    const secondSub = getComparisonCategory(sub2)
    if (firstSub < secondSub) {
      return -1
    } else if (firstSub > secondSub) {
      return 1
    } else {
      return 0
    }
  }
}

export const sortListItems = (items, sortByFunction = (a, b) => 0) => items.slice().sort(sortByFunction)

/**************************
 * METADATA / ACTIONS
 */
export function appendNestedData (key, nestedDataPropMap) {
  const makeNestedObject = makeItemWithPropMap(nestedDataPropMap, true)

  return (listItem) => {
    const nestedObject = makeNestedObject(listItem)
    const itemWithNestedData = {
      ...listItem,
      [key]: nestedObject
    }
    return itemWithNestedData
  }
}

function addAnalyticsToActions (item) {
  const { actions, id } = item
  return {
    ...item,
    actions: {
      actions,
      analyticsId: id
    }
  }
}

/**
 * Naively grab the first category from a list of categories and return its name
 * @param {Array} catArray - Array of objects representing categories
 */
function getComparisonCategory(catArray) {
  return catArray[0] && catArray[0].name.toUpperCase()
}

/*************************
 * EVIDENCE
 ************************/
const EVIDENCE_ASSOCIATED_ID_KEY = 'competencyId'

const getEvidence = (sheetData) => {
  const evidenceItems = getItems(sheetData, 'evidence')
  const makeEvidence = makeItemWithPropMap(evidencePropMap)
  const evidence = evidenceItems.map(makeEvidence)
  return evidence
}

const getStudentEvidence = (studentId, sheetData) => {
  const evidenceData = getEvidence(sheetData)
  const studentEvidenceData = filterOnRecordKey('studentId', studentId, evidenceData)
  return studentEvidenceData
}

const getEvidenceByAssociatedListItemId = (associatedId, evidence) => filterOnRecordKey(EVIDENCE_ASSOCIATED_ID_KEY, associatedId, evidence)

const makeEvidenceProcessor = (evidencePropMap) => {
  const makeEvidenceItem = makeItemWithPropMap(evidencePropMap)

  return (evidenceData) => evidenceData.map(makeEvidenceItem)
}

/**
 * Uses a property map to return a function that add a new `evidence` property
 * made up of a list of data objects to each item that comes through it
 * @param {Object} evidencePropMap - Plain JS Object that maps old keys to new keys and values
 * @param {Array} evidenceData - list of data objects to turn into an evidence array
 */
export function appendEvidence (evidencePropMap, evidenceData) {
  return (listItem) => {
    const associatedId = getListItemId(listItem)
    const associatedEvidence = getEvidenceByAssociatedListItemId(associatedId, evidenceData)
    const itemWithEvidence = {
      ...listItem,
      evidence: associatedEvidence
    }
    return itemWithEvidence
  }
}

/************************
 * SCORES
 ***********************/

/**
 * Creates an array length counter function that appends its count as a property to a given object.
 *
 * @param {String} nestedKey name of the new property you'll create when appending the count to the given items
 * @param {String} itemCountedPropKey name of the property of type Array you want to count up the elements of
 */
export function countAppenderMaker (nestedKey, itemCountedPropKey) {
  return (listItem) => {
    const countedProp = listItem[itemCountedPropKey]
    const count = getArrayLength(countedProp)
    return {
      ...listItem,
      [nestedKey]: count
    }
  }
}

/************************
 * MALCOMMARKS
 ***********************/
export const getPoints = (sheetData) => sheetData.malcomMarks

/************************
 * CREDITS
 ***********************/

const CREDIT_SETTINGS_HEADER = 'Maximum Credits'
const CREDIT_STUDENT_ID_KEY = 'personId'

export const getCredits = (dataStore) => {
  const creditsData = getItems(dataStore, 'credits')
  const makeCredit = makeItemWithPropMap(creditPropMap)
  const credits = creditsData.map(makeCredit)
  return credits
}

export function getStudentCredits(studentId, sheetData) {
  const credits = getCredits(sheetData)
  const studentCredits = filterOnRecordKey(CREDIT_STUDENT_ID_KEY, studentId, credits)
  const numCredits = studentCredits.length
  if (numCredits === 1) {
    const studentCreditObj = studentCredits[0]
    return studentCreditObj
  } else if (numCredits < 1) {
    return {}
  } else {
    throw new Error('There are multiple credit records for the same student ID. Student IDs must be unique.')
  }
}

function getCreditSettingsFromSettings(settingsArray) {
  const creditSettingsHeaderIndex = settingsArray.findIndex((setting) => getSettingKey(setting) === CREDIT_SETTINGS_HEADER)
  const creditSettingsData = settingsArray.slice(creditSettingsHeaderIndex + 1)
  return creditSettingsData
}

const makeCreditSetting = curryPipe(
  makeObjectToEntryMapper('setting', 'value'),
  makeKeyValueTransformer(creditSettingPropMap)
)

const getCreditSettings = (sheetData) => {
  const settingsData = getSettingsSheet(sheetData)
  const creditSettingsData = getCreditSettingsFromSettings(settingsData)
  const creditSettings = creditSettingsData.map(makeCreditSetting)
  return creditSettings
}

function makeCreditGroup([creditKey, settingObject]) {
  /**
     * There's a single entry per creditSetting, so we grab the first in the array.
     */
  return {
    key: creditKey,
    /**
         * value _should_ look like { name: string, outOf: number, cssClass: string }
         */
    ...settingObject
  }
}

const makeStudentCreditAppender = (studentCreditObj) =>
  (creditGroup) => {
    const { key } = creditGroup
    return {
      ...creditGroup,
      count: studentCreditObj[key] || 0
    }
  }

export function getStudentCreditGroups(studentId, sheetData) {
  const creditSettings = getCreditSettings(sheetData)
  const studentCreditObj = getStudentCredits(studentId, sheetData)
  const makeStudentCreditGroup = curryPipe(
    makeCreditGroup,
    makeStudentCreditAppender(studentCreditObj)
  )
  const studentCreditGroups = creditSettings.map(makeStudentCreditGroup)
  return studentCreditGroups
}

/***************************
 * ATTENDANCE
 */

export const getAttendance = (sheetData) => sheetData.attendance
export const getStudentIdFromAttendanceRecord = (record) => record['Student Number']
export const getAttendanceRecordsByStudentId = (studentId, attendanceData) => attendanceData.filter((attendanceRecord) => getStudentIdFromAttendanceRecord(attendanceRecord) === studentId)
export const getStudentAttendance = (studentId, sheetData) => {
  const attendance = getAttendance(sheetData)
  const settings = getSettingsSheet(sheetData)
  const nodeGraphicUrl = getSettingFromArray('Attendance Image Link', settings)
  const studentRecords = getAttendanceRecordsByStudentId(studentId, attendance)
  const categories = makeAttendanceItems(studentRecords, attendancePropMap, { nodeGraphicUrl })
  return categories
}

export function makeAttendanceItems(attendanceItems, propMap, commonProps) {
  const makeAttendanceItem = makeItemWithPropMap(propMap)
  const fullItems = attendanceItems.map((item) => ({ ...makeAttendanceItem(item), ...commonProps }))
  return fullItems
}

/*************************
 * SETTINGS
 */

export function getSettingsSheet(sheetData) {
  const settingItems = getItems(sheetData, 'settings')
  const makeSetting = makeItemWithPropMap(settingPropMap)
  const settings = settingItems.map(makeSetting)
  return settings
}
export function getSettingKey(setting) { return setting.setting }
export function getSettingValue(setting) { return setting.value }
export function getSettingFromArray(targetSetting, settings) {
  return settings.reduce((val, setting) => {
    const currKey = getSettingKey(setting)
    if (currKey === targetSetting) {
      return getSettingValue(setting)
    } else {
      return val
    }
  }, undefined)
}

/*************************
 * UTILITIES
 */

export const hasData = (name, data) => {
  const exists = data !== undefined && data !== null
  const hasRecords = exists && ((Array.isArray(data) && data.length > 0) || Object.keys(data).length > 0)
  return exists && hasRecords
}

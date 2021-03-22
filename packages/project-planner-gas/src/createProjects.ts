import { getSheetByName, getRange, setRangeValues, nameRange, openTypeById, getFileIdFromUrl, copySheetToSpreadsheet, getOnlySheet, appendRow, getFileOrFolderId, getFileOrFolderName, getFileOrFolderUrl, nameFileOrFolder, appendValuesToSheet } from "../../gas-utilities/gas-apis";
import { formatDate, replaceSpaceAndCase } from "../../utilities-gas/src/general";
import plannerConstants from "../../utilities-gas/src/constants";
import { getFolderChildIdsByName } from "./distributeFiles";
import { getFolderById, copyFullFolder, getProjectFolderFromRoot, getProjectAppFromRootFolder } from "./handleFoldersAndFiles";

const {
    SHEET,
    TEACHERS
} = plannerConstants()

/*

Helpers

*/

export function storeProjectIdSettings(toolSpreadsheet, projectFolder, initialConfig) {
    const { filePropNameMap, folderPropNameMap } = initialConfig
    const mapConfig = {
        filePropNameMap,
        folderPropNameMap
    }

    const fileIdValues = getFolderChildIdsByName(projectFolder, mapConfig)
    const typedFileIdValues = fileIdValues.map((fileIdValue) => ['unitFile', ...fileIdValue])
    const fileIdSheet = getSheetByName(toolSpreadsheet, ".fileIds")
    return appendValuesToSheet(fileIdSheet, typedFileIdValues)
}

function storeProjectFields(app, requirementsObject) {
    const requestSheet = getSheetByName(app, 'request-raw')
    const namedFieldValueArray = Object.entries(requirementsObject)
    const fieldsRange = getRange(requestSheet, 1, 1, namedFieldValueArray.length, 2)
    setRangeValues(fieldsRange, namedFieldValueArray)
    nameRange(app, fieldsRange, 'requirements')
}

export function createNewProjectFolder(config) {
    const masterFolder = getFolderById(config.masterPacketFolderId)
    const projectDbFolder = getFolderById(config.projectDbFolderId)
    return copyFullFolder(masterFolder, projectDbFolder)
}

function createRootFolderName(customer: string, subjects: string | string[], topic: string, timestamp) {
    return `${replaceSpaceAndCase(customer)}_${replaceSpaceAndCase(subjects)}_${replaceSpaceAndCase(topic)}_${formatDate(timestamp)}`
}

function createAppName(name) {
    return `${name}.tools`
}

export function createProjectFileName(currentName, projectName) {
    return `${currentName} - ${projectName}`
}

function insertDbRecord(values, dbId) {
    const db = openTypeById(SHEET, dbId)
    const dbSheet = getOnlySheet(db)
    return appendRow(dbSheet, values)
}

function registerNewProject(projectRootFolder, projectType, fullConfig) {
    const rootId = getFileOrFolderId(projectRootFolder)
    const rootName = getFileOrFolderName(projectRootFolder)
    const rootUrl = getFileOrFolderUrl(projectRootFolder)

    const dbId = fullConfig.projectDbId
    const dbValues = [rootId, projectType, rootName, rootUrl]

    return insertDbRecord(dbValues, dbId)
}

/*

Sidekick operations

*/

/**
 * Creates a new project based on a values from a spreadsheet
 * @param {Array} requirements - array of the form submission values
 * @param {Object} requirementsObject - object mapped from the array of values
 * @param {Object} fullConfig - global config object
 */
export function createNewProject(requirements, requirementsObject, fullConfig) {
    const {
        "Timestamp": timestamp,
        "Pick the customer": customer,
        "Pick the subjects": subjects,
        "1 or 2 words for the unit's main topic": topic
    } = requirementsObject

    const name = createRootFolderName(
        customer,
        subjects,
        topic,
        timestamp
    )

    const newProjectRootFolder = createNewProjectFolder(fullConfig)
    nameFileOrFolder(newProjectRootFolder, name)

    const newProjectFolder = getProjectFolderFromRoot(newProjectRootFolder)

    const newProjectApp = getProjectAppFromRootFolder(newProjectRootFolder, fullConfig)
    nameFileOrFolder(newProjectApp, createAppName(name))
    storeProjectFields(newProjectApp, requirementsObject)
    storeProjectIdSettings(newProjectApp, newProjectFolder, fullConfig)
    // registerNewProject(newProjectRootFolder, TEACHERS, fullConfig)

    return newProjectRootFolder
}
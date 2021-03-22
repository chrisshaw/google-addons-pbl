import { getRangeValues, openTypeById, getSheetByName, getAllSheetValues, getJsonDataFromSheetByName } from "../../utilities-gas/src/gas-apis";
import { transformArrayToObject } from "../../utilities-gas/src/general";
import plannerConstants from "../../utilities-gas/src/constants";

const {
    SHEET,
} = plannerConstants()


interface FileId {
    type: string,
    key: string,
    id: string
}

function getFileIds(spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet, fullConfig): FileId[] {
    const { sheetNames: { fileIds } } = fullConfig
    return getJsonDataFromSheetByName(spreadsheet, fileIds)
}

export function getUnitFileIds(fileIds: FileId[]) {
    // get the .fileIds, which includes all the file and folder ids
    // if desiredKeys is undefined it'll return all of them

    return fileIds  .filter(makeFilterForType('unitFile'))
                    .reduce(tranformFileIdsToObject, {})
}

function tranformFileIdsToObject(finalObject: {}, currentFileIdObject: FileId, currentIndex: number, array: FileId[]) {
    const { key, id } = currentFileIdObject
    return { ...finalObject, [key]: id }
}

function makeFilterForType(type): (value: FileId, index: number, array: FileId[]) => Boolean {
    return (fileIdObject) => fileIdObject.type === type;
}

export function getComponentIds(fileIds: FileId[]) {

    return fileIds  .filter(makeFilterForType('masterComponent'))
                    .reduce(tranformFileIdsToObject, {})
}

/**
 * Creates an object holding common configuration fields for the project.
 * @param spreadsheet - Google Sheets spreadsheet that is the active spreadsheet for the add-on
 * @param config - shared config object from {@link config/config.ts}
 */
export function getFields(spreadsheet, config) {
    const { sheetNames: { fields: fieldsName, settings } } = config
    const configObject = [fieldsName, settings].reduce((finalFieldObject, currentSheetName) => {
        const values = getAllSheetValues(getSheetByName(spreadsheet, currentSheetName))
        /**
         * Because getAllSheetValues grabs a square grid, fieldsValues rows may have some empty values.
         * I happen to know that this particular sheet is just a bunchof key-value pairs.
         * Each row should only have 2 elements.
         * So we're going to truncate it.
         */
        const fields = values.map((fieldRow) => fieldRow.slice(0, 2))
        const object = transformArrayToObject(fields)
        return { ...finalFieldObject, ...object }
    }, {})
    return configObject
}

export function getMasterAppAndConfig(config) {
    const appId = config.masterPacketAppId
    const masterApp = openTypeById(SHEET, appId)
    const masterConfig = getConfig(masterApp, config)

    return {
        masterApp,
        masterConfig
    }
}

export function getNames(spreadsheet) {
    const nameSheet = getSheetByName(spreadsheet, "newProject")
    const nameValues = getRangeValues(nameSheet.getRange(1, 1, 3, 2))
    const namesObject = transformArrayToObject(nameValues)
    return namesObject
}

export function getConfig(app, config) {
    const fileIds = getFileIds(app, config)
    const projectIds = getUnitFileIds(fileIds)
    const componentIds = getComponentIds(fileIds)
    const fieldConfig = getFields(app, config)
    return {
        ...config,
        projectIds,
        componentIds,
        fieldConfig
    }
}
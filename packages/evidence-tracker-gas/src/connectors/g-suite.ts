import { getSheetByName, openSpreadsheet, getFolderById, getActiveSpreadsheet } from "../../../gas-utilities/gas-apis";

function getSheetAsConnection( spreadsheetId, sheetName ) {
    const ss = openSpreadsheet(spreadsheetId)
    const sheet = getSheetByName(ss, sheetName)
    return sheet
}

export function connectToActiveGSuiteSheet({ sheetName }) {
    const ss = getActiveSpreadsheet()
    return getSheetByName(ss, sheetName)
}

export function connectToGSuiteSheet({ spreadsheetId, sheetName }) {
    return getSheetAsConnection(spreadsheetId, sheetName)
}

export function connectToGSuiteFolder({ folderId }) {
    return getFolderById(folderId)
}
import { getSheetByName, getJsonDataFromSheet, clearAllSheetValuesExceptHeaders, appendValuesToSheet } from "../../../utilities-gas/gas-apis";
import { transformObjectArrayToMatrix } from "../../../utilities-gas/general";
export function demo_copyOverCyber(toolSpreadsheet, { sheetNames }) {
    const headers = [
        null,
        'Project',
        "First Name",
        "Last Name",
        null,
        "Email",
    ]

    const contactListSheet = getSheetByName(toolSpreadsheet, sheetNames.contacts)
    const cyberSheet = getSheetByName(toolSpreadsheet, 'cyber')
    const contacts = getJsonDataFromSheet(cyberSheet)
    const contactMatrix = transformObjectArrayToMatrix(headers, false, contacts)
    clearAllSheetValuesExceptHeaders(contactListSheet)
    appendValuesToSheet(contactListSheet, contactMatrix)
}
import { getJsonDataFromSheet, setRangeValues, getRange, getActiveSpreadsheet, getSheetByName, getHeadersFromSheet, } from "../../utilities-gas/src/gas-apis";

/**
 * Click handler for when people decide to click on an item's link.
 * Takes the id of the item and the header to increment the click count.
 * 
 * @param id - ID of the resource
 * @param clickColumnHeader - Exact name of the header holding click values
 */
export function logClick(id, clickColumnHeader) {
    const ss = getActiveSpreadsheet()
    const sheet = getSheetByName(ss, 'Resources')
    const headers: any[] = getHeadersFromSheet(sheet)

    const headerIndex = headers.findIndex( (col) => col === clickColumnHeader )
    if (headerIndex < 0) throw Error('We did not find the given clickColumnHeader as a header.')
    // The index is from a JavaScript array, which starts at 0.
    // Google spreadsheets start their indices at 1.
    // So we add 1 to make it even.
    const clickColumnIndex = headerIndex + 1
    const values: object[] = getJsonDataFromSheet(sheet)
    const index = values.findIndex( (val) => id === val['ID'] )
    // The index is based on JavaScript arrays, which start at 0.
    // It also doesn't account for the header row. So to make it
    // even with the appropriate spreadsheet row we add 2.
    const rowIndex = index + 2

    if (index >= 0) {

        const obj = values[index]
        const cell = getRange(sheet, rowIndex, clickColumnIndex, 1, 1)

        // obj[clickColumnHeader] should be the current click value.
        // A + operator will dynamically cast the value to a Number.
        // We then add 1 to it and set the new number as the new value.
        // Set range values needs a grid.
        const valuesGrid = [
            [ obj[clickColumnHeader] + 1 ]
        ]
        setRangeValues(cell, valuesGrid)
    } else {
        throw new Error('The id of the clicked item does not exist in the sheet values')
    }
}
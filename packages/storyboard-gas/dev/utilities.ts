import { removeDocumentCache } from "../../utilities-gas/gas-apis";
import { batchGetRangeValues, getSpreadsheetId, getActiveSpreadsheet } from "../../utilities-gas/src/gas-apis";

function removeListDataFromCache() {
    removeDocumentCache(['listData'])
}

function getListDataResponse() {
    const ranges = [
        'settings',
        'roster',
        'credits',
        'competencies',
        'evidence',
        'checkpoints',
        'attendance'
    ]
    const ssId = getSpreadsheetId(getActiveSpreadsheet())
    const resp = batchGetRangeValues(ssId, ranges)
    console.log(resp)
}
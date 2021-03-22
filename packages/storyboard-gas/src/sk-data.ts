import { batchGetRangeValues, appendValuesToSheet, openSpreadsheet, getSheetByName, getActiveSpreadsheet, getSpreadsheetId, getEffectiveUserEmail, getActiveUserEmail, getDocumentCache, getValueInCache, storeValueInCache, getGzippedValueInCache, storeGzippedValueInCache, gasGzip, base64Encode, getBlobBytes, base64Decode, newBlob, gasUngzipToString, getBlobDataAsString, gzip, ungzip } from '../../utilities-gas/src/gas-apis';
import { jsonStringify, jsonParse } from "../../utilities-ts/general";

export function getUserData() {
    const mainSpreadsheet = getActiveSpreadsheet();
    const spreadsheetId = getSpreadsheetId(mainSpreadsheet);
    const userEmail = getActiveUserEmail();
    const scriptUserEmail = getEffectiveUserEmail();
    return {
        spreadsheetId,
        userEmail,
        scriptUserEmail
    };
}

export function getListData(spreadsheetId, ranges) {
    const result = batchGetRangeValues(spreadsheetId, ranges);
    return result
}

export function getAndCacheListData(ranges: string[]) {
    const data = getDataTryCache(ranges, 'listData')
    return data
}

export function getDataTryCache(ranges: string[], cacheKey: string) {
    const cache = getDocumentCache()
    const cachedData = getCachedResonse(cache, cacheKey)
    if (cachedData && ranges.every( (range) => cachedData[range] )) {
        return cachedData
    } else {
        const ssId = getSpreadsheetId(getActiveSpreadsheet())
        const sheetData = batchGetRangeValues(ssId, ranges)
        const storeResult = cacheResponse(sheetData, cache, cacheKey)
        return sheetData
    }
}

function getCachedResonse(cache, cacheKey) {
    const jsonBlobGzBytesB64 = getValueInCache(cache, cacheKey)
    if (jsonBlobGzBytesB64) {
        const jsonBlobGzBytes = base64Decode(jsonBlobGzBytesB64)
        const jsonBlobGz = newBlob(jsonBlobGzBytes, 'application/x-gzip')
        const jsonBlob = ungzip(jsonBlobGz)
        const json = getBlobDataAsString(jsonBlob)
        const obj = jsonParse(json)
        return obj
    } else {
        return jsonBlobGzBytesB64
    }
}

function cacheResponse(objData, cache, cacheKey) {
    const json = jsonStringify(objData)
    const jsonBlob = newBlob(json, 'application/json')
    const jsonBlobGz = gzip(jsonBlob)
    const jsonBlobGzBytes = getBlobBytes(jsonBlobGz)
    const jsonBlobGzBytesB64 = base64Encode(jsonBlobGzBytes)
    const result = storeValueInCache(cache, jsonBlobGzBytesB64, cacheKey)
    return result
}

export function addAttendanceData(sheetName, spreadsheetId, values) {
    const ss = openSpreadsheet(spreadsheetId);
    const sheet = getSheetByName(ss, sheetName);
    return appendValuesToSheet(sheet, values);
}
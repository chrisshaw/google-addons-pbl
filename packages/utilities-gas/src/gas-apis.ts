import plannerConstants from './constants'
import { makeTypeSupportError, transformRowsToObjects, transposeMatrix } from "./general";
import { joinOnNewLines, getObjectEntries, zip, stringifyJsObject, parseStringifiedJsObject, jsonStringify, jsonParse, isString } from '../../utilities-ts/general';


const {
  SHEET,
  DOC,
  SLIDE,
  TABLE,
  PARAGRAPH,
  IMAGE,
  TABLE_ROW
} = plannerConstants()

export function openTypeById(fileType, id) {
  switch (fileType) {
    case SHEET:
      return SpreadsheetApp.openById(id)
    case DOC:
      return DocumentApp.openById(id)
    case SLIDE:
      return SlidesApp.openById(id)
    default:
      return new Error('"fileType" must be defined as "spreadsheet", "document", or "slide"')
  }
}

/*********************
 * SHEETS
 */

export function openSpreadsheet(id): GoogleAppsScript.Spreadsheet.Spreadsheet {
  return openTypeById(SHEET, id)
}

export function getSpreadsheetId(spreadsheet) {
  return spreadsheet.getId()
}

export function getSheetByName(spreadsheet, name) {
  return spreadsheet.getSheetByName(name)
}

export function getNumberOfColumnsInRange(range) {
  return range.getNumColumns()
}

export function getNumberOfRowsInRange(range) {
  return range.getNumRows()
}

export function clearRangeValues(range: GoogleAppsScript.Spreadsheet.Range) {
  return range.clearContent()
}

export function clearAllSheetValuesExceptHeaders(sheet) {
  const dataRange: GoogleAppsScript.Spreadsheet.Range = getFullDataRange(sheet)
  const numRows = getNumberOfRowsInRange(dataRange)
  if (numRows > 1) {
    const rangeToClear = offsetRange(
      dataRange,
      1,
      0,
      numRows - 1,
      getNumberOfColumnsInRange(dataRange)
    )
    return clearRangeValues(rangeToClear)
  } else {
    return dataRange
  }
}

export function offsetRange(range: GoogleAppsScript.Spreadsheet.Range, rowOffset, columnOffset, rowSize, columnSize) {
  return range.offset(rowOffset, columnOffset, rowSize, columnSize)
}

export function appendRow(sheet, valuesArray) {
  // adds a row starting in the first column to however many columns there are values 
  const valuesGrid = [valuesArray]
  return appendValuesToSheet(sheet, valuesGrid)
}

export function appendValuesToSheet(sheet, valuesGrid) {
  const lastRowIndex = getLastRow(sheet)
  const rows = valuesGrid.length
  const columns = valuesGrid.reduce((maxLength, row) => Math.max(maxLength, row.length || 0), 0)
  if (isNaN(rows)) {
    throw new Error(`valuesGrid.length is not a number`)
  } else if (isNaN(columns)) {
    throw new Error(`Math.max(${valuesGrid.map((row) => row.length).join(', ')}) is not a number.`)
  }
  const nextRange = getRange(sheet, lastRowIndex + 1, 1, rows, columns)

  return setRangeValues(nextRange, valuesGrid)
}

export function getLastRow(sheet) {
  return sheet.getLastRow()
}

export function getLastColumn(sheet) {
  return sheet.getLastColumn()
}

export function getRange(
  sheet: GoogleAppsScript.Spreadsheet.Sheet,
  row: number,
  column: number,
  rowSize: number,
  columnSize: number
) {
  return sheet.getRange(row, column, rowSize, columnSize)
}

/**
 * Sets a range to the given matrix of values.
 * @param range Google Sheets spreadsheet range to change the value of
 * @param values A matrix/grid of values to put into the cells. It **must** be a grid.
 * @see https://developers.google.com/apps-script/reference/spreadsheet/range#setValues(Object)
 */
export function setRangeValues(range, values) {
  return range.setValues(values)
}

export function getActiveSpreadsheet() {
  return SpreadsheetApp.getActiveSpreadsheet()
}

export function getRangeByName(spreadsheet, rangeName) {
  return spreadsheet.getRangeByName(rangeName)
}

export function nameRange(spreadsheet, range, name) {
  spreadsheet.setNamedRange(name, range)
}

export function openSpreadsheetByUrl(url) {
  return openTypeByUrl(url, SHEET)
}

function openTypeByUrl(url, type) {
  switch (type) {
    case 'spreadsheet':
      return SpreadsheetApp.openByUrl(url)
      break;
    case 'document':
      return DocumentApp.openByUrl(url)
      break;
    default:
      return new Error('"type" must be "spreadsheet" or "document"')
  }
}

function nameSheet(sheet, name) {
  return sheet.setName(name)
}

function makeSheetActive(sheet) {
  return sheet.activate()
}

function moveActiveSheet(spreadsheet, position) {
  return spreadsheet.moveActiveSheet(position)
}

function moveSheet(sheet, parentSpreadsheet, position) {
  makeSheetActive(sheet)
  moveActiveSheet(parentSpreadsheet, position)
}

export function copySheetToSpreadsheet(sheet, spreadsheet, options) {
  const { name, position } = options

  const copiedSheet = sheet.copyTo(spreadsheet)
  if (name) {
    nameSheet(copiedSheet, name)
  }

  if (position) {
    moveSheet(copiedSheet, spreadsheet, position)
  }

  return copiedSheet
}

export function getOnlySheet(spreadsheet) {
  return spreadsheet.getSheets()[0]
}

export function getFullDataRange(sheet) {
  return sheet.getDataRange()
}

export function getAllSheetValues(sheet) {
  return getRangeValues(getFullDataRange(sheet))
}

export function getJsonDataFromSheet(sheet) {
  const valueMatrix = getAllSheetValues(sheet)
  return transformRowsToObjects(valueMatrix)
}

export function getJsonDataFromSheetByName(spreadsheet, sheetName) {
  return getJsonDataFromSheet(getSheetByName(spreadsheet, sheetName))
}

export function getJsonDataFromSheetsByNames(spreadsheet, sheetNames: string[]) {
  return sheetNames.reduce((properties, sheetName) => {
    const data = getJsonDataFromSheetByName(spreadsheet, sheetName)
    return { ...properties, [sheetName]: data }
  }, {})
}

export function getTransposedJsonDataFromSheetByName(spreadsheet, sheetName) {
  const valueMatrix = getAllSheetValues(getSheetByName(spreadsheet, sheetName))
  const transposedMatrix = transposeMatrix(valueMatrix)
  return transformRowsToObjects(transposedMatrix)
}

export function getRangeValue(range: GoogleAppsScript.Spreadsheet.Range) {
  return range.getValue()
}

export function getRangeValues(range) {
  return range.getValues()
}

export function getHeadersFromSheetByName(ss, sheetName) {
  const sheet = getSheetByName(ss, sheetName)
  const headerValues = getHeadersFromSheet(sheet)
  return headerValues
}

export function getHeadersFromSheet(sheet) {
  const headerRow = getHeaderRowFromSheet(sheet)
  const headerValueGrid = getRangeValues(headerRow)
  const headerValues = headerValueGrid[0]
  return headerValues
}

export function getHeaderRowFromSheet(sheet) {
  const lastColumn = getLastColumn(sheet)
  const headerRow = getRange(sheet, 1, 1, 1, lastColumn)
  return headerRow
}

export function getHeaderRowFromSheetName(ss: any, sheetName: any) {
  const sheet = getSheetByName(ss, sheetName);
  const headerRow = getHeaderRowFromSheet(sheet)
  return headerRow
}

/**
 * Gets a bunch of different value sets from different ranges.
 * 
 * Requires advanced Drive service (hence the Sheets service object) to be enabled
 * @param spreadsheetId id of the g suite spreadsheet
 * @param stringRanges either the named range names or the string of the range
 * @requires Sheets Advanced Sheets API Service
 */
export function batchGetRangeValues(spreadsheetId, stringRanges) {
  const request = {
    ranges: stringRanges
  }
  const result = Sheets.Spreadsheets.Values.batchGet(spreadsheetId, request)
  const valueRanges = getValueRangesFromBatchResult(result)
  const dataArray = valueRanges.map(handleValueRange)
  const dataObject = zip(stringRanges, dataArray)
  return dataObject
}

function getValueRangesFromBatchResult(result) {
  const valueRanges = result.valueRanges
  return valueRanges
}

function getSheetValuesFromValueRange(valueRange) {
  return valueRange.values;
}

function handleValueRange(valueRange) {
  const values = getSheetValuesFromValueRange(valueRange)
  const objArr = transformRowsToObjects(values)
  return objArr
}

export function getSelection(spreadsheet) {
  return spreadsheet.getSelection()
}

export function getValuesFromSelection(ssApp) {
  const selection = getSelection(ssApp)
  return getRangeValues(selection.getActiveRange())
}

export function getSheetActiveRange(sheet: GoogleAppsScript.Spreadsheet.Sheet) {
  return sheet.getActiveRange()
}

export function getSelectionActiveRange (selection: GoogleAppsScript.Spreadsheet.Selection) {
  return selection.getActiveRange()
}

export function getSheetCurrentCell(sheet: GoogleAppsScript.Spreadsheet.Sheet) {
  return sheet.getCurrentCell()
}

export function getRangeRow(range: GoogleAppsScript.Spreadsheet.Range) {
  return range.getRowIndex()
}

/******************
 * FILES
 */

export function getFileIdFromUrl(url, type) {
  const id = url.substring(url.indexOf('id=') + 3)
  return id

  // const file = openByUrl(url, type)
  // return getFileOrFolderId(file)
}

export function getFileById(id) {
  return DriveApp.getFileById(id)
}

function getFileByUrl(url, type) {
  return getFileById(
    getFileIdFromUrl(url, type)
  )
}

export function getFileIteratorFromToken(token) {
  const iterator = DriveApp.continueFileIterator(token)
  return iterator
}

export function getFilesByIds(idArray): GoogleAppsScript.Drive.File[] {
  return idArray.map((id) => getFileById(id))
}

export function getChildFiles(folder: GoogleAppsScript.Drive.Folder) {
  return folder.getFiles()
}

/**
 * Gets an array of Files that are direct children of the given folder and fit the given search criteria
 * 
 * 
 * @param searchString search criteria as detailed in the [Google Drive SDK documentation](https://developers.google.com/drive/api/v3/search-files)
 * @param folder parent folder of which to search direct children Files
 * @param auth OAuth token to use with the UrlFetch request, if required
 * @see https://developers.google.com/drive/api/v3/search-files
 * @see https://developers.google.com/apps-script/reference/drive/folder#searchFiles(String)
 * @returns {Array} File resource objects
 */
export function searchChildren(searchString: string, fieldsString, folder: GoogleAppsScript.Drive.Folder, auth?) {
  if (searchString === undefined || searchString.length === 0) {
    throw new Error('searchString is empty. If you having nothing to filter on, use getFiles() instead.')
  }
  /**
   * Currently the built in searchFiles() method for Folders uses v2 of the Drive API.
   * 
   * We want to use v3 for more functionality. So, we have to use UrlFetchApp.
   */
  const BASE_URL = 'https://www.googleapis.com/drive/v3/files'
  const folderId = getFileOrFolderId(folder)
  const fullSearchQuery = `'${folderId}' in parents and (${searchString})`
  const q = encodeURIComponent(fullSearchQuery)
  const fields = encodeURIComponent(fieldsString)
  const url = `${BASE_URL}?q=${q}&fields=${fields}`
  const params = {
    headers: {
      "Authorization": `Bearer ${auth || getScriptOAuthToken()}`,
      "Accept": "application/json",
    }
  }
  const response = gasFetch(url, params)
  const { files } = JSON.parse(getResponseContent(response))
  return files
}

/**
 * My version of {@function batchUpdateFiles} doesn't work so here's a copy-pasted version to see what's up.
 * 
 * @see https://tanaikech.github.io/2018/01/19/batching-requests-for-google-apps-script/
 * @see https://github.com/tanaikech/BatchRequest/blob/master/BatchRequests.js
 * @see https://stackoverflow.com/questions/48310761/how-to-make-a-drive-api-batch-request-with-urlfetchapp-in-google-apps-script
 * @param body objects that hold the File id and new properties to update
 */
export function cpBatchUpdateFiles(updateArray) {
  const body = updateArray.map(({ id, update }) => ({
    method: 'PATCH',
    endpoint: `https://www.googleapis.com/drive/v3/files/${id}`,
    requestBody: update
  }))

  var url = "https://www.googleapis.com/batch/drive/v3";
  var boundary = "xxxxxxxxxx";
  var contentId = 0;
  var data = "--" + boundary + "\r\n";
  for (var i in body) {
    data += "Content-Type: application/http\r\n";
    data += "Content-ID: " + ++contentId + "\r\n\r\n";
    data += body[i].method + " " + body[i].endpoint + "\r\n";
    data += body[i].requestBody ? "Content-Type: application/json; charset=utf-8\r\n\r\n" : "\r\n";
    data += body[i].requestBody ? JSON.stringify(body[i].requestBody) + "\r\n" : "";
    data += "--" + boundary + "\r\n";
  }
  var payload = Utilities.newBlob(data).getBytes();
  var options = {
    method: "post",
    contentType: "multipart/mixed; boundary=" + boundary,
    payload: payload,
    headers: { 'Authorization': 'Bearer ' + ScriptApp.getOAuthToken() },
    muteHttpExceptions: true,
  };
  var res = UrlFetchApp.fetch(url, options);
  logResponse('live', res)
}

/**
 * #DOES NOT WORK
 * 
 * Update Google Drive files all at once using a list of file IDs and the updated values to the targeted properties.
 * This doesn't currently chunk updates over 100, but it should. 
 * 
 * Subject to Google's limitations
 * - No more than 100 batch requests at a time
 * - No more than 8000 characters in the URL
 * - No media uploads or downloads
 * 
 * @see https://developers.google.com/drive/api/v3/performance#batch_requests
 * 
 * @param updateArray list of files and the new properties to add in the format provided in the below initializer
 */
export function batchUpdateFiles(updateArray = [{ id: '', update: { key: 'value' } }]) {
  const BASE_BATCH_URL = 'https://www.googleapis.com/batch/drive/v3'
  const HOST_URL = 'https://www.googleapis.com'
  const PATH_URL = '/drive/v3/files'
  const METHOD = 'PATCH'
  const BOUNDARY = 'END_OF_PART'
  const token = getScriptOAuthToken()

  const commonParams = makeBatchParamObject(BOUNDARY)

  const body = writeBatchUpdateBody(updateArray, PATH_URL, METHOD, BOUNDARY, token)
  const payload = getBlobBytes(newBlob(body))
  const params = { ...commonParams, payload }
  const dryRunResponse = getGasFetchRequest(BASE_BATCH_URL, params)
  logResponse('dry', dryRunResponse);

  const response = gasFetch(BASE_BATCH_URL, params)
  logResponse('live', response)

  if (getResponseCode(response) >= 400) throw {
    message: `The batchUpdateFiles() batch HTTP request to ${BASE_BATCH_URL} returned ${getResponseCode(response)}.`,
    response
  }

  return response
}

export function mapFolderChildren(folder, mapper, folderDepth = NaN, currentDepth = 0) {
  const childFileIterator = getChildFiles(folder)
  const childFolderIterator = getChildFolders(folder)

  const atMaxDepth = currentDepth >= folderDepth

  let result = []
  for (const childFile of childFileIterator) {
    result = [...result, mapper(childFile)]
  }

  if (!atMaxDepth) {
    for (const childFolder of childFolderIterator) {
      result = [...result, ...mapFolderChildren(childFolder, mapper, folderDepth, currentDepth + 1)]
    }
  }

  return result
}

export function getDownloadUrl(file: GoogleAppsScript.Drive.File) {
  return file.getDownloadUrl()
}


/*******************
 * FOLDERS
 */

export function getFolderById(id) {
  try {
    const folder = DriveApp.getFolderById(id)
    return folder
  } catch (err) {
    console.error(`getFolderById(${id}) failed because: ${JSON.stringify(err)}`);
    return err
  }
}

export function getFoldersByIds(idArray) {
  return idArray.map((id) => getFolderById(id))
}

export function getFolderIteratorFromToken(token) {
  const iterator = DriveApp.continueFolderIterator(token)
  return iterator
}

/**
 * Uses string.match() to find a folderId based on the regex [a-zA-Z0-9-_]
 * 
 * This is strictly based on the pattern that Google uses and so it's prone to breaking.
 * 
 * @param {String} folderUrl url for a folder that follows a format like drive.google.com/drive/folders/{{ id }}
 */
export function getFolderIdFromUrl(folderUrl: string) {
  const id = folderUrl.match(/drive\.google\.com\/drive\/folders\/([a-zA-Z0-9-_]+)/)[1]
  return id
}

export function nameFileOrFolder(item, name) {
  return item.setName(name);
}

export function getFileOrFolderId(item) {
  return item.getId()
}

export function getFileOrFolderUrl(item) {
  return item.getUrl()
}

export function getFileOrFolderName(item) {
  return item.getName()
}

export function getFileOrFolderDescription(item) {
  return item.getDescription()
}

export function getFileThumbnailBlob(file) {
  return file.getThumbnail()
}

/**
 * Gets the temporary thumbnail link of the file using the Advanced Drive service
 * @param fileId id of the file
 * @requires Drive Advanced Google Drive API service service
 */
export function getFileThumbnailLink(fileId) {
  const request = {
    fields: 'thumbnailLink',
  }
  return Drive.Files.get(fileId, request)
}

/**
 * Sends a request to the Google Drive API v2 to gets a single File by its id and returns the requested fields
 * 
 * @requires Drive Advanced Google Drive API service that uses v2 of the Google Drive API
 * @param fileId id of the File
 * @param fieldsArray array of strings that you want to request with the File resource
 */
export function getFileFields(fileId, fieldsArray) {
  const request = {
    fields: fieldsArray.join(', ')
  }
  const response = Drive.Files.get(fileId, request)
  return response
}

export function getFileMimeType(file) {
  return file.getMimeType()
}

export function getChildFolders(folder: GoogleAppsScript.Drive.Folder) {
  return folder.getFolders()
}

/*****
 * 
 * 
 * DOCUMENT UTILITIES
 * 
 * 
 * 
 */
export function openDocument(id) {
  return openTypeById(DOC, id)
}

export function getDocBody(doc: GoogleAppsScript.Document.Document) {
  return doc.getBody()
}

export function getElementText(element) {
  return element.getText()
}

export function findText(regexString, element, fromRangeElement) {
  const result = fromRangeElement && element.findText() element.findText(regexString)
  return result
}

export function getTablesFromBody(body: GoogleAppsScript.Document.Body) {
  return body.getTables()
}

function getNumberOfTableRowsInTable(table: GoogleAppsScript.Document.Table) {
  return table.getNumRows()
}

function getChildTableRowAtIndex(table: GoogleAppsScript.Document.Table, index) {
  return table.getRow(index)
}

export function getTableRowsFromTable(table: GoogleAppsScript.Document.Table) {
  console.log('table', table)
  const numberRows = getNumberOfTableRowsInTable(table)
  console.log(`This table has ${numberRows} rows.`)
  let rows = []
  for (let i = 0; i < numberRows; i++) {
    rows = [...rows, getChildTableRowAtIndex(table, i)]
  }
  console.log('rows', rows)
  return rows
}

export function getTableRowsFromBody(body) {
  const tables = getTablesFromBody(body)
  if (tables.length > 1) {
    throw new Error(`There are ${tables.length} tables in this body. I'm only able to grab 1.`)
  } else {
    console.log('We have one table. Getting the table rows now.')
    return getTableRowsFromTable(tables[0])
  }
}

export function getParagraphsFromBody(body) {
  return body.getParagraphs()
}

export function copyElement(element) {
  return element.copy()
}

export function replaceText(element, searchPatternString, replacementText) {
  return element.replaceText(searchPatternString, replacementText)
}

export function saveAndCloseDocument(doc) {
  return doc.saveAndClose()
}

export function deleteDocumentProperties() {
  const docProps = PropertiesService.getDocumentProperties()
  return docProps.deleteAllProperties()
}

export function appendHeaderToBody(header, body) {
  return body.appendParagraph(header)
}

export function appendTableToBody(table, body) {
  return body.appendTable(table)
}

export function appendImageToBody(image, body) {
  return body.appendImage(image)
}

export function appendTableRowToTable(row: GoogleAppsScript.Document.TableRow, table: GoogleAppsScript.Document.Table) {
  return table.appendTableRow(row)
}

/**
 * Use ES6 Map to hold the types and make them simpler.
 * 
 * GAS pukes all over this so I'll add a different hackier way below.
 */
export function GASDocElementTypeMap() {
  return new Map([
    [DocumentApp.ElementType.PARAGRAPH, PARAGRAPH],
    [DocumentApp.ElementType.TABLE, TABLE],
    [DocumentApp.ElementType.INLINE_IMAGE, IMAGE],
    [DocumentApp.ElementType.TABLE_ROW, TABLE_ROW]
  ])
}

export function GASDocElementTypeMapES3() {
  this.types = [
    [DocumentApp.ElementType.PARAGRAPH, PARAGRAPH],
    [DocumentApp.ElementType.TABLE, TABLE],
    [DocumentApp.ElementType.INLINE_IMAGE, IMAGE],
    [DocumentApp.ElementType.TABLE_ROW, TABLE_ROW]
  ]
  this.get = function (elementType) {
    return this.types.filter((type) => type[0] === elementType).pop()[1]
  }
}

export function _GASDocElementTypeMap() {
  return new GASDocElementTypeMapES3()
}

export function appendElementOfTypeToBody(element, type, body) {

  const supportedTypes = [
    TABLE,
    PARAGRAPH,
    IMAGE
  ]

  switch (type) {
    case TABLE:
      return appendTableToBody(element, body)
    case PARAGRAPH:
      return appendHeaderToBody(element, body)
    case IMAGE:
      return appendImageToBody(element, body)
    default:
      throw makeTypeSupportError(supportedTypes)
  }
}

export function getNumChildrenInBody(body: GoogleAppsScript.Document.Body) {
  return body.getNumChildren()
}

export function getChildElementAtIndex(body: GoogleAppsScript.Document.Body, index) {
  return body.getChild(index)
}

export function getElementType(element: GoogleAppsScript.Document.Element) {
  return element.getType()
}

export function appendAllChildElementsToBody(bodyWithChildElements, bodyToAppend) {
  const appended = []
  const numChildren = getNumChildrenInBody(bodyWithChildElements)
  const typeMap = _GASDocElementTypeMap()

  for (let i = 0; i < numChildren; i++) {
    const childElement = copyElement(getChildElementAtIndex(bodyWithChildElements, i))
    const childType = getElementType(childElement)
    const mappedType = typeMap.get(childType)
    appended.push(appendElementOfTypeToBody(childElement, mappedType, bodyToAppend))
  }

  return appended
}

/**********************
 * BASE UTILITIES
 */

function gasFetch(url: string, params: { headers: { "Authorization": string; "Accept": string; }; }) {
  return UrlFetchApp.fetch(url, params);
}

function getGasFetchRequest(url, params) {
  return UrlFetchApp.getRequest(url params)
}

function makeBoundarySegment(boundary) {
  const boundarySegment = `--${boundary}`
  return boundarySegment
}

function logResponse(title, response: Object) {
  console.log(`<<< **${title.toUpperCase()}** RESPONSE >>>`);
  if (title === 'dry') getObjectEntries(response).forEach(([key, value]) => console.log(key, value));
  else {
    [
      'getResponseCode',
      'getHeaders',
      'getContentText'
    ].forEach((fn) => console.log(fn, response[fn]()))
    console.log('Response', response)
  }
}

function writeBatchUpdateBody(updateArray: { id: string; update: { key: string; }; }[], baseUrl: string, sharedMethod: string, boundary: string) {
  const body = updateArray.reduce((requestBody, { id, update }, index) => {
    const url = `${baseUrl}/${encodeURIComponent(id)}`;
    const part = makeBatchRequestPart(sharedMethod, url, update, boundary, index);
    const appended = joinOnNewLines([requestBody, part]);
    return appended;
  }, '\r\n' + makeBoundarySegment(boundary));
  return body
}

/**
 * Creates a Part of a multipart batch request as needed by Google's Drive API
 * 
 * @see https://developers.google.com/drive/api/v3/batch#example
 * @param method HTTP Method to use
 * @param url path part of the URL
 * @param body data to send in body
 * @param boundary boundary defined by parent batch request
 * @param index id index
 */
function makeBatchRequestPart(method, url, body, boundary, index) {
  const boundarySegment = makeBoundarySegment(boundary)
  const requestPart = joinOnNewLines([
    'Content-Type: application/http',
    `Content-ID: ${index}`,
    'content-transfer-encoding: binary',
    '\r\n',
    `${method} ${url}`,
    `Authorization: ${getScriptOAuthToken()}`
    body ? joinOnNewLines([makeBodySegment(body), boundarySegment]) : boundarySegment
  ])

  return requestPart
}

function makeBodySegment(body) {
  const segment = joinOnNewLines([
    'Content-Type: application/json; charset=UTF-8',
    '\r\n',
    JSON.stringify(body)
  ])

  return segment
}

function makeBatchParamObject(boundary) {
  return {
    headers: makeBaseFetchHeaders('multipart'),
    method: "post",
    contentType: `multipart/mixed; boundary=${boundary}`,
    muteHttpExceptions: true
  };
}

function makeBaseFetchHeaders(responseDataType = 'json') {
  const sharedHeaders = {
    "Authorization": `Bearer ${getScriptOAuthToken()}`,
  }

  switch (responseDataType) {
    case 'json':
      return { ...sharedHeaders, "Accept": "application/json" }
    default:
      return sharedHeaders
  }
}

function getResponseContent(response) {
  return response.getContentText()
}

function getResponseCode(response) {
  return response.getResponseCode()
}

function getScriptOAuthToken() {
  return ScriptApp.getOAuthToken();
}

/**
 * Uses Google's built-in utility to encode byte or string data as a base 64 encoded string.
 * @param {String|GoogleAppsScript.Byte[]} data string or byte data to encode
 * @see https://developers.google.com/apps-script/reference/utilities/utilities#base64encodedata
 */
export function base64Encode(data) {
  return Utilities.base64EncodeWebSafe(data)
}

/**
 * Uses Google's built-in utility to decode string data into Bytes
 * @param str String to decode
 * @see https://developers.google.com/apps-script/reference/utilities/utilities#base64decodeencoded
 */
export function base64Decode(str) {
  return Utilities.base64DecodeWebSafe(str)
}

/**
 * Google Apps Script Blobs have a method getBytes().
 * 
 * As far as I know nothing else does.
 * 
 * This works because right now I'm using it to compare against strings, basically.
 * @param obj object to check if it is a GAS Blob
 */
function isBlob(obj) {
  return !!obj.getBytes
}

export function gzip(blob, name?) {
  return Utilities.gzip(blob, name)
}

export function ungzip(blob) {
  return Utilities.ungzip(blob)
}

/**
 * Gets the data from  Blob as a UTF-8 encoded string
 * @param blob Blob to get the string data of
 */
export function getBlobDataAsString(blob: GoogleAppsScript.Base.Blob) {
  return blob.getDataAsString()
}

export function newBlob(data, contentType = null, name = null) {
  return Utilities.newBlob(data, contentType, name)
}

export function getBlobBytes(blob) {
  return blob.getBytes()
}

function getUserEmail(user) {
  return user.getEmail()
}

export function getEffectiveUser() {
  return Session.getEffectiveUser()
}

export function getActiveUser() {
  return Session.getActiveUser()
}

export function getEffectiveUserEmail() {
  return getUserEmail(getEffectiveUser())
}

export function getActiveUserEmail() {
  return getUserEmail(getActiveUser())
}

/************************
 * CACHE
 */

/**
 * Puts a single key-value pair into a given cache.
 * @param cache cache to put the value in 
 * @param value individual value to store. Must be a string.
 * @param key string key for the cached value
 * @param duration How many seconds until the cache expires. Default is 1 hour.
 */
export function storeValueInCache(cache: GoogleAppsScript.Cache.Cache, value: string, key: string, duration = 3600) {
  const result = cache.put(key, value, duration)
  return result
}

/**
 * Puts a single key-value pair into a given cache, first stringifying the value as JSON.
 * @param cache cache to put the value in
 * @param value individual value to store. Must be JSON serializable.
 * @param key key for the cached value
 */
export function storeJsonValueInCache(cache: GoogleAppsScript.Cache.Cache, value, key: string) {
  const jsonString = jsonStringify(value)
  const result = storeValueInCache(cache, jsonString, key)
  return result
}

/**
 * Puts a single key-value pairi nto a given cache, first gzip-ing the string value.
 * @param cache cache to put he value in
 * @param value value to store. Must be a string because we're going to turn it into a Blob
 * @param key accessor for the cached value
 */
export function storeGzippedValueInCache(cache: GoogleAppsScript.Cache.Cache, value: string, key) {
  console.log('storeGzippedValueInCache()')
  const gzippedBlob = gzip(value)
  console.log('gzippedBlob')
  console.log(gzippedBlob)
  const gzippedStringData = getBlobDataAsString(gzippedBlob)
  console.log('gzippedStringData')
  console.log(gzippedStringData)
  const result = storeValueInCache(cache, gzippedStringData, key)
  return result
}

/**
 * Puts a stringified object of key-value pairs into a given cache.
 * @param cache Cache to put the values in
 * @param values Object filled with string key value pairs
 * @param duration How many seconds until the cache expires.
 */
export function storeValuesInCache(cache: GoogleAppsScript.Cache.Cache, values, duration = 21600) {
  const strValues = stringifyJsObject(values)
  const result = cache.putAll(strValues, duration)
  return result
}

/**
 * Gets the bound document's cache
 */
export function getDocumentCache() {
  return CacheService.getDocumentCache();
}

/**
 * Gets a single value in a given cache from a given key.
 * 
 * Cache.get() returns null if there is no value for the given key.
 * 
 * @see https://developers.google.com/apps-script/reference/cache/cache#getkey
 * @param cache cache to pull values from
 * @param key individual key to get the value of
 * @returns {String} or @type null if no cache key found
 */
export function getValueInCache(cache: GoogleAppsScript.Cache.Cache, key: string) {
  const stringValue = cache.get(key)
  return stringValue
}

export function getJsonValueInCache(cache: GoogleAppsScript.Cache.Cache, key: string) {
  const stringValue = getValueInCache(cache, key)
  const obj = stringValue && jsonParse(stringValue)
  return obj
}

/**
 * Gets multiple values in a given cache from an array of keys.
 * @param cache Cache to pull values from
 * @param keys Keys in the cache to get the values of
 */
export function getValuesInCache(cache: GoogleAppsScript.Cache.Cache, keys: string[]) {
  const stringifiedValues = cache.getAll(keys)
  const parsedValues = parseStringifiedJsObject(stringifiedValues, keys)
  return parsedValues
}

/**
 * Utility function to bust the current document's cache.
 */
export function removeDocumentCache(key: string[] | string) {
  const docCache = getDocumentCache()
  docCache.removeAll(Array.isArray(key) ? key : [key])
}
/****************************
 * GAS CLIENT-SIDE SCRIPT RUNNER
 ***************************/

import client from '../../dev/mocks/gas/HtmlService/gas-client.dev.js'

function gasClientRunScript (client, scriptName, userObject, ...args) {
  return new Promise(
    (resolve, reject) => {
      const onSuccess = (response) => resolve(response)
      const onFailure = (error) => reject(error)

      const script = client.script.run.withSuccessHandler(onSuccess).withFailureHandler(onFailure)
      if (userObject) script.withUserObject(userObject)
      script[scriptName](...args)
    }
  )
}

/******************************
 * API REQUESTS
 */

export async function getUserData (auth) {
  const data = await gasClientRunScript(client, 'getUserData')
  return data
}

export async function getListData (userRanges) {
  const data = await gasClientRunScript(client, 'getAndCacheListData', undefined, userRanges)
  return data
}

export async function logAnalyticsClick (itemId, clickColumnHeader) {
  const result = await gasClientRunScript(client, 'logClick', undefined, itemId, clickColumnHeader)
  return result
}

export async function addAttendanceData (sheetName, spreadsheetId, values) {
  const updatedRange = await gasClientRunScript(client, 'addAttendanceData', undefined, sheetName, spreadsheetId, values)
  return updatedRange
}

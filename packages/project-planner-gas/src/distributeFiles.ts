import { openTypeById, getRangeByName, getOnlySheet, getRangeValue, getSheetByName } from "../../gas-utilities/gas-apis";
import plannerConstants from "../../constants/constants";
import { dropHeaders } from "../../gas-utilities/general";
import { getChildFileArray, getChildFolderArray, getFolderById } from "./handleFoldersAndFiles";

const {
    SHEET,
    TEAM_FOLDER,
    SHARED_FOLDER,
} = plannerConstants()

/*

General file and folder handling

*/

function addFileToFolder(file, folder) {
    // add (NOT COPY) a file to the designated folder
    return folder.addFile(file)
}

function addFolderToFolder(folder, destFolder) {
    // add (NOT COPY) a folder to the designated folder
    return destFolder.addFolder(folder)
}

function addFileToFolders(file, folderArray) {
    folderArray.forEach( function (folder) {
      return addFileToFolder(file, folder)
    } )
    
    return true
  }
  
function addFolderToFolders(folder, folderArray) {
    return folderArray.map( (destFolder) => {
        return addFolderToFolder(folder, destFolder)
    } )
}

/*

Helpers

*/

/**
 * Returns an array of rows with the property name and the associated file and folder id
 * @param {Array} itemArray - array of G Suite file or folder items
 * @param {Object} propNameMap - map of the key names and file names you want to use
 * @returns {Array}
 */
function mapPropsToIds(itemArray, propNameMap) {
    
    const namePairs = Object.entries(propNameMap)
    return itemArray.reduce( (finalRows, item) => {
        const itemName = item.getName()

        const matchingEntry = namePairs.find( ([nameKey, name]) => itemName === name )
        
        if (matchingEntry !== undefined) {
            const [ keyName, fileName ] = matchingEntry
            finalRows.push([keyName, item.getId()])
        }
        
        return finalRows
    }, [])
}

/**
 * map both files and folders with the appropriate config ad return a grid (an array of arrays) with the values
 * @param folder - the parent folder to pull all the ids from
 * @param mapConfig - the property name to file name map you want to use
 */
export function getFolderChildIdsByName(folder, mapConfig) {
    const files = getChildFileArray(folder, true)
    const fileIds = mapPropsToIds(files, mapConfig.filePropNameMap)
    const folders = getChildFolderArray(folder, true)
    const folderIds = mapPropsToIds(folders, mapConfig.folderPropNameMap)

    return [ ...fileIds, ...folderIds ]
}

export function getRosterById(rosterId) {
    const roster = openTypeById(SHEET, rosterId)
    const lastRow = getRangeValue(getRangeByName(roster, 'lastRow'))
    const rosterValues = getOnlySheet(roster).getRange(1, 2, lastRow, 5).getValues()
    return dropHeaders(rosterValues)
}

export function getRosterEmailsById(rosterId) {
    const rosterValues = getRosterById(rosterId)
    return rosterValues.map( (studentValue) => studentValue[4])
}

function getRosterNameAndEmailById(rosterId){
    const rosterValues = getRosterById(rosterId)
    return rosterValues.map( ([id, section, first, last, email]) => `${first} ${last} | ${email}` )
}

export function getTeamsById(teamId) {
  const teams = openTypeById(SHEET, teamId)
  const lastRow = getRangeValue(getRangeByName(teams, "lastRow"))
  const teamsArray = getSheetByName(teams, "teams").getRange(1,2,lastRow, 10).getValues()
  return dropHeaders(teamsArray)
}

function getTeamFolders(mainTeamFolderId) {
    const mainTeamFolder = getFolderById(mainTeamFolderId)
    return getChildFolderArray(mainTeamFolder)
}

/*

Sidekick operations

*/

export function addSharedResourcesFolderToTeamFolders(app, fullConfig) {
    const { projectIds } = fullConfig
    const teamFolders = getTeamFolders(projectIds[TEAM_FOLDER])
    const sharedFolder = getFolderById(projectIds[SHARED_FOLDER])
    const result = addFolderToFolders(sharedFolder, teamFolders)
    return result
}
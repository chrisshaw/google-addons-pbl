import plannerConstants from "../../constants/constants";
import { getFileById, openTypeById, getChildFiles, getChildFolders } from "../../gas-utilities/gas-apis";
import { getTeamsById, getRosterById } from "./distributeFiles";
import { shareItemWithEmailsGraceful } from "./shareFiles";

const {
    FILE,
    FOLDER,
    VIEW,
    TEAM_FOLDER,
    ROSTER,
    SHEET
} = plannerConstants()

/*

General folder handling

*/

function createNewChildFolder(parentFolder, folderName) {
    return parentFolder.createFolder(folderName)
}

export function getFolderById(folderId) {
  return DriveApp.getFolderById(folderId)
}

function getFileOrFolderArrayFromCollection(itemIterator) {
  const itemArray = []
  while (itemIterator.hasNext()) {
    itemArray.push(itemIterator.next())
  }
  return itemArray  
}

export function getChildFolderArray(folder, isDeepSearch?) {
  const folderIterator = getChildFolders(folder)
  var folderArray = getFileOrFolderArrayFromCollection(folderIterator)
  if (isDeepSearch) {
    const deepFolderIterator = folder.getFolders() // I'm sure this is a hacky but I needed to refill the folder collection
    while (deepFolderIterator.hasNext()) {
      folderArray = folderArray.concat(getChildFolderArray(deepFolderIterator.next(), true))
    }                                  
  }
  return folderArray
}

export function copyFullFolder(folderToCopy, destParent) {
  const newFolder = copyFolderToFolder(folderToCopy, destParent)
  copyFolderContentToFolder(folderToCopy, newFolder)
  const folderIterator = getChildFolders(folderToCopy)
  while (folderIterator.hasNext()) {
    copyFullFolder(folderIterator.next(), newFolder)
  }
  return newFolder
}

function copyFolderWithOptions(currentCopyTarget, currentDestParent, optionsArray = [ { folders: true, files: true } ]) {
    // optionsArray is looking for something like [ { folders: true, files: true}, { folders: false, files: true } ]

    const depthOption = optionsArray.shift()
    const newFolder = copyFolderToFolder(currentCopyTarget, currentDestParent)

    if (depthOption.files) {
        copyFolderContentToFolder(currentCopyTarget, newFolder)
    }

    if (depthOption.folders) {
        const folderIterator = getChildFolders(currentCopyTarget)
        while (folderIterator.hasNext()) {
            copyFolderWithOptions(
                folderIterator.next(),
                newFolder,
                optionsArray.map( (option) => ({...option}) )
            )
        }
    }

    return newFolder
}

function copyFolderToFolder(folderToCopy, destParent) {
  return destParent.createFolder(folderToCopy.getName())
}

function copyFolderContentToFolder(folderToCopy, destParent) {
  const files = getChildFileArray(folderToCopy)
  copyFilesToFolder(files, destParent)
  
  return true
}

/*

General file handling

*/

function copyFilesToFolder(files, folder) {
  files.forEach( function (file) {
    return copyFileToFolder(file, folder)
  } )
  
  return true
}

function copyFileToFolder(file, folder) {
  // copy a file to the designated folder
  return file.makeCopy(file.getName(), folder)
}

export function getItemById(itemId, itemType) {
    switch (itemType) {
        case FILE:
            return getFileById(itemId)
        case FOLDER:
            return getFolderById(itemId)
        default:
            return new Error('Sorry, itemType must be file or folder')
    }
}

function getChildFilesByName(folder, fileName) {
  return folder.getFilesByName(fileName)
}

function getChildFileArrayByName(folder, fileName) {
  const fileIterator = getChildFilesByName(folder, fileName)
  return getFileOrFolderArrayFromCollection(fileIterator)
}

export function getChildFileArray(folder, isDeepSearch?) {
  const fileIterator = getChildFiles(folder)
  let fileArray = getFileOrFolderArrayFromCollection(fileIterator)
  if (isDeepSearch) {
    const deepFolderIterator = folder.getFolders()
    while (deepFolderIterator.hasNext()) {
      fileArray = fileArray.concat(getChildFileArray(deepFolderIterator.next(), true))
    }
  }
  return fileArray
}

function mapStudentToTeam(student) {
    const [id, section, first, last, email] = student
    return [id, `${first} ${last}`, 'Client', email]
}

/*

Sidekick-specific operations

*/

function buildAndShareFolder(mainTeamFolder, team) {
    const [id, name, client, ...memberEmails] = team
    const folder = createNewChildFolder(mainTeamFolder, name)
    const result = shareItemWithEmailsGraceful(folder, FOLDER, memberEmails, VIEW)
    return { team, folder, result }
}

export function createTeamFolders(app, fullConfig) {
    const { projectIds } = fullConfig
    const mainTeamFolder = getFolderById(projectIds[TEAM_FOLDER])
    let teams = getTeamsById(projectIds[TEAM_FOLDER])
    
    // if the teams only includes the example...
    if (teams.length === 1) {
        // use each individual as the team
        teams = getRosterById(projectIds[ROSTER]).map(mapStudentToTeam)
    }

    return buildAndShareFolders(teams, mainTeamFolder);
}

export function buildAndShareFolders(teams, mainTeamFolder) {
    const result = teams.reduce(({ success, error }, team) => {
        const response = buildAndShareFolder(mainTeamFolder, team);
        if (response.result.length) {
            return {
                success,
                error: [...error, response]
            };
        }
        else {
            return {
                success: [...success, response],
                error
            };
        }
    }, { success: [], error: [] });

    return result;
}

export function getProjectAppFromRootFolder(rootFolder, { templateToolSheetName }) {
  const appFiles = getChildFileArrayByName(rootFolder, templateToolSheetName)
  const appFile = appFiles[0]
  return openTypeById(SHEET, appFile.getId())
}

function getRootFolder(app) {
    // root is misleading because it really means direct parent
  // this assumes that "app" (the _tools spreadsheet) is unique to each project
  // since there's only a single parent folder we can find the parent at index 0
  
  const id = app.getId()
  const appFile = getFileById(id)
  const parents = appFile.getParents()
  return getFileOrFolderArrayFromCollection(parents)[0]
}

export function getProjectFolder(app) {
    // the project folder is the only child folder of the root folder
  const rootFolder = getRootFolder(app)

  return getProjectFolderFromRoot(rootFolder)
}

export function getProjectFolderFromRoot(rootFolder) {
    return getChildFolderArray(rootFolder)[0]
}
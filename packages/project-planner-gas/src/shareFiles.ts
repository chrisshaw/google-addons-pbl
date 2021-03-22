import plannerConstants from "../../constants/constants";
import { getProjectFolder, getItemById } from "./handleFoldersAndFiles";
import { getRosterEmailsById } from "./distributeFiles";
import { getIdsWithKeysFromKeyIdMap, getIdFromKeyAndKeymap } from "../../gas-utilities/general";
import { getFilesByIds, getFoldersByIds } from "../../gas-utilities/gas-apis";

const {
    FILE,
    FOLDER,
    VIEW,
    EDIT,
    COMMENT,
    TEACHERS,
    PARTNERS,
    STUDENTS
} = plannerConstants()

/*

General file/folder sharing

*/

function getItemUsers(item) {
  var viewers = item.getViewers();
  var commenters = item.getCommenters();
  var editors = item.getEditors();
  return editors.concat(viewers, commenters);
}

function getEmailsFromUsers(userArray) {
  return userArray.map(function (user) {
    return user.getEmail();
  });
}

function addViewer(item, email) {
  try {
    item.addViewer(email);
    return [item, email, true];
  } catch (err) {
    return [item, email, err];
  }
}

function addViewers(item, emailArray) {
  // adds all email addresses to the file or folder as viewers

  return item.addViewers(emailArray);
}

function addViewersGraceful(item, emailArray) {
  var result = emailArray.map(function (email) {
    return addViewer(item, email);
  });

  return filterToErrors(result);
}

function addCommenter(item, type, email) {
    if (type === FILE) {
        try {
            item.addCommenter(email)
            return [item, email, true]
        } catch (err) {
            return [item, email, err]
        }
    } else if (type === FOLDER) {
        return addViewer(item, email)
    } else {
        return new Error('type must be either folder or file')
    }
}

function addCommentersGraceful(item, type, emailArray) {
    const result = emailArray.map( (email) => addCommenter(item, type, email) )
    return filterToErrors(result)
}

function addEditor(item, email) {
  try {
    item.addEditor(email);
    return [item, email, true];
  } catch (err) {
    console.log(err);
    return [item, email, err];
  }
}

function addEditors(item, emailArray) {
  // adds all email addresses to the file or folder as editors

  return item.addEditors(emailArray);
}

function addEditorsGraceful(item, emailArray) {
  var result = emailArray.map(function (email) {
    return addEditor(item, email);
  });

  return filterToErrors(result);
}

function filterToErrors(resultArray) {
  return resultArray.reduce(function (errorArray, currentResult) {
    if (currentResult[2] instanceof Error) {
      errorArray.push(currentResult[1]);
    }
    return errorArray;
  }, []);
}

function shareItemWithEmails(item, emailArray, role) {
  // adds all email addresses as viewers or editors (commenter not supported) to the file or folder

  if (role && role === 'view') {
    return addViewers(item, emailArray);
  } else if (role && role === 'edit') {
    return addEditors(item, emailArray);
  } else {
    return new Error('role must be defined as either "view" or "edit"');
  }
}

export function shareItemWithEmailsGraceful(item, type, emailArray, permission) {
  if (permission && permission === VIEW) {
    return addViewersGraceful(item, emailArray);
  } else if (permission && permission === EDIT) {
    return addEditorsGraceful(item, emailArray);
  } else if (type === null && permission === COMMENT) {
    return new Error('You must specify the type if the permission is comment')
  } else if (permission && permission === COMMENT) {
      return addCommentersGraceful(item, type, emailArray)
  } else {
    return new Error('role must be defined as either "view", "comment", or "edit"');
  }
}

function shareItemsWithEmailsGraceful(itemArray, type, emailArray, role) {
  const result = itemArray.map(function (item) {
    return shareItemWithEmailsGraceful(item, type, emailArray, role);
  });
  return result
}

function removeItemsFromEmailsGraceful(itemArray, emailArray) {
  return itemArray.map(function (item) {
    return removeItemFromEmailsGraceful(item, emailArray);
  });
}

function removeItem(item, email) {
  try {
    item.revokePermissions(email);
    return [item, email, true];
  } catch (err) {
    console.log(err);
    return [item, email, err];
  }
}

function removeItemFromEmailsGraceful(item, emailArray) {
  var result = emailArray.map(function (email) {
    return removeItem(item, email);
  });

  return filterToErrors(result);
}

/*

Sidekick helpers

*/

export function shareProjectFolderWithRoster(app, fullConfig) {
  // share the project folder with the students on the roster
  var projectFolder = getProjectFolder(app);
  var rosterEmails = getRosterEmailsById(fullConfig.projectIds.roster);
  return shareItemWithEmailsGraceful(projectFolder, FOLDER, rosterEmails, VIEW);
}

function getFilesAndFoldersFromIds({ files: fileKeys, folders: folderKeys }, projectIds) {
    const fileIds = fileKeys && getIdsWithKeysFromKeyIdMap(fileKeys, projectIds) || []
    const files = getFilesByIds(fileIds)
    const folderIds = folderKeys && getIdsWithKeysFromKeyIdMap(folderKeys, projectIds) || []
    const folders = getFoldersByIds(folderIds)
    return [ ...files, ...folders ]
}

function shareAndHideStage(stage, forApp, emailArray, projectIds) {
    const sharingErrors = shareStage(forApp, stage.share, projectIds, emailArray)
    const hidingErrors = hideStage(forApp, stage.hide, projectIds, emailArray)
    return {
        sharingErrors,
        hidingErrors
    }
}

function shareStage(forApp, shareSettings, projectIds, emailArray) {
    return shareSettings.map((shareSetting) => {
        const { itemType, propKey, permission, findFunction } = shareSetting;
        let item = getItemFromSettings(forApp, findFunction, propKey, itemType, projectIds);
        return shareItemWithEmailsGraceful(item, itemType, emailArray, permission);
    });
}

function getItemFromSettings(forApp, findFunction, propKey, itemType, projectIds) {
    if (!findFunction) {
        const id = getIdFromKeyAndKeymap(propKey, projectIds)
        return getItemById(id, itemType)
    } else {
        return findFunction(forApp)
    }
}

function hideStage(forApp, hideSettings, projectIds, emailArray) {
    return hideSettings.map( (hideSetting) => {
        const { itemType, propKey, findFunction } = hideSetting
        let item = getItemFromSettings(forApp, findFunction, propKey, itemType, projectIds)
        return removeItemFromEmailsGraceful(item, emailArray)
    })
}

function getTeacherStageX(stages, x) {
  const teacherStages = getTeacherStages(stages)
  return teacherStages[x -1]
}

function getTeacherStages(sharingStages) {
    return getStagesOfType(sharingStages, TEACHERS)
}

function getPartnerStages(stages) {
    return getStagesOfType(stages, PARTNERS)
}

function getStudentStages(stages) {
    return getStagesOfType(stages, STUDENTS)
}

function getStagesOfType(stages, type) {
    return stages.filter( (stage) => stage.sharedWith === type )
}

/* 

Main Sidekick Operations

*/

export function shareWithTeacherStageX(app, fullConfig, x) {
    const { projectIds, fieldConfig, fieldPropNameMap, sharingStages } = fullConfig

    const emailArray = [ fieldConfig[fieldPropNameMap.teacherEmail] ]
    const stage = getTeacherStageX(sharingStages, x)
    return shareAndHideStage(stage, app, emailArray, projectIds)
}

export function makeFilesFoldersEditableForRoster(editKeyObject, projectIds, rosterEmails) {
    const editableItems = getFilesAndFoldersFromIds(editKeyObject, projectIds)

    return shareItemsWithEmailsGraceful(editableItems, null, rosterEmails, EDIT) 
}

export function hideFilesFoldersForRoster(hideKeyObject, projectIds, rosterEmails) {
    const hiddenItems = getFilesAndFoldersFromIds(hideKeyObject, projectIds)
    return removeItemsFromEmailsGraceful(hiddenItems, rosterEmails)
}

export function setUpFileFolderSharingForRoster(app, { projectIds, rosterFilesFolders, ...rest }) {
    const rosterEmails = getRosterEmailsById(projectIds.roster)
    const { editable, hidden } = rosterFilesFolders
    
    const editableErrors = makeFilesFoldersEditableForRoster(editable, projectIds, rosterEmails)
    const hiddenErrors = hideFilesFoldersForRoster(hidden, projectIds, rosterEmails)
    return { editableErrors, hiddenErrors }
}
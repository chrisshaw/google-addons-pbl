import { getUnitFileIds } from "./handleSetup";
import { getFilesByIds, nameFileOrFolder, getFileOrFolderName } from "../../utilities-gas/src/gas-apis";
import { formatDate } from "../../utilities-gas/src/general";
import { getObjectValues } from "../../utilities-ts/src/general";
import { createProjectFileName } from "./createProjects";
import { getProjectFolder } from "./handleFoldersAndFiles";

/**
 * Publishes a project modeled in the given spreadsheet to the main teacher's Google Drive
 * - Finds the folder, renames it based on the selected project, and #TODO sends it
 * - Finds the plan, renames it, and #TODO sends it
 * - Finds the rubric, renames it, and #TODO sends it
 * @param toolSpreadsheet - Google Sheets spreadsheet that holds all the project data
 * @param fullConfig - shared TS/JS config file for project planning
 */
export function publishProjectToDrive(toolSpreadsheet, fullConfig) {
    const { projectIds, fieldConfig: { projectName, startDate, classes } } = fullConfig

    // Name the files their final name
    const projectFileIds: string[] = getObjectValues(projectIds)
    const projectFiles = getFilesByIds(projectFileIds)
    projectFiles.forEach((file) => {
        const fileName = createProjectFileName(getFileOrFolderName(file), projectName)
        nameFileOrFolder(file, fileName)
    })

    // Name the project folder its final name
    const folder = getProjectFolder(toolSpreadsheet)
    const date = new Date(startDate)
    const folderName = createProjectFolderName(getFileOrFolderName(folder), date, classes, projectName)
    nameFileOrFolder(folder, folderName)
}


export function createProjectFolderName(currentName, startDate, classes, projectName) {
    return `${currentName} ${formatDate(startDate, 'yyyy-MM')} (${classes}) - ${projectName}`
}
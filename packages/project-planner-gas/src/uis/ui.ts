import { getActiveSpreadsheet, getValuesFromSelection, deleteDocumentProperties } from "../../../gas-utilities/gas-apis";
import { getConfig } from "../handleSetup";
import { writeTasks } from "../builders/documents/writePlanDoc";
import writeSummaryDoc from '../builders/documents/writeSummaryDoc'
import config from "../config/config";
import { buildGoalsAndAssessment } from "../builders/spreadsheets/main";
import { createNewProject } from "../createProjects";
import { getRosterEmailsById, addSharedResourcesFolderToTeamFolders } from "../distributeFiles";
import { createTeamFolders } from "../handleFoldersAndFiles";
import { createNamedValuesFromFormSelection } from "../handleForms";
import { addDropDownOptionsToTeamSignUp } from "../modifyFiles";
import { shareProjectFolderWithRoster, makeFilesFoldersEditableForRoster, hideFilesFoldersForRoster, setUpFileFolderSharingForRoster, shareWithTeacherStageX } from "../shareFiles";
import { writeSchedules } from "../builders/documents/writeScheduleDoc";
import { demo_copyOverCyber } from "../logistics/findPeople";
import { publishProjectToDrive } from "../publishProjects";

function onOpen() {
    const ui = SpreadsheetApp.getUi()
    const menu = ui.createMenu('Project Planning')

    menu
        .addItem('Write summary', 'onWriteSummary')
        .addItem('Write schedules', 'onWriteSchedules')
        .addItem('Write instructions', 'onWriteTasks')
        .addItem('Write rubrics', 'onBuildGoalsAndAssessment')

    menu.addSubMenu(
        ui.createMenu('Logistics')
            .addItem('Get recruits', 'onGetRecruits')
            .addItem('Get roster', 'onGetRoster')
    )
    
    menu.addSubMenu(
        ui.createMenu('Publish')
            .addItem('Publish in Drive', 'onPublishDrive')
            .addItem('Publish in Classroom', 'onPublishClassroom')
    )

    menu.addSubMenu(
        ui.createMenu('Utilities')
            .addItem('Start new project from selected values', 'onStartNewProject')
            .addItem('Blow away project plan properties', 'onDeleteDocumentProperties')
    )

    menu.addToUi()
}

/*

Event handling

*/

function onGetRecruits() {
    const app = getActiveSpreadsheet()
    const conf = getConfig(app, config)
    demo_copyOverCyber(app, conf)
}

function onWriteSchedules() {
    const app = getActiveSpreadsheet()
    const fullConfig = getConfig(app, config)
    writeSchedules(app, fullConfig)
}

function onWriteSummary() {
    const app = getActiveSpreadsheet()
    const fullConfig = getConfig(app, config)
    writeSummaryDoc(app, fullConfig)
}

function onWriteTasks() {
    const app = getActiveSpreadsheet()
    const fullConfig = getConfig(app, config)
    writeTasks(app, fullConfig)
}

function onAddDropDownOptionsToTeamSignUp() {
    const app = getActiveSpreadsheet()
    const fullConfig = getConfig(app, config)
    addDropDownOptionsToTeamSignUp(fullConfig)
}

function onShareProjectFolderWithRoster() {
    const app = getActiveSpreadsheet()
    const fullConfig = getConfig(app, config)
    shareProjectFolderWithRoster(app, fullConfig)
}

function onMakeFilesFoldersEditableForRoster() {
    const app = getActiveSpreadsheet()
    const { projectIds, rosterFilesFolders, ...rest } = getConfig(app, config)
    makeFilesFoldersEditableForRoster(
        rosterFilesFolders.editable,
        projectIds,
        getRosterEmailsById(projectIds.roster)
    )
}

function onHideFilesFoldersForRoster() {
    const app = getActiveSpreadsheet()
    const { projectIds, rosterFilesFolders, ...rest } = getConfig(app, config)
    hideFilesFoldersForRoster(
        rosterFilesFolders.hidden,
        projectIds,
        getRosterEmailsById(projectIds.roster)
    )
}

function onSetUpFileFolderSharingForRoster() {
    const app = getActiveSpreadsheet()
    const fullConfig = getConfig(app, config)
    setUpFileFolderSharingForRoster(app, fullConfig)
}

function onBuildGoalsAndAssessment() {
    const app = getActiveSpreadsheet()
    const fullConfig = getConfig(app, config)
    buildGoalsAndAssessment(app, fullConfig)
}

function onStartNewProject() {
    // This should be the form response table for project requirements
    const app = getActiveSpreadsheet()
    const requirements = getValuesFromSelection(app)[0]
    const requirementsObject = createNamedValuesFromFormSelection(app)

    createNewProject(requirements, requirementsObject, config)
}

function onShareWithTeacherStage1() {
    const app = getActiveSpreadsheet()
    const fullConfig = getConfig(app, config)
    shareWithTeacherStageX(app, fullConfig, 1)
}

function onShareWithTeacherStage2() {
    const app = getActiveSpreadsheet()
    const fullConfig = getConfig(app, config)
    shareWithTeacherStageX(app, fullConfig, 2)
}

function onShareWithTeacherStage3() {
    const app = getActiveSpreadsheet()
    const fullConfig = getConfig(app, config)
    shareWithTeacherStageX(app, fullConfig, 3)
}

function onCreateTeamFolders() {
    const app = getActiveSpreadsheet()
    const fullConfig = getConfig(app, config)
    const result = createTeamFolders(app, fullConfig)
    if (result.error.length) {
        console.log(result)
        SpreadsheetApp.getUi().alert('There were errors. Check the logs.')
    }
}

function onAddSharedResourcesToTeamFolders() {
    const app = getActiveSpreadsheet()
    const fullConfig = getConfig(app, config)
    addSharedResourcesFolderToTeamFolders(app, fullConfig)
}

function onDeleteDocumentProperties() {
    deleteDocumentProperties()
}

function onPublishDrive() {
    const toolSpreadsheet = getActiveSpreadsheet()
    const fullConfig = getConfig(toolSpreadsheet, config)
    publishProjectToDrive(toolSpreadsheet, fullConfig)
}
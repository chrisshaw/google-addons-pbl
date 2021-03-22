import { openTypeById, openSpreadsheet } from "../../../gas-utilities/gas-apis";
import { getConfig, getFields } from "../handleSetup";
import config from "../config/config";
import plannerConstants from "../../../constants/constants";
import { writeTasks } from "../builders/documents/writePlanDoc";
import { buildGoalsAndAssessment } from "../builders/spreadsheets/main";
import { storeProjectIdSettings, createNewProjectFolder } from "../createProjects";
import { getRosterEmailsById, addSharedResourcesFolderToTeamFolders } from "../distributeFiles";
import { getProjectFolderFromRoot, getProjectFolder, createTeamFolders, getFolderById, buildAndShareFolders } from "../handleFoldersAndFiles";
import { addDropDownOptionsToTeamSignUp } from "../modifyFiles";
import { shareProjectFolderWithRoster, setUpFileFolderSharingForRoster, makeFilesFoldersEditableForRoster, hideFilesFoldersForRoster, shareWithTeacherStageX } from "../shareFiles";
import { writeSchedules } from "../builders/documents/writeScheduleDoc";


const {
    SHEET,
    TEACHERS,
    FOLDER,
    PROJECT_FOLDER,
    VIEW,
    FILE,
    ROSTER,
    EDIT,
    TEAM_FOLDER,
    SHARED_FOLDER,
    PROJECT_PLAN,
    RUBRIC
} = plannerConstants()

function testWriteSchedules() {
    const appId = config.masterPacketAppId
    const testApp = openSpreadsheet(appId)
    const testConfig = getConfig(testApp, config)
    writeSchedules(testApp, testConfig)
}

function testShareProjectFolderWithRoster() {
  const appId = '1kaoVBVyMqhLmsyLWWNeRWqdc6hK2nQOuRJc3kWe_NmA'
  const testApp = openTypeById('ss', appId)
  const configNeededForTest = {}
  const testConfig = getConfig(testApp, configNeededForTest)
  const result = shareProjectFolderWithRoster(testApp, testConfig)
  console.log(result.reduce( function (errArray, item) {
    if (item[2] instanceof Error) {
      errArray.push(item[0])
    }
    return errArray
  } ))
}

function testAddDropDownOptionsToTeamSignUp() {
  const appId = '1kaoVBVyMqhLmsyLWWNeRWqdc6hK2nQOuRJc3kWe_NmA'
  const testApp = openTypeById(SHEET, appId)
  const configNeededForTest = {}
  const testConfig = getConfig(testApp, configNeededForTest)
  addDropDownOptionsToTeamSignUp(testConfig)
}

function testStoreProjectIdSettings() {
  const appId = '1kaoVBVyMqhLmsyLWWNeRWqdc6hK2nQOuRJc3kWe_NmA'
  const testApp = openTypeById(SHEET, appId)
  const configNeededForTest = config
  const testConfig = getConfig(testApp, configNeededForTest)
  const newProjectRootFolder = createNewProjectFolder(testConfig)
  const newProjectFolder = getProjectFolderFromRoot(newProjectRootFolder)  
  storeProjectIdSettings(testApp, newProjectFolder, testConfig)
}

function testSetUpFileFolderSharingForRoster() {
    const appId = "1kaoVBVyMqhLmsyLWWNeRWqdc6hK2nQOuRJc3kWe_NmA"
    const testApp = openTypeById('ss', appId)
    const configNeededForTest = {
        rosterFilesFolders: {
            viewable: {
                files: ['projectSummary', 'rubric', 'projectPlan'],
                folders: ['resourceFolder']
            },
            editable: {
                files: ['teams', 'sharedQuestions'],
                folders: ['teamFolder']
            },
            hidden: {
                files: ['packetList', 'starterChecklist', 'roster',  'permissionSlip', 'projectRequirements']
            },
            commonFiles: ['sharedQuestions']
        }
    }
    const testConfig = getConfig(testApp, configNeededForTest)
    console.log(JSON.stringify(setUpFileFolderSharingForRoster(testApp, testConfig), null, 4))
}

function testMakeFilesFoldersEditableForRoster() {
    const appId = '1kaoVBVyMqhLmsyLWWNeRWqdc6hK2nQOuRJc3kWe_NmA'
    const testApp = openTypeById('ss', appId)
    const configNeededForTest = {
        rosterFilesFolders: {
            viewable: {
                files: ['projectSummary', 'rubric', 'projectPlan'],
                folders: ['resourceFolder']
            },
            editable: {
                files: ['teams', 'sharedQuestions'],
                folders: ['teamFolder']
            },
            hidden: {
                files: ['packetList', 'starterChecklist', 'roster',  'permissionSlip', 'projectRequirements']
            },
            commonFiles: ['sharedQuestions']
        }
    }
    const { projectIds, rosterFilesFolders, ...rest } = getConfig(testApp, configNeededForTest)
    makeFilesFoldersEditableForRoster(
        rosterFilesFolders.editable,
        projectIds,
        getRosterEmailsById(projectIds.roster)
    )
}

function testHideFilesFoldersForRoster() {
    const appId = '1kaoVBVyMqhLmsyLWWNeRWqdc6hK2nQOuRJc3kWe_NmA'
    const testApp = openTypeById('ss', appId)
    const configNeededForTest = {
        rosterFilesFolders: {
            viewable: {
                files: ['projectSummary', 'rubric', 'projectPlan'],
                folders: ['resourceFolder']
            },
            editable: {
                files: ['teams', 'sharedQuestions'],
                folders: ['teamFolder']
            },
            hidden: {
                files: ['packetList', 'starterChecklist', 'roster',  'permissionSlip', 'projectRequirements']
            },
            commonFiles: ['sharedQuestions']
        }
    }
    const { projectIds, rosterFilesFolders, ...rest } = getConfig(testApp, configNeededForTest)
    hideFilesFoldersForRoster(
        rosterFilesFolders.hidden,
        projectIds,
        getRosterEmailsById(projectIds.roster)
    )
}

function testWriteTasks() {
    const appId = config.masterPacketAppId
    const testApp = openTypeById(SHEET, appId)
    const testConfig = getConfig(testApp, config)
    writeTasks(testApp, testConfig)
}

function testBuildGoalsAndAssessment() {
    const appId = config.masterPacketAppId
    const testApp = openTypeById('ss', appId)
    const configNeeded = {}
    const testConfig = getConfig(testApp, configNeeded)
    buildGoalsAndAssessment(testApp, testConfig)
}

function testGetFields() {
    const appId = config.masterPacketAppId
    const testApp = openTypeById('ss', appId)
    console.log(getFields(testApp)) 
}

function testGetConfig() {
    const appId = config.masterPacketAppId
    const testApp = openTypeById('ss', appId)
    console.log(getConfig(testApp, config))
}

function testShareWithTeacherStage1() {
    const appId = config.masterPacketAppId
    const testApp = openTypeById('ss', appId)
    const configNeeded = {
        sharingStages: [
            {
                sharedWith: TEACHERS,
                stage: 1,
                desc: 'Teacher gets roster to fill out.',
                share: [
                    { itemType: FOLDER, propKey: PROJECT_FOLDER, permission: VIEW, findFunction: getProjectFolder },
                    { itemType: FILE, propKey: ROSTER, permission: EDIT },
                ],
                hide: [
                    { itemType: FOLDER, propKey: TEAM_FOLDER },
                    { itemType: FOLDER, propKey: SHARED_FOLDER },
                    { itemType: FILE, propKey: PROJECT_PLAN },
                    { itemType: FILE, propKey: RUBRIC },
                ]
            },
        ]        
    }
    const testConfig = getConfig(testApp, configNeeded)
    testConfig.fieldConfig.teacherEmail = [1, "single", "teacherInput", 'chrisstevenshaw@gmail.com']
    shareWithTeacherStageX(testApp, testConfig, 1)
}

function testShareWithTeacherStage2() {
    const appId = '1GEvEHtMpYHSsEIlV59lqEzZhYbsS1ZF1-xxiROBbeng' // Kent Gish summer school
    const testApp = openTypeById('ss', appId)
    const configNeeded = {
        sharingStages: [
            {
                sharedWith: TEACHERS,
                stage: 2,
                desc: 'Teacher get the project plan.',
                share: [
                    { itemType: FILE, propKey: PROJECT_PLAN, permission: EDIT },
                ],
            },
            {
                sharedWith: TEACHERS,
                stage: 3,
                desc: 'Teacher get the rubric.',
                share: [
                    { itemType: FILE, propKey: RUBRIC, permission: EDIT },
                ],
            },         
        ]        
    }
    const testConfig = getConfig(testApp, configNeeded)
    testConfig.fieldConfig.teacherEmail = [1, "single", "teacherInput", 'chrisstevenshaw@gmail.com']
    shareWithTeacherStageX(testApp, testConfig, 2)
}

function testCreateTeamFolders() {
    const appId = '1GEvEHtMpYHSsEIlV59lqEzZhYbsS1ZF1-xxiROBbeng' // Kent Gish Summer
    const testApp = openTypeById('ss', appId)
    const configNeeded ={}
    const testConfig = getConfig(testApp, configNeeded)
    console.log(createTeamFolders(testApp, testConfig))
}

function testBuildAndShareFolders() {
    const mainTeamFolder = getFolderById('1DQ1QJqRZNX16INfi6Fyl7U95nMYT7aB8') // master packet team folder
    const teams = [
        ['000', 'Test 1', 'Client', 'chrisstevenshaw@gmail.com'],
        ['001', 'Test 2 Fail', 'Client', '2021madelinecurry@cscshc.org'],
    ]

    console.log(buildAndShareFolders(teams, mainTeamFolder))
}

function testAddSharedResourcesFolderToTeamFolders() {
    const appId = config.masterPacketAppId
    const testApp = openTypeById('ss', appId)
    const configNeeded = {}
    const testConfig = getConfig(testApp, configNeeded)
    console.log(addSharedResourcesFolderToTeamFolders(testApp, testConfig))
}
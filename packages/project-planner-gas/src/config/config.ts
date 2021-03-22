import plannerConstants from '../../../utilities-gas/src/constants'
import { getProjectFolder } from '../handleFoldersAndFiles';

const {
    TEACHERS,
    FOLDER,
    PROJECT_FOLDER,
    FILE,
    VIEW,
    ROSTER,
    EDIT,
    TEAM_FOLDER,
    SHARED_FOLDER,
    PROJECT_PLAN,
    RUBRIC,
    STUDENTS,
    SHARED_QUESTIONS,
    COMMENT
} = plannerConstants()

const config = {
    projectFormResponsesId: '18wEJQxVaEEm6ncPk1k9ZCxDoewF3QYM4DKwzOqkMoy0',
    masterPacketAppId: '1bF-XrQoEmjJ1lGio3alXAI-bMDgtUDt5eml_b5pqHQo',
    masterPacketFolderId: '1COP6VzujG-8J91gNvseTcRtiZfH8JRLB',
    masterProjectPlanId: '1qNfmcD6yUyIeJ2X-yCWvBe1oHoctTCIE97ZQmBAU6EQ',
    projectDbFolderId: "1RgpLagkymjEK04yVi7agFkXWB7-AH_02",
    projectDbId: '1EZapqGsOuWbM-Sm9YMTnEDM8rR-xTsWRnAeKvcc7Jx4',    
    templateToolSheetName: "template.tools",
    sheetNames: {
        settings: 'config',
        ideas: 'ideas',
        instructions: 'tasks',
        assessment: 'assessment',
        skills: 'skillTable',
        checkpoints: 'checkpoints',
        rubric: 'rubric',
        pros: 'professionals',
        fields: 'request',
        goals: 'skills',
        days: 'keyDates',
        recruiting: 'recruiting',
        contacts: 'contactList',
        cumulativeMins: 'cumulativeMinutes',
        fileIds: '.fileIds'
    },
    filePropNameMap: {
        // roster: "Roster",
        projectPlan: "Plan",
        rubric: "Rubric",
        dossier: "Project dossier for partners"
        // sharedQuestions: "Shared Questions and Resources",
        // permissionSlip: "Parent Information and Consent Form",
    },
    folderPropNameMap: {
        sharedFolder: "Files shared with the partner",
        teamFolder: "Team Files",
        // projectFolder: null
    },
    fieldPropNameMap: {
        teacherEmail: "School email address",
    },
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
        {
            sharedWith: TEACHERS,
            stage: 4,
            desc: 'Teacher gets the team and shared folders',
            share: [
                { itemType: FOLDER, propKey: TEAM_FOLDER, permission: VIEW },
                { itemType: FOLDER, propKey: SHARED_FOLDER, permission: VIEW },
            ]
        },
        {
            desc: 'Students get the initial project folder to create teams with',
            sharedWith: STUDENTS,
            share: [
                { itemType: FOLDER, propKey: PROJECT_FOLDER, permission: VIEW, findFunction: getProjectFolder },
                { itemType: FILE, propKey: TEAM_FOLDER, permission: EDIT },
            ],
            hide: [
                { itemType: FOLDER, propKey: SHARED_FOLDER },
                { itemType: FOLDER, propKey: TEAM_FOLDER },
                { itemType: FILE, propKey: PROJECT_PLAN },
                { itemType: FILE, propKey: RUBRIC },
            ]
        },
        {
            desc: 'Students get oriented to the project (done in tandem with building the team folder structure, which already gave view permission for shared folder)',
            sharedWith: STUDENTS,
            share: [
                { itemType: FILE, propKey: SHARED_QUESTIONS, permission: EDIT },
            ],
            hide: []
        },
        {
            desc: 'Students get the project documents',
            sharedWith: STUDENTS,
            share: [
                { itemType: FILE, propKey: PROJECT_PLAN, permission: COMMENT },
                { itemType: FILE, propKey: RUBRIC, permission: COMMENT }
            ],
            hide: []
        },
    ],
};

export default config
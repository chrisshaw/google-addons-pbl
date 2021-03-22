import { getJsonDataFromSheetByName, getTransposedJsonDataFromSheetByName, openDocument, appendAllChildElementsToBody, getDocBody, getTablesFromBody, appendTableRowToTable, getJsonDataFromSheetsByNames, getRangeByName, getRangeValue } from "../../../../utilities-gas/src/gas-apis";
import plannerConstants from "../../../../utilities-gas/src/constants"
import { createElement, getComponentTemplateOfType } from "../handleTemplates";
import { formatDate } from "../../../../utilities-gas/src/general";
import { filterOnKeyValue } from "../../../../utilities-ts/src/general";
import { getCheckpointNumber } from "./writeScheduleDoc";

const {
    PROJECT_PLAN,
    PARAGRAPH,
    TABLE,
    DOC,
    TABLE_ROW
} = plannerConstants()

export function findRecruitsInStatus(recruitmentRecords, status) {
    return recruitmentRecords.filter((pro) => pro.status === status)
}

export function getProjectInfo(contact, projectIdeas) {
    const [ideaId] = contact.project.match(/\d{3}/)
    if (!ideaId) throw new Error(`No project idea id found with contact.project.match(/\d{3})/) with a contact.project of ${contact.project}`)
    const idea = projectIdeas.find((projectIdea) => projectIdea.ideaId === ideaId)
    if (!idea) throw new Error(`No project idea with project idea ${ideaId} found in the projectIdeas at projectIdea.ideaId`)
    return idea
}

const getProjectRows = (projectId, rows) => filterOnKeyValue('ideaId', projectId, rows)

function makeResource(resource, provider, required) {
    return {
        resource,
        provider,
        required
    }
}

function cleanResources(projectInfo) {
    const {
        free1,
        free2,
        broughtByPro1,
        broughtByPro2,
        broughtByTeacher1,
        broughtByTeacher2,
    } = projectInfo

    const teacherArgs = ['Teacher', 'Yes']
    const proArgs = ['Professional', 'Yes']
    const resources = [
        makeResource(...[free1, ...teacherArgs]),
        makeResource(...[free2, ...teacherArgs]),
        makeResource(...[broughtByTeacher1, ...teacherArgs]),
        makeResource(...[broughtByTeacher2, ...teacherArgs]),
        makeResource(...[broughtByPro1, ...proArgs]),
        makeResource(...[broughtByPro2, ...proArgs]),
    ]

    /**
     * We don't actually need to create rows for empty resouces.
     * 
     * This destructures the resource row to grab the resource property and checks the length
     */
    return resources.filter(({ resource }) => resource.length)
}

function shouldMakeSummary (publish = 'no') {
    return publish === 'yes'
}

/**
 * Gets the `group` property from the skill, which says whether this skill is assessed or not
 * @param skill - object representing a target skill
 */
const getSkillGroup = (skill) => skill['group']

/**
 * Determines if this skill is assessed or not by looking at the property on the skill
 * @param skill - object representing a target skill
 */
const isAssessedSkill = (skill) => getSkillGroup(skill) === 'assess'

/**
 * Splits the skill table into two arrays, one for assessed skills, and one for everything else,
 * and then returns those two arrays within one object.
 * @param skillTable - array of skill objects
 */
function getSkills (skillTable = []) {
    return skillTable.reduce(({skills, otherSkills}, skill) => {
        if (isAssessedSkill(skill)) {
            return {
                skills: [...skills, skill],
                otherSkills
            }
        } else {
            return {
                skills,
                otherSkills: [...otherSkills, skill]
            }
        }
    }, { skills: [], otherSkills: [] })
}

function cleanFields({ startDate, endDate, ...rest }) {
    console.log('cleanFields()', startDate, endDate)
    const formattedStartDate = formatDate(startDate, 'EEEE M/d')
    const formattedEndDate = formatDate(endDate, 'EEEE M/d')
    return { startDate: formattedStartDate, endDate: formattedEndDate, ...rest }
}

function getCheckpoints (ideaId = '', checkpointRows = []) {
    const projectCheckpoints = getProjectRows(ideaId, checkpointRows) // checkpointRows.filter(({ideaId: projectId}) => projectId === ideaId)
    return projectCheckpoints
}

const getProjectSkillId = (assessmentItem) => assessmentItem['projectSkillId']
const getProjectSkillIdInteger = (assessmentItem = {}) => parseInt(getProjectSkillId(assessmentItem), 10)

/**
 * Sort by the skillIds (because this is the order that they show up in the skills table). Then sort by checkpoint order.
 * @param assessmentRows - array of assessment objects
 */
const sortAssessments = (assessmentRows = []) => {
    // Let's create a shallow copy of this so we don't mutate the array.
    const assessmentCopy = assessmentRows.slice()
    return assessmentCopy.sort((first, second) => {
        const firstSkillId = getProjectSkillIdInteger(first)
        const secondSkillId = getProjectSkillIdInteger(second)
        const skillOrder = firstSkillId - secondSkillId
        if (skillOrder === 0) {
            const firstCheckpoint = getCheckpointNumber(first)
            const secondCheckpoint = getCheckpointNumber(second)
            return firstCheckpoint - secondCheckpoint
        } else {
            return skillOrder
        }
    })
}

/**
 * Gets a sorted list of assessment items, which are "links" between the checkpoints and the skills
 * @param ideaId - string id for the current project
 * @param assessmentRows - array of rows with assessment item objects
 */
function getAssessments (ideaId = '', assessmentRows = []) {
    const projectAssessments: object[] = getProjectRows(ideaId, assessmentRows) // assessmentRows.filter(({ideaId: projectId}) => projectId === ideaId)
    const sortedProjectAssessments = sortAssessments(projectAssessments)
    // For now let's just return the whole list. This is getting hard.
    // const assessments = groupAssessments(sortedProjectAssessments)
    return sortedProjectAssessments
}

// #TODO - this is a mess
function groupAssessments(sortedProjectAssessments: any[]) {
    return sortedProjectAssessments.reduce((groupedArray, assessment) => {
        const lastIndex = groupedArray.length - 1;
        const last = groupedArray[lastIndex];
        const lastSkillId = getProjectSkillId(last);
        const skillId = getProjectSkillId(assessment);
        if (lastSkillId === skillId) {
            return [...groupedArray.slice(0, lastIndex), { ...last, checkpoints: [...last.checkpoints, assessment] }];
        } else {
            return [...groupedArray, {...assessment, checkpoints: [{checkpointName: assessment.checkpointName, performanceDescriptor: assessment.performanceDescriptor}]}]
        }
    }, []);
}

/**
 * For a given project id, returns whether this project should be published and, if there is a matching
 * partner already, who the partner for the project is.
 * @param publish - value from the project idea on whether to include in the set of summaries to publish
 * @param ideaId - unique idea for this project idea
 * @param professionals - records of professionals (partners who have agreed to participate)
 */
function getProjectProfessional(ideaId: string, professionals: any[]) {
    // Return an empty object to make sure we're returning the appropriate type
    return professionals.find(({ projectId }) => ideaId === projectId) || {}
}

/**
 * Looks in the `ideas` and `professionals` sheets in the main tool spreadsheet
 * to create Google Docs summary docs for a project or projects. Depends on the
 * professionals spreadsheet to filter down to the right people we should be
 * making summaries with. Only makes summaries for the projects with `publish`
 * set to yes on the `ideas` sheet.
 * @see https://docs.google.com/spreadsheets/d/1bF-XrQoEmjJ1lGio3alXAI-bMDgtUDt5eml_b5pqHQo/edit#gid=2133032366
 * @param toolSpreadsheet - Google Sheets spreadsheet with all the project data
 * @param sheetNames - sheet name configuration kept in the shared config
 * @param fields - top-level request data
 */
function preparePublishableSummaries(toolSpreadsheet, sheetNames, fields) {
    const {
        pros,
        ideas,
        checkpoints,
        skills: skillTable,
        assessment
    } = sheetNames

    const summaryData = {
        ...getJsonDataFromSheetsByNames(toolSpreadsheet, [pros, checkpoints, skillTable, assessment]),
        [ideas]: getTransposedJsonDataFromSheetByName(toolSpreadsheet, ideas)
    }

    const professionals = summaryData[pros]
    const projects = summaryData[ideas]
    const summaries = projects.reduce((projectSummaries, project) => {
        const { publish, ideaId } = project
        if (shouldMakeSummary(publish)) {
            const professional: object = getProjectProfessional(ideaId, professionals)
            const checkpointTable = getCheckpoints(ideaId, summaryData[checkpoints])
            const {skills, otherSkills} = getSkills(summaryData[skillTable])
            const assessments = getAssessments(ideaId, summaryData[assessment])
            return [
                ...projectSummaries,
                {
                    ...project,
                    ...professional,
                    ...cleanFields(fields),
                    skills,
                    otherSkills,
                    assessments,
                    checkpoints: checkpointTable,
                    resources: cleanResources(project)
                }
            ]
        } else {
            return projectSummaries
        }
    }, [])
    return summaries
}

/**
 * Takes fully-prepared data object and creates a summary Google Doc by pasting in
 * a bunch of Google Doc templates and then filling in the variables with fields from
 * the data object. If you don't have the data right, don't expect this to work.
 * @see #preparePublishableSummaries() to get the data right
 * @param componentIds - array of Google Docs document ids that hold templates
 * @param docBody - open Google Document we're going to write to
 * @param data - fully-prepared data object with fields to fill in the templates with
 * @returns {void}
 */
export function writeSummary(componentIds, docBody, data) {
    const {
        summaryIntro,
        // summaryVideoLink,
        summaryProfessionalIntro,
        summaryProfessionalListItem,
        summaryProject,
        summaryProduct,
        summaryPurpose,
        // summaryTiming,
        summaryCheckpoints,
        summaryCheckpointsRow,
        summaryLearning,
        summaryLearningRow,
        summaryAssessments,
        summaryAssessmentsRow,
        summaryOtherLearning,
        summaryOtherLearningRow,
        // summaryResources,
        // summaryResourcesRow,
    } = componentIds

    const summaryComponentIds = [
        summaryIntro,
        // summaryVideoLink,
        summaryProfessionalIntro,
        summaryProfessionalListItem,
        summaryProject,
        summaryProduct,
        summaryPurpose,
        // summaryTiming,
    ]

    summaryComponentIds.forEach((componentId) => {
        appendRenderedComponentToBody(componentId, data, docBody);
    })

    /**
     * Takes the form of [ bodyTemplateWithTable, tableRowTemplate, rowData, stringIdJustBecause ]
     */
    const summaryComponentWithTableIds = [
        [summaryCheckpoints, summaryCheckpointsRow, data.checkpoints, 'checkpoints'],
        [summaryLearning, summaryLearningRow, data.skills, 'skills'],
        [summaryAssessments, summaryAssessmentsRow, data.assessments, 'assessments'],
        [summaryOtherLearning, summaryOtherLearningRow, data.otherSkills, 'other-skills'],
        // [summaryResources, summaryResourcesRow, data.resources, 'resources']
    ]

    summaryComponentWithTableIds.forEach((row) => {
        const [bodyWithTableTemplateId, tableRowTemplateId, rowData, section] = row
        appendRenderedTableComponentToBody(bodyWithTableTemplateId, tableRowTemplateId, docBody, data, rowData);
    })

}

/**
 * Mutates a given document by adding a table composed of the given tableBodyTemplate (more accurately body with table headers) and tableRowTemplate
 * @param bodyWithTableTemplateId `componentId` of the table body template
 * @param tableRowTemplateId `componentId` of the table row template
 * @param docBody Google Docs body to append to
 * @param bodyData one-time, body-level data to render
 * @param rowsData array of data objects to render as separate rows in the table
 */
export function appendRenderedTableComponentToBody(bodyWithTableTemplateId: string, tableRowTemplateId: string, docBody: any, bodyData: any, rowsData: any) {
    const tableBodyTemplate = getComponentTemplateOfType(DOC, bodyWithTableTemplateId);
    const tableRowTemplate = getComponentTemplateOfType(DOC, tableRowTemplateId, TABLE_ROW);
    const tableBodyComponent = createElement(bodyData, tableBodyTemplate);
    const bodyWithNewTable = createBodyWithNewTable(tableBodyComponent, tableRowTemplate, rowsData);
    const appendedComponent = appendAllChildElementsToBody(bodyWithNewTable, docBody);
    return appendedComponent
}

export function appendRenderedComponentToBody(componentId: any, data: any = {}, docBody: any) {
    const templateBody = getComponentTemplateOfType(DOC, componentId);
    const filledTemplateBody = createElement(data, templateBody);
    const appendedElements = appendAllChildElementsToBody(filledTemplateBody, docBody);
    // console.info('appendedElements', appendedElements);
    return appendedElements
}

/**
 * Mutates a given body with a table by appending new rows to the included table based on a TableRow template
 * @param templateWithTable Google Apps Script Document body that contains a table in it. Must contain **1** table only.
 * @param tableRowTemplate TableRow with template slots to fill in
 * @param rowBasedData array of data
 */
export function createBodyWithNewTable(templateWithTable, tableRowTemplate, rowBasedData) {
    console.log(
        'templateWithTable', templateWithTable,
        'tableRowTemplate', tableRowTemplate,
        'rowBasedData', rowBasedData
    )
    const tableRef = getTablesFromBody(templateWithTable)[0];
    rowBasedData.forEach((row) => {
        const tableRow = createElement(row, tableRowTemplate);
        appendTableRowToTable(tableRow, tableRef);
    });
    return templateWithTable;
}

export function getProjectPlanBody(projectIds) {
    const projectPlanId = projectIds[PROJECT_PLAN]
    const planDoc = openDocument(projectPlanId)
    const planDocBody = getDocBody(planDoc)
    return planDocBody
}

export function writeSummaryDoc(toolSpreadsheet, fullConfig) {
    /**
     * Steps to this:
     * 
     * 1. Get all the fields that could possibly matter from fields, goals, ideas, contacts, recruiting
     * 2. Get all the templates needed to construct the summary: intro, pro, project, product, purpose, timing, learning, materials
     * 3. One by one, go through the templates and fill in with all those fields
     */

    const { projectIds, componentIds, sheetNames, fieldConfig: fields } = fullConfig
    const planDocBody = getProjectPlanBody(projectIds)
    const summaries = preparePublishableSummaries(toolSpreadsheet, sheetNames, fields)

    summaries.forEach((summaryData) => writeSummary(componentIds, planDocBody, summaryData))
}

export default writeSummaryDoc
import { copyElement, getSheetByName, getAllSheetValues, openTypeById, getDocBody, saveAndCloseDocument, appendElementOfTypeToBody } from "../../../../gas-utilities/gas-apis";
import { getComponentTemplateOfType, createElement } from "../handleTemplates";
import { transformRowsToObjects } from '../../../../gas-utilities/general'
import plannerConstants from '../../../../constants/constants'

const {
    DOC,
    PARAGRAPH,
    TABLE,
    PROJECT_PLAN
} = plannerConstants()

function findCheckpoints(tasks) {
    return tasks.reduce( (checkpoints, task) => {
        const { checkpoint, isCheckpoint } = task
        if (isCheckpoint) return { ...checkpoints, [checkpoint]: task }
        else return checkpoints
    }, {} )
}

function parseProp(prop) {
    return prop === null ? 0 : parseInt(prop, 10)
}

function saveDoc(planId, planDoc) {
    saveAndCloseDocument(planDoc)
    const plan = openTypeById(DOC, planId)
    const planBody = getDocBody(plan)
    return { plan, planBody }
}

export function writeTasks(app, fullConfig) {
    const CHUNK_SIZE = 100
    const TASK_INDEX_KEY = 'taskIndex'
    const CHECKPOINT_INDEX_KEY = 'latestCheckpoint'

    const docProps = PropertiesService.getDocumentProperties()
    let taskIndex = parseProp(docProps.getProperty(TASK_INDEX_KEY))
    let latestCheckpoint = parseProp(docProps.getProperty(CHECKPOINT_INDEX_KEY))

    const { projectIds, componentIds, sheetNames, fieldConfig: { langCheckpointAlias: checkpointAlias } } = fullConfig

    const taskIntroTemplate = getComponentTemplateOfType(DOC, componentIds.tasksIntro, PARAGRAPH)
    const checkpointTemplate = getComponentTemplateOfType(DOC, componentIds.checkpoint, PARAGRAPH)
    const taskTemplate = getComponentTemplateOfType(DOC, componentIds.task, TABLE)

    const taskSheet = getSheetByName(app, sheetNames.instructions)
    const allRows = getAllSheetValues(taskSheet)
    const tasks = transformRowsToObjects(allRows)
    const numTasks = tasks.length

    const checkpoints = findCheckpoints(tasks)

    const projectPlanId = projectIds[PROJECT_PLAN]
    let plan = openTypeById(DOC, projectPlanId)
    let planContent = getDocBody(plan)

    /**
     * Since this is the last thing in the document, we can just start adding stuff.
     */
    if (taskIndex === 0) {
        appendElementOfTypeToBody(
            createElement({}, taskIntroTemplate),
            PARAGRAPH,
            planContent
        )        
    }

    /**
     * We're limited on how long we can run a Google Apps Script.
     * 
     * So, that means we need to run it in chunks.
     * 
     * We store the latest-run task and checkpoint of the full task array in a Google Apps Document Property
     * 
     * The next time we run this script, it picks up the latest task index, starts from there, and then goes for a chunk or until end.
     */
    while (((taskIndex + 1) % CHUNK_SIZE) !== 0 && taskIndex < numTasks) {
        const task = tasks[taskIndex]
        const { checkpoint, ...taskData } = task       
        
        if ( checkpoint > latestCheckpoint ) {
            const { workProductName, workProductType } = checkpoints[checkpoint]
            appendElementOfTypeToBody(
                createElement( { checkpointAlias, checkpoint, workProductName, workProductType }, checkpointTemplate),
                PARAGRAPH,
                planContent
            )

            latestCheckpoint = checkpoint
        }

        appendElementOfTypeToBody(
            createElement(taskData, taskTemplate),
            TABLE,
            planContent
        )

        const { plan: newPlan, planBody } = saveDoc(projectPlanId, plan)
        plan = newPlan
        planContent = planBody
        taskIndex++
    }
    
    docProps.setProperty(TASK_INDEX_KEY, taskIndex.toString())
    docProps.setProperty(CHECKPOINT_INDEX_KEY, latestCheckpoint.toString())

    return saveAndCloseDocument(plan)
}
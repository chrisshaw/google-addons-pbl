import plannerConstants from "../../../../constants/constants";
import { getProjectPlanBody, appendRenderedComponentToBody, appendRenderedTableComponentToBody } from "./writeSummaryDoc";
import { getJsonDataFromSheetsByNames, getHeadersFromSheetByName } from "../../../../gas-utilities/gas-apis";
import { dropHeaders, formatDate } from "../../../../gas-utilities/general";

const {
    PROJECT_PLAN
} = plannerConstants()

export function writeSchedules(toolSpreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet, fullConfig) {
    /**
     * Steps
     * 
     * 1. Get the cumulative minutes for each task, including checkpoints
     * 2. Get the cumulative minutes for each day available
     * 3. For each schedule, loop through the cumulativeMinutes by day
     * 4. For each day, find which task start and end minute intervals overlap the start and end minute interval of the day (I do this brute force, sloooow. Use interval tree).
     * 5. Find the min task number and max task number that overlaps
     * 6. Find all checkpoints that overlap.
     * 7. Use the first, store the second for when there isn't a checkpoint.
     * 8. If there's no checkpoint, grab one from the store
     * 9. Write the date row into the schedule table
     */
    const { sheetNames, projectIds, componentIds, fieldConfig } = fullConfig
    const { instructions, cumulativeMins } = sheetNames
    const { scheduleIntro, classScheduleIntro, classScheduleRow } = componentIds
    const { langCheckpointAlias: checkpointAlias, scheduleIntroText: firstRowText } = fieldConfig

    const dayMinutesHeaders = getHeadersFromSheetByName(toolSpreadsheet, cumulativeMins)
    const sectionNames = dayMinutesHeaders.slice(3)
    const { [instructions]: taskMinutes, [cumulativeMins]: dayMinutes } = getJsonDataFromSheetsByNames(toolSpreadsheet, [instructions, cumulativeMins])
    const sectionSchedules = prepareSchedulesBySection(sectionNames, taskMinutes, dayMinutes)

    const planBody = getProjectPlanBody(projectIds)
    appendRenderedComponentToBody(scheduleIntro, {}, planBody)

    sectionSchedules.forEach((sectionScheduleData) => {
        writeSchedule({ classScheduleIntro, classScheduleRow }, planBody, { checkpointAlias, firstRowText }, sectionScheduleData)
    });
}

function writeSchedule({ classScheduleIntro: bodyId, classScheduleRow: rowId }, docBody, options, { name, schedule }) {
    console.log('>>> writeSchedule()')
    const rows = turnScheduleIntoRows(options, schedule)
    appendRenderedTableComponentToBody(bodyId, rowId, docBody, { name }, rows)
}

const makeTaskRangeString = ({ minTaskId, maxTaskId }) => {
    /**
     * To date, when we run out of tasks before we run out of days, Math.max() and Math.min() yield Infinity.
     * 
     * We don't want that in our rows. The only time this _should_ happen is when we run out of tasks before days. In other words, it's catch-up time.
     */
    if (Number.isFinite(maxTaskId)) {
        return minTaskId === maxTaskId && `Task ${maxTaskId}` || `Tasks ${minTaskId} - ${maxTaskId}`
    } else {
        return 'Catch up'
    }
}

const makeCheckpoint = (checkpointAlias, checkpoint = { checkpointNumber: '', checkpointName: '' }) => {
    const { checkpointNumber, checkpointName } = checkpoint
    return {
        checkpoint: checkpointNumber && `${checkpointAlias} ${checkpointNumber}` || checkpointNumber,
        checkpointName
    }
}

const makeDayObject = ({ checkpoint, checkpointName }, date: string, activityText: string, taskRange: string) => ({
    checkpoint,
    checkpointName,
    date,
    activityText,
    taskRange
})

function turnScheduleIntoRows({ checkpointAlias, firstRowText }, schedule) {
    const dayRows = schedule.map(({ date, formatted }, index) => {
        console.log(formatted)
        const { taskRange: rangeObj, checkpoints, dayOff } = formatted
        const dateString = formatDate(date, 'M/d')
        const activityText = index === 0 && firstRowText || ''
        /**
         * Rather than randomly deferring checkpoints, let's just show the latest one.
         * 
         * Because the formatter uses a filter and returns an array, even if there's only 1 checkpoint, we can just pop off the last element.
         */
        const latestCheckpoint = checkpoints.slice().pop()
        const checkpoint = makeCheckpoint(checkpointAlias, latestCheckpoint)
        /**
         * If it has a message (like 'Day off'), then it doesn't have tasks or checkpoints (at least for now).
         * 
         * Thus, just return the message and stick it in the place of the `taskRange`
         */
        const taskRange = dayOff && 'Day off' || makeTaskRangeString(rangeObj)
        const dayObj = makeDayObject(checkpoint, dateString, activityText, taskRange)
        return dayObj
    })
    return dayRows
}

export function prepareSchedulesBySection(sectionNames: string[], taskMinutes, dayMinutes) {
    const sections = sectionNames.map((sectionName) => {
        const sectionScheduleData = prepareScheduleData(sectionName, formatDayTasks, taskMinutes, dayMinutes)
        return { name: sectionName, schedule: sectionScheduleData }
    })

    return sections
}

const getDayDate = (day) => day['date']
const isIncluded = (day) => parseInt(day['includeMinutes'], 10)
const getTaskIdAsNumber = (task) => parseInt(task['taskId'], 10)
const isCheckpoint = (task) => parseInt(task['isCheckpoint'], 10)
const getProductName = (task) => task['workProductName']
const getCheckpointNumber = (task) => parseInt(task['checkpoint'], 10)
export { getCheckpointNumber }
const getProductType = (task) => task['workProductType']

function prepareScheduleData(dayMinutesKey, dataFormatter, taskMinutes, dayMinutes) {

    const schedule = dayMinutes.reduce((scheduleDays, day, i, days) => {
        const date = getDayDate(day)
        const endDayMinutes = day[dayMinutesKey]
        const startDayMinutes = i > 0 && days[i - 1][dayMinutesKey] || 0
        const newDay = prepareDay(taskMinutes, startDayMinutes, endDayMinutes, dataFormatter, date);
        const included = isIncluded(day) && endDayMinutes - startDayMinutes > 0
        const excluded = !included
        return [...scheduleDays, { ...newDay, dayOff: excluded }]
    }, [])

    return schedule
}

function prepareDay(taskMinutes: any, startDayMinutes: any, endDayMinutes: any, dataFormatter: any, date: any) {
    const overlappingTasks = taskMinutes.filter((task) => {
        const startTaskMinutes = getTaskStartMinutes(task);
        const endTaskMinutes = getTaskEndMinutes(task);
        const overlaps = startDayMinutes <= endTaskMinutes && startTaskMinutes <= endDayMinutes;
        return overlaps
    });
    const formatted = dataFormatter(overlappingTasks);

    return {
        date,
        source: overlappingTasks,
        formatted
    };
}

function getTaskEndMinutes(task: any) {
    return task['endingCumulativeMinutes'];
}

function getTaskStartMinutes(task: any) {
    return task['startingCumulativeMinutes'];
}

function formatDayTasks(tasks) {
    const overlappingTaskIds = tasks.map(getTaskIdAsNumber)
    const overlappingCheckpoints = tasks.filter(isCheckpoint)
    const checkpoints = overlappingCheckpoints.map((checkpoint) => ({
        checkpointName: getProductName(checkpoint),
        checkpointNumber: getCheckpointNumber(checkpoint),
        checkpointProduct: getProductType(checkpoint),
    }))
    const taskRange = {
        minTaskId: Math.min(...overlappingTaskIds),
        maxTaskId: Math.max(...overlappingTaskIds),
    }
    return { checkpoints, taskRange }
}
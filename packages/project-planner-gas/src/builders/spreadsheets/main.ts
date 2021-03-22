import { getSheetByName, getAllSheetValues, openTypeById } from "../../../../gas-utilities/gas-apis";
import plannerConstants from "../../../../constants/constants";
import { formatRubricData, buildRubrics } from "./writeRubricSheet";

const {
    SHEET
} = plannerConstants()

export function buildGoalsAndAssessment(app, fullConfig) {

    const rubricSheet = getSheetByName(app, 'Rubrics')
    const rubricData = getAllSheetValues(rubricSheet)
    const headers = rubricData.shift()
    const { overview, rubrics } = formatRubricData(rubricData)
    const rubricId = fullConfig.projectIds.rubric
    const rubricSs = openTypeById(SHEET, rubricId)

    buildRubrics(rubricSs, rubrics)

}
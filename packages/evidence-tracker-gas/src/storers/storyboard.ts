import { formatDate } from "../../../gas-utilities/general";
import { appendRow } from "../../../gas-utilities/gas-apis";

function makeAddResultObject(success, error?) {
    return {
        added: success && 1 || 0,
        erred: !success && 1 || 0,
        error
    }
}



function addToSheet(sheet, student, competency, teacher, notes) {
    const date = new Date()
    const timestamp = formatDate(date)
    const values = [
        timestamp,
        teacher,
        student,
        competency,
        notes
    ]

    try {
        appendRow(sheet, values)
        return makeAddResultObject(true)
    } catch (error) {
        return makeAddResultObject(false, error)
    }
}

export const addEvidence = (sheet) => (evidence) => {
    const initialResult = {
        addedCount: 0,
        errorCount: 0,
        errors: [],
        evidence: [],
        done: false
    }

    const finalAddResult = evidence.reduce( (addResult, currentEvidence) => {
        const { addedCount, errorCount, errors, evidence } = addResult
        const { student, competency, teacher, notes } = currentEvidence.data
        const { added, erred, error } = addToSheet(sheet, student, competency, teacher, notes)
        return {
            ...addResult,
            addedCount: addedCount + added,
            errorCount: errorCount + erred,
            evidence: [ ...evidence, currentEvidence ],
            errors: error && [ ...errors, error ] || errors
        }
    }, initialResult )

    return {
        ...finalAddResult,
        done: true,
    }
}
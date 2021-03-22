import { batchGetRangeValues } from "../src/gas-apis";

function testBatchGetRangeValues() {
    const ssId = '1WwaTBAlALMGi7BEtCAAYEl5i4PVplaroNXJ6R5u5ISE'
    const stringRanges = [
        "settings",
        "roster",
        "credits",
        "competencies",
        "evidence",
        "attendance",
        "resources",
        "checkpoints"
    ]

    const result = batchGetRangeValues(ssId, stringRanges)
    const dlUrl = DriveApp.getRootFolder().createFile("mock-result.json", JSON.stringify(result)).getDownloadUrl()
    console.log(dlUrl)
}
import { getSheetByName, getRangeByName } from "../../../../gas-utilities/gas-apis";
import { makeArrayAMatrix } from "../../../../gas-utilities/general";

function buildSummary(rubricSs, summary) {
    const borders = SpreadsheetApp.BorderStyle
    const solidBorder = borders.SOLID    
    const summarySheet = getSheetByName(rubricSs, "Summary")
    const summaryStart = getRangeByName(rubricSs, "startSummary")

    /*
    From summaryStart, there is a pattern for cells to follow
    1. Competency Name: left gray border, right gray border, Bold
    2. Competency Category: left gray border, right gray border, font color #757575
    3. Competency Id: left gray border, right gray border, font color #757575
    4-8. Description: left gray border, bottom gray border, right gray border, span 5 rows
    */

    const styleArrays = {
        fontWeights: [ "bold", "normal", "normal", "normal" ],
        fontColors: [ "black", "#757575", "#757575", "black" ],
    }

    summary.forEach( (competency, i) => {
        const { competency: name, category, identifier, description, coveredLevels } = competency
        const competencyStart = summaryStart.offset(1 + (8*i),0)

        const competencyInfo = [ name, category, identifier, description ]
        const competencyLevels = coveredLevels.map( (level) => level[0] )

        // put in competency info
        competencyStart
            .offset(0, 0, 4)
            .setValues(makeArrayAMatrix(competencyInfo))
            .setFontColors(makeArrayAMatrix(styleArrays.fontColors))
            .setFontWeights(makeArrayAMatrix(styleArrays.fontWeights))
            .setVerticalAlignment("top")
            .setWrap(true)

        // merge the description
        competencyStart
            .offset(3, 0, 5)
            .mergeVertically()

        // put in competency levels
        competencyStart
            .offset(0, 1, competencyLevels.length)
            .setValues(makeArrayAMatrix(competencyLevels))

        // set borders
        competencyStart
            .offset(0, 0, 8, 2)
            .setBorder(null, true, true, true, true, false, "#BDBDBD", solidBorder)

    } )
}
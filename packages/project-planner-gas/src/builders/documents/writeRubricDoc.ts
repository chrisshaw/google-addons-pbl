/*

-- OBSOLETE --

writeSomething functions for creating Goals and Assessments as a document instead of a spreadsheet. May come in handy later

*/

export function getTableStyles() {
    // Global styling config

    const headings = DocumentApp.ParagraphHeading
    const attributes = DocumentApp.Attribute
    const cellStyle = {}
    cellStyle[attributes.BORDER_COLOR] = '#EDEDED'
    const tableHeadingStyle = {}
    tableHeadingStyle[attributes.BOLD] = true
    const tableCellStyle = {}
    tableCellStyle[attributes.BOLD] = false
    const cellTitleStyle = {}
    cellTitleStyle[attributes.BOLD] = true
    const cellSubtitleStyle = {}
    cellSubtitleStyle[attributes.FOREGROUND_COLOR] = '#757575'
    
    return {
        headings,
        attributes,
        cellStyle,
        tableHeadingStyle,
        tableCellStyle,
        cellTitleStyle,
        cellSubtitleStyle
    }
}

function writeOverview(rubricContent, overview) {
    // Some styling
    const {
        headings,
        attributes,
        cellStyle,
        tableHeadingStyle,
        tableCellStyle,
        cellTitleStyle,
        cellSubtitleStyle
    } = getTableStyles()

    // prepare the overview
    rubricContent.appendPageBreak()
    rubricContent.appendParagraph("Summary of What's Covered").setHeading(headings.HEADING1)
    const overviewTable = rubricContent.appendTable()
    overviewTable.setAttributes(cellStyle)
    insertRowInDoc(overviewTable, [ { text: "Competency"}, { text: "Competence Level" } ], tableHeadingStyle)

    // Add some real data
    overview.forEach( (competency) => {
        const { competency: compName, identifier, category, description, coveredLevels } = competency
        const firstColumn = [
            {
                text: compName,
                style: cellTitleStyle
            }, {
                text: category,
                style: cellSubtitleStyle
            }, {
                text: identifier,
                style: cellSubtitleStyle
            }, {
                text: description,
            }
        ]

        const secondColumn = coveredLevels.map( (level) => ({ text: level[0] }) )

        insertRowInDoc(overviewTable, [ firstColumn, secondColumn ])
    } )

    return rubricContent
}

function writeRubrics(rubricContent, rubrics) {

    const {
        headings
    } = getTableStyles()

    // prepare the rubric
    rubricContent.appendPageBreak()
    rubricContent.appendParagraph("Rubrics for Learning and Behavior Goals").setHeading(headings.HEADING1)
    rubricContent.appendParagraph("How we’ll know know when we’ve reached our goals").setHeading(headings.SUBTITLE)

    rubrics.forEach( (rubric) => {
        rubricContent.appendParagraph(rubric.competency).setHeading(headings.HEADING2)

        writeRubric(rubricContent, rubric)
    } )

    return rubricContent
}

function writeRubric(rubricContent, rubric) {
    // Some styling
    const {
        headings,
        attributes,
        cellStyle,
        tableHeadingStyle,
        tableCellStyle,
        cellTitleStyle,
        cellSubtitleStyle
    } = getTableStyles()

    const rubricTable = rubricContent.appendTable()
    rubricTable.setAttributes(cellStyle)
    const headerData = [
        { text: "Competence Level" },
        { text: "Description" },
        { text: "Where to Find Evidence" },
        { text: "What to Look For" }
    ]
    insertRowInDoc(rubricTable, [ headerData ], tableHeadingStyle)
    
    rubric.levels.forEach( (levelObject, levelName) => {

    } )
}

function insertRowInDoc(table, rowData, rowStyle?) {
    /* Row data expects an array of arrays of objects with text and styles

    [
        [
            {
                text: 'first cell first paragraph',
                style: styleObject
            },
            {
                text: 'first cell second paragraph',
                style: styleObject
            }
        ], [
            {
                text: 'second cell only paragraph',
                style: styleObject
            }
        ]
    ]

    */

    const newRow = table.appendTableRow()
    if (rowStyle) newRow.setAttributes(rowStyle)

    rowData.forEach( (column) => {
        const cell = newRow.appendTableCell()

        column.forEach( (paragraph) => {
            const newParagraph = cell.appendParagraph(paragraph.text)
            if (paragraph.style) newParagraph.setAttributes(paragraph.style)
        })
    } )
    
    return newRow
}
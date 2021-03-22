import { getSheetByName, getRangeByName } from "../../../../utilities/google-apis";
import { transformArrayToObjectWithKeys } from "../../../../utilities/general";

function destructureRubricRow(row): any {
    const orderedKeysForRow = [
        'skill',
        'description',
        'level',
        'performanceIndicator',
        'checkpoint',
        'task',
        'product',
        'evidence'
    ]

    return transformArrayToObjectWithKeys(row, orderedKeysForRow)
}

/* formatRubricData

Private function to format data from the spreadsheet to make it easy for writing

*/
export function formatRubricData(rubricData) {
    /*

    sections = {
        overview: [
            {
                competency: String,
                category: String,
                identifier: String,
                description: String,
                coveredLevels: [
                    [level<String>, attributeCount<Integer>]
                ]
            }
        ],
        rubrics: [
            {
                competency: String,
                identifier: String,
                levels: [
                    {
                        level: String,
                        description: String,
                        evidence: [
                            {
                                product: String,
                                attribute: String,
                            }
                        ]
                    }
                ]
            }
        ]
    }

    */

    return rubricData.reduce((finalSections, currentRow) => {
        let { overview, rubrics } = finalSections;
        const {
            skill: compId,
            description: compName,
            level: compLevel,
            performanceIndicator: description,
            product,
            evidence,
            shortName,
            group
        } = destructureRubricRow(currentRow)

        const newLevel = [compLevel, 1];

        const newEvidence = {
            product,
            attribute: evidence
        }

        const newRubricLevel = {
            level: compLevel,
            description,
            evidence: [newEvidence]
        };

        let currentCompetency = overview.find((comp) => comp.identifier && comp.identifier === compId);
        if (!currentCompetency) currentCompetency = overview.find((comp) => comp.competency === compName);

        let currentRubric = rubrics.find((rubric) => rubric.identifier && rubric.identifier === compId);
        if (!currentRubric) currentRubric = rubrics.find((rubric) => rubric.competency === compName);

        if (!currentCompetency && !currentRubric) {
            // This must be a new competency
            currentCompetency = {
                competency: shortName && shortName || compId,
                category: group,
                identifier: compId,
                description: compName,
                coveredLevels: [newLevel]
            };
            overview = [...overview, currentCompetency];
            currentRubric = {
                competency: compName,
                identifier: compId,
                levels: [newRubricLevel]
            };
            rubrics = [...rubrics, currentRubric];
        } else if (currentCompetency && !currentRubric || !currentCompetency && currentRubric) {
            // Something's wrong
            return new Error('We only found either the overview or the rubric--not both. Something is wrong!')
        } else {
            // We have them both and can update stuff

            // Update the overview
            const { coveredLevels } = currentCompetency;
            const coveredLevelIndex = coveredLevels.findIndex((level) => level[0] === compLevel);
            if (coveredLevelIndex >= 0) {
                coveredLevels[coveredLevelIndex][1]++;
            } else {
                coveredLevels.push(newLevel);
            }

            // Now for the rubric
            const { levels } = currentRubric;
            const thisLevel = levels.find((level) => level.level === compLevel)
            if (thisLevel) {
                thisLevel.evidence.push(newEvidence);
            }
            else {
                levels.push(newRubricLevel)
            }
        }
        return { overview, rubrics };
    }, {
            overview: [],
            rubrics: [],
        });
}

function groupEvidenceByProduct(evidenceArray) {
    return evidenceArray.reduce((groupedEvidence, currentEvidence) => {
        const { product, attribute } = currentEvidence

        let productObject = groupedEvidence.find((prod) => prod.product === product)
        if (productObject) {
            productObject.attributes.push(attribute)
        } else {
            productObject = {
                product,
                attributes: [attribute]
            }
            groupedEvidence.push(productObject)
        }

        return groupedEvidence
    }, [])
}

export function buildRubrics(rubricSs, rubrics) {
    const borders = SpreadsheetApp.BorderStyle
    const solidBorder = borders.SOLID

    const rubricSheet = getSheetByName(rubricSs, "Rubrics")
    let rubricCursor = getRangeByName(rubricSs, "startFirstRubric")
    /*
    From rubricStart, there is a pattern for cells to follow
    1. Competency Name: font family roboto, font size 16
    2. divider: row height 12
    3. headers: font weight bold, font size 11, border all #BDBDBD
        ["Competence Level", "Description", "Where to Look", "What to Look for"]
    4+. Each of the rows, with various row spans
        [ span length of all children of level, span length of all children of level, span length of all children of product ]
    */

    const headers = [
        ["Competence Level", "Description", "Where to Look", "What to Look for"]
    ]

    rubrics.forEach((rubric, i) => {
        const { competency, levels } = rubric

        // Add title with Competency Name
        rubricCursor
            .setValue(competency)
            .setFontFamily("Roboto")
            .setFontSize(16)

        // Add a spacer row
        const spacerRow = rubricCursor.offset(1, 0).getRow()
        rubricSheet.setRowHeight(spacerRow, 12)

        // Add headers
        rubricCursor
            .offset(2, 0, 1, 4)
            .setValues(headers)
            .setFontWeight("bold")
            .setFontSize(11)
            .setBorder(true, true, true, true, true, true, "#BDBDBD", solidBorder)

        // Add levels
        rubricCursor = rubricCursor.offset(3, 0)

        levels.forEach((level) => {
            const { level: name, description, evidence } = level
            const evidenceCount = evidence.length
            const groupedEvidence = groupEvidenceByProduct(evidence)
            let productRowTally = 0

            groupedEvidence.forEach((group) => {
                const { product, attributes } = group
                const attributeCount = attributes.length

                const productValues = attributes.map((attribute, i) => {
                    return i === 0 ? [product, attribute] : [null, attribute]
                })

                rubricCursor
                    .offset(productRowTally, 2, attributeCount)
                    .mergeVertically()
                    .offset(0, 0, attributeCount, 2)
                    .setValues(productValues)
                    .setFontSize(11)
                    .setWrap(true)
                    .setVerticalAlignment("top")
                    .setBorder(true, true, true, true, true, true, "#BDBDBD", solidBorder)

                productRowTally += attributeCount
            })

            const levelValues = [
                [name, description]
            ]

            rubricCursor
                .offset(0, 0, 1, 2)
                .setValues(levelValues)
                .setFontSize(11)
                .offset(0, 0, evidenceCount, 2)
                .mergeVertically()
                .setWrap(true)
                .setVerticalAlignment("top")
                .setBorder(true, true, true, true, true, true, "#BDBDBD", solidBorder)

            // Jump to the next level
            rubricCursor = rubricCursor.offset(evidenceCount, 0)
        })

        // Prep the next rubric
        rubricCursor = rubricCursor.offset(2, 0)

    })
}
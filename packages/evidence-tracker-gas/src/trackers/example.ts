import { connectToActiveGSuiteSheet, connectToGSuiteFolder } from "../connectors/g-suite"
import { UserTrackerSettings } from "../main"
import { getFiles } from "../sourcers/folders"
import { addEvidence } from "../storers/storyboard"

const TRACKER_SETTINGS = {
    /**
     * Some of the configuration needed to 
     */
    example1: {
        DOC_ID: '<specific-template-google-doc-id>',
        SHEET_ID: '<specific-google-sheet-id>',
        finder: (docBody) => {
            /**
             * Traverse the doc template
             */
            const table = docBody.getTables()[0]

            /**
             * Find a specific source of evidence
             */
            const result = table.findText("[Y|y]es$") 
            return result           
        },
        /**
         * Test data
         */
        evidenceData: [
            'Marley Sherlock',
            'Positive Risk-taking',
            'Chris Shaw',
            'This should pull from the doc, but it does not do that yet because there is no way for teachers to comment.'            
        ]
    },
    example2: {
        DOC_ID: '',
        SHEET_ID: '',
        /**
         * This finder shows you can use highlighting specific table cells in a Google Doc.
         * It's totally up to you what you can do.
         * @param docBody Body of a Google Doc
         * @returns {boolean} whether to count a piece of evidence
         */
        finder: (docBody) => {
            const table = docBody.getTables()[0]

            const text = table.findText("Self-Knowledge")
            const color = text.getElement().asText().getBackgroundColor()
            const result = color === '#ffff00'
            return result
        },
        evidenceData: [
            'Marley Sherlock',
            'Self Knowledge',
            'Chris Shaw',
            'Graduate Vision Reflection'
        ]
    }
}

const exampleTrackerSettingsList: UserTrackerSettings[] = [
    {
        sourceInformation: {
            folderId: '<id-of-location-of-files>',
        },
        storeInformation: {
            spreadsheetId: '<google-spreadsheet-id-to-store-data>',
            sheetName: '<name-of-sheet>',
        },
        sourceConnector: connectToGSuiteFolder,
        sourcer: getFiles,
        finder: TRACKER_SETTINGS.example1.finder,
        /**
         * The default assumes you run this with the google sheet open and simply drops it in.
         */
        storeConnector: connectToActiveGSuiteSheet, // connectToGSuiteSheet,
        storer: addEvidence
    }    
]

export default exampleTrackerSettingsList
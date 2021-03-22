import { getJsonDataFromSheetByName, openSpreadsheetByUrl, getAllSheetValues } from '../../gas-utilities/gas-apis'

function doGet() {
    const html = HtmlService.createTemplateFromFile("build/ui/index").evaluate()
    html.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
        .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    return html
}

function include(fileName) {
    console.log(`including ${fileName}`)
    const content = HtmlService.createHtmlOutputFromFile(fileName).getContent()
    console.log(`${fileName}: ${content}`)
    return content
}
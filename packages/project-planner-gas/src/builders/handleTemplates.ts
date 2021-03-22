import { replaceText, openTypeById, getDocBody, getTablesFromBody, getParagraphsFromBody, copyElement, getTableRowsFromBody, getElementType } from "../../../gas-utilities/gas-apis";
import plannerConstants from "../../../constants/constants";
import { makeTypeSupportError } from "../../../gas-utilities/general";


const {
    PARAGRAPH,
    TABLE,
    TABLE_ROW
} = plannerConstants()
/*

Helpers

*/

interface FieldMapItem {
    key: string,
    pattern: string,
    value: any
}

export function createFieldMap(keyValueObject) {
    return Object.entries( { ...keyValueObject, test: 'test' } ).map( ([key, value]) => ({ key, pattern: `\{\{ ${key} \}\}`, value }) )
}

export function fillTemplate(element, fieldMap: FieldMapItem[]) {
  fieldMap.forEach( ({ key, pattern, value }) => replaceText(element, pattern, value))
  return element
}

export function getComponentTemplateOfType(fileType, templateId, templateType?) {
    const templateFile = openTypeById(fileType, templateId)
    const body = getDocBody(templateFile)

    let template

    switch (templateType) {
        case TABLE:
            template = getTablesFromBody(body)[0]
            break
        case PARAGRAPH:
            template = getParagraphsFromBody(body)[0]
            break
        case TABLE_ROW:
            template = getTableRowsFromBody(body)[0]
            break
        default:
        /**
         * Return the whole body
         */
            template = body
    }

    const copiedTemplate = copyElement(template)
    return copiedTemplate
}

export function createElement(data, template) {
    const fieldMap = createFieldMap(data)
    const element = copyElement(template)
    return fillTemplate(element, fieldMap)
}
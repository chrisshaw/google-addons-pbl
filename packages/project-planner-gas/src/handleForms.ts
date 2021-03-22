import { openTypeById, getOnlySheet, getRangeValues, getRange, getLastColumn, getValuesFromSelection, getSheetActiveRange, getRangeRow, getSheetCurrentCell, getSelection, getSelectionActiveRange, getSheetByName } from "../../utilities-gas/src/gas-apis";
import config from "./config/config";
import plannerConstants from "../../constants/constants";
import { getConfig, getMasterAppAndConfig } from "./handleSetup";
import { createNewProject } from "./createProjects";
import { transformArrayToObjectHorizontal } from "../../gas-utilities/general";

const {
  SHEET,
} = plannerConstants()

export function createNamedValuesFromFormSelection(app) {
  const formSheet = getSheetByName(app, 'Form Responses 1')
  const selection = getSelection(formSheet)
  const selectedRange = getSelectionActiveRange(selection)
  const selectedRow = getRangeRow(selectedRange)
  console.log(
    'selection', selection,
    'selectedRange', selectedRange,
    'selectedRow', selectedRow
  )
  const lastColumn = getLastColumn(formSheet)
  const headerValues = getRangeValues( getRange( formSheet, 1, 1, 1, lastColumn ) )
  const submissionValues = getRangeValues( getRange( formSheet, selectedRow, 1, 1, lastColumn ) )
  const headers = headerValues[0]
  const submission = submissionValues[0]

  return transformArrayToObjectHorizontal( [headers, submission] )
}
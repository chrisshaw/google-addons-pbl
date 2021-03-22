import { getRosterEmailsById } from "./distributeFiles";
import { openTypeById, getSheetByName, setRangeValues } from "../../utilities/google-apis";

/*

Main operations

*/

export function addDropDownOptionsToTeamSignUp(fullConfig) {
  // add a list of text values into the Team Sign-up that can be used in data validation
  
  //target format: 'Name | Email'
  
  const dropDownOptions = getRosterEmailsById(fullConfig.projectIds.roster).map( (option) => [option] )
  const teams = openTypeById('ss', fullConfig.projectIds.teams)
  const hiddenSheet = getSheetByName(teams, "options")
  const settingsRange = hiddenSheet.getRange(1,1, dropDownOptions.length)
  return setRangeValues(settingsRange, dropDownOptions)
}
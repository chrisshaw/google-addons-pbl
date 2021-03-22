import { getCustomerSettings } from "../../../../sidekick/apps/storyboard/customerSettings";
import { curryPipe, trace } from "../../utilities-ts/functional-programming";


interface Connector {
    (connectionInformation: ConnectionInformation): Connection
}
type ConnectionInformation = string | number | Object
type Connection = Object

interface EvidenceSourcer {
    (sourceConnection: Connection): any | any[]
}

interface Evidence {
    dateFound: Date,
    evidenceFor: string | number,
    attributes: any,
    data: object,
    source: object | number | string
}

interface EvidenceFinder {
    (sources): any[]
}

interface AddResult {
    done?: Boolean,
    addedCount?: number,
    errorCount?: number,
    errors?: Error[],
    evidence?: Evidence[]
}

interface EvidenceAdder {
    (storeConnection: Connection): (evidence: any[]) => any
}

interface UserDataSettings {
    sourceInformation?: ConnectionInformation,
    storeInformation?: ConnectionInformation,
}

interface TrackerSettings {
    sourceConnector: Connector,
    sourcer: EvidenceSourcer,
    finder: EvidenceFinder,
    storeConnector: Connector,    
    storer: EvidenceAdder
}

export type UserTrackerSettings = UserDataSettings & TrackerSettings

/************************
 * SELECTORS
 */

const getSourceInfo = (userDataSettings: UserDataSettings) => userDataSettings.sourceInformation
const getEvidence = (evidenceResult) => evidenceResult.evidence
const getSources = (sourceResult) => sourceResult.sources
const getEvidenceData = (evidence) => evidence.data
export { getEvidenceData }

/************************
 * FACTORIES
 */

export function makeUserTracker(userTrackerSettings: UserTrackerSettings) {
    const {
        sourceInformation,
        sourceConnector,
        storeInformation,
        storeConnector,
        sourcer,
        finder,
        storer
    } = userTrackerSettings
    console.log('sourceInformation', sourceInformation);
    console.log('sourceConnector()', sourceConnector)
    const sourceConnection = sourceConnector(sourceInformation)
    console.log('sourceConnection', sourceConnection);
    const connectedSourcer = sourcer(sourceConnection)
    console.log('connectedSourcer()', connectedSourcer)
    const storeConnection = storeConnector(storeInformation)
    console.log('storeConnection', storeConnection)
    const connectedStorer = storer(storeConnection)
    console.log('connectedStorer()', connectedStorer)

    const userTracker = curryPipe(
        connectedSourcer,
        trace('sources'),
        finder,
        trace('data'),
        connectedStorer
    )
    return userTracker
}

/************************
 * MAIN
 */

export function track(userTrackerSettingsList: UserTrackerSettings[]) {
    const trackingResults = userTrackerSettingsList.map( (userTrackerSettings) => {
        console.log('Creating tracker.');
        const track = makeUserTracker(userTrackerSettings)
        console.log('Tracker made.');
        console.log('Begin tracking.');
        
        return track()
    } )
    return trackingResults
}
export default track

function onTrack() {
    const userTrackerSettingsList = getCustomerSettings()
    console.log(track(userTrackerSettingsList))
}
import { newBlob, gzip, getBlobBytes, base64Encode, base64Decode, ungzip, getBlobDataAsString } from "../../utilities-gas/gas-apis";
import { logClick } from "../src/analytics";

function gzipBase64EncodeAndBack() {
    console.log('runTest()')
    const texts = [
        'This is just plain old text',
        JSON.stringify({ textValue: 'Here is some text!', nested: { nestedTextValue: 'Hey look, I am an object...?' } })
    ]

    /**
     * Which kind of text do you want to check? Primitive string (0) or JSON (1)?
     */
    const testSwitch = 0

    const blob = newBlob(texts[testSwitch])
    const gzipped = gzip(blob)
    const bytes = getBlobBytes(gzipped)
    const encoded = base64Encode(bytes)
    const decodedBytes = base64Decode(encoded)
    const blobAgain = newBlob(decodedBytes, GoogleAppsScript.Base.MimeType.PLAIN_TEXT)
    const unzipped = ungzip(blobAgain)
    console.log(getBlobDataAsString(unzipped)) 
}

function testLogClick() {
    console.log('testLogClick()')
    const ID = '1TCdeHi4A9MUCG30IWzbXsA4VlK8-k3Cd'
    const CLICK_COLUMN = 'View Clicks'
    logClick(ID, CLICK_COLUMN)
}
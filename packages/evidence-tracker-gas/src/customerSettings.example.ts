/**
 * @file
 * In (at least the older versions of) Google Apps Script, ES6+ modules and top-level constants don't work. So you have do
 * wrap things in functions and invoke them as needed.
 */

import { exampleTrackerSettingsList } from './trackers/example'
import { makeTypeSupportError } from "../../utilities-gas/general";
import "../gas-utilities/polyfills"

/**
 * Hacky but lightweight way to change configuration based on use case.
 * @returns Enum-like object with string keys for specific customers
 */
export function customerKeys() {
    return {
        EXAMPLE: 'example',
    }
}


export function customers() {
    const {
        EXAMPLE
    } = customerKeys()
    
    return [ EXAMPLE ]
}

export function CUSTOMER_SWITCH() {
    return 0
}

export function customerSettings(customerKey) {
    const {
        EXAMPLE
    } = customerKeys()

    switch(customerKey) {
        case EXAMPLE:
            return exampleTrackerSettingsList
        default:
            throw makeTypeSupportError(`${customerKey} is not a supported customer.`)
    }
}

export function getCustomerSettings() {
    const customerSwitch = CUSTOMER_SWITCH()
    const customerKey = customers()[customerSwitch]
    return customerSettings(customerKey)
}

export default customerSettings
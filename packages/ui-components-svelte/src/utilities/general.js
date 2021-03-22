export const createLabelString = (andOr) => (...args) => {
    const len = args.length
    const label = len > 1 ? `${args.slice(0, -1).join(', ')} ${andOr} ${args[len - 1]}` : args[0]
    return label
}

/**
 * Finds the y value as a measure of screen coordinates for the bottom of the given element
 * @param {HTMLElement} node - element that we're going to find the bottom of
 */
export const getBottomY = (node) => {
    const rect = node.getBoundingClientRect()
    const topY = rect.top
    const height = rect.bottom - topY
    const y = topY + height
    return y
}

/**
 * Calculates a max width for fluid layouts for the option chips
 * 
 * @param {Number} deviceWidth - The number of device pixels of the client in which you're rendering
 */
export const getMaxWidth = (deviceWidth) => {
    // Based on a max width I think looks nice:

    // at 375px, 88%
    // at 1440px, 42%
    // 42% - 88% = -46%
    // 1440 - 375 = 1065
    // m = -46 / 1065 = −0.043192488 percentage points per pixel
    // b = 104.197 

    return (-0.0432 * deviceWidth) + 104.197
}

/**
 * Curried function.
 * 
 * Takes in an initial set of (x, y) coordinates and returns a new set
 * that ensures the container doesn't render out of view on transform: translate().
 * 
 * @param {Number} deviceWidth - The number of device pixels of the client in which you're rendering
 * @param {MouseEvent} event - The event that you want the bounding rect from
 * @returns {Object}
 */
export const getTranslateXY = (deviceWidth) => (event) => {
    const containerWidth = getMaxWidth(deviceWidth)
    const { target, clientX } = event
    // #TODO...
    
    return {
        x: newX,
        y: newY,
        overlap
    }
}
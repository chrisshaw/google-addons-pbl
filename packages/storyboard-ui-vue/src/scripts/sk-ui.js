import { makePercent, getArrayLength, joinByComma } from './utilities.js'

/***********************
 * SELECTORS
 **********************/

export const getPolygonCoordinates = (coordinatesObject) => coordinatesObject.polygonCoordinateString
export const getSquareCoordinates = (coordinatesObject) => coordinatesObject.squareCoordinateString

/**********************
 * MAKE CLIP PATH COORDINATE STRINGS
 ***********************/

export const makePieChartPolygonClipPaths = (percent) => {
  const startingPolygonCoordinateStrings = [
    '50% 50%',
    '50% 0%'
  ]
  const cornerCoordinateStrings = [
    '100% 0%',
    '100% 100%',
    '0% 100%',
    '0% 0%'
  ]

  const degrees = 360 * (percent > 1 && percent / 100 || percent)

  let polygonCoordinateStrings = cornerCoordinateStrings.reduce((coordinateStrings, cornerCoordinateString, index) => {
    const currentCornerDegrees = 45 + (90 * index)
    if (degrees >= currentCornerDegrees) {
      return [...coordinateStrings, cornerCoordinateString]
    } else {
      return [...coordinateStrings, makePieChartCoordinates(degrees, index + 1, 0.5)]
    }
  }, startingPolygonCoordinateStrings)

  let numberPoints = getArrayLength(polygonCoordinateStrings)

  if (numberPoints < 4) {
    polygonCoordinateStrings = [...polygonCoordinateStrings, polygonCoordinateStrings[numberPoints - 1]]
    numberPoints = getArrayLength(polygonCoordinateStrings)
  }

  const polygonCoordinateString = joinByComma(polygonCoordinateStrings)

  const squareCoordinateStrings = makeSquareClipPathCoordinates(numberPoints)
  const squareCoordinateString = joinByComma(squareCoordinateStrings)

  return {
    polygonCoordinateString,
    squareCoordinateString
  }
}

function makeSquareClipPathCoordinates (numberPoints) {
  let coords = [
    '0% 0%',
    '100% 0%',
    '100% 100%',
    '0% 100%'
  ]

  const neededPoints = numberPoints - coords.length

  while (coords.length < numberPoints) {
    coords = [...coords, '0% 0%']
  }

  return coords
}

function makePieChartCoordinates (degrees, quadrant, relativeSize) {
  /**
     * Quadrants 1 and 2 are the left side of the pie chart
     */
  const isRight = isQuadrant([1, 2], quadrant)

  /**
     * Quadrants 2 and 3 are the bottom of the pie chart
     */
  const isBottom = isQuadrant([2, 3], quadrant)

  const edgeIndex = findEdge(degrees)

  /**
     * tan(theta) is the ratio of the opposite side over the adjacent side (y / x)
     *
     * We're going to treat everything as x = 1 and then use the y value as the % we'll need to add to the appropriate coordinate. That means all we need is the tangent.
     */
  const tangent = getTangent(degrees % 90)
  const percent = tangent * relativeSize

  switch (edgeIndex) {
    case 1:
      return makeCoordinateString(relativeSize + (isRight && percent || -percent), 0)
    case 2:
      return makeCoordinateString(1, relativeSize + (isBottom && percent || -percent))
    case 3:
      return makeCoordinateString(relativeSize + (isRight && percent || -percent), 1)
    case 4:
      return makeCoordinateString(0, relativeSize + (isBottom && percent || -percent))
    default:
      throw new Error('Your edgeIndex is not between 1 and 4.')
  }
}

function makeCoordinateString (x, y) {
  return `${makePercent(x)} ${makePercent(y)}`
}

function isQuadrant (quadrants, quadrant) {
  return quadrants.some((q) => q === quadrant)
}

function findEdge (degrees) {
  const geThresholds = {
    45: 1,
    135: 2,
    225: 3,
    315: 4,
    360: 1
  }

  const geThresholdKey = Object.keys(geThresholds).find((degreeThreshold) => degrees < degreeThreshold)
  return geThresholds[geThresholdKey]
}

const getRadians = (degrees) => degrees * Math.PI / 180
const getTangent = (degrees) => Math.tan(getRadians(degrees))

export const makeEvidenceItem = (evidenceData = {}, degreesToRotate, index, numberFilledSlots) => ({
  ...evidenceData,
  rotation: `${degreesToRotate * index * 360}deg`,
  attempted: index === numberFilledSlots,
  complete: index < numberFilledSlots,
  show: Object.keys(evidenceData).length > 0,
  scale: index
})

export const makeEvidenceArray = (numberFilledSlots, numberTotalSlots, evidence) => {
  const arr = []
  const degreesToRotate = 1 / numberTotalSlots
  for (let i = 0; i < numberTotalSlots; i++) {
    arr.push(makeEvidenceItem(evidence[i], degreesToRotate, i, numberFilledSlots))
  }
  return arr
}

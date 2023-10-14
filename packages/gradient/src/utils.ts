import { ColorStop } from '.'

// Minmax a value between an upper and lower bound.
// We use ternary operators because it makes the minified code
// 2 times shorter then `Math.min(Math.max(a,b),c)`
export const minmax = (number: number, min = 0, max = 1): number => {
  return number > max ? max : number < min ? min : number
}

export function findRange(
  arr: ColorStop[],
  target: number
): [ColorStop, ColorStop] | null {
  arr.sort((a, b) => a.position - b.position) // Ensure the array is sorted in ascending order based on the position
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i].position <= target && target < arr[i + 1].position) {
      return [arr[i], arr[i + 1]]
    }
  }
  return null // If the target is outside the range of the array
}

export function drawTransparentBg(
  canvas: HTMLCanvasElement,
  repeatPatternCount = 3
) {
  const ctx = canvas.getContext('2d', { willReadFrequently: true })

  if (!ctx) {
    return
  }

  const { width, height } = canvas.getBoundingClientRect()
  canvas.width = width
  canvas.height = height

  const repeatPatternSize = Math.round(height / repeatPatternCount)

  let xPos = 0
  let yPos = 0

  for (let x = 0; x <= width + repeatPatternSize; x += repeatPatternSize) {
    for (let y = 0; y <= height + repeatPatternSize; y += repeatPatternSize) {
      const isXEven = xPos % 2 === 0
      const isYEven = yPos % 2 === 0

      if (isXEven === isYEven) {
        ctx.fillStyle = '#fff'
      } else {
        ctx.fillStyle = '#eee'
      }

      ctx.fillRect(x, y, repeatPatternSize, repeatPatternSize)
      yPos++
    }

    xPos++
    yPos = 0
  }
}

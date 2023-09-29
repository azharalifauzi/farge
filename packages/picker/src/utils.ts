import { TinyColor } from '@ctrl/tinycolor'

export function drawCanvas(canvas: HTMLCanvasElement, fillColor: string) {
  const ctx = canvas.getContext('2d', { willReadFrequently: true })

  const canvasSize = canvas.getBoundingClientRect()

  canvas.width = canvasSize.width
  canvas.height = canvasSize.height

  if (ctx) {
    ctx.fillStyle = fillColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const whiteGradient = ctx.createLinearGradient(0, 0, canvas.width, 0)
    whiteGradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
    whiteGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')

    ctx.fillStyle = whiteGradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const blackGradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    blackGradient.addColorStop(0, 'rgba(0, 0, 0, 0)')
    blackGradient.addColorStop(1, 'rgba(0, 0, 0, 1)')

    ctx.fillStyle = blackGradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }
}

// Minmax a value between an upper and lower bound.
// We use ternary operators because it makes the minified code
// 2 times shorter then `Math.min(Math.max(a,b),c)`
export const minmax = (number: number, min = 0, max = 1): number => {
  return number > max ? max : number < min ? min : number
}

export function drawHue(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d', { willReadFrequently: true })

  if (ctx) {
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0)
    // Orange
    gradient.addColorStop(0, 'rgb(255, 0, 0)')
    // Yellow
    gradient.addColorStop(0.15, 'rgb(255, 255, 0)')
    // Green
    gradient.addColorStop(0.33, 'rgb(0, 255, 0)')
    // Teal
    gradient.addColorStop(0.49, 'rgb(0, 255, 255)')
    // Blue
    gradient.addColorStop(0.67, 'rgb(0, 0, 255)')
    // Purple
    gradient.addColorStop(0.84, 'rgb(255, 0, 255)')
    // Red
    gradient.addColorStop(1, 'rgb(255, 0, 0)')

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }
}

export function drawAlpha(canvas: HTMLCanvasElement, fill: string) {
  const ctx = canvas.getContext('2d', { willReadFrequently: true })

  if (!ctx) {
    return
  }

  const { width, height } = canvas.getBoundingClientRect()
  canvas.width = width
  canvas.height = height

  const repeatPatternSize = Math.round(height / 3)

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

  const fillColor = new TinyColor(fill)

  if (!fillColor.isValid) {
    return
  }

  const { r, g, b } = fillColor.toRgb()

  const gradient = ctx.createLinearGradient(0, 0, width, 0)
  gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0)`)
  gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 1)`)

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
}

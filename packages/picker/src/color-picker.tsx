import React, { useEffect, useRef, useState } from 'react'
import { ColorPickerContext } from './hooks'
import {
  HSV,
  HSVA,
  Numberify,
  RGB,
  TinyColor,
  hsvToRgb,
  rgbToHex,
} from '@ctrl/tinycolor'
import { minmax } from './utils'

export interface ColorPickerProps {
  color?: string
  onChange?: (color: string, alpha: number) => void
  onChangeComplete?: (color: string, alpha: number) => void
  children?: React.ReactNode
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  onChange,
  onChangeComplete,
  color,
  children,
}) => {
  const [hsv, setHsv] = useState<Numberify<HSV>>({ h: 0, s: 0, v: 100 })
  const [rgb, setRgb] = useState<Numberify<RGB>>({ r: 255, g: 255, b: 255 })
  const [huePointerX, setHuePointerX] = useState(0)
  const [alphaPointerX, setAlphaPointerX] = useState(100)
  const [colorPointer, setColorPointer] = useState({ x: 0, y: 0 })
  const [alpha, setAlpha] = useState(1)

  const firstTime = useRef(true)
  const huePointerRef = useRef<HTMLElement>(null)
  const hueCanvasRef = useRef<HTMLCanvasElement>(null)
  const alphaPointerRef = useRef<HTMLElement>(null)
  const alphaCanvasRef = useRef<HTMLCanvasElement>(null)
  const canvasPointerRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const huePointerEl = huePointerRef.current
    const hueCanvasEl = hueCanvasRef.current
    const alphaPointerEl = alphaPointerRef.current
    const alphaCanvasEl = alphaCanvasRef.current

    if (color && firstTime.current) {
      const tinyColor = new TinyColor(color)

      if (tinyColor.isValid) {
        const { h, s, v, a } = tinyColor.toHsv()
        const { r, g, b } = tinyColor.toRgb()

        setAlpha(a)
        if (alphaPointerEl && alphaCanvasEl) {
          const x =
            a * alphaCanvasEl.offsetWidth - alphaPointerEl.offsetWidth / 2
          const percentage = (x / alphaCanvasEl.offsetWidth) * 100
          const max =
            ((alphaCanvasEl.offsetWidth - alphaPointerEl.offsetWidth) /
              alphaCanvasEl.offsetWidth) *
            100

          setAlphaPointerX(minmax(percentage, 0, max))
        }
        setColorPointer({
          x: s * 100,
          y: 100 - v * 100,
        })
        if (huePointerEl && hueCanvasEl) {
          const x =
            (h / 360) * hueCanvasEl.offsetWidth - huePointerEl.offsetWidth / 2
          const percentage = (x / hueCanvasEl.offsetWidth) * 100
          const max =
            ((hueCanvasEl.offsetWidth - huePointerEl.offsetWidth) /
              hueCanvasEl.offsetWidth) *
            100

          setHuePointerX(minmax(percentage, 0, max))
        }
        setHsv({ h, s: s * 100, v: v * 100 })
        setRgb({ r, g, b })
      }

      firstTime.current = false
    }
  }, [color])

  const handleChangeColor = (
    hsva: Numberify<HSVA>,
    huePointerX?: number,
    alphaPointerX?: number
  ) => {
    let { h, s, v, a } = hsva

    h = minmax(h, 0, 360)
    s = minmax(s, 0, 100)
    v = minmax(v, 0, 100)
    a = minmax(a, 0, 1)

    const rgb = hsvToRgb(h, s, v)

    setHsv({ h, s, v })
    setRgb(rgb)
    setColorPointer({
      x: s,
      y: 100 - v,
    })
    if (huePointerX !== undefined) {
      setHuePointerX(huePointerX)
    }
    setAlpha(a)
    if (alphaPointerX) {
      setAlphaPointerX(alphaPointerX)
    }

    const { r, g, b } = rgb

    if (onChange) {
      onChange(rgbToHex(r, g, b, false), a)
    }
  }

  return (
    <ColorPickerContext.Provider
      value={{
        colorPointer,
        huePointerX,
        alphaPointerX,
        hsv,
        rgb,
        alpha,
        hueCanvasRef,
        huePointerRef,
        alphaCanvasRef,
        alphaPointerRef,
        canvasRef,
        canvasPointerRef,
        onChangeColor: handleChangeColor,
        onChangeColorComplete: (hsva) => {
          const { h, s, v, a } = hsva
          const { r, g, b } = hsvToRgb(h, s, v)

          if (onChangeComplete) {
            onChangeComplete(rgbToHex(r, g, b, false), a)
          }
        },
      }}
    >
      <>{children}</>
    </ColorPickerContext.Provider>
  )
}

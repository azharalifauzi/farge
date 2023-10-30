import React, { CSSProperties, useEffect, useRef, useState } from 'react'
import { ColorPickerContext, onChangeColorOptions } from './hooks'
import {
  HSV,
  HSVA,
  Numberify,
  RGB,
  TinyColor,
  hsvToRgb,
  rgbToHex,
  RGBA,
  rgbToHsv,
} from '@ctrl/tinycolor'
import { minmax } from './utils'

export interface ColorPickerProps {
  color?: string
  /**
   * color: hex string
   *
   * alpha: 0 to 1
   */
  onChange?: (color: string, alpha: number) => void
  onChangeComplete?: (color: string, alpha: number) => void
  children?: React.ReactNode
  className?: string
  style?: CSSProperties
}

function getPointerX(
  value: number,
  canvasEl: HTMLCanvasElement,
  pointerEl: HTMLElement
) {
  const x = value * canvasEl.offsetWidth - pointerEl.offsetWidth / 2
  const percentage = (x / canvasEl.offsetWidth) * 100
  const max =
    ((canvasEl.offsetWidth - pointerEl.offsetWidth) / canvasEl.offsetWidth) *
    100

  return minmax(percentage, 0, max)
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  onChange,
  onChangeComplete,
  color,
  children,
  className,
  style,
}) => {
  const [hsv, setHsv] = useState<Numberify<HSV>>({ h: 0, s: 0, v: 100 })
  const [rgb, setRgb] = useState<Numberify<RGB>>({ r: 255, g: 255, b: 255 })
  const [huePointerX, setHuePointerX] = useState(0)
  const [alphaPointerX, setAlphaPointerX] = useState(100)
  const [colorPointer, setColorPointer] = useState({ x: 0, y: 0 })
  const [alpha, setAlpha] = useState(1)

  // NOTE: using range 0 to 1 for saturation and brightness to not confuse tiny color
  const cacheHsv = useRef({ h: 0, s: 0, v: 1, a: 1 })
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

    if (color) {
      const newColor = new TinyColor(color)
      const currentColor = new TinyColor(cacheHsv.current)

      if (newColor.isValid && !newColor.equals(currentColor)) {
        // eslint-disable-next-line prefer-const
        let { h, s, v, a } = newColor.toHsv()
        const { r, g, b } = newColor.toRgb()

        setAlpha(a)
        if (alphaPointerEl && alphaCanvasEl) {
          setAlphaPointerX(getPointerX(a, alphaCanvasEl, alphaPointerEl))
        }
        setColorPointer({
          x: s * 100,
          y: 100 - v * 100,
        })
        if (huePointerEl && hueCanvasEl) {
          setHuePointerX(getPointerX(h / 360, hueCanvasEl, huePointerEl))
        }
        setHsv({
          h,
          s: s * 100,
          v: v * 100,
        })
        setRgb({ r, g, b })

        // NOTE: using range 0 to 1 for saturation and brightness to not confuse tiny color
        cacheHsv.current = {
          h,
          s,
          v,
          a,
        }
      }
    }
  }, [color])

  const handleChangeColor = (
    color: Numberify<HSVA> | Numberify<RGBA>,
    opts?: onChangeColorOptions
  ) => {
    const huePointerEl = huePointerRef.current
    const hueCanvasEl = hueCanvasRef.current
    const alphaPointerEl = alphaPointerRef.current
    const alphaCanvasEl = alphaCanvasRef.current

    let hsva: Numberify<HSVA> | undefined = undefined
    let rgba: Numberify<RGBA> | undefined = undefined

    // eslint-disable-next-line no-prototype-builtins
    if (color.hasOwnProperty('h')) {
      hsva = color as Numberify<HSVA>
    } else {
      rgba = color as Numberify<RGBA>
    }

    let h = 360
    let s = 100
    let v = 100
    let a = 1

    if (hsva) {
      h = hsva.h
      s = hsva.s
      v = hsva.v
      a = hsva.a
    } else if (rgba) {
      const { r, g, b } = rgba
      const hsv = rgbToHsv(r, g, b)

      h = hsv.h * 360
      s = hsv.s * 100
      v = hsv.v * 100
      a = rgba.a
    }

    h = minmax(h, 0, 360)
    s = minmax(s, 0, 100)
    v = minmax(v, 0, 100)
    a = minmax(a, 0, 1)

    let rgb = hsva ? hsvToRgb(h, s, v) : undefined

    if (rgba) {
      const { a: __a__, ...__rgb__ } = rgba
      rgb = __rgb__
      a = minmax(__a__, 0, 1)
    }

    setHsv({ h, s, v })
    setColorPointer({
      x: s,
      y: 100 - v,
    })
    if (rgb) {
      setRgb(rgb)
    }
    if (hueCanvasEl && huePointerEl) {
      setHuePointerX(getPointerX(h / 360, hueCanvasEl, huePointerEl))
    }
    setAlpha(a)
    if (alphaCanvasEl && alphaPointerEl) {
      setAlphaPointerX(getPointerX(a, alphaCanvasEl, alphaPointerEl))
    }

    // NOTE: using range 0 to 1 for saturation and brightness to not confuse tiny color
    cacheHsv.current = {
      h,
      s: s / 100,
      v: v / 100,
      a,
    }

    if (onChange && rgb && !opts?.ignoreCallback) {
      const { r, g, b } = rgb
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
      <div className={className} style={style}>
        {children}
      </div>
    </ColorPickerContext.Provider>
  )
}

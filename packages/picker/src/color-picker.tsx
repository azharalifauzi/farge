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
  const [hueSelectorX, setHueSelectorX] = useState(0)
  const [alphaSelectorX, setAlphaSelectorX] = useState(100)
  const [colorSelector, setColorSelector] = useState({ x: 0, y: 0 })
  const [alpha, setAlpha] = useState(1)

  const firstTime = useRef(true)

  useEffect(() => {
    if (color && firstTime.current) {
      const tinyColor = new TinyColor(color)

      if (tinyColor.isValid) {
        const { h, s, v, a } = tinyColor.toHsv()
        const { r, g, b } = tinyColor.toRgb()

        setAlpha(a)
        setAlphaSelectorX(a * 100)
        setColorSelector({
          x: s * 100,
          y: 100 - v * 100,
        })
        setHueSelectorX((h / 360) * 100)
        setHsv({ h, s: s * 100, v: v * 100 })
        setRgb({ r, g, b })
      }

      firstTime.current = false
    }
  }, [color])

  const handleChangeColor = (hsva: Numberify<HSVA>) => {
    let { h, s, v, a } = hsva

    h = minmax(h, 0, 360)
    s = minmax(s, 0, 100)
    v = minmax(v, 0, 100)
    a = minmax(a, 0, 1)

    const rgb = hsvToRgb(h, s, v)
    const hueSelectorX = (h / 360) * 100

    setHsv({ h, s, v })
    setRgb(rgb)
    setColorSelector({
      x: s,
      y: 100 - v,
    })
    setHueSelectorX(hueSelectorX)
    setAlpha(a)
    setAlphaSelectorX(a * 100)

    const { r, g, b } = rgb

    if (onChange) {
      onChange(rgbToHex(r, g, b, false), a)
    }
  }

  return (
    <ColorPickerContext.Provider
      value={{
        colorSelector,
        hueSelectorX,
        alphaSelectorX,
        hsv,
        rgb,
        alpha,
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

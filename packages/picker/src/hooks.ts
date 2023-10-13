import { createContext, useContext } from 'react'
import { HSV, HSVA, Numberify, RGB } from '@ctrl/tinycolor'

type Coordinate = { x: number; y: number }

export interface ColorPickerContextProps {
  huePointerX: number
  alphaPointerX: number
  colorPointer: Coordinate
  hsv: Numberify<HSV>
  rgb: Numberify<RGB>
  alpha: number
  onChangeColor?: (hsva: Numberify<HSVA>) => void
  onChangeColorComplete?: (hsva: Numberify<HSVA>) => void
}

export const ColorPickerContext = createContext<ColorPickerContextProps>({
  colorPointer: { x: 0, y: 0 },
  huePointerX: 0,
  alphaPointerX: 100,
  alpha: 1,
  hsv: {
    h: 0,
    s: 0,
    v: 0,
  },
  rgb: {
    r: 255,
    g: 255,
    b: 255,
  },
})

export const useColorPicker = () => useContext(ColorPickerContext)

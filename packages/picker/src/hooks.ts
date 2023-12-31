import { createContext, useContext } from 'react'
import { HSV, HSVA, Numberify, RGB } from '@ctrl/tinycolor'

type Coordinate = { x: number; y: number }

export interface ColorPickerContextProps {
  hueSelectorX: number
  alphaSelectorX: number
  colorSelector: Coordinate
  hsv: Numberify<HSV>
  rgb: Numberify<RGB>
  alpha: number
  onChangeColor?: (hsva: Numberify<HSVA>) => void
  onChangeColorComplete?: (hsva: Numberify<HSVA>) => void
}

export const ColorPickerContext = createContext<ColorPickerContextProps>({
  colorSelector: { x: 0, y: 0 },
  hueSelectorX: 0,
  alphaSelectorX: 100,
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

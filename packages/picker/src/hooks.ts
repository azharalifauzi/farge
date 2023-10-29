import { createContext, createRef, useContext } from 'react'
import { HSV, HSVA, Numberify, RGB, RGBA } from '@ctrl/tinycolor'

type Coordinate = { x: number; y: number }

const huePointerRef = createRef<HTMLElement>()
const hueCanvasRef = createRef<HTMLCanvasElement>()
const alphaPointerRef = createRef<HTMLElement>()
const alphaCanvasRef = createRef<HTMLCanvasElement>()
const canvasRef = createRef<HTMLCanvasElement>()
const canvasPointerRef = createRef<HTMLElement>()

export interface onChangeColorOptions {
  ignoreCallback?: boolean
}

export interface ColorPickerContextProps {
  huePointerX: number
  alphaPointerX: number
  colorPointer: Coordinate
  hsv: Numberify<HSV>
  rgb: Numberify<RGB>
  /**
   * Value between 0 to 1
   */
  alpha: number
  huePointerRef: typeof huePointerRef
  hueCanvasRef: typeof hueCanvasRef
  alphaPointerRef: typeof alphaPointerRef
  alphaCanvasRef: typeof alphaCanvasRef
  canvasRef: typeof canvasRef
  canvasPointerRef: typeof canvasPointerRef
  onChangeColor?: (
    hsva: Numberify<HSVA> | Numberify<RGBA>,
    opts?: onChangeColorOptions
  ) => void
  onChangeColorComplete?: (hsva: Numberify<HSVA>) => void
}

export const ColorPickerContext = createContext<ColorPickerContextProps>({
  huePointerRef,
  hueCanvasRef,
  alphaCanvasRef,
  alphaPointerRef,
  canvasRef,
  canvasPointerRef,
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

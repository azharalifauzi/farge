'use client'

import { RGBA, HSVA, TinyColor, rgbToHex } from '@ctrl/tinycolor'
import { cn } from '@/lib/utils'
import {
  Alpha,
  AlphaContainer,
  AlphaPointer,
  Canvas,
  CanvasContainer,
  ColorPicker,
  ColorPointer,
  HueCanvas,
  HueContainer,
  HuePointer,
  useColorPicker,
} from '@farge/picker'
import Gradient, { ColorStop, GradientProps } from '@farge/gradient'
import React, { useMemo, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'

export type GradientType = 'linear' | 'radial' | 'angular'
export type ColorPickerMode = 'solid' | 'gradient'

interface FigmaColorPickerProps {
  color?: string
  onChange?: (color: string) => void
  onChangeColorStop?: (colorStops: ColorStop[]) => void
  colorStops?: ColorStop[]
  onChangeMode?: (mode: ColorPickerMode) => void
  mode?: ColorPickerMode
  gradientType?: GradientType
  onChangeGradientType?: (gradientType: GradientType) => void
}

const FigmaColorPicker: React.FC<FigmaColorPickerProps> = ({
  color = 'rgba(255, 0, 0, 1)',
  onChange,
  colorStops,
  onChangeColorStop,
  mode,
  onChangeMode,
  gradientType,
  onChangeGradientType,
}) => {
  const [localMode, setMode] = useState<ColorPickerMode>('solid')
  const [localColor, setLocalColor] = useState(color)
  const [localColorStops, setColorStops] = useState<ColorStop[]>([
    {
      position: 0,
      value: 'rgba(255, 0, 0, 1)',
    },
    {
      position: 1,
      value: 'rgba(255, 0, 0, 0)',
    },
  ])
  const [activeIdxColorStops, setActiveIdxColorStops] = useState(0)
  const [localGradientType, setGradientType] = useState<GradientType>('linear')

  return (
    <ColorPicker
      className="w-[275px] select-none shadow-lg"
      color={color || localColor}
      onChange={(color, alpha) => {
        const c = new TinyColor(color)
        c.setAlpha(alpha)
        setLocalColor(c.toHex8String())
        if (onChange) {
          onChange(c.toRgbString())
        }

        if ((mode || localMode) === 'gradient') {
          const cs = [...(colorStops || localColorStops)]
          cs[activeIdxColorStops].value = c.toRgbString()
          setColorStops(cs)

          if (onChangeColorStop) {
            onChangeColorStop(cs)
          }
        }
      }}
    >
      <div className="flex items-center gap-0.5 py-1 border-b px-4 border-gray-100">
        <button
          onClick={() => {
            setMode('solid')
            const color = [...(colorStops || localColorStops)].sort(
              (a, b) => a.position - b.position
            )[0].value
            setLocalColor(color)

            if (onChange) {
              onChange(color)
            }

            if (onChangeMode) {
              onChangeMode('solid')
            }
          }}
          className={cn(
            'flex items-center justify-center w-6 h-6 cursor-pointer hover:border rounded-sm',
            {
              'bg-gray-200': (mode || localMode) === 'solid',
            }
          )}
        >
          <div className="w-3 h-3 bg-black"></div>
        </button>
        <button
          onClick={() => {
            setMode('gradient')
            setActiveIdxColorStops(0)

            const color = [...(colorStops || localColorStops)].sort(
              (a, b) => a.position - b.position
            )[0].value
            setLocalColor(color)

            if (onChange) {
              onChange(color)
            }

            if (onChangeMode) {
              onChangeMode('gradient')
            }
          }}
          className={cn(
            'flex items-center justify-center w-6 h-6 cursor-pointer hover:border rounded-sm',
            {
              'bg-gray-200': (mode || localMode) === 'gradient',
            }
          )}
        >
          <div className="w-3 h-3 bg-gradient-to-b from-gray-800 to-gray-300"></div>
        </button>
      </div>
      {(mode || localMode) === 'gradient' && (
        <>
          <div className="px-4 pb-2 pt-4">
            <Select
              value={gradientType || localGradientType}
              onValueChange={(gt) => {
                setGradientType(gt as GradientType)
                if (onChangeGradientType) {
                  onChangeGradientType(gt as GradientType)
                }
              }}
            >
              <SelectTrigger className="text-xs h-7 px-2 rounded-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[99999]">
                <SelectItem className="text-xs" value="linear">
                  Linear
                </SelectItem>
                <SelectItem className="text-xs" value="radial">
                  Radial
                </SelectItem>
                <SelectItem className="text-xs" value="angular">
                  Angular
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <GradientPicker
            activeIdx={activeIdxColorStops}
            colorStops={colorStops || localColorStops}
            onChange={(cs) => {
              setColorStops(cs)
              if (onChangeColorStop) {
                onChangeColorStop(cs)
              }
            }}
            onChangeSelection={(cs, idx) => {
              setLocalColor(cs.value)
              setActiveIdxColorStops(idx)

              if (onChange) {
                onChange(cs.value)
              }
            }}
          />
        </>
      )}
      <CanvasContainer className="w-full h-[275px]">
        <Canvas className="w-full h-full" />
        <ColorPointer className="w-3 h-3 border-2 border-white rounded-full cursor-pointer" />
      </CanvasContainer>
      <div className="px-3 pb-5">
        <HueContainer className="w-[200px] h-3 mt-2 ml-auto mb-2">
          <HueCanvas className="w-full h-full rounded-full absolute top-0 left-0" />
          <HuePointer className="w-3 h-3 shadow-[0_4px_20px_rgba(0,0,0,0.1)] rounded-full cursor-pointer border-2 border-white" />
        </HueContainer>
        <AlphaContainer className="w-[200px] h-3 ml-auto mb-4">
          <Alpha className="w-full h-3 absolute top-0 left-0 rounded-full" />
          <AlphaPointer className="w-3 h-3 shadow-[0_4px_20px_rgba(0,0,0,0.1)] rounded-full cursor-pointer border-2 border-white" />
        </AlphaContainer>
        <InputColor />
      </div>
    </ColorPicker>
  )
}

const GradientPicker: React.FC<GradientProps> = ({
  colorStops,
  onChange,
  onChangeSelection,
  activeIdx,
}) => {
  return (
    <div className="w-full px-5 h-4 mb-4 mt-10">
      <Gradient
        activeIdx={activeIdx}
        colorStops={colorStops}
        onChange={onChange}
        onChangeSelection={onChangeSelection}
      />
    </div>
  )
}

const inputNameMap = {
  0: {
    hex: 'hex',
    rgb: 'r',
    hsv: 'h',
  },
  1: {
    rgb: 'g',
    hsv: 's',
  },
  2: {
    rgb: 'b',
    hsv: 'v',
  },
  3: {
    hex: 'a',
    rgb: 'a',
    hsv: 'a',
  },
} as const

type ColorFormat = 'hex' | 'rgb' | 'hsv'

const InputColor = () => {
  const [colorFormat, setColorFormat] = useState<ColorFormat>('hex')
  const { hsv, rgb, alpha, onChangeColor } = useColorPicker()
  const [localRgb, setLocalRgb] = useState<RGBA>({
    r: '255',
    g: '255',
    b: '255',
    a: 100,
  })
  const [localHex, setLocalHex] = useState({ hex: 'ffffff', a: 100 })
  const [localHsb, setLocalHsb] = useState<HSVA>({
    h: '360',
    s: '100',
    v: '100',
    a: 100,
  })
  const [isEdit, setEdit] = useState(false)

  const hexCode = useMemo(() => {
    return new TinyColor(rgb).toHex(false).toUpperCase()
  }, [rgb])

  const getColor = (index: 0 | 1 | 2 | 3) => {
    if (colorFormat === 'hex') {
      if (index === 3) {
        return isEdit ? localHex.a : alpha * 100
      }

      return isEdit ? localHex.hex : hexCode
    }

    if (colorFormat === 'hsv') {
      const key = inputNameMap[index].hsv
      return isEdit
        ? localHsb[key]
        : key === 'a'
        ? alpha * 100
        : Math.round(hsv[key])
    }

    const key = inputNameMap[index].rgb
    return isEdit
      ? localRgb[key]
      : key === 'a'
      ? alpha * 100
      : Math.round(rgb[key])
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = e.target

    if (colorFormat === 'rgb') {
      setLocalRgb({
        ...localRgb,
        [name]: value,
      })
    }

    if (colorFormat === 'hex') {
      setLocalHex({
        ...localHex,
        [name]: value,
      })
    }

    if (colorFormat === 'hsv') {
      setLocalHsb({
        ...localHsb,
        [name]: value,
      })
    }
  }

  const handleFocus = () => {
    setEdit(true)
    const { r, g, b } = rgb
    const { h, s, v } = hsv

    setLocalRgb({
      r: Math.round(r),
      g: Math.round(g),
      b: Math.round(b),
      a: alpha * 100,
    })
    setLocalHsb({
      h: Math.round(h),
      s: Math.round(s),
      v: Math.round(v),
      a: alpha * 100,
    })

    const hex = rgbToHex(r, g, b, false).toUpperCase()
    setLocalHex({
      hex,
      a: alpha * 100,
    })
  }

  const handleBlur = () => {
    setEdit(false)
    let color: TinyColor | undefined = undefined

    if (colorFormat === 'hex') {
      color = new TinyColor(localHex.hex)
      color.setAlpha(parseFloat((localHex.a / 100).toFixed(2)))
    } else if (colorFormat === 'rgb') {
      localRgb.a = parseFloat((localRgb.a / 100).toFixed(2))
      color = new TinyColor(localRgb)
    } else {
      localHsb.a = parseFloat((localHsb.a / 100).toFixed(2))
      color = new TinyColor(localHsb)
    }

    if (color.isValid && onChangeColor) {
      if (
        colorFormat === 'hsv' &&
        Object.values(localHsb).every((v) => !isNaN(Number(v)))
      ) {
        onChangeColor({
          h: Number(localHsb.h),
          s: Number(localHsb.s),
          v: Number(localHsb.v),
          a: localHsb.a,
        })
      } else {
        const rgb = color.toRgb()
        onChangeColor(rgb)
      }
    }
  }

  return (
    <div className="grid grid-cols-[60px_1fr] gap-2">
      <Select
        value={colorFormat}
        onValueChange={(value) => setColorFormat(value as ColorFormat)}
      >
        <SelectTrigger className="text-xs h-7 px-2 rounded-none">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem className="text-xs" value="hex">
            Hex
          </SelectItem>
          <SelectItem className="text-xs" value="rgb">
            RGB
          </SelectItem>
          <SelectItem className="text-xs" value="hsv">
            HSB
          </SelectItem>
        </SelectContent>
      </Select>
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <form
        onKeyDown={(e) => {
          const target = e.target as HTMLInputElement
          if (e.key === 'Enter' && target && target.tagName === 'INPUT') {
            target.blur()
          }
        }}
        className="grid grid-cols-4 border-transparent border hover:border-gray-200 group focus-within:!border-sky-500"
      >
        <input
          value={getColor(0)}
          name={inputNameMap[0][colorFormat]}
          className={cn(
            'px-1 text-xs focus:outline-none group-hover:border-r border-gray-200 group-focus-within:border-r',
            {
              'col-span-3': colorFormat === 'hex',
            }
          )}
          autoComplete="off"
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        {colorFormat !== 'hex' && (
          <>
            <input
              value={getColor(1)}
              name={inputNameMap[1][colorFormat]}
              className="px-1 text-xs focus:outline-none group-hover:border-r border-gray-200 group-focus-within:border-r"
              autoComplete="off"
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
            <input
              value={getColor(2)}
              name={inputNameMap[2][colorFormat]}
              className="px-1 text-xs focus:outline-none group-hover:border-r border-gray-200 group-focus-within:border-r"
              autoComplete="off"
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </>
        )}
        <input
          value={Math.round(Number(getColor(3)))}
          name={inputNameMap[3][colorFormat]}
          className="px-1 text-xs focus:outline-none"
          autoComplete="off"
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </form>
    </div>
  )
}

export default FigmaColorPicker

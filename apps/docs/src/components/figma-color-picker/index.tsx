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
import React, { useMemo, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'

const FigmaColorPicker = () => {
  return (
    <ColorPicker className="w-[275px] select-none" color="hsva(225,100,100,1)">
      <CanvasContainer className="w-full h-[275px]">
        <Canvas className="w-full h-full" />
        <ColorPointer className="w-3 h-3 border-2 border-white rounded-full cursor-pointer" />
      </CanvasContainer>
      <div className="px-3">
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
      return isEdit ? localHsb[key] : key === 'a' ? alpha * 100 : hsv[key]
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

    setLocalRgb({
      r: Math.round(r),
      g: Math.round(g),
      b: Math.round(b),
      a: alpha * 100,
    })
    setLocalHsb({ ...hsv, a: alpha * 100 })

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
      color.a = parseFloat((localHex.a / 100).toFixed(2))
    } else if (colorFormat === 'rgb') {
      localRgb.a = parseFloat((localRgb.a / 100).toFixed(2))
      color = new TinyColor(localRgb)
    } else {
      localHsb.a = parseFloat((localHsb.a / 100).toFixed(2))
      color = new TinyColor(localHsb)
    }

    if (color.isValid && onChangeColor) {
      if (colorFormat === 'hsv') {
        const hsv = color.toHsv()
        hsv.s = Math.round(hsv.s * 100)
        hsv.v = Math.round(hsv.v * 100)
        hsv.h = Math.round(hsv.h)
        onChangeColor(hsv)
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

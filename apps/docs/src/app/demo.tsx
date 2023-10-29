'use client'

import { ColorStop } from '@farge/gradient'
import FigmaColorPicker, {
  ColorPickerMode,
  GradientType,
} from '@/components/figma-color-picker'
import { useState } from 'react'

const Demo = () => {
  const [color, setColor] = useState('rgba(255, 0, 0, 1)')
  const [colorStops, setColorColorStops] = useState<ColorStop[]>([
    {
      position: 0,
      value: 'rgba(255, 0, 0, 1)',
    },
    {
      position: 1,
      value: 'rgba(255, 0, 0, 0)',
    },
  ])
  const [mode, setMode] = useState<ColorPickerMode>('solid')
  const [gradientType, setGradientType] = useState<GradientType>('linear')

  function generateGradient() {
    if (gradientType === 'linear') {
      return `linear-gradient(180deg, ${[...colorStops]
        .sort((a, b) => a.position - b.position)
        .map(({ position, value }) => `${value} ${position * 100}%`)
        .join(', ')})`
    }

    if (gradientType === 'radial') {
      return `radial-gradient(50% 50% at 50% 50%, ${[...colorStops]
        .sort((a, b) => a.position - b.position)
        .map(({ position, value }) => `${value} ${position * 100}%`)
        .join(', ')})`
    }

    return `conic-gradient(from 180deg at 50% 50%, ${[...colorStops]
      .sort((a, b) => a.position - b.position)
      .map(({ position, value }) => `${value} ${position * 100}%`)
      .join(', ')})`
  }

  return (
    <div className="grid grid-cols-[auto_minmax(0,_1fr)] items-center gap-4 justify-items-center">
      <FigmaColorPicker
        colorStops={colorStops}
        color={color}
        gradientType={gradientType}
        mode={mode}
        onChange={(color) => setColor(color)}
        onChangeMode={(mode) => {
          setMode(mode)

          if (mode === 'solid') {
            setColor(
              colorStops.sort((a, b) => a.position - b.position)[0].value
            )
          }
        }}
        onChangeGradientType={(gt) => setGradientType(gt)}
        onChangeColorStop={(cs) => setColorColorStops(cs)}
      />
      <div
        className="h-80 w-80"
        style={{ background: mode === 'gradient' ? generateGradient() : color }}
      />
    </div>
  )
}

export default Demo

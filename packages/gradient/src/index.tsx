import { TinyColor } from '@ctrl/tinycolor'
import { useEffect, useRef, useState } from 'react'
import ColorStop from './color-stop'
import { drawTransparentBg, findRange, minmax } from './utils'

export type ColorStop = {
  /**
   * Color value with RGBA format.
   */
  value: string
  /**
   * Color stop position. Value from 0 to 1
   */
  position: number
}

export interface GradientProps {
  colorStops?: ColorStop[]
  onChange?: (colorStops: ColorStop[]) => void
  onChangeSelection?: (colorStop: ColorStop, idx: number) => void
  activeIdx?: number
}

const Gradient: React.FC<GradientProps> = ({
  colorStops,
  onChange,
  onChangeSelection,
  activeIdx,
}) => {
  const [localColorStops, setLocalColorStops] = useState<ColorStop[]>([
    {
      position: 0,
      value: 'rgba(255, 0, 0, 1)',
    },
    {
      position: 1,
      value: 'rgba(255, 0, 0, 0)',
    },
  ])
  const [localActiveIdx, setActiveIdx] = useState(0)
  const [isMouseDown, setMouseDown] = useState(false)

  const gradientRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvasEl = canvasRef.current

    if (canvasEl) {
      drawTransparentBg(canvasEl, 4)
    }
  }, [])

  useEffect(() => {
    if (colorStops) {
      setLocalColorStops(colorStops)
    }
  }, [colorStops])

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      const gradientEl = gradientRef.current
      if (isMouseDown && gradientEl) {
        const colorStops = [...localColorStops]
        const currentColorStop = colorStops[activeIdx || localActiveIdx]

        const newPosition =
          (currentColorStop.position * gradientEl.offsetWidth + e.movementX) /
          gradientEl.offsetWidth
        currentColorStop.position = minmax(newPosition, 0, 1)

        setLocalColorStops(colorStops)
        if (onChange) {
          onChange(colorStops)
        }
      }
    }

    function handleMouseUp() {
      setMouseDown(false)
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Backspace' || e.key === 'Delete') {
        const colorStops = [...localColorStops]
        if (colorStops.length > 1) {
          colorStops.splice(activeIdx || localActiveIdx, 1)
          setLocalColorStops(colorStops)
          setActiveIdx(0)

          if (onChange) {
            onChange(colorStops)
          }

          if (onChangeSelection) {
            onChangeSelection(colorStops[0], 0)
          }
        }
      }
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isMouseDown, activeIdx, localColorStops, localActiveIdx])

  return (
    <div
      ref={gradientRef}
      style={{
        userSelect: 'none',
        width: '100%',
        height: '100%',
        position: 'relative',
      }}
      onMouseDown={(e) => {
        const gradientEl = gradientRef.current
        const { clientX } = e
        if (gradientEl) {
          const { x, width } = gradientEl.getBoundingClientRect()
          const localX = clientX - x
          const position = localX / width

          const colorBetween = findRange(localColorStops, position)
          let value = 'rgba(255,0,0)'

          if (colorBetween) {
            const [before, after] = colorBetween
            const colorBefore = new TinyColor(before.value)
            const colorAfter = new TinyColor(after.value)

            const fraction =
              (position - before.position) / (after.position - before.position)

            const interpolatedColor = colorBefore.mix(
              colorAfter,
              fraction * 100
            )
            value = interpolatedColor.toRgbString()
          }

          const newColorStop = {
            position,
            value,
          }

          const colorStops = [...localColorStops, newColorStop]

          setLocalColorStops(colorStops)
          setActiveIdx(colorStops.length - 1)

          if (onChange) {
            onChange(colorStops)
          }

          if (onChangeSelection) {
            onChangeSelection(newColorStop, colorStops.length - 1)
          }
        }
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(90deg, ${[...localColorStops]
            .sort((a, b) => a.position - b.position)
            .map(({ position, value }) => `${value} ${position * 100}%`)
            .join(', ')})`,
        }}
      />
      <canvas ref={canvasRef} style={{ height: '100%', width: '100%' }} />
      {localColorStops.map(({ position, value }, idx) => (
        <ColorStop
          position={position}
          color={value}
          isActive={activeIdx === idx}
          key={`color-stop-${idx}`}
          onMouseDown={(e) => {
            e.stopPropagation()
            setActiveIdx(idx)
            setMouseDown(true)
            if (onChangeSelection) {
              onChangeSelection({ position, value }, idx)
            }
          }}
        />
      ))}
    </div>
  )
}

export default Gradient
